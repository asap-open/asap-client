import { Play, Square, RotateCcw, Clock3 } from "lucide-react";
import Modal from "../ui/Modal";

interface SetTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  elapsedMs: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

function getElapsedParts(totalMs: number) {
  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const centiseconds = Math.floor((safeMs % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return { minutes, seconds, centiseconds };
}

export default function SetTimerModal({
  isOpen,
  onClose,
  title,
  elapsedMs,
  isRunning,
  onStart,
  onStop,
  onReset,
}: SetTimerModalProps) {
  const elapsed = getElapsedParts(elapsedMs);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      minHeight={320}
      initialHeight={380}
      className="max-w-md"
    >
      <div className="px-4 py-5 space-y-5">
        <div className="rounded-2xl border border-border bg-surface-hover p-5">
          <div className="flex items-center justify-center gap-2 text-text-muted text-sm font-medium">
            <Clock3 size={16} />
            Stopwatch
          </div>
          <div className="mt-2 flex justify-center text-4xl font-black tracking-tight text-amber-500 font-mono tabular-nums select-none">
            <span className="inline-flex w-[2ch] justify-end">
              {elapsed.minutes}
            </span>
            <span className="inline-flex w-[1ch] justify-center">:</span>
            <span className="inline-flex w-[2ch] justify-end">
              {elapsed.seconds}
            </span>
            <span className="inline-flex w-[1ch] justify-center">.</span>
            <span className="inline-flex w-[2ch] justify-end">
              {elapsed.centiseconds}
            </span>
          </div>
          <p className="mt-1 text-center text-xs text-text-muted">
            {isRunning ? "Running" : "Paused"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onStart}
            className="h-11 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 font-semibold hover:bg-amber-500/20 flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Start
          </button>
          <button
            type="button"
            onClick={onStop}
            className="h-11 rounded-xl border border-primary/30 bg-primary/10 text-primary font-semibold hover:bg-primary/20 flex items-center justify-center gap-2"
          >
            <Square size={15} />
            Stop
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-11 rounded-xl border border-border text-text-main font-semibold hover:bg-surface-hover flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-surface-hover text-text-main font-semibold hover:bg-border"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
