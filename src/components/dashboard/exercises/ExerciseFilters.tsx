import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ChevronDown, Filter, X } from "lucide-react";
import { exerciseService } from "../../../utils/exercises";

interface ExerciseFiltersProps {
  filters: {
    muscle?: string;
    category?: string;
    equipment?: string;
  };
  onChange: (filters: ExerciseFiltersProps["filters"]) => void;
}

export default function ExerciseFilters({
  filters,
  onChange,
}: ExerciseFiltersProps) {
  const { token } = useAuth();
  const [muscles, setMuscles] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;

    // Fetch all filter data using the centralized service
    const fetchFilters = async () => {
      const data = await exerciseService.getAllFilters(token);
      setMuscles(data.muscles);
      setCategories(data.categories);
      setEquipment(data.equipment);
    };

    fetchFilters();
  }, [token]);

  const hasActiveFilters =
    filters.muscle || filters.category || filters.equipment;

  const clearFilters = () => {
    onChange({ muscle: "", category: "", equipment: "" });
  };

  return (
    <div className="flex items-center gap-3 px-6 py-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center text-text-muted text-sm font-medium mr-1">
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </div>

      <FilterSelect
        label="Muscle"
        value={filters.muscle || ""}
        options={muscles}
        onChange={(val) => onChange({ ...filters, muscle: val })}
      />

      <FilterSelect
        label="Category"
        value={filters.category || ""}
        options={categories}
        onChange={(val) => onChange({ ...filters, category: val })}
      />

      <FilterSelect
        label="Equipment"
        value={filters.equipment || ""}
        options={equipment}
        onChange={(val) => onChange({ ...filters, equipment: val })}
      />

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <X className="w-3 h-3" />
          Clear All
        </button>
      )}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="relative min-w-[140px]">
      <select
        className={`w-full appearance-none rounded-lg border px-3 py-2 text-sm pr-8 transition-colors cursor-pointer
                    ${
                      value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-surface text-text-main hover:border-text-muted/40"
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                `}
        value={value}
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
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors 
                    ${value ? "text-primary" : "text-slate-400"}`}
      />
    </div>
  );
}
