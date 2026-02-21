import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchSessionCalendarStats } from "../../../utils/session";

interface DayData {
  day: string;
  date: string;
  fullDate: string;
  hasWorkout: boolean;
  workoutCount: number;
}

export default function WeekCalendar() {
  const { token } = useAuth();
  const [days, setDays] = useState<DayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);

    // Get to Monday of current week
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + diff);

    const weekDays: DayData[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const fullDate = date.toISOString().split("T")[0];
      const isToday = fullDate === today.toISOString().split("T")[0];

      weekDays.push({
        day: dayNames[date.getDay()],
        date: date.getDate().toString(),
        fullDate,
        hasWorkout: false,
        workoutCount: 0,
      });

      if (isToday) {
        setSelectedDate(fullDate);
      }
    }

    setDays(weekDays);
  };

  const fetchCalendarData = async () => {
    try {
      const calendarData = await fetchSessionCalendarStats(token, 7);

      // Map workout data to days
      setDays((prevDays) =>
        prevDays.map((day) => {
          const dayData = calendarData.find(
            (d: any) => d.date === day.fullDate,
          );
          return {
            ...day,
            hasWorkout: dayData?.workouts > 0 || false,
            workoutCount: dayData?.workouts || 0,
          };
        }),
      );
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    }
  };

  useEffect(() => {
    generateWeekDays();
    fetchCalendarData();
  }, []);

  return (
    <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar px-1">
      {days.map((item, index) => {
        const isSelected = item.fullDate === selectedDate;
        return (
          <div
            key={index}
            onClick={() => setSelectedDate(item.fullDate)}
            className={`
              relative flex flex-col items-center min-w-[54px] p-3 rounded-2xl border shadow-sm transition-all cursor-pointer 
              ${
                isSelected
                  ? "bg-primary text-background border-primary shadow-lg shadow-primary/30"
                  : "bg-surface text-text-main border-border hover:border-text-muted/40"
              }
            `}
          >
            <span
              className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? "opacity-80" : "text-text-muted"}`}
            >
              {item.day}
            </span>
            <span className="text-lg font-bold">{item.date}</span>

            {/* Workout indicator dot */}
            {item.hasWorkout && (
              <div
                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                  isSelected ? "bg-text-main" : "bg-primary"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
