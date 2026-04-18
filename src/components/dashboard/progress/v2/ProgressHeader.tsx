import { motion } from "framer-motion";

export interface ProgressHeaderProps {
  error: string | null;
  collapsed: boolean;
}

export function ProgressHeader({ error, collapsed }: ProgressHeaderProps) {
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
          y: -12,
          transition: {
            duration: 0.22,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      className={`sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-6 overflow-hidden ${
        collapsed
          ? "pointer-events-none border-b-transparent"
          : "border-b border-border/80 shadow-sm"
      }`}
      style={{ willChange: "height, transform, opacity" }}
    >
      <div className="pt-7 md:pt-9 pb-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-main leading-none">
          Progress
        </h1>

        {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
      </div>
    </motion.header>
  );
}
