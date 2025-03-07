import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Retrieve stored backup dates safely
const storedBackupDates = JSON.parse(localStorage.getItem("backupDates")) || [];

const useStore = create((set) => ({
  selectedDate: null,
  isBackupInProgress: JSON.parse(localStorage.getItem("isBackupInProgress")) || false,
  backupStatus: "",
  backupDates: new Set(storedBackupDates), // Store as a Set to avoid duplicates

  setSelectedDate: (date) => set({ selectedDate: date }),

  setBackupInProgress: (status) => {
    localStorage.setItem("isBackupInProgress", JSON.stringify(status));
    set({ isBackupInProgress: status });
  },

  setBackupStatus: (status) => set({ backupStatus: status }),

  // Fetch backup dates dynamically
  fetchBackupDates: async (startDate, endDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/listbackups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();
      if (data.backups) {
        const formattedDates = new Set(data.backups.map((file) => file.date));
        localStorage.setItem("backupDates", JSON.stringify([...formattedDates]));
        set({ backupDates: formattedDates });
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  },

  // Add a new backup
  addBackupDate: async () => {
    set({ isBackupInProgress: true });
    try {
      const response = await fetch(`${API_BASE_URL}/backup`, { method: "POST" });
      const data = await response.json();

      if (data.message) {
        const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        set((state) => {
          const updatedBackupDates = new Set([...state.backupDates, date]);
          localStorage.setItem("backupDates", JSON.stringify([...updatedBackupDates]));
          return {
            backupDates: updatedBackupDates,
            backupStatus: `Backup successful for ${date}`,
          };
        });
      }
    } catch (error) {
      set({ backupStatus: "Backup failed" });
      console.error("Error taking backup:", error);
    } finally {
      set({ isBackupInProgress: false });
    }
  },

  // Restore a backup
  restoreBackup: async (filename) => {
    set({ isBackupInProgress: true });
    try {
      const response = await fetch(`${API_BASE_URL}/restore/${filename}`, { method: "POST" });
      const data = await response.json();

      if (data.message) {
        set({ backupStatus: `Restored backup from ${filename}` });
      }
    } catch (error) {
      set({ backupStatus: "Restore failed" });
      console.error("Error restoring backup:", error);
    } finally {
      set({ isBackupInProgress: false });
    }
  },
}));

export default useStore;
