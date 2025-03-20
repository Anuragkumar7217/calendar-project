import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore"; // Ensure the correct path
 
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role selection
  const [error, setError] = useState("");
  const navigate = useNavigate();
 
  const { setBackupStatus } = useStore();
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
 
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
 
    if (!username || !password) {
      setError("Please enter valid credentials");
      return;
    }
 
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
 
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server: " + text);
      }
 
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify({ username, role }));
        localStorage.setItem("token", data.token); // Store token
 
        setBackupStatus("Login successful");
        navigate(`/${role}`);
      } else {
        setError(data.msg || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setError("Something went wrong. Please try again.");
    }
  };
 
  return (
    <div className="max-w-md mx-auto mt-12 bg-white border shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Login
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
 
      <form onSubmit={handleLogin}> {/* Wrapped inputs in a form */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
};
 
export default LoginPage;
 