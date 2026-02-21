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
        <div className="col-span-3 text-center">Done</div>
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
            <div className="col-span-3 flex justify-center items-center gap-1">
              <button
                onClick={() => onToggleSetDone(exerciseIndex, setIndex)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  set.done
                    ? "border-primary bg-primary"
                    : "border-border hover:border-text-muted/50"
                }`}
              >
                {set.done && (
                  <svg
                    className="w-4 h-4 text-white"
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
              {exercise.sets.length > 1 && (
                <button
                  onClick={() => onRemoveSet(exerciseIndex, setIndex)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 ml-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
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
