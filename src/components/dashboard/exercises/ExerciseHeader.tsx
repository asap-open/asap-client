import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface ExerciseHeaderProps {
  onAddClick: () => void;
  collapsed: boolean;
}

export default function ExerciseHeader({
  onAddClick,
  collapsed,
}: ExerciseHeaderProps) {
  return (
    <motion.header
      initial={false}
      animate={collapsed ? "hidden" : "visible"}
      variants={{
        visible: {
          height: "auto",
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          },
        },
        hidden: {
          height: 0,
          opacity: 0,
          y: -10,
          transition: {
            duration: 0.22,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      className={`sticky top-0 z-20 bg-background/90 backdrop-blur-md px-6 overflow-hidden ${
        collapsed ? "pointer-events-none" : ""
      }`}
      style={{ willChange: "height, transform, opacity" }}
    >
      <div className="flex items-center justify-between pt-8 md:pt-12 pb-4">
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
    </motion.header>
  );
}
