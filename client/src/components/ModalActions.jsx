import React from "react";
import { isToday } from "date-fns";

const ModalActions = ({
  selectedDate,
  userRole,
  backupCompleted,
  isBackingUp,
  isRestoring,
  hasBackup,
  onBackup,
  onRestore,
  onDownload,
}) => (
  <>
    {!isToday(selectedDate) && !hasBackup && (
      <p className="text-red-500 text-sm mb-2">No backups available for the selected date.</p>
    )}

    {!backupCompleted && isToday(selectedDate) && !isBackingUp && (
      <button
        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-700 text-white"
        onClick={onBackup}
        disabled={isBackingUp || isRestoring}
      >
        Backup Now
      </button>
    )}

    {backupCompleted && !isRestoring && userRole === "admin" && (
      <button
        className="mr-4 px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded"
        onClick={onRestore}
        disabled={isBackingUp || isRestoring}
      >
        Restore Data
      </button>
    )}

    {hasBackup && (
      <button
        className="px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded"
        onClick={onDownload}
      >
        Download Backup
      </button>
    )}
  </>
);

export default ModalActions;
