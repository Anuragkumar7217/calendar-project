import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  userRole: localStorage.getItem("userRole") || null,
  username: localStorage.getItem("username") || null,

  login: ({ token, userRole, username }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("username", username);
    set({ token, userRole, username });
  },

  logout: () => {
    localStorage.clear();
    set({ token: null, userRole: null, username: null });
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
}));

export default useAuthStore;
