require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");
const AdmZip = require("adm-zip");

const app = express();
const PORT = process.env.PORT || 5000;
const BACKUP_DIR = path.join(__dirname, "backup");

const MONGO_DUMP_PATH = process.env.MONGO_DUMP_PATH;
const MONGO_RESTORE_PATH = process.env.MONGO_RESTORE_PATH;
const MONGO_URI = process.env.MONGO_URI;
const BASE_URL = process.env.BASE_URL || ""; // Example: "http://localhost:5000"

// ❌ Exit if required env variables are missing
if (!MONGO_DUMP_PATH || !MONGO_RESTORE_PATH || !MONGO_URI) {
    console.error("❌ Error: Missing MongoDB environment variables.");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ✅ List backups (including folders)
app.get("/api/listbackups", (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and End dates are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Get list of backups (both ZIPs and folders)
        const items = fs.readdirSync(BACKUP_DIR)
            .map(item => {
                const fullPath = path.join(BACKUP_DIR, item);
                const isFolder = fs.statSync(fullPath).isDirectory();
                const match = item.match(/backup-(\d{4}-\d{2}-\d{2})/);

                if (!match) return null;
                return {
                    date: match[1],
                    file: isFolder ? item : `${item}.zip`, // Show as folder or zip
                    status: isFolder ? "success" : "pending", // UI can show green if "success"
                    url: isFolder ? null : `${BASE_URL}/api/download/${item}.zip`
                };
            })
            .filter(item => item !== null) // Remove invalid files
            .filter(item => {
                const fileDate = new Date(item.date);
                return fileDate >= start && fileDate <= end;
            });

        res.json({ backups: items });
    } catch (error) {
        console.error("❌ Error fetching backups:", error);
        res.status(500).json({ error: "Error fetching backups" });
    }
});

// ✅ Take a backup (ZIP format)
app.post("/api/backup", (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const backupFolder = `backup-${date}`;
        const backupPath = path.join(BACKUP_DIR, backupFolder);
        const zipPath = path.join(BACKUP_DIR, `${backupFolder}.zip`);

        // Prevent duplicate backups
        if (fs.existsSync(zipPath)) {
            return res.status(200).json({ message: `Backup for ${date} already exists.` });
        }

        // Run MongoDB dump
        execSync(`"${MONGO_DUMP_PATH}" --uri="${MONGO_URI}" --out "${backupPath}"`, { stdio: "inherit" });

        // Zip the backup folder
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
            fs.rmSync(backupPath, { recursive: true, force: true }); // Delete unzipped folder
            res.status(201).json({ message: `Backup taken successfully` });
        });

        archive.pipe(output);
        archive.directory(backupPath, false);
        archive.finalize();
    } catch (error) {
        console.error("❌ Backup error:", error);
        res.status(500).json({ error: "Error taking backup" });
    }
});

// ✅ Restore a backup
app.post("/api/restore/:filename", (req, res) => {
    try {
        const { filename } = req.params;
        const zipPath = path.join(BACKUP_DIR, filename);
        const restorePath = zipPath.replace(".zip", "");

        if (!fs.existsSync(zipPath)) {
            return res.status(404).json({ error: `Backup file ${filename} not found.` });
        }

        console.log(`Extracting ${filename}...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(restorePath, true);

        console.log("Running mongorestore...");
        execSync(`"${MONGO_RESTORE_PATH}" --uri="${MONGO_URI}" "${restorePath}"`, { stdio: "inherit" });

        res.json({ message: `Database successfully restored from ${filename}` });
    } catch (error) {
        console.error("❌ Restore error:", error);
        res.status(500).json({ error: `Error restoring backup: ${error.message}` });
    }
});

// ✅ Serve backup files directly (Download)
app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    res.set("Content-Disposition", `attachment; filename="${filename}"`);
    res.set("Content-Type", "application/zip");
    fs.createReadStream(filePath).pipe(res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
