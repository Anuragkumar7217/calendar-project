// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setIsAuthenticated, setUserRole }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username && password) {
            const userData = { username, role };
            localStorage.setItem("user", JSON.stringify(userData));

            setIsAuthenticated(true);
            setUserRole(role);

            navigate(`/${role}`); // Redirect after login
        } else {
            alert("Please enter valid credentials");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white border shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
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
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                Login
            </button>
        </div>
    );
};

export default LoginPage;
