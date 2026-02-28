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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Fetch Exercises
  const fetchExercises = async (
    currentPage: number,
    currentPageSize: number,
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", String(currentPageSize));
      params.append("offset", String((currentPage - 1) * currentPageSize));

      if (filters.muscle) params.append("muscle", filters.muscle);
      if (filters.category) params.append("category", filters.category);
      if (filters.equipment) params.append("equipment", filters.equipment);
      if (search) params.append("q", search);

      const response = await api.get(
        `/exercises/search?${params.toString()}`,
        token,
      );

      // The search endpoint returns { data: Exercise[], meta: { total, ... } }
      if (response && Array.isArray(response.data)) {
        setExercises(response.data);
        setTotal(response.meta?.total ?? response.data.length);
      } else if (Array.isArray(response)) {
        setExercises(response);
        setTotal(response.length);
      } else {
        setExercises([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      setExercises([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // When filters/search/pageSize change, reset to page 1.
  // If already on page 1 setPage is a no-op so we fetch directly;
  // otherwise setting page triggers the navigation effect below.
  useEffect(() => {
    if (!token) return;
    if (page !== 1) {
      setPage(1);
    } else {
      fetchExercises(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    filters.muscle,
    filters.category,
    filters.equipment,
    search,
    pageSize,
  ]);

  // Fetch whenever the page number changes (includes navigating back to page 1)
  useEffect(() => {
    if (!token) return;
    fetchExercises(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
      fetchExercises(page, pageSize); // Refresh list
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
      {/* Pagination controls - top */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Per page:</span>
          <select
            className="bg-surface border border-border rounded-md px-2 py-1 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-text-muted">
          {total > 0
            ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
            : "No results"}
        </span>
      </div>

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

      {/* Pagination controls - bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
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
          fetchExercises(page, pageSize);
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
