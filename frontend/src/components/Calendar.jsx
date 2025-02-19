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
import useStore from "../store/useStore";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { selectedDate, setSelectedDate, backupDates, addBackupDate, fetchBackupDates } = useStore();

  useEffect(() => {
    fetchBackupDates(); // Load backup data on mount
  }, []);

  const handleDateClick = (date) => setSelectedDate(date);
  const closeModal = () => setSelectedDate(null);

  const handleBackup = async (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    await addBackupDate(formattedDate);
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevYear = () => setCurrentDate(subYears(currentDate, 1));
  const nextYear = () => setCurrentDate(addYears(currentDate, 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return (
    <div className="max-w-lg mx-auto mt-5 bg-white border shadow-lg rounded-lg p-8">
      <div className="flex justify-between items-center mb-4 bg-gray-200 rounded p-2">
        <button onClick={prevYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">«</button>
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">‹</button>
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">›</button>
        <button onClick={nextYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">»</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const isToday = formattedDate === format(new Date(), "yyyy-MM-dd");
          const isFutureDate = isFuture(day);
          const hasBackup = backupDates.has(formattedDate);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`py-2 w-10 h-10 rounded-full cursor-pointer transition duration-300 ${
                isToday ? "bg-amber-400 text-white"
                : hasBackup ? "bg-green-500 text-white"
                : isFutureDate ? "text-gray-400"
                : "text-black"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {selectedDate && <Modal selectedDate={selectedDate} closeModal={closeModal} handleBackup={handleBackup} />}
    </div>
  );
};

export default Calendar;
