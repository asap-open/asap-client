import type { WorkoutSession } from "../../../services/sessionService";
import SessionCard from "./SessionCard";

interface SessionListProps {
  sessions: WorkoutSession[];
  deletingId: number | null;
  onSessionClick: (session: WorkoutSession) => void;
  onDelete: (sessionId: number) => void;
  onEdit: (session: WorkoutSession) => void;
  onResume: (session: WorkoutSession) => void;
  onRename: (sessionId: number, newName: string) => Promise<void>;
}

export default function SessionList({
  sessions,
  deletingId,
  onSessionClick,
  onDelete,
  onEdit,
  onResume,
  onRename,
}: SessionListProps) {
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onSessionClick={onSessionClick}
          onDelete={onDelete}
          onEdit={onEdit}
          onResume={onResume}
          onRename={onRename}
          isDeleting={deletingId === session.id}
        />
      ))}
    </div>
  );
}
