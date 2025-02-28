import React, { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import useStore from "../store/useStore";

const Modal = ({ selectedDate, closeModal, handleBackup }) => {
  if (!selectedDate) return null;

  const { restoreBackup } = useStore();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const [backupCompleted, setBackupCompleted] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedBackups = JSON.parse(localStorage.getItem("backupDates")) || [];
    setBackupCompleted(savedBackups.includes(formattedDate));
  }, [formattedDate]);

  const startBackup = async () => {
    setIsBackingUp(true);
    setProgress(10); // Start progress

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    await handleBackup(selectedDate);

    setProgress(100);
    clearInterval(interval);

    setTimeout(() => {
      setIsBackingUp(false);
      setBackupCompleted(true);
    }, 500);
  };

  const startRestore = async () => {
    setIsRestoring(true);
    setProgress(10); // Start progress

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    await restoreBackup(formattedDate);

    setProgress(100);
    clearInterval(interval);

    setTimeout(() => {
      setIsRestoring(false);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70"
      onClick={closeModal} // Close modal on outside click
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg text-center w-80"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2
          className={`text-lg font-semibold mb-4 ${
            backupCompleted ? "text-green-600" : "text-black"
          }`}
        >
          Options for {format(selectedDate, "PPP")}
        </h2>

        {!isToday(selectedDate) && (
          <p className="text-red-500 text-sm mb-2">
            You can only backup today's date!
          </p>
        )}

        {/* Backup button */}
        {!backupCompleted && isToday(selectedDate) && !isBackingUp && (
          <button
            className={`px-4 py-2 rounded ${
              isBackingUp || isRestoring
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
            onClick={startBackup}
            disabled={isBackingUp || isRestoring}
          >
            Backup Now
          </button>
        )}

        {/* Backup Progress Bar */}
        {isBackingUp && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Restore button */}
        {backupCompleted && !isRestoring && (
          <button
            className={`mt-3 px-4 py-2 rounded ${
              isBackingUp || isRestoring
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700 text-white"
            }`}
            onClick={startRestore}
            disabled={isBackingUp || isRestoring}
          >
            Restore Data
          </button>
        )}

        {/* Restore Progress Bar */}
        {isRestoring && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Close button */}
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
