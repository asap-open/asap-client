import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithSWR } from "../../utils/swrHelpers";
import { CacheTTL } from "../../utils/cacheService";
import {
  fetchMuscleBalance,
  fetchPBTimeline,
  fetchDayDetail,
  fetchProgressCalendar,
  fetchProgressSummary,
  fetchProgressTimeSeries,
  fetchStrength1RM,
  fetchWorkload,
  type CalendarMetric,
  type Granularity,
  type DayDetailResponse,
  type MuscleBalanceResponse,
  type PBTimelineResponse,
  type ProgressCalendarResponse,
  type ProgressMode,
  type ProgressSummaryResponse,
  type ProgressTimeSeriesResponse,
  type Strength1RMResponse,
  type TimeRange,
  type WorkloadResponse,
} from "../../utils/progress";
import { ProgressHeader } from "../../components/dashboard/progress/v2/ProgressHeader";
import { ProgressKpiGrid } from "../../components/dashboard/progress/v2/ProgressKpiGrid";
import { ProgressCalendarPanel } from "../../components/dashboard/progress/v2/ProgressCalendarPanel";
import { ProgressDayDetailPanel } from "../../components/dashboard/progress/v2/ProgressDayDetailPanel";
import { ProgressWorkloadPanel } from "../../components/dashboard/progress/v2/ProgressWorkloadPanel";
import { ProgressInsightsPanel } from "../../components/dashboard/progress/v2/ProgressInsightsPanel";
import { ProgressPBTimelinePanel } from "../../components/dashboard/progress/v2/ProgressPBTimelinePanel";
import { ProgressMobileDaySheet } from "../../components/dashboard/progress/v2/ProgressMobileDaySheet";
import {
  type MuscleGroupFilter,
  modes,
  ranges,
} from "../../components/dashboard/progress/v2/constants";

export default function Progress() {
  const { token } = useAuth();
  const [range, setRange] = useState<TimeRange>("1M");
  const [mode, setMode] = useState<ProgressMode>("Balanced");
  const [calendarMetric, setCalendarMetric] =
    useState<CalendarMetric>("sessions");
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [compare, setCompare] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [hasUserSelectedDay, setHasUserSelectedDay] = useState(false);
  const [isMobileDaySheetOpen, setIsMobileDaySheetOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    const scrollRoot = document.getElementById("dashboard-scroll-root");
    return scrollRoot ? scrollRoot.scrollTop > 60 : false;
  });
  const [summary, setSummary] = useState<ProgressSummaryResponse | null>(null);
  const [calendar, setCalendar] = useState<ProgressCalendarResponse | null>(
    null,
  );
  const [timeSeries, setTimeSeries] =
    useState<ProgressTimeSeriesResponse | null>(null);
  const [workload, setWorkload] = useState<WorkloadResponse | null>(null);
  const [muscleBalance, setMuscleBalance] =
    useState<MuscleBalanceResponse | null>(null);
  const [pbTimeline, setPbTimeline] = useState<PBTimelineResponse | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroupFilter | null>(null);
  const [strengthTrend, setStrengthTrend] =
    useState<Strength1RMResponse | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isActive = true;

    const loadProgress = async () => {
      setLoading(true);
      setError(null);
      setIsMobileDaySheetOpen(false);
      try {
        const [
          summaryData,
          calendarData,
          timeSeriesData,
          workloadData,
          muscleBalanceData,
          pbTimelineData,
        ] = await Promise.all([
          fetchWithSWR(
            `progress:summary:${range}:${mode}`,
            () => fetchProgressSummary(token, range, mode),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setSummary(data); }
          ),
          fetchWithSWR(
            `progress:calendar:${range}:${calendarMetric}`,
            () => fetchProgressCalendar(token, range, calendarMetric),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setCalendar(data); }
          ),
          fetchWithSWR(
            `progress:timeSeries:${range}:${granularity}:${compare}`,
            () => fetchProgressTimeSeries(token, range, granularity, compare),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setTimeSeries(data); }
          ),
          fetchWithSWR(
            `progress:workload:${range}`,
            () => fetchWorkload(token, range),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setWorkload(data); }
          ),
          fetchWithSWR(
            `progress:muscleBalance:${range}:${mode}`,
            () => fetchMuscleBalance(token, range, mode),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setMuscleBalance(data); }
          ),
          fetchWithSWR(
            `progress:pbTimeline:${range}`,
            () => fetchPBTimeline(token, range),
            CacheTTL.FIVE_MINUTES,
            (data) => { if (isActive) setPbTimeline(data); }
          ),
        ]);

        if (!isActive) return;

        setSummary(summaryData);
        setCalendar(calendarData);
        setTimeSeries(timeSeriesData);
        setWorkload(workloadData);
        setMuscleBalance(muscleBalanceData);
        setPbTimeline(pbTimelineData);

        const defaultExercise = pbTimelineData.events[0]?.exerciseId ?? "";
        setSelectedExerciseId((prev) => prev || defaultExercise);

        const defaultDay =
          calendarData.days
            .slice()
            .reverse()
            .find((d) => d.sessions > 0)?.day ??
          calendarData.days[calendarData.days.length - 1]?.day ??
          null;
        setSelectedDay((prev) => {
          if (prev && calendarData.days.some((d) => d.day === prev)) {
            return prev;
          }
          return defaultDay;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load progress",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [token, range, mode, calendarMetric, granularity, compare]);

  useEffect(() => {
    if (!token || !selectedExerciseId) {
      setStrengthTrend(null);
      return;
    }
    let isActive = true;

    const loadStrengthTrend = async () => {
      try {
        const result = await fetchWithSWR(
          `progress:strength1RM:${range}:${selectedExerciseId}`,
          () => fetchStrength1RM(token, range, selectedExerciseId),
          CacheTTL.FIVE_MINUTES,
          (data) => { if (isActive) setStrengthTrend(data); }
        );
        if (isActive) setStrengthTrend(result);
      } catch {
        if (isActive) setStrengthTrend(null);
      }
    };

    loadStrengthTrend();
    return () => { isActive = false; };
  }, [token, range, selectedExerciseId]);

  useEffect(() => {
    if (!token || !selectedDay || !hasUserSelectedDay) {
      setDayDetail(null);
      return;
    }
    let isActive = true;

    const loadDayDetail = async () => {
      setDayLoading(true);
      try {
        const detail = await fetchWithSWR(
          `progress:dayDetail:${selectedDay}`,
          () => fetchDayDetail(token, selectedDay),
          CacheTTL.FIVE_MINUTES,
          (data) => { if (isActive) setDayDetail(data); }
        );
        if (isActive) setDayDetail(detail);
      } catch {
        if (isActive) setDayDetail(null);
      } finally {
        if (isActive) setDayLoading(false);
      }
    };

    loadDayDetail();
    return () => { isActive = false; };
  }, [token, selectedDay, hasUserSelectedDay]);

  useEffect(() => {
    const scrollRoot = document.getElementById("dashboard-scroll-root");
    if (!scrollRoot) {
      return;
    }

    let collapsedState = scrollRoot.scrollTop > 60;
    setIsHeaderCollapsed(collapsedState);

    const handleScroll = () => {
      const currentY = scrollRoot.scrollTop;
      // Use hysteresis to prevent flickering: 
      // collapse later (60px), expand earlier (20px)
      const threshold = collapsedState ? 20 : 60;
      const nextCollapsed = currentY > threshold;

      if (nextCollapsed !== collapsedState) {
        collapsedState = nextCollapsed;
        setIsHeaderCollapsed(nextCollapsed);
      }
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", handleScroll);
  }, []);

  const calendarDays = useMemo(() => {
    if (!calendar) return [];
    return calendar.days.slice(-42);
  }, [calendar]);

  const paddedCalendarDays = useMemo(() => {
    if (calendarDays.length === 0)
      return [] as Array<null | (typeof calendarDays)[number]>;

    const firstWeekday = new Date(
      `${calendarDays[0].day}T00:00:00.000Z`,
    ).getUTCDay();
    const lead = Array.from({ length: firstWeekday }).map(() => null);
    return [...lead, ...calendarDays];
  }, [calendarDays]);

  const maxSeriesValue = useMemo(() => {
    const currentMax = Math.max(
      ...(timeSeries?.current.map((b) => b.volume) ?? [0]),
    );
    const previousMax = Math.max(
      ...(timeSeries?.previous.map((b) => b.volume) ?? [0]),
    );
    return Math.max(currentMax, previousMax, 1);
  }, [timeSeries]);

  const exerciseOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of pbTimeline?.events ?? []) {
      if (!map.has(event.exerciseId)) {
        map.set(event.exerciseId, event.exercise.name);
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [pbTimeline]);

  const strengthSeriesMax = useMemo(() => {
    return Math.max(...(strengthTrend?.series.map((s) => s.e1rm) ?? [0]), 1);
  }, [strengthTrend]);

  const handleCalendarDaySelect = (day: string) => {
    setSelectedDay(day);
    setHasUserSelectedDay(true);
    setIsMobileDaySheetOpen(true);
  };

  const handleTimelineDaySelect = (day: string) => {
    setSelectedDay(day);
    setHasUserSelectedDay(true);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto w-full md:max-w-6xl pb-28 md:pb-10">
      <ProgressHeader error={error} collapsed={isHeaderCollapsed} />

      <main className="px-6 pt-5 grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-12 flex flex-col items-center gap-3">
          <div className="grid grid-cols-3 bg-surface border border-border rounded-2xl p-1 w-full max-w-sm">
            {modes.map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
                  mode === item
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-surface-hover"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 w-full">
            {ranges.map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  range === item
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted border border-border hover:bg-surface-hover"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <ProgressCalendarPanel
          loading={loading}
          selectedDay={selectedDay}
          metric={calendarMetric}
          paddedCalendarDays={paddedCalendarDays}
          calendarSummary={calendar?.summary ?? null}
          onSelectDay={handleCalendarDaySelect}
          onMetricChange={setCalendarMetric}
        />

        <ProgressKpiGrid summary={summary} />

        <ProgressDayDetailPanel
          selectedDay={hasUserSelectedDay ? selectedDay : null}
          dayLoading={hasUserSelectedDay ? dayLoading : false}
          dayDetail={hasUserSelectedDay ? dayDetail : null}
          selectedMuscleGroup={selectedMuscleGroup}
        />

        <ProgressWorkloadPanel
          loading={loading}
          granularity={granularity}
          compare={compare}
          selectedDay={selectedDay}
          timeSeries={timeSeries}
          maxSeriesValue={maxSeriesValue}
          onGranularityChange={setGranularity}
          onCompareToggle={() => setCompare((prev) => !prev)}
        />

        <ProgressInsightsPanel
          workload={workload}
          muscleBalance={muscleBalance}
          strengthTrend={strengthTrend}
          exerciseOptions={exerciseOptions}
          selectedExerciseId={selectedExerciseId}
          selectedMuscleGroup={selectedMuscleGroup}
          strengthSeriesMax={strengthSeriesMax}
          onExerciseChange={setSelectedExerciseId}
          onMuscleGroupSelect={setSelectedMuscleGroup}
        />

        <ProgressPBTimelinePanel
          pbTimeline={pbTimeline}
          selectedExerciseId={selectedExerciseId}
          onSelectExercise={setSelectedExerciseId}
          onSelectDay={handleTimelineDaySelect}
        />
      </main>

      <ProgressMobileDaySheet
        isOpen={isMobileDaySheetOpen && hasUserSelectedDay}
        selectedDay={selectedDay}
        dayLoading={hasUserSelectedDay ? dayLoading : false}
        dayDetail={hasUserSelectedDay ? dayDetail : null}
        onClose={() => setIsMobileDaySheetOpen(false)}
      />
    </div>
  );
}
