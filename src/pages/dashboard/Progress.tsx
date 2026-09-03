import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithSWR } from "../../utils/swrHelpers";
import { CacheTTL } from "../../utils/cacheService";
import {
  fetchProgressHeatmap,
  fetchProgressMetrics,
  fetchVolumeTracking,
  type ProgressHeatmapDay,
  type ProgressOverviewMetrics,
  type ProgressChartPoint,
  type TimeRange,
  type SessionLabel,
  type ProgressHeatmapResponse,
  type ProgressMetricsResponse,
  type VolumeTrackingResponse,
} from "../../utils/progress";
import { ProgressCards } from "../../components/dashboard/progress/ProgressCards";
import { ProgressHeatmap } from "../../components/dashboard/progress/ProgressHeatmap";
import { ProgressChart } from "../../components/dashboard/progress/ProgressChart";
import { AlertCircle, RefreshCw } from "lucide-react";

const RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export default function Progress() {
  const { token } = useAuth();
  const [range, setRange] = useState<TimeRange>("1M");
  const [metric, setMetric] = useState<"volume" | "weight">("volume");
  const [selectedLabels, setSelectedLabels] = useState<SessionLabel[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const [heatmap, setHeatmap] = useState<ProgressHeatmapDay[]>([]);
  const [metrics, setMetrics] = useState<ProgressOverviewMetrics | null>(null);
  const [chartData, setChartData] = useState<ProgressChartPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(
    async (isBackground = false) => {
      if (!token) return;
      if (!isBackground) setLoading(true);
      setError(null);

      const labelsKey = selectedLabels.sort().join(",");
      const heatmapCacheKey = `progress:heatmap:${selectedYear ?? "trailing365"}`;

      try {
        const [heatmapRes, metricsRes, volumeRes] = await Promise.all([
          fetchWithSWR<ProgressHeatmapResponse>(
            heatmapCacheKey,
            () => fetchProgressHeatmap(token, selectedYear),
            CacheTTL.FIVE_MINUTES,
            (fresh) => setHeatmap(fresh.heatmap),
          ),
          fetchWithSWR<ProgressMetricsResponse>(
            `progress:metrics:${range}:${labelsKey}`,
            () => fetchProgressMetrics(token, range, selectedLabels),
            CacheTTL.FIVE_MINUTES,
            (fresh) => setMetrics(fresh.metrics),
          ),
          fetchWithSWR<VolumeTrackingResponse>(
            `progress:volume:${range}:${metric}:${labelsKey}`,
            () => fetchVolumeTracking(token, range, metric, selectedLabels),
            CacheTTL.FIVE_MINUTES,
            (fresh) => setChartData(fresh.chartData),
          ),
        ]);

        setHeatmap(heatmapRes.heatmap);
        setMetrics(metricsRes.metrics);
        setChartData(volumeRes.chartData);
      } catch (err) {
        console.error("Failed to load progress data:", err);
        setError(err instanceof Error ? err.message : "Failed to load progress data");
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [token, range, metric, selectedLabels, selectedYear],
  );

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Progress & Consistency
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Track your training consistency, workout volume, and body progression
          </p>
        </div>

        {/* Range Selector Pill Group */}
        <div className="flex items-center gap-1 bg-surface border border-border/80 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
          {RANGES.map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadProgress()}
            className="flex items-center gap-1 font-bold text-xs uppercase hover:underline"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Middle Section: GitHub-Style Consistency Heatmap with Year Selector */}
      <ProgressHeatmap
        data={heatmap}
        loading={loading && heatmap.length === 0}
        selectedYear={selectedYear}
        onYearChange={(year) => setSelectedYear(year)}
      />

      {/* Top Section: 4 KPI Cards */}
      <ProgressCards
        metrics={metrics}
        loading={loading && metrics === null}
      />

      {/* Bottom Section: Single Unified Recharts Interactive Graph */}
      <ProgressChart
        data={chartData}
        metric={metric}
        selectedLabels={selectedLabels}
        onMetricChange={(newMetric) => setMetric(newMetric)}
        onLabelsChange={(newLabels) => setSelectedLabels(newLabels)}
        loading={loading && chartData.length === 0}
      />
    </div>
  );
}
