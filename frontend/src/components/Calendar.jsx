import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Move to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Move to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Move to previous year
  const prevYear = () => {
    setCurrentDate(subYears(currentDate, 1));
  };

  // Move to next year
  const nextYear = () => {
    setCurrentDate(addYears(currentDate, 1));
  };

  // Get first and last day of the current month
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);

  // Get first and last day of the current week
  const startWeek = startOfWeek(startMonth);
  const endWeek = endOfWeek(endMonth);

  // Get all the days in the month
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white-100 shadow-lg rounded-lg p-5">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevYear} className="px-3 py-1 bg-gray-200 rounded">
          «
        </button>
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded">
          ‹
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded">
          ›
        </button>
        <button onClick={nextYear} className="px-3 py-1 bg-gray-200 rounded">
          »
        </button>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day) => (
          <div
            key={day}
            className={`py-2 ${
              format(day, "MM") === format(currentDate, "MM")
                ? "text-black"
                : "text-gray-400"
            } ${
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                ? "bg-blue-500 text-white rounded-full"
                : ""
            }`}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
