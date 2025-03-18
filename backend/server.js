require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const connectDB = require("./config/db");

// Load environment variables
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

const corsOptions = {
    origin: "http://localhost:5173",  
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests manually
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});


// Initialize Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Connect Database
connectDB();

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));




//✅ List backups (only ZIP files, with date range in request body)
 
app.post("/api/listbackups", (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and End dates are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Get list of ZIP backups only
        const items = fs.readdirSync(BACKUP_DIR)
            .filter(item => item.endsWith(".zip")) // ✅ Filter ZIP files only
            .map(item => {
                const match = item.match(/backup-(\d{4}-\d{2}-\d{2})/);
                if (!match) return null;

                return {
                    date: match[1],
                    file: item,
                    url: `${BASE_URL}${item}` // ✅ Generate download URL
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


//✅ Restore a backup
 
app.post("/api/restore/:filename", (req, res) => {
    try {
        const { filename } = req.params;
        const zipPath = path.join(BACKUP_DIR, filename);
        const restorePath = zipPath.replace(".zip", ""); // Extract folder (e.g., backup-YYYY-MM-DD)

        if (!fs.existsSync(zipPath)) {
            return res.status(404).json({ error: `Backup file ${filename} not found.` });
        }

        console.log(`Extracting ${filename}...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(restorePath, true);

        // **Ensure the extracted folder exists**
        if (!fs.existsSync(restorePath)) {
            return res.status(400).json({ error: `Extracted folder ${restorePath} not found.` });
        }

        console.log("Dropping existing database...");
        execSync(`"${MONGO_RESTORE_PATH}" --uri="${MONGO_URI}" --drop "${restorePath}"`, { stdio: "inherit" });

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
