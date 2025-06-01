import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudDownload } from "lucide-react";
import { loginUser } from "../services/api";
import useAuthStore from "../store/useAuthStore"; // ✅ Import Zustand store

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const { login } = useAuthStore(); // ✅ Zustand login
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter valid credentials");
      return;
    }

    try {
      const res = await loginUser({ username, password, role });

      if (res.token) {
        if (res.userRole !== role) {
          setError("Selected role does not match user role.");
          return;
        }

        login({
          token: res.token,
          userRole: res.userRole,
          username: username,
        });

        navigate("/calendar");
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-300 via-blue-100 to-white">
      <div className="bg-gradient-to-b from-sky-200 via-white to-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gray-100 p-2 rounded-full mb-2">
            <CloudDownload className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Backup Sync</h2>
          <p className="text-gray-500 text-sm mt-1">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-6 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-md font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
