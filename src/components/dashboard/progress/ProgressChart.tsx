import { useState, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChevronDown, Filter, X, Check } from "lucide-react";
import { SESSION_LABELS, type ProgressChartPoint, type SessionLabel } from "../../../utils/progress";

interface ProgressChartProps {
  data: ProgressChartPoint[];
  metric: "volume" | "weight";
  selectedLabels: SessionLabel[];
  onMetricChange: (metric: "volume" | "weight") => void;
  onLabelsChange: (labels: SessionLabel[]) => void;
  loading?: boolean;
}

export function ProgressChart({
  data,
  metric,
  selectedLabels,
  onMetricChange,
  onLabelsChange,
  loading,
}: ProgressChartProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLabel = (label: SessionLabel) => {
    if (selectedLabels.includes(label)) {
      onLabelsChange(selectedLabels.filter((l) => l !== label));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const clearAllLabels = () => onLabelsChange([]);
  const selectAllLabels = () => onLabelsChange([...SESSION_LABELS]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = parseInt(parts[1] ?? "1", 10) - 1;
      const day = parseInt(parts[2] ?? "1", 10);
      return `${monthNames[monthIdx]} ${day}`;
    }
    return dateStr;
  };

  const formatYAxis = (val: number) => {
    if (metric === "volume") {
      if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
      return `${val}`;
    }
    return `${val}`;
  };

  const isVolume = metric === "volume";
  const strokeColor = isVolume ? "#10b981" : "#3b82f6";
  const gradientId = isVolume ? "colorVolume" : "colorWeight";

  return (
    <div className="bg-surface border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4 w-full">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-bold text-text-main">
            {isVolume ? "Volume Progression" : "Body Weight Trend"}
          </h2>
          <p className="text-xs text-text-muted">
            {isVolume
              ? selectedLabels.length > 0
                ? `Showing volume for: ${selectedLabels.join(", ")}`
                : "Tracking cumulative lifted load over time"
              : "Tracking body weight measurements over time"}
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown 1: Metric Type (Volume vs Weight) */}
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as "volume" | "weight")}
              className="appearance-none bg-surface-hover/80 hover:bg-surface-hover border border-border text-text-main font-semibold text-xs rounded-xl px-3.5 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="volume">Volume (kg)</option>
              <option value="weight">Body Weight (kg)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          {/* Dropdown 2: Session Labels Filter (Visible only for Volume) */}
          {isVolume && (
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3.5 py-2 border transition-all cursor-pointer ${
                  selectedLabels.length > 0
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface-hover/80 hover:bg-surface-hover border-border text-text-main"
                }`}
              >
                <Filter size={13} />
                <span>
                  {selectedLabels.length === 0
                    ? "All Tags"
                    : `${selectedLabels.length} Tag${selectedLabels.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {/* Multi-Select Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl z-30 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <span className="text-xs font-bold text-text-main">Filter by Tags</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllLabels}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-text-muted text-[10px]">•</span>
                      <button
                        type="button"
                        onClick={clearAllLabels}
                        className="text-[10px] font-semibold text-text-muted hover:text-text-main"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-border">
                    {SESSION_LABELS.map((label) => {
                      const isSelected = selectedLabels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleLabel(label)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-text-main hover:bg-surface-hover"
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <Check size={14} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected tags badges for quick removal */}
      {isVolume && selectedLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-text-muted mr-1">Filtered:</span>
          {selectedLabels.map((lbl) => (
            <span
              key={lbl}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface-hover border border-border/60 text-text-main px-2 py-0.5 rounded-md"
            >
              {lbl}
              <button
                type="button"
                onClick={() => toggleLabel(lbl)}
                className="text-text-muted hover:text-text-main"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllLabels}
            className="text-[11px] text-text-muted hover:text-primary font-medium underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Chart Area */}
      <div className="h-64 sm:h-72 w-full pt-3">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-text-muted gap-1 text-center">
            <p className="text-sm font-medium">No recorded data in this timeframe.</p>
            <p className="text-xs opacity-75">
              {isVolume ? "Log sessions with matching tags to see volume trends." : "Record body weight logs to view your weight progression."}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-text-muted"
                dy={6}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-text-muted"
                dx={-4}
                domain={["auto", "auto"]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]?.payload as ProgressChartPoint;
                    return (
                      <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                        <p className="text-text-muted font-medium">{formatDate(item.date)}</p>
                        <p className="text-sm font-bold text-text-main">
                          {item.value.toLocaleString()} {isVolume ? "kg volume" : "kg weight"}
                        </p>
                        {item.sessions !== undefined && item.sessions > 0 && (
                          <p className="text-[11px] text-text-muted">
                            {item.sessions} workout{item.sessions > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
