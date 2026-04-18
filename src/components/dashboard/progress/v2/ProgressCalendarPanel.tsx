import { type KeyboardEvent, useMemo, useState } from "react";
import {
  type CalendarMetric,
  type ProgressCalendarDay,
} from "../../../../utils/progress";
import { CalendarDays, ChevronDown, SlidersHorizontal } from "lucide-react";
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

  const dayMap = useMemo(() => {
    const map = new Map<string, ProgressCalendarDay>();
    for (const day of paddedCalendarDays) {
      if (day) {
        map.set(day.day, day);
      }
    }
    return map;
  }, [paddedCalendarDays]);

  const realDays = useMemo(
    () => paddedCalendarDays.filter(Boolean) as ProgressCalendarDay[],
    [paddedCalendarDays],
  );

  const fallbackSelectedDay = realDays[realDays.length - 1]?.day ?? null;
  const resolvedSelectedDay =
    selectedDay && dayMap.has(selectedDay) ? selectedDay : fallbackSelectedDay;

  const resolvedHoveredDay =
    hoveredDay && dayMap.has(hoveredDay) ? hoveredDay : null;
  const baseDayKey = resolvedHoveredDay ?? resolvedSelectedDay;
  const activeDay = baseDayKey ? (dayMap.get(baseDayKey) ?? null) : null;
  const baseDate = useMemo(
    () => (baseDayKey ? new Date(`${baseDayKey}T00:00:00.000Z`) : new Date()),
    [baseDayKey],
  );

  const monthLabel = useMemo(
    () =>
      baseDate.toLocaleDateString(undefined, {
        month: "long",
      }),
    [baseDate],
  );

  const weekDays = useMemo(() => {
    const start = new Date(baseDate);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    return Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + idx);
      const key = date.toISOString().split("T")[0];

      return {
        key,
        shortLabel: date.toLocaleDateString(undefined, { weekday: "short" }),
        dateNumber: date.getUTCDate(),
        isWeekend: idx === 0 || idx === 6,
        item: dayMap.get(key) ?? null,
      };
    });
  }, [baseDate, dayMap]);

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

  const findNextRealDay = (fromDay: string, step: number) => {
    const idx = realDays.findIndex((item) => item.day === fromDay);
    if (idx < 0) {
      return null;
    }

    const next = realDays[idx + step];
    return next ?? null;
  };

  const handleDayKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    day: ProgressCalendarDay,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectDay(day.day);
      return;
    }

    let direction = 0;
    if (event.key === "ArrowRight") direction = 1;
    if (event.key === "ArrowLeft") direction = -1;
    if (!direction) return;

    event.preventDefault();
    const nextDay = findNextRealDay(day.day, direction);
    if (!nextDay) {
      return;
    }

    onSelectDay(nextDay.day);
    setHoveredDay(nextDay.day);
  };

  const cycleMetric = () => {
    const order: CalendarMetric[] = ["sessions", "volume", "intensity"];
    const currentIndex = order.indexOf(metric);
    const next = order[(currentIndex + 1) % order.length];
    onMetricChange(next);
  };

  const jumpToLatest = () => {
    if (!fallbackSelectedDay) {
      return;
    }
    onSelectDay(fallbackSelectedDay);
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
    <section className="md:col-span-12 bg-surface rounded-xl border border-border p-4 md:p-6">
      {loading ? (
        <div className="h-32 flex items-center justify-center text-sm text-text-muted">
          Loading calendar...
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 md:gap-2 text-lg md:text-xl font-black text-text-main tracking-tight group whitespace-nowrap"
            >
              {monthLabel}
              <ChevronDown
                size={18}
                strokeWidth={2.25}
                className="text-text-muted group-hover:text-primary transition-colors"
              />
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={jumpToLatest}
                title="Jump to latest day"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-main hover:text-primary transition-colors"
              >
                <CalendarDays size={17} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={cycleMetric}
                title={`Switch metric (current: ${metric})`}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-main hover:text-primary transition-colors"
              >
                <SlidersHorizontal size={17} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 md:gap-2">
            {weekDays.map((weekDay) => {
              const isSelected = resolvedSelectedDay === weekDay.key;
              const metricText =
                weekDay.item == null
                  ? "--"
                  : metric === "sessions"
                    ? weekDay.item.sessions.toLocaleString()
                    : metric === "volume"
                      ? Math.round(weekDay.item.volume).toLocaleString()
                      : weekDay.item.intensity.toFixed(1);

              return (
                <div
                  key={weekDay.key}
                  className="flex flex-col items-center gap-2 md:gap-3"
                >
                  <span
                    className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${
                      weekDay.isWeekend ? "text-red-500" : "text-text-muted"
                    }`}
                  >
                    {weekDay.shortLabel}
                  </span>

                  {weekDay.item ? (
                    <button
                      type="button"
                      onClick={() => onSelectDay(weekDay.item.day)}
                      onMouseEnter={() => setHoveredDay(weekDay.item.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onFocus={() => setHoveredDay(weekDay.item.day)}
                      onBlur={() => setHoveredDay(null)}
                      onKeyDown={(event) =>
                        handleDayKeyDown(event, weekDay.item)
                      }
                      title={`${weekDay.item.day} • ${weekDay.item.sessions} sessions • ${Math.round(weekDay.item.volume)} volume`}
                      className="flex flex-col items-center gap-2 outline-none"
                    >
                      {isSelected ? (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                          <span className="text-base md:text-lg font-bold text-white">
                            {weekDay.dateNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base md:text-lg font-bold text-text-main leading-none">
                          {weekDay.dateNumber}
                        </span>
                      )}

                      <span
                        className={`w-6 h-1 rounded-full ${
                          levelClass[weekDay.item.level]
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <span className="text-base md:text-lg font-bold text-text-main leading-none">
                        {weekDay.dateNumber}
                      </span>
                      <span className="w-6 h-1 rounded-full bg-surface-hover" />
                    </div>
                  )}

                  <span className="text-[10px] md:text-[11px] text-text-muted leading-none">
                    {metricText}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
            <div className="bg-surface-hover rounded-lg p-2 border border-border/70">
              <p className="text-[10px] text-text-muted">{metricLabel}</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {metricValue}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2 border border-border/70">
              <p className="text-[10px] text-text-muted">Day Streak</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {activeDayStreak}d
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2 border border-border/70">
              <p className="text-[10px] text-text-muted">Active Days</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {calendarSummary
                  ? `${calendarSummary.activeDays}/${calendarSummary.totalDays}`
                  : "--"}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2 border border-border/70">
              <p className="text-[10px] text-text-muted">Current / Best</p>
              <p className="text-xs font-semibold text-text-main mt-0.5">
                {calendarSummary
                  ? `${calendarSummary.currentStreak}d / ${calendarSummary.bestStreak}d`
                  : "--"}
              </p>
            </div>
          </div>

          <div className="w-12 h-1 bg-surface-hover rounded-full mx-auto mt-5" />
        </>
      )}
    </section>
  );
}
