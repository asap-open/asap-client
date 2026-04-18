import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
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
import { type MuscleGroupFilter } from "../../components/dashboard/progress/v2/constants";

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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
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
          fetchProgressSummary(token, range, mode),
          fetchProgressCalendar(token, range, calendarMetric),
          fetchProgressTimeSeries(token, range, granularity, compare),
          fetchWorkload(token, range),
          fetchMuscleBalance(token, range, mode),
          fetchPBTimeline(token, range),
        ]);

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

    const loadStrengthTrend = async () => {
      try {
        const result = await fetchStrength1RM(token, range, selectedExerciseId);
        setStrengthTrend(result);
      } catch {
        setStrengthTrend(null);
      }
    };

    loadStrengthTrend();
  }, [token, range, selectedExerciseId]);

  useEffect(() => {
    if (!token || !selectedDay || !hasUserSelectedDay) {
      setDayDetail(null);
      return;
    }

    const loadDayDetail = async () => {
      setDayLoading(true);
      try {
        const detail = await fetchDayDetail(token, selectedDay);
        setDayDetail(detail);
      } catch {
        setDayDetail(null);
      } finally {
        setDayLoading(false);
      }
    };

    loadDayDetail();
  }, [token, selectedDay, hasUserSelectedDay]);

  useEffect(() => {
    const scrollRoot = document.getElementById("dashboard-scroll-root");
    if (!scrollRoot) {
      return;
    }

    let lastY = scrollRoot.scrollTop;

    const handleScroll = () => {
      const currentY = scrollRoot.scrollTop;
      const delta = currentY - lastY;

      if (Math.abs(delta) < 8) {
        return;
      }

      if (currentY < 24) {
        setIsHeaderCollapsed(false);
      } else if (delta > 0) {
        setIsHeaderCollapsed(true);
      } else {
        setIsHeaderCollapsed(false);
      }

      lastY = currentY;
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
      <ProgressHeader
        range={range}
        mode={mode}
        error={error}
        collapsed={isHeaderCollapsed}
        onRangeChange={setRange}
        onModeChange={setMode}
      />

      <main className="px-6 pt-5 grid grid-cols-1 md:grid-cols-12 gap-6">
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
