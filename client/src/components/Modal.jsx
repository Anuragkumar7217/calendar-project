import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ModalHeader from "./ModalHeader";
import ModalActions from "./ModalActions";
import ProgressBar from "./ProgressBar";
import useCalendarStore from "../store/useCalendarStore";

const Modal = ({ selectedDate, closeModal, handleBackup, userRole }) => {
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { backupDates, fetchBackupDates } = useCalendarStore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    fetchBackupDates(); // ✅ fetch from backend
  }, [fetchBackupDates]);

  useEffect(() => {
    setHasBackup(backupDates.includes(formattedDate));
  }, [backupDates, formattedDate]);

  const updateProgress = () => {
    let current = 10;
    const interval = setInterval(() => {
      current += 10;
      setProgress((prev) => (prev >= 100 ? 100 : prev + 10));
      if (current >= 100) clearInterval(interval);
    }, 500);
    return interval;
  };

  const handleBackupClick = async () => {
    setIsBackingUp(true);
    setProgress(10);
    const interval = updateProgress();

    try {
      await handleBackup(selectedDate);
      setProgress(100);
      clearInterval(interval);
      await fetchBackupDates(); // ✅ refresh list
    } catch {
      // Handle backup error
    } finally {
      setTimeout(() => setIsBackingUp(false), 500);
    }
  };

  const handleRestoreClick = async () => {
    setIsRestoring(true);
    setProgress(10);
    const interval = updateProgress();

    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: formattedDate }),
      });

      if (!res.ok) {
        throw new Error("Restore failed");
      }

      const data = await res.json();
      console.log("Restore successful:", data);
      setProgress(100);
      clearInterval(interval);
    } catch (err) {
      console.error("Restore error:", err);
      clearInterval(interval);
    } finally {
      setTimeout(() => setIsRestoring(false), 500);
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/backup/download/${formattedDate}`;
  };

  if (!selectedDate) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70" onClick={closeModal}>
      <div
        className="bg-white p-6 rounded-lg shadow-lg text-center w-100"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader selectedDate={selectedDate} backupCompleted={hasBackup} />
        <ModalActions
          selectedDate={selectedDate}
          userRole={userRole}
          backupCompleted={hasBackup}
          isBackingUp={isBackingUp}
          isRestoring={isRestoring}
          hasBackup={hasBackup}
          onBackup={handleBackupClick}
          onRestore={handleRestoreClick}
          onDownload={handleDownload}
        />
        {(isBackingUp || isRestoring) && (
          <ProgressBar progress={progress} color={isBackingUp ? "blue" : "green"} />
        )}
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-700"
            onClick={closeModal}
            disabled={isBackingUp || isRestoring}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
