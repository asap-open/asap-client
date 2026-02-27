import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { sessionService } from "../../../services/sessionService";
import type { WorkoutSession } from "../../../services/sessionService";
import { deleteSession, updateSession } from "../../../utils/session";
import SessionDetailsModal from "./SessionDetailsModel";
import LoadingScreen from "../../ui/Loading";
import SessionList from "./SessionList";
import EmptyState from "./EmptyState";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface RecentHistoryProps {
  filter?: "today" | "week" | "month";
}

export default function RecentHistory({ filter }: RecentHistoryProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // When filter or pageSize changes, reset to page 1 and fetch directly
  useEffect(() => {
    if (!token) return;
    setPage(1);
    fetchSessions(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter, pageSize]);

  // When only the page changes (prev/next navigation), fetch that page
  useEffect(() => {
    if (!token || page === 1) return;
    fetchSessions(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchSessions = async (
    currentPage: number,
    currentPageSize: number,
  ) => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await sessionService.getSessions(
        token,
        filter,
        currentPageSize,
        currentPage,
      );
      setSessions(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: WorkoutSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleEdit = (session: WorkoutSession) => {
    navigate("/session/create", {
      state: {
        sessionId: session.id,
        sessionName: session.sessionName,
        labels: session.labels ?? [],
        mode: "edit",
      },
      replace: true,
    });
  };

  const handleResume = (session: WorkoutSession) => {
    navigate("/session/create", {
      state: {
        sessionId: session.id,
        sessionName: session.sessionName,
        labels: session.labels ?? [],
        mode: "resume",
      },
      replace: true,
    });
  };

  const handleCopy = (session: WorkoutSession) => {
    navigate("/session/create", {
      state: {
        mode: "copy",
        sessionName: session.sessionName,
        labels: session.labels ?? [],
        copyExercises: session.exercises,
      },
    });
  };

  const handleRename = async (sessionId: number, newName: string) => {
    try {
      await updateSession(token, sessionId, { sessionName: newName });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, sessionName: newName } : s,
        ),
      );
    } catch (error) {
      console.error("Error renaming session:", error);
      alert("Failed to rename session. Please try again.");
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      setDeletingId(sessionId);
      await deleteSession(token, sessionId);
      // If last item on page > 1, go back a page
      const newTotal = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
      const targetPage = page > newTotalPages ? newTotalPages : page;
      setTotal(newTotal);
      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        fetchSessions(targetPage, pageSize);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (sessions.length === 0 && page === 1) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Pagination controls - top */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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

      <SessionList
        sessions={sessions}
        deletingId={deletingId}
        onSessionClick={handleSessionClick}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onResume={handleResume}
        onRename={handleRename}
        onCopy={handleCopy}
      />

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

      <SessionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
      />
    </>
  );
}
