import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CalendarMetric,
  type ProgressCalendarDay,
} from "../../../../utils/progress";
import { levelClass } from "./constants";

interface ProgressCalendarPanelProps {
  loading: boolean;
  selectedDay: string | null;
  metric: CalendarMetric;
  paddedCalendarDays: Array<ProgressCalendarDay | null>;
  calendarSummary: {
    activeDays: number;
    totalDays: number;
    currentStreak: number;
    bestStreak: number;
  } | null;
  onSelectDay: (day: string) => void;
  onMetricChange: (next: CalendarMetric) => void;
}

export function ProgressCalendarPanel({
  loading,
  selectedDay,
  metric,
  paddedCalendarDays,
  calendarSummary,
  onSelectDay,
  onMetricChange,
}: ProgressCalendarPanelProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const dayMap = useMemo(() => {
    const map = new Map<string, ProgressCalendarDay>();
    for (const day of paddedCalendarDays) {
      if (day) {
        map.set(day.day, day);
      }
    }
    return map;
  }, [paddedCalendarDays]);

  useEffect(() => {
    if (!selectedDay) {
      return;
    }
    if (!dayMap.has(selectedDay)) {
      setHoveredDay(null);
    }
  }, [selectedDay, dayMap]);

  const activeDayKey = hoveredDay ?? selectedDay;
  const activeDay = activeDayKey ? (dayMap.get(activeDayKey) ?? null) : null;

  const realDays = useMemo(
    () => paddedCalendarDays.filter(Boolean) as ProgressCalendarDay[],
    [paddedCalendarDays],
  );

  const activeDayStreak = useMemo(() => {
    if (!activeDay) return 0;
    const idx = realDays.findIndex((d) => d.day === activeDay.day);
    if (idx < 0 || activeDay.sessions <= 0) return 0;

    let start = idx;
    while (start > 0 && realDays[start - 1].sessions > 0) {
      start -= 1;
    }

    let end = idx;
    while (end < realDays.length - 1 && realDays[end + 1].sessions > 0) {
      end += 1;
    }

    return end - start + 1;
  }, [activeDay, realDays]);

  const findNextSelectableIndex = (startIndex: number, step: number) => {
    let idx = startIndex + step;
    while (idx >= 0 && idx < paddedCalendarDays.length) {
      if (paddedCalendarDays[idx]) {
        return idx;
      }
      idx += step;
    }
    return -1;
  };

  const handleDayKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let step = 0;
    if (event.key === "ArrowRight") step = 1;
    if (event.key === "ArrowLeft") step = -1;
    if (event.key === "ArrowDown") step = 7;
    if (event.key === "ArrowUp") step = -7;
    if (!step) return;

    event.preventDefault();
    const nextIndex = findNextSelectableIndex(index, step);
    if (nextIndex < 0) return;

    const nextDay = paddedCalendarDays[nextIndex];
    if (!nextDay) return;

    onSelectDay(nextDay.day);
    setHoveredDay(nextDay.day);
    buttonRefs.current[nextIndex]?.focus();
  };

  const metricLabel =
    metric === "sessions"
      ? "Sessions"
      : metric === "volume"
        ? "Volume"
        : "Intensity";

  const metricValue = activeDay
    ? metric === "sessions"
      ? activeDay.sessions.toLocaleString()
      : metric === "volume"
        ? Math.round(activeDay.volume).toLocaleString()
        : activeDay.intensity.toFixed(1)
    : "--";

  return (
    <section className="md:col-span-8 bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-text-main">
          Consistency Calendar
        </h2>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-semibold text-text-muted">
            Click a day to drill down
          </span>
          <div className="grid grid-cols-3 bg-surface-hover border border-border rounded-lg p-1">
            {(
              [
                ["sessions", "S"],
                ["volume", "V"],
                ["intensity", "I"],
              ] as Array<[CalendarMetric, string]>
            ).map(([item, label]) => (
              <button
                key={item}
                onClick={() => onMetricChange(item)}
                title={item}
                className={`text-[11px] px-2 py-1 rounded-md font-bold uppercase ${
                  metric === item ? "bg-primary text-white" : "text-text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <p
            key={day}
            className="text-[10px] font-bold text-text-muted text-center uppercase"
          >
            {day}
          </p>
        ))}
      </div>

      {loading ? (
        <div className="h-44 flex items-center justify-center text-sm text-text-muted">
          Loading calendar...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-surface-hover rounded-lg p-2">
              <p className="text-[10px] text-text-muted">Active Day</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {activeDay
                  ? new Date(
                      `${activeDay.day}T00:00:00.000Z`,
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "--"}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2">
              <p className="text-[10px] text-text-muted">{metricLabel}</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {metricValue}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2">
              <p className="text-[10px] text-text-muted">Day Streak</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {activeDayStreak}d
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2">
              <p className="text-[10px] text-text-muted">Current / Best</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {calendarSummary
                  ? `${calendarSummary.currentStreak}d / ${calendarSummary.bestStreak}d`
                  : "--"}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-muted mb-2">
            Arrow keys navigate days. Enter selects and updates drilldown.
          </p>

          <div className="grid grid-cols-7 gap-2">
            {paddedCalendarDays.map((item, idx) =>
              item ? (
                <button
                  ref={(el) => {
                    buttonRefs.current[idx] = el;
                  }}
                  key={item.day}
                  onClick={() => onSelectDay(item.day)}
                  onMouseEnter={() => setHoveredDay(item.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onFocus={() => setHoveredDay(item.day)}
                  onBlur={() => setHoveredDay(null)}
                  onKeyDown={(event) => handleDayKeyDown(event, idx)}
                  title={`${item.day} • ${item.sessions} sessions • ${Math.round(item.volume)} volume`}
                  className={`aspect-square rounded-md transition-all border ${
                    selectedDay === item.day
                      ? "ring-2 ring-primary border-primary"
                      : "border-transparent"
                  } ${
                    activeDay?.day === item.day ? "ring-1 ring-primary/50" : ""
                  } ${levelClass[item.level]}`}
                />
              ) : (
                <div key={`empty-${idx}`} className="aspect-square" />
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}
