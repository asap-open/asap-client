import { Info, Pencil, Trash2 } from "lucide-react";

interface ExerciseActionsMenuProps {
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function ExerciseActionsMenu({
  onView,
  onEdit,
  onRemove,
}: ExerciseActionsMenuProps) {
  return (
    <div
      className="absolute right-0 top-12 w-48 bg-surface rounded-xl shadow-xl border border-border z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <button
          onClick={onView}
          className="w-full text-left px-4 py-3 text-sm font-medium text-text-main hover:bg-surface-hover flex items-center gap-3 transition-colors"
        >
          <Info size={16} className="text-text-muted" />
          View Details
        </button>
        <button
          onClick={onEdit}
          className="w-full text-left px-4 py-3 text-sm font-medium text-text-main hover:bg-surface-hover flex items-center gap-3 transition-colors"
        >
          <Pencil size={16} className="text-text-muted" />
          Edit
        </button>
        <div className="h-px bg-border my-1"></div>
        <button
          onClick={onRemove}
          className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>
    </div>
  );
}
export default ExerciseActionsMenu;
