import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DocTopic } from "../../../pages/dashboard/help/docsNav";

interface HelpHeaderProps {
  currentTopic: DocTopic;
  onOpenMobileDrawer: () => void;
}

export default function HelpHeader({
  currentTopic,
  onOpenMobileDrawer,
}: HelpHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/profile")}
            aria-label="Go back to Profile"
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-text-main shrink-0 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-main truncate">
              Help & Docs
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              Quick Reference
            </span>
          </div>
        </div>

        {/* Right: Mobile Drawer Toggle */}
        <div className="md:hidden">
          <button
            onClick={onOpenMobileDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-text-main shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen size={16} className="text-primary" />
            <span className="truncate max-w-[120px]">{currentTopic.title}</span>
            <span className="text-[10px] text-text-muted">▾</span>
          </button>
        </div>
      </div>
    </header>
  );
}
