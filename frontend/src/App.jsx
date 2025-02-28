import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import useStore from "./store/useStore";

function App() {
  const initializeStore = useStore((state) => state.initializeStore);

  useEffect(() => {
    if (initializeStore) {
      initializeStore(); // Ensure it's defined before calling
    }
  }, []);

  return (
    <div>
      <Header />
      <Calendar />
    </div>
  );
}

export default App;
