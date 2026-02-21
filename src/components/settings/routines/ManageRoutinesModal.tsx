import { useState, useEffect } from "react";
import { Trash2, Dumbbell, Plus } from "lucide-react";
import Modal from "../../ui/Modal";
import { useAuth } from "../../../context/AuthContext";
import { routineService } from "../../../services/routineService";
import type { Routine } from "../../../services/routineService";
import CreateRoutineModal from "./CreateRoutineModal";

interface ManageRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageRoutinesModal({
  isOpen,
  onClose,
}: ManageRoutinesModalProps) {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      loadRoutines();
    }
  }, [isOpen, token, isCreateOpen]); // Reload when create modal closes

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

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this routine?")) {
      try {
        await routineService.deleteRoutine(token, id);
        setRoutines(routines.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Failed to delete routine:", error);
        alert("Failed to delete routine");
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Routines"
        minHeight={400}
      >
        <div className="p-4 space-y-4 pb-24 relative min-h-[300px]">
          {/* Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors"
          >
            <Plus size={20} />
            Create New Routine
          </button>

          {/* List */}
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading...</div>
          ) : routines.length > 0 ? (
            <div className="space-y-3">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main">{routine.name}</h3>
                    <div className="text-xs text-text-muted mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Dumbbell size={12} /> {routine.exercises.length}{" "}
                        Exercises
                      </span>
                      {routine.labels.length > 0 && (
                        <span className="bg-surface-hover px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                          {routine.labels[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(routine.id, e)}
                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-text-muted opacity-60">
              <Dumbbell size={48} className="mb-3" strokeWidth={1} />
              <p>No routines created yet.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Routine Creation Modal */}
      <CreateRoutineModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
