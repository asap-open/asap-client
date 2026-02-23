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

  useEffect(() => {
    fetchSessions();
  }, [filter, token]);

  const fetchSessions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await sessionService.getSessions(token, filter, 10);
      setSessions(data);
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
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
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

  if (sessions.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <SessionList
        sessions={sessions}
        deletingId={deletingId}
        onSessionClick={handleSessionClick}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onResume={handleResume}
        onRename={handleRename}
      />

      <SessionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
      />
    </>
  );
}
