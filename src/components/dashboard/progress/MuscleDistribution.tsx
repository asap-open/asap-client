import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

interface MuscleDistributionProps {
  range: string;
}

export default function MuscleDistribution({ range }: MuscleDistributionProps) {
  const { token } = useAuth();
  const [data, setData] = useState<{ muscle: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`progress/muscles?range=${range}`, token);
        // Sort descending
        const sorted = res.sort((a: any, b: any) => b.value - a.value);
        setData(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, token]);

  const totalSets = data.reduce((acc, curr) => acc + curr.value, 0);

  // Colors for chart segments
  const colors = [
    "#2beecd",
    "#fb923c",
    "#60a5fa",
    "#c084fc",
    "#f472b6",
    "#94a3b8",
  ];

  // Calculate SVG circles
  // radius = 16, circumference approx 100
  const radius = 16;
  const circumference = 2 * Math.PI * radius; // ~100.53

  let accumulatedPercent = 0;

  return (
    <section className="bg-surface rounded-xl p-5 shadow-sm border border-border">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-6">
        Muscle Group Split
      </h3>

      {loading ? (
        <div className="text-center text-xs text-text-muted py-8">
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-xs text-text-muted py-8">
          No data available
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative size-32 shrink-0">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                className="stroke-slate-100"
                strokeWidth="4"
              />

              {data.map((item, i) => {
                const percent = item.value / totalSets;
                const dashArray = `${percent * circumference} ${circumference}`;
                const dashOffset = -1 * accumulatedPercent * circumference;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={item.muscle}
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth="4"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-text-muted">
                Total Sets
              </span>
              <span className="text-lg font-black text-text-main">
                {totalSets}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2 w-full">
            {data.slice(0, 5).map((item, i) => (
              <div
                key={item.muscle}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  ></div>
                  <span className="text-xs font-bold text-text-muted">
                    {item.muscle}
                  </span>
                </div>
                <span className="text-xs font-bold text-text-main">
                  {Math.round((item.value / totalSets) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
