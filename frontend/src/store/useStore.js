import create from 'zustand';

const useStore = create((set) => ({
  selectedDate: null,
  isBackupInProgress: false,
  backupStatus: '',
  setSelectedDate: (date) => set({ selectedDate: date }),
  setBackupInProgress: (status) => set({ isBackupInProgress: status }),
  setBackupStatus: (status) => set({ backupStatus: status }),
}));

export default useStore;  