import { MoreVertical } from "lucide-react";
import ExerciseActionsMenu from "./ExerciseActionsMenu";

// --- Types ---
interface Exercise {
  title: string;
  muscles: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onView?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

function ExerciseItem({
  exercise,
  isOpen,
  onToggle,
  onView,
  onEdit,
  onRemove,
}: ExerciseItemProps) {
  return (
    <div className="relative bg-surface p-4 rounded-xl shadow-sm border border-border flex items-center justify-between group hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-text-main">
            {exercise.title}
          </h3>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {exercise.muscles}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={onToggle}
          className={`p-2 rounded-full transition-colors ${
            isOpen
              ? "bg-primary/20 text-text-main"
              : "text-text-muted hover:text-text-main hover:bg-surface-hover"
          }`}
        >
          <MoreVertical size={20} />
        </button>

        {isOpen && (
          <ExerciseActionsMenu
            onView={onView || (() => {})}
            onEdit={onEdit || (() => {})}
            onRemove={onRemove || (() => {})}
          />
        )}
      </div>
    </div>
  );
}

export default ExerciseItem;
