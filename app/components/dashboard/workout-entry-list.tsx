"use client";

import { WorkoutEntry } from "@/app/types/workoutEntriesType";

const MAX_VISIBLE_WORKOUTS = 10;

type WorkoutEntryListProps = {
  workouts: WorkoutEntry[];
};

const formatLoad = (value: string) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed.toFixed(2);
  return value;
};

const formatRpe = (value: string) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed.toFixed(1);
  return value;
};

const calcVolume = (sets: WorkoutEntry["sets"]) =>
  sets.reduce((total, set) => {
    const load = Number(set.load_kg);
    if (!Number.isFinite(load)) return total;
    return total + load * set.reps;
  }, 0);

const formatVolume = (volume: number) => {
  if (!Number.isFinite(volume) || volume <= 0) return null;
  return `${volume.toFixed(1)} kg total`;
};

export function WorkoutEntryList({ workouts }: WorkoutEntryListProps) {
  if (!workouts.length) {
    return (
      <div className="glass-panel flex h-full flex-col justify-center rounded-xl border border-white/5 bg-slate-900/40 p-6 text-center text-slate-300">
        <p className="text-lg font-semibold text-white">No sessions yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Log your first session to start tracking sets, loads, and effort.
        </p>
      </div>
    );
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.performed_on).getTime() - new Date(a.performed_on).getTime()
  );
  const recentWorkouts = sortedWorkouts.slice(0, MAX_VISIBLE_WORKOUTS);

  return (
    <div className="glass-panel rounded-xl border border-white/5 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent sessions</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Latest {Math.min(workouts.length, MAX_VISIBLE_WORKOUTS)} logged sessions
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="rounded-full border border-white/10 px-3 py-1">{workouts.length} total</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {recentWorkouts.map((workout) => {
          const orderedSets = [...workout.sets].sort((a, b) => a.id - b.id);
          const volume = formatVolume(calcVolume(orderedSets));
          return (
            <article
              key={workout.id}
              className="rounded-lg border border-white/10 bg-slate-900/60 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold tracking-tight text-white">{workout.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span>Performed on {workout.performed_on}</span>
                    <span className="text-slate-700">•</span>
                    <span>{orderedSets.length} sets</span>
                    {volume && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span>{volume}</span>
                      </>
                    )}
                  </div>
                    {workout.notes && (
                    <p className="text-sm text-slate-300">
                      {workout.notes}
                    </p>
                  )}
                </div>
              </div>

              {orderedSets.length ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {orderedSets.map((set, index) => (
                    <div
                      key={set.id ?? `${workout.id}-set-${index}`}
                      className="rounded-lg border border-white/10 bg-slate-900/80 p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">
                            S{index + 1}
                          </span>
                          <p className="font-semibold text-white">{set.exercise}</p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-300">
                          {formatLoad(set.load_kg)} kg
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {set.reps} reps
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          RPE {formatRpe(set.rpe)}
                        </span>
                        {set.notes && (
                          <span className="rounded-full border border-white/10 px-3 py-1">
                            Notes
                          </span>
                        )}
                      </div>
                      {set.notes && (
                        <p className="mt-2 text-sm text-slate-300">{set.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">No sets logged for this workout.</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
