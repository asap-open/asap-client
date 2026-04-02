import { type DayDetailResponse } from "../../../../utils/progress";

interface ProgressMobileDaySheetProps {
  selectedDay: string | null;
  dayLoading: boolean;
  dayDetail: DayDetailResponse | null;
  onClose: () => void;
}

export function ProgressMobileDaySheet({
  selectedDay,
  dayLoading,
  dayDetail,
  onClose,
}: ProgressMobileDaySheetProps) {
  if (!selectedDay) {
    return null;
  }

  const selectedDayLabel = new Date(
    `${selectedDay}T00:00:00.000Z`,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="md:hidden fixed left-0 right-0 bottom-20 z-20 px-4">
      <div className="absolute inset-0 -z-10 bg-background/30 backdrop-blur-[2px]" />
      <div className="bg-surface/95 border border-border rounded-3xl shadow-2xl p-4 backdrop-blur-md">
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-text-main">Day Detail</h3>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-text-muted px-2 py-1 rounded-lg hover:bg-surface-hover"
          >
            Close
          </button>
        </div>
        <p className="text-xs text-text-muted mb-3">{selectedDayLabel}</p>
        {dayLoading ? (
          <p className="text-xs text-text-muted">Loading detail...</p>
        ) : dayDetail ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-hover rounded-xl p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sessions
              </p>
              <p className="text-sm font-bold text-text-main mt-0.5">
                {dayDetail.summary.sessions}
              </p>
            </div>
            <div className="bg-surface-hover rounded-xl p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sets
              </p>
              <p className="text-sm font-bold text-text-main mt-0.5">
                {dayDetail.summary.totalSets}
              </p>
            </div>
            <div className="bg-surface-hover rounded-xl p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Volume
              </p>
              <p className="text-sm font-bold text-text-main mt-0.5">
                {Math.round(dayDetail.summary.totalVolume).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted">No detail available.</p>
        )}
      </div>
    </section>
  );
}
