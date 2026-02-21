import { useState } from "react";
import { Target } from "lucide-react";
import ManageTrackedExercisesModal from "./tracked/ManageTrackedExercisesModal";

export default function TrackedExercisesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Target size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-semibold text-text-main">
                Tracked Exercises
              </h2>
              <p className="text-xs text-text-muted">
                Manage exercises for progress tracking
              </p>
            </div>
          </div>
        </button>
      </section>

      <ManageTrackedExercisesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
