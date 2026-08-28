import { Activity, Calendar, Flame, Weight } from "lucide-react";
import type { ProgressOverviewMetrics } from "../../../utils/progress";

interface ProgressCardsProps {
  metrics: ProgressOverviewMetrics | null;
  loading?: boolean;
}

export function ProgressCards({ metrics, loading }: ProgressCardsProps) {
  const cards = [
    {
      title: "Consistency",
      value: metrics ? `${metrics.consistency}%` : "0%",
      subtext: "workout adherence",
      icon: Activity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Days",
      value: metrics ? `${metrics.activeDays}` : "0",
      subtext: "days trained",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Current Streak",
      value: metrics ? `${metrics.currentStreak} ${metrics.currentStreak === 1 ? "day" : "days"}` : "0 days",
      subtext: "consecutive days",
      icon: Flame,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Volume",
      value: metrics ? `${metrics.totalVolume.toLocaleString()} kg` : "0 kg",
      subtext: "cumulative load",
      icon: Weight,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="space-y-0.5">
              {loading ? (
                <div className="h-8 w-20 bg-surface-hover animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
                  {card.value}
                </div>
              )}
              <div className="text-[11px] text-text-muted font-medium">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
