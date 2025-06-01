import { create } from "zustand";

const useCalendarStore = create((set) => ({
  selectedDate: null,
  backupDates: [],

  // Set the selected date
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Set full list of backup dates
  setBackupDates: (dates) => set({ backupDates: dates }),

  // Add a backup date if not already present
  addBackupDate: (date) =>
    set((state) => {
      if (!state.backupDates.includes(date)) {
        return { backupDates: [...state.backupDates, date] };
      }
      return {};
    }),

  // Fetch backup dates from backend
  fetchBackupDates: async () => {
    try {
      const response = await fetch("/api/backup/dates"); // ✅ Fixed endpoint

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const dateList = Array.isArray(data)
        ? data.map((item) => item.date)
        : [];

      set({ backupDates: dateList });
    } catch (error) {
      console.error("Error fetching backup dates:", error.message);
    }
  },
}));

export default useCalendarStore;
