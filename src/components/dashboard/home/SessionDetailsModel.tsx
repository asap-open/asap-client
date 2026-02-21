import Modal from "../../ui/Modal";
import type { WorkoutSession } from "../../../services/sessionService";
import { Clock, Dumbbell, Calendar, Layers, Tag } from "lucide-react";

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

export default function SessionDetailsModal({
  isOpen,
  onClose,
  session,
}: SessionDetailsModalProps) {
  if (!session) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const mins = Math.round(duration);
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={session.sessionName}
      minHeight={100}
      maxHeight={700}
      initialHeight={500}
    >
      <div className="p-6 pb-35">
        {/* Labels Section */}
        {session.labels && session.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {session.labels.map((label, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold"
              >
                <Tag size={12} />
                {label === "FullBody" ? "Full Body" : label}
              </span>
            ))}
          </div>
        )}

        {/* Header Stats */}
        <div className="bg-surface-hover rounded-xl p-4 mb-6 border border-border">
          <div className="text-text-muted text-sm flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" />
            {formatDate(session.startTime)}
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-text-muted text-xs mb-1 uppercase font-semibold">
                <Clock className="w-3 h-3" /> Duration
              </div>
              <div className="font-bold text-text-main">
                {formatDuration(session.stats.duration)}
              </div>
            </div>
            <div className="text-center border-l border-border">
              <div className="flex items-center justify-center gap-1 text-text-muted text-xs mb-1 uppercase font-semibold">
                <Layers className="w-3 h-3" /> Volume
              </div>
              <div className="font-bold text-text-main">
                {session.stats.totalVolume}kg
              </div>
            </div>
            <div className="text-center border-l border-border">
              <div className="flex items-center justify-center gap-1 text-text-muted text-xs mb-1 uppercase font-semibold">
                <Dumbbell className="w-3 h-3" /> Exercises
              </div>
              <div className="font-bold text-text-main">
                {session.stats.exerciseCount}
              </div>
            </div>
          </div>
        </div>
        {/* Exercises List */}
        <div className="space-y-6">
          {session.exercises.map((item, index) => (
            <div
              key={index}
              className="border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <h3 className="font-bold text-text-main mb-3 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                {item.exercise.name}
              </h3>
              <div className="bg-surface-hover rounded-lg overflow-hidden border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-hover text-text-muted text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3 text-left w-12">Set</th>
                      <th className="py-2 px-3 text-center">kg</th>
                      <th className="py-2 px-3 text-center">Reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.sets.map((set, setIndex) => (
                      <tr
                        key={setIndex}
                        className="border-t border-border last:border-0"
                      >
                        <td className="py-2 px-3 text-text-muted font-medium">
                          {setIndex + 1}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-text-main">
                          {set.weight}
                        </td>
                        <td className="py-2 px-3 text-center font-medium text-text-main">
                          {set.reps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
