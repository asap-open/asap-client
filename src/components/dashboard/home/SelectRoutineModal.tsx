import { useState, useEffect } from "react";
import { Search, Loader2, Play, Tag, Dumbbell } from "lucide-react";
import Modal from "../../ui/Modal";
import { useAuth } from "../../../context/AuthContext";
import { routineService } from "../../../services/routineService";
import type { Routine } from "../../../services/routineService";

interface SelectRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoutine: (routine: Routine) => void;
}

export default function SelectRoutineModal({
  isOpen,
  onClose,
  onSelectRoutine,
}: SelectRoutineModalProps) {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen && token) {
      loadRoutines();
    }
  }, [isOpen, token]);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const data = await routineService.getRoutines(token);
      setRoutines(data);
    } catch (error) {
      console.error("Failed to load routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutines = routines.filter((routine) =>
    routine.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Routine"
      minHeight={400} // Increased min height for list
    >
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Search routines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface-hover border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium text-text-main"
          />
        </div>

        {/* Routines List */}
        {loading ? (
          <div className="flex justify-center py-8 text-primary">
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredRoutines.length > 0 ? (
          <div className="space-y-3 pb-20">
            {filteredRoutines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => onSelectRoutine(routine)}
                className="w-full text-left bg-surface border border-border rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-text-main group-hover:text-primary transition-colors">
                    {routine.name}
                  </h3>
                  <div className="bg-primary/10 text-primary p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>

                {routine.description && (
                  <p className="text-xs text-text-muted mb-3 line-clamp-1">
                    {routine.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Dumbbell size={14} />
                    <span>{routine.exercises.length} Exercises</span>
                  </div>
                  {routine.labels.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{routine.labels.join(", ")}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text-muted">
            <p>No routines found.</p>
            <p className="text-xs mt-2">Create one to get started!</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
