import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { TrendingUp } from "lucide-react";
import type { VolumeData } from "../../../utils/progress";

interface VolumeStatsProps {
  range: string;
}

export default function VolumeStats({ range }: VolumeStatsProps) {
  const { token } = useAuth();
  const [data, setData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalBodyweightScore, setTotalBodyweightScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`progress/volume?range=${range}`, token);
        setData(res);

        const total = res.reduce(
          (acc: number, curr: VolumeData) => acc + curr.volume,
          0,
        );
        const bwTotal = res.reduce(
          (acc: number, curr: VolumeData) => acc + (curr.bodyweightScore || 0),
          0,
        );
        setTotalVolume(total);
        setTotalBodyweightScore(bwTotal);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, token]);

  const maxVolume =
    data.length > 0 ? Math.max(...data.map((d) => d.volume)) : 100;

  // Limit bars to fit nicely (e.g. last 7-14 entries depending on range?)
  // If range is large, maybe aggregate? For now, slice last 10
  const displayData = data.slice(-14);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Bar Chart Card */}
      <div className="bg-surface rounded-xl p-5 shadow-sm border border-border flex flex-col">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-tight mb-4">
          Volume Trend
        </h3>
        <div className="flex items-end justify-between h-24 gap-1">
          {loading ? (
            <div className="w-full text-center text-[10px] text-text-muted">
              Loading...
            </div>
          ) : (
            displayData.map((d, i) => {
              const heightPercent =
                maxVolume > 0 ? (d.volume / maxVolume) * 100 : 0;
              // Ensure minimum height for visibility
              const styleHeight = Math.max(heightPercent, 5) + "%";
              return (
                <div
                  key={i}
                  className="w-full bg-primary rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: styleHeight }}
                  title={`${d.day}: ${d.volume}kg, BW ${
                    d.bodyweightScore || 0
                  }`}
                ></div>
              );
            })
          )}
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-border">
          {/* Simple labels for start/mid/end if needed, or just leave blank for minimal look */}
          <span className="text-[8px] font-bold text-text-muted">Start</span>
          <span className="text-[8px] font-bold text-text-muted">End</span>
        </div>
      </div>

      {/* Summary Card - Centered Content */}
      <div className="bg-surface rounded-xl p-5 shadow-sm border border-border flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-bold text-text-muted uppercase tracking-tight">
            Total Volume (kg)
          </p>
          <p className="text-xl font-black text-text-main">
            {totalVolume.toLocaleString()}{" "}
            <span className="text-sm font-normal text-text-muted">kg</span>
          </p>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight mt-2">
            Bodyweight Score
          </p>
          <p className="text-lg font-black text-text-main">
            {totalBodyweightScore.toLocaleString()}
            <span className="text-sm font-normal text-text-muted"> reps</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-green-500" />
            <p className="text-green-500 text-xs font-bold">Accumulated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
