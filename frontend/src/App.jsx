import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "./components/Header";
import Calendar from "./components/Calendar";

function App() {
  return (
    <>
      <Header />
      <Calendar />
    </>
  );
}

export default App;
