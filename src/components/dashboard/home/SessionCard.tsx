import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Trash2,
  Pencil,
  PlayCircle,
  CaseSensitive,
  Check,
  X as XIcon,
} from "lucide-react";
import type { WorkoutSession } from "../../../services/sessionService";

interface SessionCardProps {
  session: WorkoutSession;
  onSessionClick: (session: WorkoutSession) => void;
  onDelete: (sessionId: number) => void;
  onEdit: (session: WorkoutSession) => void;
  onResume: (session: WorkoutSession) => void;
  onRename: (sessionId: number, newName: string) => Promise<void>;
  isDeleting: boolean;
}

export default function SessionCard({
  session,
  onSessionClick,
  onDelete,
  onEdit,
  onResume,
  onRename,
  isDeleting,
}: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.sessionName);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(session);
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onResume(session);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setRenameValue(session.sessionName);
    setIsRenaming(true);
    // Focus input after render
    setTimeout(() => renameInputRef.current?.focus(), 0);
  };

  const handleRenameConfirm = async (
    e: React.MouseEvent | React.KeyboardEvent,
  ) => {
    e.stopPropagation();
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === session.sessionName) {
      setIsRenaming(false);
      return;
    }
    try {
      setIsRenameSaving(true);
      await onRename(session.id, trimmed);
    } finally {
      setIsRenameSaving(false);
      setIsRenaming(false);
    }
  };

  const handleRenameCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameConfirm(e);
    if (e.key === "Escape") {
      e.stopPropagation();
      setIsRenaming(false);
    }
  };

  const primaryCategory = session.exercises[0]?.exercise?.category;
  const colorClass = getCategoryColor(primaryCategory);

  return (
    <div
      onClick={() => !isRenaming && onSessionClick(session)}
      className={`bg-surface p-4 rounded-[24px] shadow-sm border border-border flex items-center gap-4 transition-all ${
        isRenaming
          ? "cursor-default"
          : "cursor-pointer hover:bg-surface-hover active:scale-[0.98]"
      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              disabled={isRenameSaving}
              className="flex-1 min-w-0 text-base font-bold bg-transparent border-b-2 border-primary outline-none text-text-main py-0.5"
            />
            <button
              onClick={handleRenameConfirm}
              disabled={isRenameSaving}
              className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleRenameCancel}
              disabled={isRenameSaving}
              className="p-1 rounded-lg text-text-muted hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              <XIcon size={16} />
            </button>
          </div>
        ) : (
          <h3 className="font-bold text-base leading-tight text-text-main truncate">
            {session.sessionName}
          </h3>
        )}
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
            {session.endTime !== null ? (
              // Saved session — offer Edit
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-muted flex items-center gap-3 hover:bg-surface-hover transition-colors"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>
            ) : (
              // In-progress session — offer Resume
              <button
                onClick={handleResume}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-muted flex items-center gap-3 hover:bg-surface-hover transition-colors"
              >
                <PlayCircle size={16} className="text-primary" />
                <span className="text-primary">Resume</span>
              </button>
            )}
            <button
              onClick={handleRenameClick}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-muted flex items-center gap-3 hover:bg-surface-hover transition-colors"
            >
              <CaseSensitive size={16} />
              <span>Rename</span>
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 hover:bg-surface-hover transition-colors"
            >
              <Trash2 size={16} className="text-red-500" />
              <span className="text-red-500">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
