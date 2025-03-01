import { create } from "zustand"; 


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Retrieve backupDates from localStorage (Ensure it is always an array)
const storedBackupDates = JSON.parse(localStorage.getItem("backupDates")) || [];

const useStore = create((set) => ({
  selectedDate: null,
  isBackupInProgress: JSON.parse(localStorage.getItem("isBackupInProgress")) || false,
  backupStatus: "",
  backupDates: new Set(storedBackupDates), // Initialize Set from localStorage

  setSelectedDate: (date) => set({ selectedDate: date }),
  setBackupInProgress: (status) => {
    localStorage.setItem("isBackupInProgress", JSON.stringify(status));
    set({ isBackupInProgress: status });
  },
  setBackupStatus: (status) => set({ backupStatus: status }),

  fetchBackupDates: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/backups`);
      const data = await response.json();
      if (data.backups) {
        const formattedDates = new Set(data.backups.map((file) => file.replace("backup-", "")));
        localStorage.setItem("backupDates", JSON.stringify([...formattedDates]));
        set({ backupDates: formattedDates });
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  },

  addBackupDate: async (date) => {
    set({ isBackupInProgress: true });
    try {
      const response = await fetch(`${API_BASE_URL}/backup/${date}`, { method: "POST" });
      const data = await response.json();

      if (data.message) {
        set((state) => {
          const updatedBackupDates = new Set([...state.backupDates, date]);
          localStorage.setItem("backupDates", JSON.stringify([...updatedBackupDates]));
          return { backupDates: updatedBackupDates, backupStatus: `Backup successful for ${date}` };
        });
      }
    } catch (error) {
      set({ backupStatus: "Backup failed" });
      console.error("Error taking backup:", error);
    } finally {
      set({ isBackupInProgress: false });
    }
  },

  restoreBackup: async (date) => {
    set({ isBackupInProgress: true });
    try {
      const response = await fetch(`${API_BASE_URL}/restore/${date}`, { method: "POST" });
      const data = await response.json();

      if (data.message) {
        set({ backupStatus: `Restored backup from ${date}` });
      }
    } catch (error) {
      set({ backupStatus: "Restore failed" });
      console.error("Error restoring backup:", error);
    } finally {
      set({ isBackupInProgress: false });
    }
  },

  initializeStore: () => {
    const storedDates = JSON.parse(localStorage.getItem("backupDates")) || [];
    set({ backupDates: new Set(storedDates) });
  },
}));

export default useStore;
