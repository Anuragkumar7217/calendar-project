import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import Calendar from "./components/Calendar.jsx";
import useAuthStore from "./store/useAuthStore"; // ✅ Import Zustand auth store

function AppWrapper() {
  const { token, userRole } = useAuthStore();
  const location = useLocation();

  const showHeader = token && location.pathname !== "/" && location.pathname !== "/register";

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/calendar"
          element={token ? <Calendar userRole={userRole} /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
