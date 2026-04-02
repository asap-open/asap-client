import { useEffect, useMemo, useState } from "react";
import {
  type Granularity,
  type ProgressTimeSeriesResponse,
} from "../../../../utils/progress";

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
        <h2 className="text-lg font-black text-text-main">Workload Volume</h2>
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
        <div className="h-48 flex items-end gap-2">
          {visibleBuckets.map((bucket, idx) => {
            const prev = timeSeries?.previous[idx];
            const height = Math.max((bucket.volume / maxSeriesValue) * 100, 6);
            const prevHeight = prev
              ? Math.max((prev.volume / maxSeriesValue) * 100, 4)
              : 0;

            return (
              <div
                key={bucket.bucket}
                className="flex-1 flex flex-col items-center gap-2"
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="w-full h-36 relative flex items-end justify-center gap-1">
                  {compare && prev ? (
                    <div
                      className="w-1/3 bg-surface-hover rounded-t-sm"
                      style={{ height: `${prevHeight}%` }}
                      title={`Previous: ${Math.round(prev.volume)}`}
                    />
                  ) : null}
                  <div
                    tabIndex={0}
                    onFocus={() => setActiveIndex(idx)}
                    onBlur={() => setActiveIndex(null)}
                    className={`w-1/2 bg-primary rounded-t-sm outline-none transition-all ${
                      activeIndex === idx ? "ring-2 ring-primary/60" : ""
                    }`}
                    style={{ height: `${height}%` }}
                    title={`Current: ${Math.round(bucket.volume)}`}
                  />
                </div>
                <p className="text-[10px] font-semibold text-text-muted truncate max-w-full">
                  {formatBucketLabel(bucket.bucket)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
