import { type ProgressMode, type TimeRange } from "../../../../utils/progress";
import { modes, ranges } from "./constants";

export interface ProgressHeaderProps {
  range: TimeRange;
  mode: ProgressMode;
  error: string | null;
  onRangeChange: (next: TimeRange) => void;
  onModeChange: (next: ProgressMode) => void;
}

export function ProgressHeader({
  range,
  mode,
  error,
  onRangeChange,
  onModeChange,
}: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-6 pt-7 md:pt-9 pb-4 border-b border-border/80 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main leading-none">
              Progress
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Interactive load, strength, and recovery signals.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-3 bg-surface border border-border rounded-2xl p-1 w-full md:w-auto">
            {modes.map((item) => (
              <button
                key={item}
                onClick={() => onModeChange(item)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
                  mode === item
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-surface-hover"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {ranges.map((item) => (
              <button
                key={item}
                onClick={() => onRangeChange(item)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  range === item
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted border border-border hover:bg-surface-hover"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
    </header>
  );
}
