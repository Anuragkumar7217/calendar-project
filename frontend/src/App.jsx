import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Calendar from "./components/Calendar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <Calendar />
    </>
  );
}

export default App;
