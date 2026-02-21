import { Plus } from "lucide-react";

interface ExerciseHeaderProps {
  onAddClick: () => void;
}

export default function ExerciseHeader({ onAddClick }: ExerciseHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 pt-8 md:pt-12 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          Exercises
        </h1>
        <button
          onClick={onAddClick}
          className="bg-primary/10 text-primary-hover p-2 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Plus size={24} />
        </button>
      </div>
    </header>
  );
}
