import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  createSession,
  updateSession,
  deleteSession,
} from "../../utils/session";
import { sessionService } from "../../services/sessionService";
import ExerciseCard from "../../components/session/ExerciseCard";
import AddExerciseModal from "../../components/session/AddExerciseModal";

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

  const mode: "new" | "edit" | "resume" = location.state?.mode || "new";

  const [sessionName, setSessionName] = useState(
    location.state?.sessionName || "Workout Session",
  );
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(
    location.state?.sessionId || null,
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(
    mode === "edit" || mode === "resume",
  );
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    location.state?.labels || [],
  );

  // For edit/resume: load existing session data
  useEffect(() => {
    if ((mode === "edit" || mode === "resume") && sessionId && token) {
      const loadExistingSession = async () => {
        try {
          setIsLoadingSession(true);
          const session = await sessionService.getSessionById(token, sessionId);
          setSessionName(session.sessionName);
          setSelectedLabels(session.labels ?? []);
          setExercises(
            session.exercises.map((ex) => ({
              id: ex.exercise.id ?? ex.exerciseId,
              name: ex.exercise.name,
              category: ex.exercise.category,
              sets: ex.sets.map((s) => ({
                weight: s.weight.toString(),
                reps: s.reps.toString(),
                done: s.isHardSet,
              })),
            })),
          );
        } catch (error) {
          console.error("Failed to load session:", error);
          alert("Failed to load session. Please try again.");
          navigate("/", { replace: true });
        } finally {
          setIsLoadingSession(false);
        }
      };
      loadExistingSession();
      return;
    }
    // new mode: create a session if one doesn't exist
    if (mode === "new" && !sessionId) {
      createInitialSession();
    }
  }, []);

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
    if (!sessionId) return;

    try {
      setIsSaving(true);
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
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      sessionId &&
      window.confirm(
        "Are you sure you want to delete this session? All progress will be lost.",
      )
    ) {
      try {
        await deleteSession(token, sessionId);
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Failed to delete session:", error);
        navigate("/", { replace: true });
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
      {isLoadingSession && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-text-muted">
              {mode === "edit" ? "Loading session..." : "Resuming session..."}
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={handleDelete}
            className="flex items-center text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <X size={20} className="mr-1" />
            <span>Delete</span>
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
