import express from "express";
import {
  createBackup,
  downloadBackup,
  getBackupDates,
  restoreBackup 
} from "../controllers/backupController.js";

const router = express.Router();

router.post("/create", createBackup);
router.get("/download/:date", downloadBackup);
router.get("/dates", getBackupDates);
router.post("/restore", restoreBackup);

export const backupRoutes = router;
