import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useStore = create((set, get) => ({
  selectedDate: null,
  isBackupInProgress: JSON.parse(localStorage.getItem("isBackupInProgress")) || false,
  backupStatus: "",
  backupDates: new Set(JSON.parse(localStorage.getItem("backupDates")) || []),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setBackupInProgress: (status) => {
    localStorage.setItem("isBackupInProgress", JSON.stringify(status));
    set({ isBackupInProgress: status });
  },

  setBackupStatus: (status) => set({ backupStatus: status }),

  fetchBackupDates: async (startDate, endDate) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ backupStatus: "Authentication token is missing. Please log in." });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/listbackups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) throw new Error(`Failed to fetch backups: ${response.statusText}`);

      const data = await response.json();
      if (data.backups) {
        const formattedDates = new Set(data.backups.map((file) => file.date));
        localStorage.setItem("backupDates", JSON.stringify([...formattedDates]));
        set({ backupDates: formattedDates });
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
      set({ backupStatus: "Failed to fetch backup dates." });
    }
  },

  addBackupDate: async () => {
    set({ isBackupInProgress: true, backupStatus: "Backup in progress..." });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ backupStatus: "Authentication token is missing. Please log in." });
        set({ isBackupInProgress: false });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/backup`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Backup request failed");

      const data = await response.json();
      if (data.message) {
        const date = new Date().toISOString().split("T")[0];
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
      console.error("Error taking backup:", error);
      set({ backupStatus: "Backup failed" });
    } finally {
      set({ isBackupInProgress: false });
    }
  },

  restoreBackup: async (filename) => {
    set({ isBackupInProgress: true, backupStatus: "Restoring backup..." });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ backupStatus: "Authentication token is missing. Please log in." });
        set({ isBackupInProgress: false });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/restore/${filename}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Restore request failed");

      const data = await response.json();
      if (data.message) {
        set({ backupStatus: `Restored backup from ${filename}` });
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      set({ backupStatus: "Restore failed" });
    } finally {
      set({ isBackupInProgress: false });
    }
  },
}));

export default useStore;