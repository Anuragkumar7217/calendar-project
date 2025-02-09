import React from "react";
import { format } from "date-fns";

const Modal = ({ selectedDate, closeModal, hasBackup, handleBackup }) => {
  if (!selectedDate) return null;

  const isFutureDate = selectedDate > new Date(); // Check if it's a future date

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4">
          Options for {format(selectedDate, "PPP")}
        </h2>

        {!isFutureDate && (
          <>
            {hasBackup ? (
              <button className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-700">
                Restore Data
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={() => handleBackup(selectedDate)}
              >
                Backup Now
              </button>
            )}
          </>
        )}

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
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
