import React from "react";
import { CalendarDays } from "lucide-react";

const Header = () => {
  return (
    <header className="p-2 flex items-center justify-center bg-gray-800 text-white font-bold text-3xl shadow-2xl">
      <CalendarDays className="w-10 h-10 mr-2" />
      <span>Calendar FRL</span>
    </header>
  );
};

export default Header;
