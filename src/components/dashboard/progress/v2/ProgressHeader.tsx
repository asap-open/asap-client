import { type ProgressMode, type TimeRange } from "../../../../utils/progress";
import { modes, ranges } from "./constants";

export interface ProgressHeaderProps {
  range: TimeRange;
  mode: ProgressMode;
  error: string | null;
  collapsed: boolean;
  onRangeChange: (next: TimeRange) => void;
  onModeChange: (next: ProgressMode) => void;
}

export function ProgressHeader({
  range,
  mode,
  error,
  collapsed,
  onRangeChange,
  onModeChange,
}: ProgressHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-6 overflow-hidden transition-all duration-300 ${
        collapsed
          ? "max-h-0 py-0 opacity-0 pointer-events-none border-b-transparent"
          : "max-h-80 pt-7 md:pt-9 pb-4 opacity-100 border-b border-border/80 shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1
              className={`font-black tracking-tight text-text-main leading-none transition-all ${
                collapsed ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
              }`}
            >
              Progress
            </h1>
            <p
              className={`text-xs text-text-muted mt-1 transition-all duration-200 ${
                collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Interactive load, strength, and recovery signals.
            </p>
          </div>

          {collapsed ? (
            <span className="text-[11px] font-semibold text-text-muted px-2 py-1 rounded-lg bg-surface border border-border whitespace-nowrap">
              {mode} • {range}
            </span>
          ) : null}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            collapsed
              ? "max-h-0 opacity-0 pointer-events-none"
              : "max-h-64 opacity-100"
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-1">
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
      </div>

      {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
    </header>
  );
}
