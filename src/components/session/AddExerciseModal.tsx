import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import type { ExerciseCacheItem } from "../../utils/exercises";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../dashboard/exercises/SearchBar";
import Modal from "../ui/Modal";
import ExerciseFilters from "../dashboard/exercises/ExerciseFilters";
import { useExerciseSearch } from "../../hooks/useExerciseSearch";
import {
  getExerciseCache,
  getUserIdFromToken,
} from "../../utils/exerciseCache";
import { USE_CLIENT_EXERCISE_SEARCH } from "../../utils/featureFlags";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  isBodyweightExercise?: boolean;
  primaryMuscles: string[];
}

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AddExerciseModal({
  isOpen,
  onClose,
  onAddExercise,
}: AddExerciseModalProps) {
  const { token, exerciseCacheRevision, refreshExerciseCache } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [cachedExercises, setCachedExercises] = useState<ExerciseCacheItem[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(USE_CLIENT_EXERCISE_SEARCH);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    muscle: "",
    category: "",
    equipment: "",
  });

  const localSearch = useExerciseSearch({
    exercises: cachedExercises,
    searchTerm: searchQuery,
    filters,
    page,
    pageSize,
  });

  const displayedExercises = USE_CLIENT_EXERCISE_SEARCH
    ? localSearch.items
    : exercises;
  const currentTotal = USE_CLIENT_EXERCISE_SEARCH ? localSearch.total : total;
  const currentPage = USE_CLIENT_EXERCISE_SEARCH ? localSearch.page : page;
  const totalPages = USE_CLIENT_EXERCISE_SEARCH
    ? localSearch.totalPages
    : Math.max(1, Math.ceil(total / pageSize));

  const loadCachedExercises = async () => {
    if (!token) {
      setCachedExercises([]);
      setLoading(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setCachedExercises([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let data = getExerciseCache(userId);
    if (data.length === 0) {
      await refreshExerciseCache();
      data = getExerciseCache(userId);
    }

    setCachedExercises(data);
    setLoading(false);
  };

  // When search/filters/pageSize change, reset to page 1.
  // If already on page 1 setPage is a no-op so we fetch directly;
  // otherwise setting page triggers the navigation effect below.
  useEffect(() => {
    if (USE_CLIENT_EXERCISE_SEARCH) {
      if (!isOpen) return;
      if (page !== 1) setPage(1);
      return;
    }

    if (isOpen) {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchExercises(1, pageSize);
      }
    }
    // eslint-disable-next-line
  }, [isOpen, searchQuery, filters, pageSize]);

  // Fetch whenever the page number changes (includes navigating back to page 1)
  useEffect(() => {
    if (USE_CLIENT_EXERCISE_SEARCH) return;
    if (isOpen) {
      fetchExercises(page, pageSize);
    }
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    if (!USE_CLIENT_EXERCISE_SEARCH || !isOpen) return;
    loadCachedExercises().catch((error) => {
      console.error("Failed to load cached exercises:", error);
      setCachedExercises([]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token, exerciseCacheRevision]);

  const fetchExercises = async (
    currentPage: number,
    currentPageSize: number,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append("q", searchQuery);
      if (filters.muscle) params.append("muscle", filters.muscle);
      if (filters.category) params.append("category", filters.category);
      if (filters.equipment) params.append("equipment", filters.equipment);
      params.append("limit", String(currentPageSize));
      params.append("offset", String((currentPage - 1) * currentPageSize));

      const response = await api.get(
        `/exercises/search?${params.toString()}`,
        token,
      );

      if (response && Array.isArray(response.data)) {
        setExercises(response.data);
        setTotal(response.meta?.total ?? response.data.length);
      } else {
        const results = Array.isArray(response) ? response : [];
        setExercises(results);
        setTotal(results.length);
      }
    } catch {
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
    onClose();
    setSearchQuery("");
    setFilters({ muscle: "", category: "", equipment: "" });
    setPage(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Exercise"
      className="md:max-w-2xl md:w-full"
      initialHeight={600}
    >
      <div className="flex flex-col h-full">
        {/* Search Bar & Filters */}
        <div className="py-2 border-b border-border">
          <div className="px-4 md:px-0 mb-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="-mx-4 md:mx-0">
            <ExerciseFilters
              filters={filters}
              onChange={(newFilters) =>
                setFilters((prev) => ({ ...prev, ...newFilters }))
              }
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto py-2 px-4 md:px-0">
          {/* Top pagination bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2">
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
            <span className="text-xs text-text-muted">
              {currentTotal > 0
                ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    currentTotal,
                  )} of ${currentTotal}`
                : "No results"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-text-muted gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading exercises...
            </div>
          ) : displayedExercises.length === 0 ? (
            <div className="text-center py-8 text-text-muted bg-surface-hover rounded-lg mt-2 border border-dashed border-border">
              No exercises found
            </div>
          ) : (
            <div className="space-y-2 pb-2 pt-1">
              {displayedExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise)}
                  className="w-full p-4 bg-surface border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group"
                >
                  <div className="font-semibold text-text-main group-hover:text-primary transition-colors">
                    {exercise.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted uppercase font-semibold bg-surface-hover px-2 py-0.5 rounded">
                      {exercise.category}
                    </span>
                    <span className="text-xs text-text-muted/40">•</span>
                    <span className="text-xs text-text-muted">
                      {exercise.equipment}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bottom pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t border-border mt-2">
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              <span className="text-sm text-text-muted">
                {currentPage} / {totalPages}
              </span>
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
