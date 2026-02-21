import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ChevronDown, Filter, X, RotateCcw } from "lucide-react";
import { exerciseService } from "../../../utils/exercises";

interface ExerciseFiltersModalProps {
  isOpen: boolean;
  filters: {
    muscle?: string;
    category?: string;
    equipment?: string;
  };
  onChange: (filters: ExerciseFiltersModalProps["filters"]) => void;
  onClose: () => void;
}

export default function ExerciseFiltersModal({
  isOpen,
  filters,
  onChange,
  onClose,
}: ExerciseFiltersModalProps) {
  const { token } = useAuth();
  const [muscles, setMuscles] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);

  // Load data when modal opens
  useEffect(() => {
    if (!token || !isOpen) return;

    const fetchFilters = async () => {
      const data = await exerciseService.getAllFilters(token);
      setMuscles(data.muscles);
      setCategories(data.categories);
      setEquipment(data.equipment);
    };

    fetchFilters();
  }, [token, isOpen]);

  // Handle local state for the modal to allow applying all at once?
  // For now, we update the parent directly as per original implementation,
  // but we provide close/reset buttons.

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-main">
              Filter Exercises
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <FilterGroup
            label="Target Muscle"
            value={filters.muscle}
            options={muscles}
            onChange={(v) => onChange({ ...filters, muscle: v })}
          />
          <FilterGroup
            label="Category"
            value={filters.category}
            options={categories}
            onChange={(v) => onChange({ ...filters, category: v })}
          />
          <FilterGroup
            label="Equipment"
            value={filters.equipment}
            options={equipment}
            onChange={(v) => onChange({ ...filters, equipment: v })}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-hover rounded-b-2xl flex gap-3">
          <button
            className="flex-1 py-3 px-4 font-semibold text-text-muted bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              onChange({ muscle: "", category: "", equipment: "" });
              // We don't close automatically on reset, letting user see it's cleared
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            className="flex-[2] py-3 px-4 font-semibold text-white bg-primary rounded-xl shadow-sm hover:bg-primary-dark transition-colors"
            onClick={onClose}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for uniform styling
function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm pr-10 transition-colors
                        ${
                          value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border bg-surface text-text-main hover:border-text-muted/40"
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    `}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All {label}s</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors 
                        ${value ? "text-primary" : "text-text-muted"}`}
        />
      </div>
    </div>
  );
}
