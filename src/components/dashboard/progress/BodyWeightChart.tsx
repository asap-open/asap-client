import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

interface BodyWeightChartProps {
  range: string;
}

export default function BodyWeightChart({ range }: BodyWeightChartProps) {
  const { token } = useAuth();
  const [data, setData] = useState<{ date: Date; weight: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(100);
  const [latestWeight, setLatestWeight] = useState(0);
  const [weightChange, setWeightChange] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fix: Use correct endpoint plural 'weights'
        const res = await api.get(`weights/history?range=${range}`, token);

        if (!Array.isArray(res)) {
          console.error("Expected array but got:", res);
          setData([]);
          return;
        }

        const parsedData = res.map((d: any) => ({
          date: new Date(d.recordedAt),
          weight: d.weightKg,
        }));

        setData(parsedData);
        if (parsedData.length > 0) {
          const latest = parsedData[parsedData.length - 1].weight;
          setLatestWeight(latest);

          // Calculate change if at least 2 points
          if (parsedData.length > 1) {
            const first = parsedData[0].weight;
            setWeightChange(latest - first);
          } else {
            setWeightChange(null);
          }

          const weights = parsedData.map((d: any) => d.weight);
          let min = Math.min(...weights);
          let max = Math.max(...weights);

          // If min and max are same (flat line), add artificial padding
          if (min === max) {
            min -= 5;
            max += 5;
          } else {
            // Add some dynamic padding (10% of range)
            const padding = (max - min) * 0.1;
            min -= padding;
            max += padding;
          }

          setMinWeight(min);
          setMaxWeight(max);
        }
      } catch (err) {
        console.error("Failed to fetch weight data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, token]);

  // Generate SVG Path
  const getPath = () => {
    if (data.length === 0) return "";

    // Width and Height of SVG (viewBox)
    const width = 100;
    const height = 100;

    // Handle single data point: draw a point or straight line
    if (data.length === 1) {
      return `M 0 50 L 100 50`;
    }

    const xStep = width / (data.length - 1);
    const weightRange = maxWeight - minWeight || 1;

    // Points: x is index-based, y is weight-based (inverted because SVG y=0 is top)
    const points = data.map((d, i) => {
      const x = i * xStep;
      // normalized 0-1
      const normalizedWeight = (d.weight - minWeight) / weightRange;
      // height - (normalized * height)
      const y = height - normalizedWeight * height;
      return `${x} ${y}`;
    });

    // Simple polyline
    return `M ${points[0]} L ${points.slice(1).join(" L ")}`;
  };

  const getAreaPath = (linePath: string) => {
    if (!linePath) return "";
    return `${linePath} V 100 H 0 Z`;
  };

  const linePath = getPath();
  const areaPath = getAreaPath(linePath);

  const changeColor =
    weightChange && weightChange < 0
      ? "text-green-500 bg-green-50"
      : "text-text-muted bg-surface-hover";

  return (
    <section className="bg-surface rounded-xl p-5 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Body Weight
          </h3>
          <p className="text-2xl font-black text-text-main">
            {latestWeight > 0 ? latestWeight : "--"}{" "}
            <span className="text-sm font-normal text-text-muted">kg</span>
          </p>
        </div>
        {weightChange !== null && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${changeColor}`}
          >
            {weightChange > 0 ? "+" : ""}
            {weightChange.toFixed(1)}kg
          </span>
        )}
      </div>

      <div className="relative h-32 w-full flex items-end justify-between px-2">
        {loading ? (
          <div className="w-full flex justify-center text-xs text-text-muted">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full flex justify-center text-xs text-text-muted">
            No data available
          </div>
        ) : (
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d={linePath}
              fill="none"
              stroke="#2beecd"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path d={areaPath} fill="url(#grad1)" opacity="0.2" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2beecd" stopOpacity="1" />
                <stop offset="100%" stopColor="#2beecd" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </section>
  );
}
