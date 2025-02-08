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
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
//import useStore from "../store/useStore";
//import DateButton from "./DateButton";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };
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
    <div className="max-w-lg mx-auto mt-15 bg-white-100 border shadow-2xl rounded-lg p-5">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4 bg-gray-200 rounded p-2">
        <button
          onClick={prevYear}
          className="px-3 py-1  bg-gray-400 rounded cursor-pointer"
        >
          «
        </button>
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 "
        >
          ‹
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400"
        >
          ›
        </button>
        <button
          onClick={nextYear}
          className="px-3 py-1 bg-gray-400 rounded cursor-pointer"
        >
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
        {days.map((day) => {
          const dayNumber = format(day, "d");
          const isCurrentMonth =
            format(day, "MM") === format(currentDate, "MM");
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const hasBackUP = ["5", "15", "25"].includes(dayNumber.toString());

          return (
            <div
              key={day}
              className={`py-2 rounded-full ${
                isToday
                  ? "bg-amber-400 text-white"
                  : hasBackUP
                  ? "bg-green-300 text-white"
                  : isCurrentMonth
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              <button
                onClick={() => handleDateClick(day)}
                className="w-10 h-10 cursor-pointer "
              >
                {dayNumber}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Popup */}
      <Modal selectedDate={selectedDate} closeModal={closeModal} />
    </div>
  );
};

export default Calendar;
