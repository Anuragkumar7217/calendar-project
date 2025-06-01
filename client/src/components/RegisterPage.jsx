import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudDownload } from "lucide-react";
import { registerUser  } from "../services/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    } else if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await registerUser({ username, password, role });
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userRole", res.userRole);
        navigate("/");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-300 via-blue-100 to-white">
      <div className="bg-gradient-to-b from-sky-200 via-sky-50 to-white  py-6 px-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-gray-100 p-2 rounded-full mb-2">
            <CloudDownload className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister}>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
