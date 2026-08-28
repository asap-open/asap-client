import { ActivityCalendar, type Activity } from "react-activity-calendar";
import type { ProgressHeatmapDay } from "../../../utils/progress";
import { useTheme } from "../../../context/ThemeContext";

interface ProgressHeatmapProps {
  data: ProgressHeatmapDay[];
  loading?: boolean;
}

export function ProgressHeatmap({ data, loading }: ProgressHeatmapProps) {
  const { theme: currentTheme } = useTheme();

  // If data is empty, generate fallback 365 empty days so calendar renders beautifully
  const calendarData: Activity[] =
    data.length > 0
      ? data.map((d) => ({
        date: d.date,
        count: d.count,
        level: d.level,
      }))
      : Array.from({ length: 365 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (364 - i));
        return {
          date: d.toISOString().split("T")[0] as string,
          count: 0,
          level: 0,
        };
      });

  // Calculate total workouts in this heatmap period
  const totalWorkouts = calendarData.reduce((acc, curr) => acc + curr.count, 0);

  const theme = {
    // Empty (Gray) -> Soft Cyan -> Primary -> Deep Teal -> Darkest Teal
    light: ["#e5e7eb", "#8cf4e7", "#13ecd6", "#0fa696", "#0a6c62"],

    // Empty (Warm Dark) -> Dark Olive -> Mid Green -> Primary Hover -> Primary
    dark: ["#2a2726", "#416323", "#60992d", "#7fc341", "#9bdf57"],
  };

  return (
    <div className="bg-surface border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            Activity Heatmap
          </h2>
          <p className="text-xs text-text-muted">
            Workout consistency over the past year ({totalWorkouts} total {totalWorkouts === 1 ? "session" : "sessions"})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 pt-1 flex justify-center scrollbar-thin scrollbar-thumb-border">
        {loading ? (
          <div className="h-36 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="min-w-[680px] flex justify-center">
            <ActivityCalendar
              data={calendarData}
              theme={theme}
              colorScheme={currentTheme}
              blockSize={12}
              blockMargin={4}
              blockRadius={3}
              fontSize={12}
              showWeekdayLabels={["mon", "wed", "fri"]}
              labels={{
                legend: {
                  less: "Less",
                  more: "More",
                },
                months: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                totalCount: "{{count}} workouts in the last year",
              }}
              tooltips={{
                activity: {
                  text: (activity) =>
                    `${activity.count} workout${activity.count === 1 ? "" : "s"} on ${activity.date}`,
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
