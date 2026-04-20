import { useMemo, useState } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { type WeightHistoryResponse } from "../../../../utils/progress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface ProgressWeightHistoryPanelProps {
  loading: boolean;
  history: WeightHistoryResponse | null;
}

export function ProgressWeightHistoryPanel({
  loading,
  history,
}: ProgressWeightHistoryPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const themeColors = {
    primary: theme === "dark" ? "#9bdf57" : "#13ecd6",
    textMuted: theme === "dark" ? "#94a3b8" : "#475569",
    grid: theme === "dark" ? "#334155" : "#e2e8f0",
  };

  const chartData = useMemo(() => history ?? [], [history]);

  /** Round down to nearest multiple of `step`. */
  const floorTo = (val: number, step: number) =>
    Math.floor(val / step) * step;

  /** Round up to nearest multiple of `step`. */
  const ceilTo = (val: number, step: number) =>
    Math.ceil(val / step) * step;

  const { yMin, yMax } = useMemo(() => {
    const weights = chartData
      .map((d) => d.weight)
      .filter((w): w is number => w !== null);

    if (weights.length === 0) return { yMin: 0, yMax: 100 };

    const dataMin = Math.min(...weights);
    const dataMax = Math.max(...weights);
    const spread = dataMax - dataMin;

    // Use a finer step for small spreads, coarser for large
    const step = spread <= 5 ? 1 : spread <= 15 ? 5 : 10;

    return {
      yMin: floorTo(dataMin, step) - step,
      yMax: ceilTo(dataMax, step) + step,
    };
  }, [chartData]);

  const formatLabel = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const activePoint =
    activeIndex != null ? (chartData[activeIndex] ?? null) : null;

  return (
    <section className="md:col-span-5 bg-surface rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-black text-text-main">Weight History</h2>
      </div>

      <p className="text-xs text-text-muted mb-3 min-h-4">
        {activePoint && activePoint.weight !== null
          ? `${formatLabel(activePoint.date)} • ${activePoint.weight.toLocaleString()} kg`
          : "Hover or focus a point to see weight."}
      </p>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-text-muted">
          Loading history...
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-text-muted">
          No weight data recorded.
        </div>
      ) : (
        <div className="h-56 w-full mt-2">
          <Line
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: "index",
                intersect: false,
              },
              onHover: (_, elements) => {
                setActiveIndex(elements.length > 0 ? elements[0].index : null);
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: themeColors.textMuted,
                    font: { size: 10, weight: "bold" },
                    maxTicksLimit: 7,
                  },
                  border: { display: false },
                },
                y: {
                  display: true,
                  position: "right",
                  min: yMin,
                  max: yMax,
                  grid: {
                    color: themeColors.grid,
                    drawTicks: false,
                  },
                  ticks: {
                    color: themeColors.textMuted,
                    font: { size: 10, weight: "bold" },
                    padding: 8,
                    callback: (val) => `${val} kg`,
                  },
                  border: { display: false },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      ctx.parsed.y != null
                        ? ` Weight: ${ctx.parsed.y} kg`
                        : " No data",
                  },
                },
              },
            }}
            data={{
              labels: chartData.map((d) => formatLabel(d.date)),
              datasets: [
                {
                  label: "Weight",
                  data: chartData.map((d) => d.weight),
                  borderColor: themeColors.primary,
                  backgroundColor: themeColors.primary,
                  borderWidth: 2,
                  pointRadius: 2,
                  pointHoverRadius: 5,
                },
              ],
            }}
          />
        </div>
      )}
    </section>
  );
}
