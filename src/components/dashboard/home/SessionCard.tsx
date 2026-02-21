import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import type { WorkoutSession } from "../../../services/sessionService";

interface SessionCardProps {
  session: WorkoutSession;
  onSessionClick: (session: WorkoutSession) => void;
  onDelete: (sessionId: number) => void;
  isDeleting: boolean;
}

export default function SessionCard({
  session,
  onSessionClick,
  onDelete,
  isDeleting,
}: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const mins = Math.round(duration);
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      chest: "bg-green-100 text-green-600",
      back: "bg-blue-100 text-blue-600",
      legs: "bg-orange-100 text-orange-600",
      shoulders: "bg-purple-100 text-purple-600",
      arms: "bg-pink-100 text-pink-600",
      core: "bg-yellow-100 text-yellow-600",
      cardio: "bg-red-100 text-red-600",
    };

    const key = category?.toLowerCase() || "other";
    return colors[key] || "bg-surface-hover text-text-muted";
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(session.id);
  };

  const primaryCategory = session.exercises[0]?.exercise?.category;
  const colorClass = getCategoryColor(primaryCategory);

  return (
    <div
      onClick={() => onSessionClick(session)}
      className={`bg-surface p-4 rounded-[24px] shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:bg-surface-hover transition-all active:scale-[0.98] ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base leading-tight text-text-main truncate">
          {session.sessionName}
        </h3>
        <div className="flex items-center gap-2 text-text-muted text-xs font-medium mt-1">
          <span>{formatTime(session.startTime)}</span>
          <span className="opacity-30">•</span>
          <span>{formatDuration(session.stats.duration)}</span>
          <span className="opacity-30">•</span>
          <span>{session.stats.exerciseCount} exercises</span>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className="relative flex items-center gap-2 flex-shrink-0"
        ref={menuRef}
      >
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-xl hover:bg-surface-hover text-text-muted transition-colors"
          title="More options"
          disabled={isDeleting}
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 bg-surface rounded-xl shadow-lg border border-border py-1 z-50 min-w-[160px]">
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-muted flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} color="red" />
              <span className="text-red-600">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
