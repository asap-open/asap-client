import { useState } from "react";
import { X, Plus, Save, Dumbbell } from "lucide-react";
import Modal from "../../ui/Modal";
import AddExerciseModal from "../../session/AddExerciseModal";
import { useAuth } from "../../../context/AuthContext";
import { routineService } from "../../../services/routineService";
import type { RoutineExercise } from "../../../services/routineService";

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoutineModal({
  isOpen,
  onClose,
}: CreateRoutineModalProps) {
  const { token } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Partial<RoutineExercise>[]>([]);

  // UI State
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const AVAILABLE_LABELS = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Core",
    "Legs",
    "Glutes",
    "FullBody",
    "Cardio",
  ];

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    // Add exercise with 3 default empty sets
    const newExercise: Partial<RoutineExercise> = {
      exerciseId: exercise.id,
      exercise: {
        // Minimal info for UI display
        id: exercise.id,
        name: exercise.name,
        category: "",
        primaryMuscles: [],
      },
      sets: [
        { isHardSet: true, reps: 10 },
        { isHardSet: true, reps: 10 },
        { isHardSet: true, reps: 10 },
      ],
    };
    setExercises([...exercises, newExercise]);
    setIsAddExerciseOpen(false);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    const updated = [...exercises];
    // @ts-error-ignore - Dynamic key access safe here
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please name your routine");
    if (exercises.length === 0)
      return alert("Please add at least one exercise");

    setIsSaving(true);
    try {
      const payload = {
        name,
        labels: selectedLabels,
        exercises: exercises.map((ex, i) => ({
          exerciseId: ex.exerciseId!,
          sets: ex.sets,
        })),
      };

      await routineService.createRoutine(token, payload);
      onClose();
      // Reset form
      setName("");
      setExercises([]);
      setSelectedLabels([]);
    } catch (error) {
      console.error("Failed to create routine:", error);
      alert("Failed to create routine");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Routine"
        initialHeight={700}
      >
        <div className="p-4 space-y-6 pb-20">
          {/* 1. Name Input */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Routine Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heavy Leg Day"
              className="w-full p-3 bg-surface-hover border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-lg text-text-main"
            />
          </div>

          {/* 2. Labels */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Focus Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedLabels.includes(label)
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-text-muted border-border hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Exercises List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-muted uppercase">
                Exercises
              </label>
              <button
                onClick={() => setIsAddExerciseOpen(true)}
                className="text-xs font-bold text-primary flex items-center hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Exercise
              </button>
            </div>

            {exercises.map((ex, exIndex) => (
              <div
                key={exIndex}
                className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm"
              >
                <div className="bg-surface-hover px-4 py-3 border-b border-border flex justify-between items-center">
                  <span className="font-bold text-sm">{ex.exercise?.name}</span>
                  <button
                    onClick={() => removeExercise(exIndex)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {ex.sets?.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="flex gap-3 items-center text-sm"
                    >
                      <span className="text-text-muted w-4 font-bold text-xs">
                        {setIndex + 1}
                      </span>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, "reps", e.target.value)
                        }
                        className="w-20 p-2 bg-surface-hover rounded border border-border text-center text-text-main"
                      />
                      <span className="text-text-muted text-xs">
                        reps target
                      </span>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      className="text-xs text-primary font-medium hover:underline"
                      onClick={() => {
                        const updated = [...exercises];
                        updated[exIndex].sets?.push({
                          isHardSet: true,
                          reps: 10,
                        });
                        setExercises(updated);
                      }}
                    >
                      + Add Set
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {exercises.length === 0 && (
              <button
                onClick={() => setIsAddExerciseOpen(true)}
                className="w-full py-8 border-2 border-dashed border-border rounded-xl text-text-muted flex flex-col items-center justify-center hover:bg-surface-hover hover:border-primary/30 transition-all"
              >
                <Dumbbell size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">
                  Add your first exercise
                </span>
              </button>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save size={20} /> Save Routine
              </>
            )}
          </button>
        </div>
      </Modal>

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={handleAddExercise}
      />
    </>
  );
}
