import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../dashboard/exercises/SearchBar";
import Modal from "../ui/Modal";
import ExerciseFilters from "../dashboard/exercises/ExerciseFilters";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primaryMuscles: string[];
}

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  onAddExercise,
}: AddExerciseModalProps) {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // New unified filters state
  const [filters, setFilters] = useState({
    muscle: "",
    category: "",
    equipment: "",
  });

  // Fetch exercises when modal opens or search/filters change
  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
    // eslint-disable-next-line
  }, [isOpen, searchQuery, filters]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append("q", searchQuery);
      if (filters.muscle) params.append("muscle", filters.muscle);
      if (filters.category) params.append("category", filters.category);
      if (filters.equipment) params.append("equipment", filters.equipment);

      const response = await api.get(
        `/exercises/search?${params.toString()}`,
        token,
      );

      // Handle the API response
      const results = response.data || response;
      setExercises(Array.isArray(results) ? results : []);
    } catch (error) {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
    onClose();
    setSearchQuery("");
    setFilters({ muscle: "", category: "", equipment: "" });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Exercise"
      className="md:max-w-2xl md:w-full"
      initialHeight={600}
    >
      <div className="flex flex-col h-full">
        {/* Search Bar & Filters */}
        <div className="py-2 border-b border-border">
          <div className="px-4 md:px-0 mb-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Replaces the old chips with the full filter component */}
          <div className="-mx-4 md:mx-0">
            <ExerciseFilters
              filters={filters}
              onChange={(newFilters) =>
                setFilters((prev) => ({ ...prev, ...newFilters }))
              }
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto py-2 px-4 md:px-0">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-text-muted gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading exercises...
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-8 text-text-muted bg-surface-hover rounded-lg mt-2 border border-dashed border-border">
              No exercises found
            </div>
          ) : (
            <div className="space-y-2 pb-4 pt-2">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise)}
                  className="w-full p-4 bg-surface border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group"
                >
                  <div className="font-semibold text-text-main group-hover:text-primary transition-colors">
                    {exercise.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted uppercase font-semibold bg-surface-hover px-2 py-0.5 rounded">
                      {exercise.category}
                    </span>
                    <span className="text-xs text-text-muted/40">•</span>
                    <span className="text-xs text-text-muted">
                      {exercise.equipment}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
