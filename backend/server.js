require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");
const AdmZip = require("adm-zip"); // Cross-platform ZIP extraction

const app = express();
const PORT = process.env.PORT || 5000;
const BACKUP_DIR = path.join(__dirname, "backup");

const MONGO_DUMP_PATH = process.env.MONGO_DUMP_PATH;
const MONGO_RESTORE_PATH = process.env.MONGO_RESTORE_PATH;
const MONGO_URI = process.env.MONGO_URI;

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

//  List backups within a date range
app.get("/api/backups", (req, res) => {
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

        const files = fs.readdirSync(BACKUP_DIR).filter(file => {
            const match = file.match(/backup-(\d{4}-\d{2}-\d{2})/);
            if (!match) return false;
            const fileDate = new Date(match[1]);
            return fileDate >= start && fileDate <= end;
        });

        res.json({ backups: files });
    } catch (error) {
        console.error("❌ Error fetching backups:", error);
        res.status(500).json({ error: "Error fetching backups" });
    }
});

// Take a backup (ZIP format)
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

        //  Run MongoDB dump
        execSync(`"${MONGO_DUMP_PATH}" --uri="${MONGO_URI}" --out "${backupPath}"`, { stdio: "inherit" });

        //  Zip the backup folder
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
            fs.rmSync(backupPath, { recursive: true, force: true }); // Delete unzipped folder
            res.status(201).json({ message: `Backup taken successfully`, downloadLink: `/api/download/${backupFolder}.zip` });
        });

        archive.pipe(output);
        archive.directory(backupPath, false);
        archive.finalize();
    } catch (error) {
        console.error("❌ Backup error:", error);
        res.status(500).json({ error: "Error taking backup" });
    }
});

// Restore a backup
app.post("/api/restore/:filename", (req, res) => {
    try {
        const { filename } = req.params;
        const zipPath = path.join(BACKUP_DIR, filename);
        const restorePath = zipPath.replace(".zip", "");

        if (!fs.existsSync(zipPath)) {
            return res.status(404).json({ error: "Backup file not found" });
        }

        // Extract ZIP using adm-zip (cross-platform)
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(restorePath, true);

        //  Restore MongoDB
        execSync(`"${MONGO_RESTORE_PATH}" --uri="${MONGO_URI}" "${restorePath}"`, { stdio: "inherit" });

        //  Clean up extracted folder
        fs.rmSync(restorePath, { recursive: true, force: true });

        res.json({ message: `Database restored from ${filename}` });
    } catch (error) {
        console.error("❌ Restore error:", error);
        res.status(500).json({ error: "Error restoring backup" });
    }
});

// Download a backup ZIP file
app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("❌ Download error:", err);
            res.status(500).json({ error: "Error downloading file" });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
