import { Dumbbell } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <Dumbbell className="mx-auto text-text-muted/30 mb-4" size={48} />
      <p className="text-text-muted text-sm">No workouts yet</p>
      <p className="text-text-muted text-xs mt-1">
        Start your first session to see it here
      </p>
    </div>
  );
}
