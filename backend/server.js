const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const BACKUP_DIR = path.join(__dirname, "backup");

// MongoDB tools paths
const MONGO_DUMP_PATH = `"C:\\Program Files\\MongoDB\\tools\\mongodb-database-tools-windows-x86_64-100.11.0\\bin\\mongodump.exe"`;
const MONGO_RESTORE_PATH = `"C:\\Program Files\\MongoDB\\tools\\mongodb-database-tools-windows-x86_64-100.11.0\\bin\\mongorestore.exe"`;
const MONGO_URI = `"mongodb://localhost:27017"`; // Wrapped in quotes

app.use(cors());
app.use(express.json());

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// API to list available backups
app.get("/api/backups", (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const fileNames = files.filter(file => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return stats.isFile();
    });
    res.json({ backups: fileNames });
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
    
    // Wrap in quotes to handle spaces
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

    // Wrap in quotes to handle spaces
    const cmd = `${MONGO_RESTORE_PATH} --uri=${MONGO_URI} "${restorePath}"`;

    execSync(cmd);
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
