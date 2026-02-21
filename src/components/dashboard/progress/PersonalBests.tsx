import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchPersonalBests } from "../../../utils/progress";
import type { PersonalBest } from "../../../utils/progress";

interface TrackedExercise {
  id: string;
  name: string;
}

export default function PersonalBests() {
  const { token } = useAuth();
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>(
    () => {
      const stored = localStorage.getItem("tracked_exercises");
      return stored ? JSON.parse(stored) : [];
    },
  );
  const [pbs, setPbs] = useState<Record<string, PersonalBest>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("tracked_exercises", JSON.stringify(trackedExercises));
  }, [trackedExercises]);

  useEffect(() => {
    const loadPBs = async () => {
      if (trackedExercises.length === 0) {
        setPbs({});
        return;
      }

      setLoading(true);
      try {
        const ids = trackedExercises.map((e) => e.id);
        const data = await fetchPersonalBests(token, ids);
        // Map by ID for easy lookup
        const map: Record<string, PersonalBest> = {};
        data.forEach((pb) => {
          map[pb.exerciseId] = pb;
        });
        setPbs(map);
      } catch (error) {
        console.error("Failed to load PBs", error);
      } finally {
        setLoading(false);
      }
    };

    loadPBs();
  }, [trackedExercises, token]);

  return (
    <section className="bg-surface rounded-xl p-5 shadow-sm border border-border h-full flex flex-col">
      <div className="flex items-center mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
          Personal Bests
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {trackedExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <p className="text-sm font-medium">No exercises tracked</p>
            <p className="text-xs mt-1">Go to Settings to add exercises</p>
          </div>
        ) : (
          trackedExercises.map((te) => {
            const pb = pbs[te.id];
            return (
              <div
                key={te.id}
                className="flex justify-between items-center py-3 px-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-semibold text-text-main text-sm truncate">
                    {te.name}
                  </p>
                  {pb ? (
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(pb.date).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted italic mt-0.5">
                      No data yet
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold text-lg ${
                      pb ? "text-primary" : "text-text-muted/30"
                    }`}
                  >
                    {pb ? pb.weight : "--"}
                  </span>
                  <span className="text-xs text-text-muted ml-1">kg</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
