require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const BACKUP_DIR = path.join(__dirname, "backup");

// MongoDB tools paths (Loaded from .env)
const MONGO_DUMP_PATH = process.env.MONGO_DUMP_PATH;
const MONGO_RESTORE_PATH = process.env.MONGO_RESTORE_PATH;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_DUMP_PATH || !MONGO_RESTORE_PATH || !MONGO_URI) {
  console.error("Error: Missing MongoDB environment variables.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// API to list available backups (With Date Range Filtering)
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

    const files = fs.readdirSync(BACKUP_DIR);
    const filteredBackups = files.filter(file => {
      const match = file.match(/backup-(\d{4}-\d{2}-\d{2})/);
      if (!match) return false;

      const fileDate = new Date(match[1]);
      return fileDate >= start && fileDate <= end;
    });

    console.log("Filtered Backups:", filteredBackups);
    res.json({ backups: filteredBackups });
  } catch (error) {
    console.error("Error fetching backups:", error);
    res.status(500).json({ error: "Error fetching backups" });
  }
});

// API to take a backup
app.post("/api/backup/:date", (req, res) => {
  const { date } = req.params;
  try {
    const backupPath = path.join(BACKUP_DIR, `backup-${date}`);

    const cmd = `${MONGO_DUMP_PATH} --uri=${MONGO_URI} --out "${backupPath}"`;
    execSync(cmd);

    res.json({ message: `Backup taken for ${date}` });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ error: "Error taking backup" });
  }
});


// API to restore a backup
app.post("/api/restore/:date", (req, res) => {
  const { date } = req.params;
  try {
    const restorePath = path.join(BACKUP_DIR, `backup-${date}`);

    if (!fs.existsSync(restorePath)) {
      return res.status(404).json({ error: "Backup not found" });
    }

    // Wrap the path in quotes to handle spaces
    const cmd = `"${MONGO_RESTORE_PATH}" --uri="${MONGO_URI}" "${restorePath}"`;
    execSync(cmd, { stdio: "inherit" });

    res.json({ message: `Database restored from ${date}` });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ error: "Error restoring backup" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
