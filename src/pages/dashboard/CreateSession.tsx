import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  createSession,
  updateSession,
  deleteSession,
} from "../../utils/session";
import ExerciseCard from "../../components/session/ExerciseCard";
import AddExerciseModal from "../../components/session/AddExerciseModal";
import { navigateAfterSessionEnd } from "../../utils/navigation";

interface Set {
  weight: string;
  reps: string;
  done: boolean;
}

interface SessionExercise {
  id: string;
  name: string;
  category: string;
  sets: Set[];
}

export default function CreateSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const AVAILABLE_LABELS = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Core",
    "Legs",
    "Glutes",
    "FullBody",
    "Cardio",
    "Mobility",
    "Stretching",
  ];

  const [sessionName, setSessionName] = useState(
    location.state?.sessionName || "Workout Session",
  );
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(
    location.state?.sessionId || null,
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    location.state?.labels || [],
  );
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  // If sessionId is not provided, create one (fallback, but should not happen in this flow)
  useEffect(() => {
    if (!sessionId) {
      createInitialSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (isSessionEnded) {
      navigateAfterSessionEnd(navigate);
    }
  }, [isSessionEnded, navigate]);

  // Auto-save every 10 seconds if there are changes
  useEffect(() => {
    if (!sessionId || !hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(() => {
      syncSession();
    }, 10000); // 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [sessionId, hasUnsavedChanges, exercises]);

  const createInitialSession = async () => {
    try {
      const response = await createSession(token, {
        sessionName,
        startTime: new Date().toISOString(),
        exercises: [],
      });
      setSessionId(response.id);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
      navigate(-1);
    }
  };

  const syncSession = useCallback(async () => {
    if (!sessionId || isSaving) return;

    try {
      setIsSaving(true);

      const payload = {
        sessionName,
        labels: selectedLabels,
        exercises: exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: ex.sets
            .filter((set) => set.weight && set.reps)
            .map((set) => ({
              weight: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
              isHardSet: set.done,
            })),
        })),
      };

      await updateSession(token, sessionId, payload);
      setLastSyncTime(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to sync session:", error);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, sessionName, exercises, token, isSaving]);

  const calculateTotalVolume = () => {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((sum, set) => {
        if (set.done && set.weight && set.reps) {
          return sum + parseFloat(set.weight) * parseFloat(set.reps);
        }
        return sum;
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  const addExerciseToSession = (exercise: {
    id: string;
    name: string;
    category: string;
  }) => {
    const newExercise: SessionExercise = {
      ...exercise,
      sets: [{ weight: "", reps: "", done: false }],
    };
    setExercises([...exercises, newExercise]);
    setHasUnsavedChanges(true);
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, idx) => idx !== exerciseIndex));
    setHasUnsavedChanges(true);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const lastSet =
      updatedExercises[exerciseIndex].sets[
        updatedExercises[exerciseIndex].sets.length - 1
      ];
    updatedExercises[exerciseIndex].sets.push({
      weight: lastSet?.weight || "",
      reps: lastSet?.reps || "",
      done: false,
    });
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[
      exerciseIndex
    ].sets.filter((_, idx) => idx !== setIndex);
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const toggleSetDone = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex].done =
      !updatedExercises[exerciseIndex].sets[setIndex].done;
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const handleSaveAndExit = async () => {
    await syncSession();

    if (!sessionId) return;

    // Mark session as ended
    try {
      const payload = {
        sessionName,
        endTime: new Date().toISOString(),
        labels: selectedLabels,
        exercises: exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: ex.sets
            .filter((set) => set.weight && set.reps)
            .map((set) => ({
              weight: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
              isHardSet: set.done,
            })),
        })),
      };

      await updateSession(token, sessionId, payload);
      setIsSessionEnded(true);
      navigateAfterSessionEnd(navigate);
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save session. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (
      sessionId &&
      window.confirm(
        "Are you sure you want to cancel this session? All progress will be lost.",
      )
    ) {
      try {
        await deleteSession(token, sessionId);
        setIsSessionEnded(true);
        navigateAfterSessionEnd(navigate);
      } catch (error) {
        console.error("Failed to delete session:", error);
        setIsSessionEnded(true);
        navigateAfterSessionEnd(navigate);
      }
    }
  };
  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => {
      const newLabels = prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label];
      setHasUnsavedChanges(true);
      return newLabels;
    });
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col font-display pb-40 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={handleCancel}
            className="flex items-center text-text-muted hover:text-text-main font-medium transition-colors"
          >
            <X size={20} className="mr-1" />
            <span>Cancel</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">{sessionName}</h1>
            {lastSyncTime && (
              <span className="text-xs text-text-muted">
                {isSaving
                  ? "Saving..."
                  : `Saved ${lastSyncTime.toLocaleTimeString()}`}
              </span>
            )}
          </div>
          <button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="flex items-center text-primary-hover font-medium hover:text-primary transition-colors disabled:opacity-50"
          >
            <Save size={20} className="mr-1" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Label Selector */}
        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm space-y-2">
          <label className="text-sm font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Session Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LABELS.map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedLabels.includes(label)
                    ? "bg-primary text-white border-primary"
                    : "bg-surface-hover text-text-muted border-border hover:border-primary/50"
                }`}
              >
                {label === "FullBody" ? "Full Body" : label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={`${exercise.id}-${exerciseIndex}`}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              onAddSet={addSet}
              onToggleSetDone={toggleSetDone}
              onUpdateSet={updateSet}
              onRemoveExercise={removeExercise}
              onRemoveSet={removeSet}
            />
          ))}

          {/* Add Exercise Button */}
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-5 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-1 text-primary-hover hover:bg-surface-hover hover:border-primary transition-all"
          >
            <Plus size={28} />
            <span className="font-bold">Add Exercise</span>
          </button>
        </div>
      </main>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Volume Bar */}
        <div className="bg-primary px-4 py-3 flex justify-between items-center text-white shadow-lg">
          <span className="text-xs uppercase font-bold opacity-90">
            Session Volume
          </span>
          <span className="text-lg font-black">
            {calculateTotalVolume().toLocaleString()} Kgs
          </span>
        </div>

        {/* Bottom Safe Area */}
        <div className="bg-background h-8 md:hidden"></div>
      </div>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onAddExercise={addExerciseToSession}
      />
    </div>
  );
}
