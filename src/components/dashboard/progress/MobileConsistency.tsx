import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { Check, Zap, ChevronRight, Flame } from "lucide-react";

interface MobileConsistencyProps {
  range: string;
}

export default function MobileConsistency({ range }: MobileConsistencyProps) {
  const { token } = useAuth();
  const [data, setData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`progress/consistency?range=${range}`, token);
        const map = new Map<string, number>();
        res.forEach((item: { day: string; value: number }) => {
          map.set(item.day, item.value);
        });
        setData(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, token]);

  // Determine current week days (Mon-Sun or Sun-Sat)
  // Let's stick to Mon-Sun as displayed in the mockup (M, T, W...)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Calculate Monday of current week
  const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 for Mon

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMon);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Calculate stats
  let completedCount = 0;

  const weekData = weekDays.map((d) => {
    const dStr = d.toISOString().split("T")[0];
    const count = data.get(dStr) || 0;
    if (count > 0) completedCount++;
    return {
      date: d,
      dateStr: dStr,
      isActive: count > 0,
      isToday: dStr === todayStr,
    };
  });

  return (
    <section className="bg-surface rounded-xl p-5 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-text-main text-sm font-semibold uppercase tracking-wider">
            Weekly Consistency
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Keep the streak alive
          </p>
        </div>
      </div>

      {/* Minimal Horizontal Grid */}
      <div className="flex justify-between items-start gap-2 mb-2">
        {weekData.map((day, i) => (
          <div
            key={day.dateStr}
            className="flex flex-col items-center flex-1 gap-2"
          >
            <div
              className={`
                w-full aspect-square rounded-lg flex items-center justify-center relative
                ${
                  day.isActive
                    ? `bg-primary shadow-[0_0_12px_rgba(43,238,205,0.3)]`
                    : `bg-surface-hover`
                }
                ${day.isToday && day.isActive ? "ring-2 ring-primary ring-offset-2" : ""}
                ${day.isToday && !day.isActive ? "ring-2 ring-slate-200 ring-offset-2" : ""}
              `}
            >
              {day.isActive ? (
                day.isToday ? (
                  <Zap size={16} className="text-white fill-white" />
                ) : (
                  <Check size={16} className="text-white" strokeWidth={4} />
                )
              ) : null}
            </div>
            <span
              className={`text-[10px] font-bold ${
                day.isToday ? "text-primary" : "text-text-muted"
              }`}
            >
              {dayLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
