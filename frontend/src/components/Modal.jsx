import React, { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import useStore from "../store/useStore";
import axios from "axios";

const Modal = ({ selectedDate, closeModal, handleBackup, userRole }) => {
  if (!selectedDate) return null;

  const { restoreBackup } = useStore();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const [backupCompleted, setBackupCompleted] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasBackup, setHasBackup] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedBackups = JSON.parse(localStorage.getItem("backupDates")) || [];
    const hasExistingBackup = savedBackups.includes(formattedDate);
    setBackupCompleted(hasExistingBackup);
    setHasBackup(hasExistingBackup);
  }, [formattedDate]);

  const getAuthToken = () => localStorage.getItem("token");

  const updateProgress = () => {
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress((prev) => (prev >= 100 ? 100 : prev + 10));
      if (currentProgress >= 100) clearInterval(interval);
    }, 500);
    return interval;
  };

  const startBackup = async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthError("Authentication required. Please log in.");
      return;
    }

    setIsBackingUp(true);
    setProgress(10);
    const interval = updateProgress();

    try {
      await handleBackup(selectedDate);
      setProgress(100);
      clearInterval(interval);
      setBackupCompleted(true);
      setHasBackup(true);
    } catch (error) {
      console.error("Backup failed:", error);
      setAuthError("Backup failed. Please try again.");
    } finally {
      setTimeout(() => setIsBackingUp(false), 500);
    }
  };

  const startRestore = async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthError("Authentication required. Please log in.");
      return;
    }

    setIsRestoring(true);
    setProgress(10);
    const interval = updateProgress();

    try {
      const backupFilename = `backup-${formattedDate}.zip`;
      const response = await fetch(`http://localhost:5000/api/restore/${backupFilename}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Restore failed");

      console.log("Restore successful:", data.message);
    } catch (error) {
      console.error("Restore error:", error);
      setAuthError("Restore failed. Please try again.");
    } finally {
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => setIsRestoring(false), 500);
    }
  };

  const downloadBackup = async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthError("Authentication required. Please log in.");
      return;
    }

    try {
      const backupFilename = `backup-${formattedDate}.zip`;
      const response = await axios.get(`http://localhost:5000/api/download/${backupFilename}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
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
      setAuthError("Download failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70" onClick={closeModal}>
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-100" onClick={(e) => e.stopPropagation()}>
        <h2 className={`text-lg font-semibold mb-4 ${backupCompleted ? "text-green-600" : "text-black"}`}>
          Options for {format(selectedDate, "PPP")}
        </h2>

        {authError && <p className="text-red-500 text-sm mb-2">{authError}</p>}

        {!isToday(selectedDate) && <p className="text-red-500 text-sm mb-2">No backups available for the selected date.</p>}

        {!backupCompleted && isToday(selectedDate) && !isBackingUp && (
          <button className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-700 text-white" onClick={startBackup} disabled={isBackingUp || isRestoring}>
            Backup Now
          </button>
        )}

        {isBackingUp && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {backupCompleted && !isRestoring && userRole === "admin" && (
          <button className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded" onClick={startRestore} disabled={isBackingUp || isRestoring}>
            Restore Data
          </button>
        )}

        {isRestoring && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {hasBackup && (
          <button className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded" onClick={downloadBackup}>
            Download Backup
          </button>
        )}

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