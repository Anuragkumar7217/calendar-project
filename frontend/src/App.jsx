import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import useStore from "./store/useStore";
import LoginPage from "./components/LoginPage";

function App() {
  const initializeStore = useStore((state) => state.initializeStore);

  // Get authentication data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedUser);
  const [userRole, setUserRole] = useState(storedUser?.role || null);

  useEffect(() => {
    if (initializeStore) {
      initializeStore();
    }
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        {/* Always show LoginPage first if not authenticated */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />

        {/* Role-based routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Calendar userRole={userRole} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user"
          element={
            isAuthenticated && userRole === "user" ? (
              <Calendar userRole={userRole} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
