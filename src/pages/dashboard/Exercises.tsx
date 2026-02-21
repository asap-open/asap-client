import { useState } from "react";
import ExerciseHeader from "../../components/dashboard/exercises/ExerciseHeader";
import SearchBar from "../../components/dashboard/exercises/SearchBar";
import ExerciseFilters from "../../components/dashboard/exercises/ExerciseFilters";
import ExerciseFiltersModal from "../../components/dashboard/exercises/ExerciseFiltersModal";
import ExerciseList from "../../components/dashboard/exercises/ExerciseList";
import CreateExerciseModal from "../../components/ui/exercises/modals/CreateExerciseModal";

export default function Exercises() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    muscle: "",
    category: "",
    equipment: "",
  });
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto w-full md:max-w-4xl">
      <ExerciseHeader onAddClick={() => setIsModalOpen(true)} />
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 px-6 pt-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <button
          className="md:hidden mt-2 bg-primary/10 text-primary px-4 py-2 rounded-lg"
          onClick={() => setIsFiltersModalOpen(true)}
        >
          Filters
        </button>
      </div>
      <div className="hidden md:block">
        <ExerciseFilters
          filters={filters}
          onChange={(newFilters) =>
            setFilters((prev) => ({
              ...prev,
              ...newFilters,
            }))
          }
        />
      </div>
      <ExerciseFiltersModal
        isOpen={isFiltersModalOpen}
        filters={filters}
        onChange={(newFilters) =>
          setFilters((prev) => ({
            ...prev,
            ...newFilters,
          }))
        }
        onClose={() => setIsFiltersModalOpen(false)}
      />
      <ExerciseList key={refreshKey} filters={filters} search={search} />
      <CreateExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
