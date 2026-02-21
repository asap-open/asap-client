import { useState, useEffect } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import Modal from "../../ui/Modal";
import AddExerciseModal from "../../session/AddExerciseModal";

interface ManageTrackedExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrackedExercise {
  id: string;
  name: string;
}

export default function ManageTrackedExercisesModal({
  isOpen,
  onClose,
}: ManageTrackedExercisesModalProps) {
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>(
    () => {
      const stored = localStorage.getItem("tracked_exercises");
      return stored ? JSON.parse(stored) : [];
    },
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("tracked_exercises", JSON.stringify(trackedExercises));
  }, [trackedExercises]);

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    if (!trackedExercises.find((e) => e.id === exercise.id)) {
      setTrackedExercises((prev) => [
        ...prev,
        { id: exercise.id, name: exercise.name },
      ]);
    }
    setIsAddModalOpen(false);
  };

  const handleRemoveExercise = (id: string) => {
    setTrackedExercises((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tracked Exercises"
        minHeight={400}
      >
        <div className="p-4 space-y-4 pb-20">
          <p className="text-sm text-text-muted text-center px-4">
            Select exercises to monitor for personal bests on your Progress
            dashboard.
          </p>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors"
          >
            <Plus size={20} />
            Add Exercise to Track
          </button>

          {trackedExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-muted opacity-60">
              <Target size={48} className="mb-3" strokeWidth={1} />
              <p>No exercises tracked yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trackedExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-surface border border-border rounded-xl p-3 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-muted w-6">
                      {index + 1}.
                    </span>
                    <span className="font-bold text-text-main">
                      {exercise.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExercise={handleAddExercise}
      />
    </>
  );
}
