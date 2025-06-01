import React from "react";
import { CloudDownload, CircleUser, LogOut } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="p-2 flex justify-between items-center bg-gray-800 text-white shadow-md">
      {/* <div className="text-lg font-semibold">{username}</div> */}
      <div className="flex items-center space-x-1 text-lg font-semibold">
        <CircleUser className="w-5 h-5" />
        <span>{username}</span>
      </div>
      <div className="flex items-center space-x-2 text-xl font-bold">
        <CloudDownload className="w-6 h-6" />
        <span>Welcome to Backup Sync</span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded text-sm font-semibold flex items-center space-x-1"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </header>
  );
}
