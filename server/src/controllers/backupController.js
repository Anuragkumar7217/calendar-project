import fs from "fs";
import path from "path";
import archiver from "archiver";
import unzipper from "unzipper";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import { Log } from "../models/Log.js";
import { Setting } from "../models/Setting.js";

// ⛳ Required for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⏺ Create Backup
export const createBackup = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  const backupDir = path.join(__dirname, "..", "backups");
  const tempDir = path.join(backupDir, `temp-${date}`);
  const fileName = `backup-${date}.zip`;
  const filePath = path.join(backupDir, fileName);

  try {
    // Ensure folders exist
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Fetch data from DB
    const users = await User.find().lean();
    const logs = await Log.find().lean();
    const settings = await Setting.find().lean();

    // Save as JSON files
    fs.writeFileSync(path.join(tempDir, "users.json"), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(tempDir, "logs.json"), JSON.stringify(logs, null, 2));
    fs.writeFileSync(path.join(tempDir, "settings.json"), JSON.stringify(settings, null, 2));

    // Create ZIP
    const output = fs.createWriteStream(filePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();

    // Cleanup temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    res.status(200).json({ message: "Backup created", fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Backup failed" });
  }
};

// ⬇ Download Backup
export const downloadBackup = (req, res) => {
  const { date } = req.params;
  const fileName = `backup-${date}.zip`;
  const filePath = path.join(__dirname, "..", "backups", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Backup not found" });
  }

  res.download(filePath);
};

// 📅 Fetch all backup dates
export const getBackupDates = (req, res) => {
  const backupDir = path.join(__dirname, "..", "backups");

  fs.readdir(backupDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read backup folder" });

    const dates = files
      .filter((file) => file.startsWith("backup-") && file.endsWith(".zip"))
      .map((file) => file.replace("backup-", "").replace(".zip", ""));

    const formattedDates = dates.map((date) => ({ date }));
    res.json(formattedDates);
  });
};

// ⬇ Restore Backup
export const restoreBackup = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  const backupDir = path.join(__dirname, "..", "backups");
  const fileName = `backup-${date}.zip`;
  const filePath = path.join(backupDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Backup file not found" });
  }

  const tempDir = path.join(backupDir, `temp-${Date.now()}`);
  fs.mkdirSync(tempDir);

  try {
    // Step 1: Extract ZIP
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    // Step 2: Read and parse each JSON file
    const readJSON = (filename) =>
      JSON.parse(fs.readFileSync(path.join(tempDir, filename), "utf-8"));

    const users = readJSON("users.json");
    const logs = readJSON("logs.json");
    const settings = readJSON("settings.json");

    // Step 3: Clear old data and insert backup
    await User.deleteMany({});
    await User.insertMany(users);

    await Log.deleteMany({});
    await Log.insertMany(logs);

    await Setting.deleteMany({});
    await Setting.insertMany(settings);

    // Step 4: Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    res.status(200).json({ message: "Restore successful" });
  } catch (err) {
    console.error("Restore failed:", err);
    fs.rmSync(tempDir, { recursive: true, force: true });
    res.status(500).json({ error: "Restore failed" });
  }
};
