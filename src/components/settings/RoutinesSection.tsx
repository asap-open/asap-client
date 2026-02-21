import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import ManageRoutinesModal from "./routines/ManageRoutinesModal";

export default function RoutinesSection() {
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
              <LayoutTemplate size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-semibold text-text-main">
                Manage Routines
              </h2>
              <p className="text-xs text-text-muted">
                Edit or delete your saved routines
              </p>
            </div>
          </div>
        </button>
      </section>

      <ManageRoutinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
