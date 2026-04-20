import { useEffect, useState } from "react";
import ExerciseHeader from "../../components/dashboard/exercises/ExerciseHeader";
import SearchBar from "../../components/dashboard/exercises/SearchBar";
import ExerciseFilters from "../../components/dashboard/exercises/ExerciseFilters";
import ExerciseFiltersModal from "../../components/dashboard/exercises/ExerciseFiltersModal";
import ExerciseList from "../../components/dashboard/exercises/ExerciseList";
import CreateExerciseModal from "../../components/ui/exercises/modals/CreateExerciseModal";

export default function Exercises() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    const scrollRoot = document.getElementById("dashboard-scroll-root");
    return scrollRoot ? scrollRoot.scrollTop > 60 : false;
  });
  const [filters, setFilters] = useState({
    muscle: "",
    category: "",
    equipment: "",
  });
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const scrollRoot = document.getElementById("dashboard-scroll-root");
    if (!scrollRoot) {
      return;
    }

    let collapsedState = scrollRoot.scrollTop > 60;
    setIsHeaderCollapsed(collapsedState);

    const handleScroll = () => {
      const currentY = scrollRoot.scrollTop;
      // Use hysteresis to prevent flickering
      const threshold = collapsedState ? 20 : 60;
      const nextCollapsed = currentY > threshold;

      if (nextCollapsed !== collapsedState) {
        collapsedState = nextCollapsed;
        setIsHeaderCollapsed(nextCollapsed);
      }
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto w-full md:max-w-4xl">
      <ExerciseHeader
        onAddClick={() => setIsModalOpen(true)}
        collapsed={isHeaderCollapsed}
      />
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
