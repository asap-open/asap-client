import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { ChevronDown } from "lucide-react";

interface ConsistencyHeatmapProps {
  range: string;
}

export default function ConsistencyHeatmap({ range }: ConsistencyHeatmapProps) {
  const { token } = useAuth();
  const [data, setData] = useState<{ day: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`progress/consistency?range=${range}`, token);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, token]);

  // Transform data into simple array of opacity levels for valid visual
  // Just show last N entries depending on range or just fill a grid
  // The mockup shows a horizontal grid of bars.
  // Let's create something representing recent activity intensity.

  // Create an array of 30 items max for display, ending today
  const chartItems = Array.from({ length: 45 }).map((_, i) => {
    // Logic to find date and value would go here if strict mapping required
    // For visual "vibe", we check if we have data.
    return { value: 0 }; // placeholder
  });

  // Real mapping
  // We need a map of date->value
  const valMap = new Map<string, number>();
  data.forEach((d) => valMap.set(d.day, d.value));

  const today = new Date();
  const displayBars = [];
  for (let i = 39; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const count = valMap.get(dStr) || 0;

    // opacity classes based on count
    let opacityClass = "bg-primary/10";
    if (count === 1) opacityClass = "bg-primary/40";
    if (count > 1) opacityClass = "bg-primary/80";
    if (count > 2) opacityClass = "bg-primary";

    displayBars.push({ date: dStr, opacityClass });
  }

  return (
    <section className="bg-surface rounded-xl p-5 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Recent Activity
        </h3>
        <span className="text-xs font-medium text-primary">Last 40 Days</span>
      </div>

      {loading ? (
        <div className="h-4 flex items-center justify-center text-xs text-text-muted">
          Loading...
        </div>
      ) : (
        <div className="flex gap-1 mb-4 overflow-hidden h-4">
          {displayBars.map((bar) => (
            <div
              key={bar.date}
              className={`flex-1 rounded-sm ${bar.opacityClass}`}
              title={bar.date}
            ></div>
          ))}
        </div>
      )}

      {/* Optional expander */}
      {/* 
      <div className="flex items-center justify-center gap-1 text-primary text-sm font-medium cursor-pointer">
        <span>Detailed View</span>
        <ChevronDown size={16} />
      </div>
      */}
    </section>
  );
}
