import React, { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import useStore from "../store/useStore";
import axios from "axios";

const Modal = ({ selectedDate, closeModal, handleBackup }) => {
  if (!selectedDate) return null;

  const { restoreBackup } = useStore();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const [backupCompleted, setBackupCompleted] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    const savedBackups = JSON.parse(localStorage.getItem("backupDates")) || [];
    const hasExistingBackup = savedBackups.includes(formattedDate);
    setBackupCompleted(hasExistingBackup);
    setHasBackup(hasExistingBackup);
  }, [formattedDate]);

  const updateProgress = (setProgress) => {
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 90) clearInterval(interval);
    }, 500);
    return interval;
  };

  // Backup Function
  const startBackup = async () => {
    if (!handleBackup || typeof handleBackup !== "function") {
      console.error("handleBackup is not a function");
      return;
    }

    setIsBackingUp(true);
    setProgress(10);
    const interval = updateProgress(setProgress);

    try {
      await handleBackup(selectedDate);
      setProgress(100);
      clearInterval(interval);
      setBackupCompleted(true);
      setHasBackup(true);
    } catch (error) {
      console.error("Backup failed:", error);
    } finally {
      setTimeout(() => setIsBackingUp(false), 500);
    }
  };

  // Restore Function
  const startRestore = async () => {
    setIsRestoring(true);
    setProgress(10);
    const interval = updateProgress(setProgress);

    try {
      const backupFilename = `backup-${formattedDate}.zip`;
      const response = await fetch(`http://localhost:5000/api/restore/${backupFilename}`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Restore failed");

      console.log("Restore successful:", data.message);
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => setIsRestoring(false), 500);
    }
  };

  // Download Backup
  const downloadBackup = async () => {
    try {
      const backupFilename = `backup-${formattedDate}.zip`;
      const response = await axios.get(`http://localhost:5000/api/download/${backupFilename}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backupFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70" onClick={closeModal}>
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-100" onClick={(e) => e.stopPropagation()}>
        <h2 className={`text-lg font-semibold mb-4 ${backupCompleted ? "text-green-600" : "text-black"}`}>
          Options for {format(selectedDate, "PPP")}
        </h2>

        {!isToday(selectedDate) && <p className="text-red-500 text-sm mb-2">You can only backup today's date!</p>}

        {/* Backup Button */}
        {!backupCompleted && isToday(selectedDate) && !isBackingUp && (
          <button
            className={`px-4 py-2 rounded ${isBackingUp || isRestoring ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
            onClick={startBackup}
            disabled={isBackingUp || isRestoring}
          >
            Backup Now
          </button>
        )}

        {/* Backup Progress Bar */}
        {isBackingUp && (
          <div className="mt-4 m-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Restore Button */}
        {backupCompleted && !isRestoring && (
          <button
            className={`mt-3 m-4 px-4 py-2 rounded ${isBackingUp || isRestoring ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white"}`}
            onClick={startRestore}
            disabled={isBackingUp || isRestoring}
          >
            Restore Data
          </button>
        )}

        {/* Restore Progress Bar */}
        {isRestoring && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Download Button */}
        {hasBackup && (
          <button className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded" onClick={downloadBackup}>
            Download Backup
          </button>
        )}

        {/* Close Button */}
        <div className="mt-4">
          <button className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-700" onClick={closeModal} disabled={isBackingUp || isRestoring}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
