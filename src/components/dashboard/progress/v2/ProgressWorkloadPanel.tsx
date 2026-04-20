import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import {
  type Granularity,
  type ProgressTimeSeriesResponse,
} from "../../../../utils/progress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface ProgressWorkloadPanelProps {
  loading: boolean;
  granularity: Granularity;
  compare: boolean;
  selectedDay: string | null;
  timeSeries: ProgressTimeSeriesResponse | null;
  maxSeriesValue: number;
  onGranularityChange: (next: Granularity) => void;
  onCompareToggle: () => void;
}

export function ProgressWorkloadPanel({
  loading,
  granularity,
  compare,
  selectedDay,
  timeSeries,
  maxSeriesValue,
  onGranularityChange,
  onCompareToggle,
}: ProgressWorkloadPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const themeColors = {
    primary: theme === "dark" ? "#9bdf57" : "#13ecd6",
    primaryHover: theme === "dark" ? "#7fc341" : "#10d4be",
    surfaceHover: theme === "dark" ? "#242120" : "#f8fafc",
    textMuted: theme === "dark" ? "#94a3b8" : "#475569",
    previousBar: theme === "dark" ? "#623CEA" : "#5896d8",
    previousBarHover: theme === "dark" ? "#4b2cbb" : "#355d88",
  };

  const visibleBuckets = useMemo(
    () => (timeSeries?.current ?? []).slice(-10),
    [timeSeries],
  );

  const formatBucketLabel = (bucket: string) => {
    const date = new Date(`${bucket}T00:00:00.000Z`);
    if (granularity === "month") {
      return date.toLocaleDateString(undefined, { month: "short" });
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const activeBucket =
    activeIndex != null ? (visibleBuckets[activeIndex] ?? null) : null;
  const activePrevious =
    activeIndex != null ? (timeSeries?.previous[activeIndex] ?? null) : null;

  useEffect(() => {
    if (!selectedDay || visibleBuckets.length === 0) {
      return;
    }

    const dayDate = new Date(`${selectedDay}T00:00:00.000Z`);
    const nextIndex = visibleBuckets.findIndex((bucket) => {
      const bucketDate = new Date(`${bucket.bucket}T00:00:00.000Z`);

      if (granularity === "day") {
        return bucket.bucket === selectedDay;
      }

      if (granularity === "week") {
        const end = new Date(bucketDate);
        end.setUTCDate(end.getUTCDate() + 7);
        return dayDate >= bucketDate && dayDate < end;
      }

      return (
        dayDate.getUTCFullYear() === bucketDate.getUTCFullYear() &&
        dayDate.getUTCMonth() === bucketDate.getUTCMonth()
      );
    });

    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  }, [selectedDay, visibleBuckets, granularity]);

  return (
    <section className="md:col-span-7 bg-surface rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-black text-text-main">Weekly Workload Volume</h2>
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 bg-surface-hover border border-border rounded-lg p-1">
            {(["day", "week", "month"] as Granularity[]).map((item) => (
              <button
                key={item}
                onClick={() => onGranularityChange(item)}
                className={`text-[11px] px-2 py-1 rounded-md font-bold uppercase ${
                  granularity === item
                    ? "bg-primary text-white"
                    : "text-text-muted"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={onCompareToggle}
            className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
              compare
                ? "bg-primary text-white border-primary"
                : "text-text-muted border-border hover:bg-surface-hover"
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted mb-3 min-h-4">
        {activeBucket
          ? `${formatBucketLabel(activeBucket.bucket)} • Current ${Math.round(activeBucket.volume).toLocaleString()}${compare && activePrevious ? ` • Previous ${Math.round(activePrevious.volume).toLocaleString()}` : ""}`
          : "Hover or focus a bar to inspect bucket values."}
      </p>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-text-muted">
          Loading workload...
        </div>
      ) : (
        <div className="h-48 w-full mt-2">
          <Bar
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: "index",
                intersect: false,
              },
              onHover: (_, elements) => {
                if (elements.length > 0) {
                  setActiveIndex(elements[0].index);
                } else {
                  setActiveIndex(null);
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: themeColors.textMuted,
                    font: { size: 10, weight: "bold" },
                  },
                  border: { display: false },
                },
                y: {
                  display: false,
                  min: 0,
                  max: maxSeriesValue * 1.1,
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      ` ${context.dataset.label}: ${Math.round(context.parsed.y).toLocaleString()}`,
                  },
                },
              },
            }}
            data={{
              labels: visibleBuckets.map((b) => formatBucketLabel(b.bucket)),
              datasets: [
                ...(compare
                  ? [
                      {
                        label: "Previous",
                        data: visibleBuckets.map(
                          (_, idx) => timeSeries?.previous[idx]?.volume ?? 0
                        ),
                        backgroundColor: themeColors.previousBar,
                        hoverBackgroundColor: themeColors.previousBarHover,
                        borderRadius: 4,
                      },
                    ]
                  : []),
                {
                  label: "Current",
                  data: visibleBuckets.map((b) => b.volume),
                  backgroundColor: themeColors.primary,
                  hoverBackgroundColor: themeColors.primaryHover,
                  borderRadius: 4,
                },
              ],
            }}
          />
        </div>
      )}
    </section>
  );
}
