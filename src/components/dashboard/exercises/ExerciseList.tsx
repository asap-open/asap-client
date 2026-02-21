import React, { useContext, useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";
import ExerciseItem from "../../ui/exercises/ExerciseItem";
import CreateExerciseModal from "../../ui/exercises/modals/CreateExerciseModal";
import ExerciseDetailsModal from "../../ui/exercises/modals/ExerciseDetailsModal";
import ConfirmModal from "../../ui/exercises/modals/ConfirmDeleteModal";
// --- Types ---
interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string;
  isCustom: boolean;
  createdBy?: string;
}

interface ExerciseListProps {
  filters?: {
    muscle?: string;
    category?: string;
    equipment?: string;
  };
  search?: string;
}

export default function ExerciseList({
  filters = {},
  search = "",
}: ExerciseListProps) {
  const { token } = useContext(AuthContext);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null,
  );

  // Fetch Exercises
  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "50");

      if (filters.muscle) params.append("muscle", filters.muscle);
      if (filters.category) params.append("category", filters.category);
      if (filters.equipment) params.append("equipment", filters.equipment);
      if (search) params.append("q", search);

      const response = await api.get(
        `/exercises/search?${params.toString()}`,
        token,
      );

      // The search endpoint returns { data: Exercise[], meta: ... }
      // api.get returns the parsed body, so response.data is the array
      if (response && Array.isArray(response.data)) {
        setExercises(response.data);
      } else if (Array.isArray(response)) {
        setExercises(response);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExercises();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.muscle, filters.category, filters.equipment, search]);

  // Close menu when clicking anywhere else on the page
  useEffect(() => {
    const handleClickOutside = () => setOpenIndex(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setOpenIndex(openIndex === index ? null : index);
  };

  const menuCallbacks = (exercise: Exercise) => ({
    onView: () => {
      setViewingExercise(exercise);
      setOpenIndex(null);
    },
    onEdit: () => {
      // Only allow editing custom exercises
      if (exercise.isCustom) {
        setEditingExercise(exercise);
      } else {
        alert("You can only edit custom exercises.");
      }
      setOpenIndex(null);
    },
    onRemove: () => {
      // Only allow deleting custom exercises
      if (exercise.isCustom) {
        setDeletingExercise(exercise);
      } else {
        alert("You can only delete custom exercises.");
      }
      setOpenIndex(null);
    },
  });

  const handleDelete = async () => {
    if (!deletingExercise || !token) return;
    try {
      await api.delete(`/exercises/${deletingExercise.id}`, token);
      fetchExercises(); // Refresh list
    } catch (error) {
      console.error("Failed to delete exercise", error);
      alert("Failed to delete exercise.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-text-muted">
        Loading exercises...
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-6 pb-32 space-y-4">
      {exercises.length === 0 ? (
        <div className="text-center p-8 text-text-muted">
          No exercises found.
        </div>
      ) : (
        exercises.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setViewingExercise(item)}
            className="cursor-pointer"
          >
            <ExerciseItem
              key={item.id}
              exercise={{
                title: item.name,
                muscles: item.primaryMuscles.join(", "),
              }}
              isOpen={openIndex === index}
              onToggle={(e) => handleToggle(e, index)}
              {...menuCallbacks(item)}
            />
          </div>
        ))
      )}

      {/* Modals */}
      <CreateExerciseModal
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        initialData={
          editingExercise
            ? {
                id: editingExercise.id,
                title: editingExercise.name,
                muscles: editingExercise.primaryMuscles.join(", "),
                category: editingExercise.category,
                equipment: editingExercise.equipment,
                secondaryMuscles: editingExercise.secondaryMuscles,
                instructions: editingExercise.instructions,
              }
            : null
        }
        onSuccess={() => {
          fetchExercises();
        }}
      />

      <ExerciseDetailsModal
        isOpen={!!viewingExercise}
        onClose={() => setViewingExercise(null)}
        exercise={
          viewingExercise
            ? {
                title: viewingExercise.name,
                muscles: viewingExercise.primaryMuscles.join(", "),
                category: viewingExercise.category,
                equipment: viewingExercise.equipment,
                secondaryMuscles: viewingExercise.secondaryMuscles,
                instructions: viewingExercise.instructions,
              }
            : null
        }
      />

      <ConfirmModal
        isOpen={!!deletingExercise}
        onClose={() => setDeletingExercise(null)}
        onConfirm={handleDelete}
        title="Delete Exercise"
        description={`Are you sure you want to delete "${deletingExercise?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}
