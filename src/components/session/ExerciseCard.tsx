import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Set {
  weight: string;
  reps: string;
  done: boolean;
}

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    category: string;
    sets: Set[];
  };
  exerciseIndex: number;
  onAddSet: (exerciseIndex: number) => void;
  onToggleSetDone: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
}

export default function ExerciseCard({
  exercise,
  exerciseIndex,
  onAddSet,
  onToggleSetDone,
  onUpdateSet,
  onRemoveExercise,
  onRemoveSet,
}: ExerciseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border relative">
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-primary-hover">
            {exercise.name}
          </h3>
          <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">
            {exercise.category}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-text-muted hover:text-text-main transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-surface rounded-xl shadow-lg border border-border py-2 min-w-[160px]">
                <button
                  onClick={() => {
                    onRemoveExercise(exerciseIndex);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sets Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">
        <div className="col-span-1 text-center">Set</div>
        <div className="col-span-4 text-center">Kgs</div>
        <div className="col-span-4 text-center">Reps</div>
        <div className="col-span-3 flex items-center justify-center gap-2 text-center">
          <span className="w-8 text-center">Done</span>
          <span className="w-[30px] text-transparent select-none">x</span>
        </div>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div
            key={setIndex}
            className="grid grid-cols-12 gap-2 items-center bg-surface-hover rounded-lg p-2 group"
          >
            <div className="col-span-1 text-center text-sm font-semibold">
              {setIndex + 1}
            </div>
            <div className="col-span-4">
              <input
                className="w-full text-center bg-transparent border-none p-0 focus:ring-0 placeholder:text-text-muted/50 text-text-main"
                placeholder="60"
                type="number"
                value={set.weight}
                onChange={(e) =>
                  onUpdateSet(exerciseIndex, setIndex, "weight", e.target.value)
                }
              />
            </div>
            <div className="col-span-4">
              <input
                className="w-full text-center bg-transparent border-none p-0 focus:ring-0 placeholder:text-text-muted/50 text-text-main"
                placeholder="10"
                type="number"
                value={set.reps}
                onChange={(e) =>
                  onUpdateSet(exerciseIndex, setIndex, "reps", e.target.value)
                }
              />
            </div>
            <div className="col-span-3 flex justify-center items-center gap-2">
              <button
                onClick={() => onToggleSetDone(exerciseIndex, setIndex)}
                className={`set-done-toggle ${set.done ? "checked" : ""}`}
                aria-pressed={set.done}
                title={set.done ? "Mark as not done" : "Mark as done"}
              >
                {set.done && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
              <button
                onClick={() => onRemoveSet(exerciseIndex, setIndex)}
                className={`set-remove-btn ${setIndex === 0 ? "invisible pointer-events-none" : ""}`}
                title={
                  setIndex === 0 ? "Cannot remove first set" : "Remove set"
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={() => onAddSet(exerciseIndex)}
        className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-sm font-bold text-primary-hover bg-primary/5 rounded-lg hover:bg-primary/10 active:scale-95 transition-all"
      >
        <Plus size={18} />
        <span>Add Set</span>
      </button>
    </div>
  );
}
