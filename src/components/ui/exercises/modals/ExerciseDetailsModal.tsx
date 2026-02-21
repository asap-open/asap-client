import Modal from "../../Modal";

interface Exercise {
  title: string;
  muscles: string;
  category?: string;
  equipment?: string;
  secondaryMuscles?: string[];
  instructions?: string;
}

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export default function ExerciseDetailsModal({
  isOpen,
  onClose,
  exercise,
}: ExerciseDetailsModalProps) {
  if (!exercise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise.title}
      minHeight={100}
      initialHeight={500}
      maxHeight={600}
    >
      <div className="space-y-6 overflow-y-auto pb-30">
        <div className="bg-surface-hover p-4 rounded-xl border border-border space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Category
              </span>
              <p className="text-text-main font-medium">
                {exercise.category || "Strength"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Equipment
              </span>
              <p className="text-text-main font-medium">
                {exercise.equipment || "Bodyweight"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-text-main block mb-2">
            Target Muscles
          </span>
          <div className="flex flex-wrap gap-2">
            {exercise.muscles.split(",").map((m) => (
              <span
                key={m}
                className="px-3 py-1 bg-primary/10 text-primary-hover text-sm font-medium rounded-full"
              >
                {m.trim()}
              </span>
            ))}
            {exercise.secondaryMuscles?.map((m) => (
              <span
                key={m}
                className="px-3 py-1 bg-surface-hover text-text-muted text-sm font-medium rounded-full"
              >
                {m.trim()}
              </span>
            ))}
          </div>
        </div>

        {exercise.instructions && (
          <div>
            <span className="text-sm font-semibold text-text-main block mb-2">
              Instructions
            </span>
            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
              {exercise.instructions}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
