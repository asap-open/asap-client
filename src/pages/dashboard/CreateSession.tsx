import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Save, X, Undo2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  createSession,
  updateSession,
  deleteSession,
  type CreateSessionPayload,
} from "../../utils/session";
import { sessionService } from "../../services/sessionService";
import ExerciseCard from "../../components/session/ExerciseCard";
import AddExerciseModal from "../../components/session/AddExerciseModal";
import SetTimerModal from "../../components/session/SetTimerModal";

interface Set {
  setId: string;
  weight: string;
  reps: string;
  duration: string;
  done: boolean;
}

interface SetTimerState {
  elapsedMs: number;
  runningSinceMs: number | null;
}

interface TimerModalTarget {
  exerciseIndex: number;
  setIndex: number;
  setId: string;
}

interface SessionExercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  isBodyweightExercise?: boolean;
  isTimeBased: boolean;
  sets: Set[];
}

const DRAFT_KEY = "asap_active_session";

interface SessionDraft {
  mode: "new" | "copy";
  sessionId: number | null;
  sessionName: string;
  exercises: SessionExercise[];
  selectedLabels: string[];
  sessionStartTime: string;
}

function createSetId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSet(values?: Partial<Omit<Set, "setId">>): Set {
  return {
    setId: createSetId(),
    weight: values?.weight ?? "",
    reps: values?.reps ?? "",
    duration: values?.duration ?? "",
    done: values?.done ?? false,
  };
}

function normalizeExercises(exercises: SessionExercise[]): SessionExercise[] {
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      setId: set.setId ?? createSetId(),
    })),
  }));
}

function loadDraft(): SessionDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as SessionDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: SessionDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export default function CreateSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const draft = loadDraft();

  const sessionStartTime = useRef<string>(
    draft?.sessionStartTime ?? new Date().toISOString(),
  );

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

  const mode: "new" | "edit" | "resume" | "copy" =
    location.state?.mode ?? draft?.mode ?? "new";

  const [sessionName, setSessionName] = useState<string>(
    draft?.sessionName ?? location.state?.sessionName ?? "Workout Session",
  );
  const [exercises, setExercises] = useState<SessionExercise[]>(() => {
    // Draft always wins — it reflects the user's actual in-progress work.
    // Only fall back to copyExercises for the very first load (no draft yet).
    if (draft?.exercises?.length) {
      return normalizeExercises(draft.exercises);
    }
    if (mode === "copy" && location.state?.copyExercises) {
      return location.state.copyExercises.map(
        (ex: {
          exerciseId: string;
          isTimeBased?: boolean;
          exercise: {
            id: string;
            name: string;
            category: string;
            equipment?: string;
            isBodyweightExercise?: boolean;
          };
          sets: {
            weight: number;
            reps: number;
            durationSec?: number | null;
            isHardSet: boolean;
          }[];
        }) => ({
          id: ex.exercise?.id ?? ex.exerciseId,
          name: ex.exercise?.name ?? "",
          category: ex.exercise?.category ?? "",
          equipment: ex.exercise?.equipment ?? "",
          isBodyweightExercise: ex.exercise?.isBodyweightExercise ?? false,
          isTimeBased: ex.isTimeBased ?? false,
          sets: ex.sets.map((s) =>
            createSet({
              weight: s.weight.toString(),
              reps: s.reps.toString(),
              duration: s.durationSec != null ? s.durationSec.toString() : "",
              done: false,
            }),
          ),
        }),
      );
    }
    return normalizeExercises(draft?.exercises ?? []);
  });
  const [sessionId, setSessionId] = useState<number | null>(
    location.state?.sessionId ?? draft?.sessionId ?? null,
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(
    mode === "edit" || mode === "resume",
  );

  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalEndTime, setOriginalEndTime] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    draft?.selectedLabels ?? location.state?.labels ?? [],
  );
  const [setTimers, setSetTimers] = useState<Record<string, SetTimerState>>({});
  const [activeTimerKey, setActiveTimerKey] = useState<string | null>(null);
  const [timerNowMs, setTimerNowMs] = useState<number>(Date.now());
  const [timerModalTarget, setTimerModalTarget] =
    useState<TimerModalTarget | null>(null);

  useEffect(() => {
    if (!activeTimerKey) return;
    const timer = window.setInterval(() => {
      setTimerNowMs(Date.now());
    }, 10);
    return () => window.clearInterval(timer);
  }, [activeTimerKey]);

  const clearTimersBySetIds = useCallback((setIds: string[]) => {
    if (setIds.length === 0) return;

    const ids = new Set(setIds);
    setSetTimers((prev) => {
      const next = { ...prev };
      setIds.forEach((id) => {
        delete next[id];
      });
      return next;
    });

    setActiveTimerKey((prev) => (prev && ids.has(prev) ? null : prev));
  }, []);

  const getElapsedMsByKey = useCallback(
    (setKey: string, nowMs: number = Date.now()) => {
      const timer = setTimers[setKey];
      if (!timer) return 0;
      const runningDelta = timer.runningSinceMs
        ? nowMs - timer.runningSinceMs
        : 0;
      return Math.max(0, timer.elapsedMs + runningDelta);
    },
    [setTimers],
  );

  const getSetKey = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      return exercises[exerciseIndex]?.sets[setIndex]?.setId ?? null;
    },
    [exercises],
  );

  const getSetLocationById = useCallback(
    (setId: string) => {
      for (
        let exerciseIndex = 0;
        exerciseIndex < exercises.length;
        exerciseIndex += 1
      ) {
        const setIndex = exercises[exerciseIndex].sets.findIndex(
          (set) => set.setId === setId,
        );
        if (setIndex !== -1) {
          return { exerciseIndex, setIndex };
        }
      }
      return null;
    },
    [exercises],
  );

  useEffect(() => {
    if (!timerModalTarget) return;
    const location = getSetLocationById(timerModalTarget.setId);

    if (!location) {
      setTimerModalTarget(null);
      return;
    }

    if (
      location.exerciseIndex !== timerModalTarget.exerciseIndex ||
      location.setIndex !== timerModalTarget.setIndex
    ) {
      setTimerModalTarget((prev) =>
        prev
          ? {
              ...prev,
              exerciseIndex: location.exerciseIndex,
              setIndex: location.setIndex,
            }
          : prev,
      );
    }
  }, [exercises, getSetLocationById, timerModalTarget]);

  const pauseTimerByKey = useCallback((setKey: string) => {
    const nowMs = Date.now();

    setSetTimers((prev) => {
      const timer = prev[setKey];
      if (!timer || !timer.runningSinceMs) return prev;
      return {
        ...prev,
        [setKey]: {
          elapsedMs: timer.elapsedMs + (nowMs - timer.runningSinceMs),
          runningSinceMs: null,
        },
      };
    });

    setActiveTimerKey((prev) => (prev === setKey ? null : prev));
  }, []);

  const startSetTimer = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const setKey = getSetKey(exerciseIndex, setIndex);
      if (!setKey) return;

      if (activeTimerKey && activeTimerKey !== setKey) {
        pauseTimerByKey(activeTimerKey);
      }

      const nowMs = Date.now();
      setTimerNowMs(nowMs);
      setSetTimers((prev) => {
        const existing = prev[setKey];
        if (existing?.runningSinceMs) return prev;
        return {
          ...prev,
          [setKey]: {
            elapsedMs: existing?.elapsedMs ?? 0,
            runningSinceMs: nowMs,
          },
        };
      });
      setActiveTimerKey(setKey);
    },
    [activeTimerKey, getSetKey, pauseTimerByKey],
  );

  const stopSetTimer = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const setKey = getSetKey(exerciseIndex, setIndex);
      if (!setKey) return;

      const elapsedSeconds = Math.max(
        1,
        Math.floor(getElapsedMsByKey(setKey) / 1000),
      );

      setSetTimers((prev) => ({
        ...prev,
        [setKey]: {
          elapsedMs: elapsedSeconds * 1000,
          runningSinceMs: null,
        },
      }));
      setActiveTimerKey((prev) => (prev === setKey ? null : prev));

      setExercises((prev) => {
        const updatedExercises = [...prev];
        const currentSet = updatedExercises[exerciseIndex]?.sets[setIndex];
        if (!currentSet) return prev;
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...currentSet,
          duration: elapsedSeconds.toString(),
        };
        return updatedExercises;
      });
      setHasUnsavedChanges(true);
    },
    [getElapsedMsByKey, getSetKey],
  );

  const resetSetTimer = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const setKey = getSetKey(exerciseIndex, setIndex);
      if (!setKey) return;

      setSetTimers((prev) => ({
        ...prev,
        [setKey]: {
          elapsedMs: 0,
          runningSinceMs: null,
        },
      }));
      setActiveTimerKey((prev) => (prev === setKey ? null : prev));

      setExercises((prev) => {
        const updatedExercises = [...prev];
        const currentSet = updatedExercises[exerciseIndex]?.sets[setIndex];
        if (!currentSet) return prev;
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...currentSet,
          duration: "",
          done: false,
        };
        return updatedExercises;
      });
      setHasUnsavedChanges(true);
    },
    [getSetKey],
  );

  const isSetTimerRunning = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const setKey = getSetKey(exerciseIndex, setIndex);
      return setKey ? activeTimerKey === setKey : false;
    },
    [activeTimerKey, getSetKey],
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
          if (session.endTime) setOriginalEndTime(session.endTime);
          setExercises(
            session.exercises.map((ex) => ({
              id: ex.exercise.id ?? ex.exerciseId,
              name: ex.exercise.name,
              category: ex.exercise.category,
              equipment: ex.exercise.equipment ?? "",
              isBodyweightExercise: ex.exercise.isBodyweightExercise ?? false,
              isTimeBased: ex.isTimeBased ?? false,
              sets: ex.sets.map((s) =>
                createSet({
                  weight: s.weight.toString(),
                  reps: s.reps.toString(),
                  duration:
                    s.durationSec != null ? s.durationSec.toString() : "",
                  done: ex.isTimeBased ? false : s.isHardSet,
                }),
              ),
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
    // new mode: create a session immediately (for auto-save)
    // copy mode: session is created on explicit Save, not upfront
    if (mode === "new" && !sessionId) {
      createInitialSession();
    }
  }, []);

  // Persist draft to sessionStorage on every change (new/copy modes only)
  useEffect(() => {
    if (mode !== "new" && mode !== "copy") return;
    saveDraft({
      mode,
      sessionId,
      sessionName,
      exercises,
      selectedLabels,
      sessionStartTime: sessionStartTime.current,
    });
  }, [mode, sessionId, sessionName, exercises, selectedLabels]);

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
          isTimeBased: ex.isTimeBased,
          sets: ex.sets
            .filter((set) => (ex.isTimeBased ? set.duration : set.reps))
            .map((set) => ({
              weight: parseFloat(set.weight) || 0,
              reps: ex.isTimeBased ? 0 : parseInt(set.reps) || 0,
              durationSec: ex.isTimeBased ? parseInt(set.duration) || 0 : null,
              isHardSet: ex.isTimeBased ? false : set.done,
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
  }, [sessionId, sessionName, selectedLabels, exercises, token, isSaving]);

  const calculateTotalVolume = () => {
    return exercises.reduce((total, exercise) => {
      if (exercise.isTimeBased) return total;
      const exerciseVolume = exercise.sets.reduce((sum, set) => {
        if (set.done && set.weight && set.reps) {
          return sum + parseFloat(set.weight) * parseFloat(set.reps);
        }
        return sum;
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  const calculateBodyweightScore = () => {
    return exercises.reduce((total, exercise) => {
      if (exercise.isTimeBased) return total;
      const repsValues = exercise.sets.map((set) => parseInt(set.reps) || 0);
      const hasAnyReps = repsValues.some((reps) => reps > 0);
      const allWeightsAreZero = exercise.sets.every((set) => {
        if (!set.weight) return true;
        return (parseFloat(set.weight) || 0) === 0;
      });

      const isBodyweight =
        exercise.isBodyweightExercise ||
        exercise.equipment?.toLowerCase().includes("body") ||
        (hasAnyReps && allWeightsAreZero);
      if (!isBodyweight) return total;

      const repsScore = exercise.sets.reduce((sum, set) => {
        if (!set.done) return sum;
        return sum + (parseInt(set.reps) || 0);
      }, 0);

      return total + repsScore;
    }, 0);
  };

  const addExerciseToSession = (exercise: {
    id: string;
    name: string;
    category: string;
    equipment?: string;
    isBodyweightExercise?: boolean;
  }) => {
    const newExercise: SessionExercise = {
      ...exercise,
      isTimeBased: false,
      sets: [createSet()],
    };
    setExercises([...exercises, newExercise]);
    setHasUnsavedChanges(true);
  };

  const toggleTimeBased = (exerciseIndex: number) => {
    const targetExercise = exercises[exerciseIndex];
    if (!targetExercise) return;

    if (targetExercise.isTimeBased) {
      clearTimersBySetIds(targetExercise.sets.map((set) => set.setId));
      if (
        timerModalTarget &&
        targetExercise.sets.some((set) => set.setId === timerModalTarget.setId)
      ) {
        setTimerModalTarget(null);
      }
    }

    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      isTimeBased: !updatedExercises[exerciseIndex].isTimeBased,
      sets: updatedExercises[exerciseIndex].sets.map((set) => ({
        ...set,
        done: !updatedExercises[exerciseIndex].isTimeBased ? false : set.done,
      })),
    };
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const removeExercise = (exerciseIndex: number) => {
    const removedSetIds =
      exercises[exerciseIndex]?.sets.map((set) => set.setId) ?? [];
    clearTimersBySetIds(removedSetIds);
    if (timerModalTarget && removedSetIds.includes(timerModalTarget.setId)) {
      setTimerModalTarget(null);
    }
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
      ...createSet({
        weight: lastSet?.weight || "",
        reps: lastSet?.reps || "",
        duration: lastSet?.duration || "",
        done: false,
      }),
    });
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const removedSetId = exercises[exerciseIndex]?.sets[setIndex]?.setId;
    if (removedSetId) {
      clearTimersBySetIds([removedSetId]);
      if (timerModalTarget?.setId === removedSetId) {
        setTimerModalTarget(null);
      }
    }

    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[
      exerciseIndex
    ].sets.filter((_, idx) => idx !== setIndex);
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const openSetTimerModal = (exerciseIndex: number, setIndex: number) => {
    const setId = getSetKey(exerciseIndex, setIndex);
    if (!setId) return;
    setTimerModalTarget({ exerciseIndex, setIndex, setId });
  };

  const closeSetTimerModal = () => {
    setTimerModalTarget(null);
  };

  const handleModalStart = () => {
    if (!timerModalTarget) return;
    startSetTimer(timerModalTarget.exerciseIndex, timerModalTarget.setIndex);
  };

  const handleModalStop = () => {
    if (!timerModalTarget) return;
    stopSetTimer(timerModalTarget.exerciseIndex, timerModalTarget.setIndex);
  };

  const handleModalReset = () => {
    if (!timerModalTarget) return;
    resetSetTimer(timerModalTarget.exerciseIndex, timerModalTarget.setIndex);
  };

  const modalSetTitle = timerModalTarget
    ? `${exercises[timerModalTarget.exerciseIndex]?.name ?? "Set"} - Set ${
        timerModalTarget.setIndex + 1
      }`
    : "Set Timer";

  const modalElapsedMs = timerModalTarget
    ? getElapsedMsByKey(timerModalTarget.setId, timerNowMs)
    : 0;

  const modalIsRunning = timerModalTarget
    ? isSetTimerRunning(
        timerModalTarget.exerciseIndex,
        timerModalTarget.setIndex,
      )
    : false;

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
    field: "weight" | "reps" | "duration",
    value: string,
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
    setHasUnsavedChanges(true);
  };

  const handleSaveAndExit = async () => {
    try {
      setIsSaving(true);

      const exercisesPayload = exercises.map((ex) => ({
        exerciseId: ex.id,
        isTimeBased: ex.isTimeBased,
        sets: ex.sets
          .filter((set) => (ex.isTimeBased ? set.duration : set.reps))
          .map((set) => ({
            weight: parseFloat(set.weight) || 0,
            reps: ex.isTimeBased ? 0 : parseInt(set.reps) || 0,
            durationSec: ex.isTimeBased ? parseInt(set.duration) || 0 : null,
            isHardSet: ex.isTimeBased ? false : set.done,
          })),
      }));

      let targetId = sessionId;

      if (mode === "copy" && !targetId) {
        // Copy mode: create a shell session first to get an id, then update like every other mode
        const created = await createSession(token, {
          sessionName,
          startTime: sessionStartTime.current,
          exercises: [],
        } as CreateSessionPayload);
        targetId = created.id;
      }

      if (!targetId) return;
      await updateSession(token, targetId, {
        sessionName,
        endTime:
          mode === "edit" && originalEndTime
            ? originalEndTime
            : new Date().toISOString(),
        labels: selectedLabels,
        exercises: exercisesPayload,
      });

      clearDraft();
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
        clearDraft();
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Failed to delete session:", error);
        clearDraft();
        navigate("/", { replace: true });
      }
    }
  };

  const handleDiscard = () => {
    clearDraft();
    navigate("/", { replace: true });
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
          {mode === "edit" || mode === "copy" ? (
            <button
              onClick={handleDiscard}
              className="flex items-center text-text-muted hover:text-text font-medium transition-colors"
            >
              <Undo2 size={20} className="mr-1" />
              <span>Discard</span>
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="flex items-center text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <X size={20} className="mr-1" />
              <span>Delete</span>
            </button>
          )}
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
              onToggleTimeBased={toggleTimeBased}
              onOpenSetTimerModal={openSetTimerModal}
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
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-85">
              Session Metrics
            </span>
            <span className="text-xs opacity-90">Volume + BW Score</span>
          </div>
          <div className="text-right leading-tight">
            <p className="text-base font-black">
              {calculateTotalVolume().toLocaleString()} kg
            </p>
            <p className="text-xs font-semibold opacity-90">
              BW {calculateBodyweightScore().toLocaleString()} reps
            </p>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="bg-background h-8 md:hidden"></div>
      </div>

      {/* Add Exercise Modal */}
      <SetTimerModal
        isOpen={!!timerModalTarget}
        onClose={closeSetTimerModal}
        title={modalSetTitle}
        elapsedMs={modalElapsedMs}
        isRunning={modalIsRunning}
        onStart={handleModalStart}
        onStop={handleModalStop}
        onReset={handleModalReset}
      />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onAddExercise={addExerciseToSession}
      />
    </div>
  );
}
