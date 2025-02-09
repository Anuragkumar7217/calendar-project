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
  isFuture,
} from "date-fns";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [backupDates, setBackupDates] = useState(new Set());

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const handleBackup = (date) => {
    setBackupDates((prev) => new Set([...prev, format(date, "yyyy-MM-dd")]));
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

  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);
  const startWeek = startOfWeek(startMonth);
  const endWeek = endOfWeek(endMonth);
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });

  return (
    <div className="max-w-lg mx-auto mt-15 bg-white-100 border shadow-2xl rounded-lg p-5">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4 bg-gray-200 rounded p-2">
        <button onClick={prevYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">
          «
        </button>
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">
          ‹
        </button>
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">
          ›
        </button>
        <button onClick={nextYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">
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
          const isCurrentMonth = format(day, "MM") === format(currentDate, "MM");
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const formattedDate = format(day, "yyyy-MM-dd");
          const hasBackup = backupDates.has(formattedDate);
          const isFutureDate = isFuture(day);
          
          // Only mark 5, 15, 25 as green if the day has arrived
          const isDefaultBackupDay = !isFutureDate && ["5", "15", "25"].includes(dayNumber);
          
          return (
            <div
              key={day}
              className={`py-2 rounded-full ${
                isFutureDate
                  ? "text-gray-400" // Future dates remain unmarked
                  : isToday
                  ? "bg-amber-400 text-white" // Today is highlighted
                  : hasBackup || isDefaultBackupDay
                  ? "bg-green-300 text-white" // Marked backup dates
                  : isCurrentMonth
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              <button onClick={() => handleDateClick(day)} className="w-10 h-10 cursor-pointer">
                {dayNumber}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Popup */}
      {selectedDate && (
        <Modal
          selectedDate={selectedDate}
          closeModal={closeModal}
          hasBackup={backupDates.has(format(selectedDate, "yyyy-MM-dd"))}
          handleBackup={handleBackup}
        />
      )}
    </div>
  );
};

export default Calendar;
