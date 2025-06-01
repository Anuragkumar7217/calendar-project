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

import React, { useEffect, useState, useCallback } from "react";
import Modal from "./Modal";
import useCalendarStore from "../store/useCalendarStore";

const Calendar = ({ userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    selectedDate,
    setSelectedDate,
    backupDates,
    setBackupDates, // 🟢 Needed to update Zustand store
  } = useCalendarStore();

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch("/api/backup/dates");
      const data = await res.json();

      const dateList = Array.isArray(data) ? data.map(item => item.date) : [];
      setBackupDates(dateList); // ✅ Correct format for Zustand store
    } catch (err) {
      console.error("Error fetching backup dates:", err);
    }
  }, [setBackupDates]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const handleDateClick = (date) => {
    if (!isFuture(date)) setSelectedDate(date);
  };

  const handleBackup = async (date) => {
    try {
      const res = await fetch("/api/backup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: format(date, "yyyy-MM-dd") }),
      });

      if (res.ok) {
        await fetchDates();
      }
    } catch (err) {
      console.error("Backup failed:", err);
    }
  };

  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const prevYear = () => setCurrentDate((prev) => subYears(prev, 1));
  const nextYear = () => setCurrentDate((prev) => addYears(prev, 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const backupSet = new Set(backupDates || []);

  return (
    <div className="bg-gradient-to-b from-blue-300 via-blue-100 to-white p-20">
      <div className="max-w-lg mx-auto bg-gradient-to-b from-sky-200 via-sky-50 to-white border shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-2 border border-gray-400 rounded-lg p-2">
          <button onClick={prevYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">«</button>
          <button onClick={prevMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">‹</button>
          <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={nextMonth} className="px-3 py-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">›</button>
          <button onClick={nextYear} className="px-3 py-1 bg-gray-400 rounded cursor-pointer">»</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 w-10 h-10 flex items-center justify-center">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day) => {
            const formattedDate = format(day, "yyyy-MM-dd");
            const isToday = formattedDate === format(new Date(), "yyyy-MM-dd");
            const isFutureDate = isFuture(day);
            const hasBackup = backupSet.has(formattedDate);

            return (
              <button
                key={formattedDate}
                onClick={() => handleDateClick(day)}
                className={`py-2 w-10 h-10 rounded-full cursor-pointer transition duration-300 ${
                  hasBackup
                    ? "bg-green-500 text-white"
                    : isToday
                    ? "bg-amber-400 text-white"
                    : isFutureDate
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black hover:bg-gray-200"
                }`}
                disabled={isFutureDate}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <Modal
            selectedDate={selectedDate}
            closeModal={() => setSelectedDate(null)}
            handleBackup={handleBackup}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;
