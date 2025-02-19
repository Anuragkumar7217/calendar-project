import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import useStore from "../store/useStore";

const Modal = ({ selectedDate, closeModal, handleBackup }) => {
  if (!selectedDate) return null;

  const { restoreBackup } = useStore();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const isFutureDate = selectedDate > new Date();

  // State for tracking backup status
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupCompleted, setBackupCompleted] = useState(false);

  // Load backup status from localStorage when component mounts
  useEffect(() => {
    const savedBackups = JSON.parse(localStorage.getItem("backupDates")) || [];
    setBackupCompleted(savedBackups.includes(formattedDate));
  }, [formattedDate]);

  // Function to simulate progress
  const simulateProgress = (callback) => {
    setProgress(0);
    let interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          callback();
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  // Start backup process
  const startBackup = async () => {
    setBackupInProgress(true);
    simulateProgress(async () => {
      await handleBackup(selectedDate);
      setBackupInProgress(false);
      setBackupCompleted(true);

      // Store in localStorage
      const savedBackups = JSON.parse(localStorage.getItem("backupDates")) || [];
      if (!savedBackups.includes(formattedDate)) {
        localStorage.setItem("backupDates", JSON.stringify([...savedBackups, formattedDate]));
      }
    });
  };

  // Start restore process
  const startRestore = async () => {
    setRestoreInProgress(true);
    simulateProgress(async () => {
      await restoreBackup(formattedDate);
      setRestoreInProgress(false);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
        {/* Date Header */}
        <h2
          className={`text-lg font-semibold mb-4 ${
            backupCompleted ? "text-green-600" : "text-black"
          }`}
        >
          Options for {format(selectedDate, "PPP")}
        </h2>

        {!isFutureDate && (
          <>
            {/* Backup Button & Progress Bar */}
            {!backupCompleted && (
              <div>
                <button
                  className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-700 ${
                    backupInProgress ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={startBackup}
                  disabled={backupInProgress}
                >
                  {backupInProgress ? "Backing Up..." : "Backup Now"}
                </button>

                {backupInProgress && (
                  <div className="w-full bg-gray-300 mt-2 h-2 rounded">
                    <div
                      className="bg-blue-500 h-2 rounded transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* Restore Button & Progress Bar */}
            {backupCompleted && (
              <div className="mt-4">
                <button
                  className={`px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-700 ${
                    restoreInProgress ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={startRestore}
                  disabled={restoreInProgress}
                >
                  {restoreInProgress ? "Restoring..." : "Restore Data"}
                </button>

                {restoreInProgress && (
                  <div className="w-full bg-gray-300 mt-2 h-2 rounded">
                    <div
                      className="bg-green-500 h-2 rounded transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Close Button */}
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-700"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
