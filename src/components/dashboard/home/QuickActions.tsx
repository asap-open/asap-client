import { Timer, LayoutTemplate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SessionNameModal from "../../ui/modals/SessionNameModal";
import SelectRoutineModal from "./SelectRoutineModal";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import type { Routine } from "../../../services/routineService";

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActions({ isOpen, onClose }: QuickActionsProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  if (!isOpen) return null;

  const handleStartFresh = () => {
    setShowNameModal(true);
  };

  const handleConfirmSession = async (sessionName: string) => {
    setShowNameModal(false);
    try {
      const response = await api.post("/sessions", { sessionName }, token);
      const sessionId = response.data?.id || response.id;
      onClose();
      navigate("/session/create", { state: { sessionName, sessionId } });
    } catch (error) {
      alert("Failed to create session." + (error as Error).message);
    }
  };

  const handleCancelSession = () => {
    setShowNameModal(false);
    onClose();
  };

  const handleSelectTemplate = () => {
    setShowRoutineModal(true);
  };

  const handleRoutineSelected = async (routine: Routine) => {
    setShowRoutineModal(false);
    onClose();

    try {
      const sessionPayload = {
        sessionName: routine.name,
        labels: routine.labels,
        exercises: routine.exercises.map((ex) => ({
          exerciseId: ex.exercise.id, // Or ex.exerciseId depending on what API returns
          sets: ex.sets.map((s) => ({
            weight: s.weight || 0,
            reps: s.reps || 0,
            isHardSet: s.isHardSet,
          })),
        })),
      };

      // Create the session immediately
      const response = await api.post("/sessions", sessionPayload, token);
      const sessionId = response.data?.id || response.id; // Adjust based on your API response structure

      // Navigate to the session editor with the NEW session ID
      navigate("/session/create", {
        state: {
          sessionId: sessionId,
          sessionName: routine.name,
          labels: routine.labels,
        },
      });
    } catch (error) {
      console.error("Failed to start routine:", error);
      alert("Failed to start routine.");
    }
  };

  return (
    <>
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50 pointer-events-none md:hidden">
        <div className="flex flex-col items-center gap-3 w-full pointer-events-auto pb-8">
          {/* Select Template */}
          <button
            onClick={handleSelectTemplate}
            className="bg-surface shadow-lg border border-border px-5 py-3 rounded-2xl flex items-center gap-3 w-full animate-in slide-in-from-bottom-5 fade-in duration-200"
          >
            <div className="bg-primary/10 text-primary-hover p-2 rounded-xl">
              <LayoutTemplate size={24} />
            </div>
            <span className="font-semibold text-sm text-text-main">
              Select a template routine
            </span>
          </button>

          {/* Start Fresh */}
          <button
            onClick={handleStartFresh}
            className="bg-surface shadow-lg border border-border px-5 py-3 rounded-2xl flex items-center gap-3 w-full animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div className="bg-primary/10 text-primary-hover p-2 rounded-xl">
              <Timer size={24} />
            </div>
            <span className="font-semibold text-sm text-text-main">
              Start fresh session
            </span>
          </button>
        </div>
      </div>

      <div className="hidden md:block fixed bottom-28 right-10 z-50 pointer-events-none">
        <div className="bg-surface border border-border rounded-3xl shadow-2xl p-5 flex flex-col gap-3 w-80 pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
          <p className="text-sm font-semibold text-text-muted tracking-wide uppercase">
            Quick Session Actions
          </p>

          <button
            onClick={handleSelectTemplate}
            className="bg-surface/90 border border-border px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-surface-hover transition-colors"
          >
            <div className="bg-primary/10 text-primary-hover p-2 rounded-xl">
              <LayoutTemplate size={22} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-text-main">
                Use a routine template
              </p>
              <p className="text-xs text-text-muted">Load saved structure</p>
            </div>
          </button>

          <button
            onClick={handleStartFresh}
            className="bg-surface/90 border border-border px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-surface-hover transition-colors"
          >
            <div className="bg-primary/10 text-primary-hover p-2 rounded-xl">
              <Timer size={22} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-text-main">
                Start fresh session
              </p>
              <p className="text-xs text-text-muted">Build from scratch</p>
            </div>
          </button>
        </div>
      </div>

      <SessionNameModal
        isOpen={showNameModal}
        onClose={handleCancelSession}
        onConfirm={handleConfirmSession}
      />
      <SelectRoutineModal
        isOpen={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        onSelectRoutine={handleRoutineSelected}
      />
    </>
  );
}
