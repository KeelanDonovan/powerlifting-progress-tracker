"use client";

import { FormEvent, useState, useTransition } from "react";

import { addWorkoutEntry } from "@/app/actions/workoutEntryAction";

type SetDraft = {
  exercise: string;
  loadKg: string;
  reps: string;
  rpe: string;
  notes: string;
};

const createEmptySet = (): SetDraft => ({
  exercise: "",
  loadKg: "",
  reps: "",
  rpe: "",
  notes: "",
});

const getToday = () => new Date().toLocaleDateString("en-CA").slice(0, 10);

export function WorkoutEntryForm() {
  const [title, setTitle] = useState("");
  const [performedOn, setPerformedOn] = useState<string>(() => getToday());
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetDraft[]>([createEmptySet()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addSetRow = () => setSets((current) => [...current, createEmptySet()]);

  const removeSetRow = (indexToRemove: number) => {
    setSets((current) =>
      current.length === 1 ? current : current.filter((_, index) => index !== indexToRemove)
    );
  };

  const updateSetField = <K extends keyof SetDraft>(indexToUpdate: number, key: K, value: string) =>
    setSets((current) =>
      current.map((set, index) => (index === indexToUpdate ? { ...set, [key]: value } : set))
    );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedSets = sets.map((set) => ({
      exercise: set.exercise.trim(),
      loadKg: set.loadKg.trim(),
      reps: set.reps.trim(),
      rpe: set.rpe.trim(),
      notes: set.notes.trim(),
    }));

    if (!title.trim()) {
      setError("Add a workout title to continue.");
      return;
    }

    if (trimmedSets.some((set) => !set.exercise || !set.loadKg || !set.reps || !set.rpe)) {
      setError("Fill in exercise, load, reps, and RPE for each set.");
      return;
    }

    startTransition(async () => {
      try {
        await addWorkoutEntry(
          title,
          performedOn,
          trimmedSets.map((set) => ({
            exercise: set.exercise,
            loadKg: set.loadKg,
            reps: Number(set.reps),
            rpe: Number(set.rpe),
            notes: set.notes,
          })),
          notes
        );
        setSuccess("Workout saved.");
        setTitle("");
        setNotes("");
        setPerformedOn(getToday());
        setSets([createEmptySet()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel flex flex-col gap-6 rounded-xl border border-white/5 bg-slate-900/40 p-4 text-sm text-white"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Session Builder</p>
        <h2 className="text-xl font-semibold text-white">Log a training session with your sets</h2>
        <p className="text-xs text-slate-400">
          Give the session a title, choose the date, and list each set you performed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="workout-title"
            className="block text-xs uppercase tracking-[0.2em] text-slate-400"
          >
            Title
          </label>
          <input
            id="workout-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
            placeholder="Heavy squat session"
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label
            htmlFor="performed-on"
            className="block text-xs uppercase tracking-[0.2em] text-slate-400"
          >
            Date
          </label>
          <input
            id="performed-on"
            type="date"
            value={performedOn}
            onChange={(event) => setPerformedOn(event.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white focus:border-secondary focus:outline-none"
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="workout-notes"
          className="block text-xs uppercase tracking-[0.2em] text-slate-400"
        >
          Session notes (optional)
        </label>
        <textarea
          id="workout-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
          placeholder="Warm-ups felt fast. Focused on bracing cues."
          rows={3}
          disabled={isPending}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sets</p>
            <p className="text-xs text-slate-400">
              Add each set with the load, reps, and RPE you completed.
            </p>
          </div>
          <button
            type="button"
            onClick={addSetRow}
            className="rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20 disabled:opacity-50"
            disabled={isPending}
          >
            Add set
          </button>
        </div>

        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={`set-${index}`}
              className="rounded-lg border border-white/10 bg-white/5 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Set {index + 1}
                </p>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSetRow(index)}
                    className="text-xs font-semibold uppercase tracking-wide text-slate-300 underline-offset-2 transition hover:text-red-200 hover:underline disabled:opacity-50"
                    disabled={isPending}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr,repeat(3,minmax(100px,1fr))]">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`exercise-${index}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    Exercise
                  </label>
                  <input
                    id={`exercise-${index}`}
                    type="text"
                    value={set.exercise}
                    onChange={(event) => updateSetField(index, "exercise", event.target.value)}
                    className="rounded-md border border-white/10 bg-slate-900/60 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
                    placeholder="Squat"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`load-${index}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    Load (kg)
                  </label>
                  <input
                    id={`load-${index}`}
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    min="0"
                    value={set.loadKg}
                    onChange={(event) => updateSetField(index, "loadKg", event.target.value)}
                    className="rounded-md border border-white/10 bg-slate-900/60 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
                    placeholder="180"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`reps-${index}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    Reps
                  </label>
                  <input
                    id={`reps-${index}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={set.reps}
                    onChange={(event) => updateSetField(index, "reps", event.target.value)}
                    className="rounded-md border border-white/10 bg-slate-900/60 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
                    placeholder="3"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`rpe-${index}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    RPE
                  </label>
                  <input
                    id={`rpe-${index}`}
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    max="10"
                    value={set.rpe}
                    onChange={(event) => updateSetField(index, "rpe", event.target.value)}
                    className="rounded-md border border-white/10 bg-slate-900/60 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
                    placeholder="8.5"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1">
                  <label
                    htmlFor={`notes-${index}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id={`notes-${index}`}
                    value={set.notes}
                    onChange={(event) => updateSetField(index, "notes", event.target.value)}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 p-2 text-sm text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
                    placeholder="Beltless, paused the last rep."
                    rows={2}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}
      {success && <p className="text-xs text-emerald-300">{success}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full border border-secondary/30 bg-secondary/10 px-6 py-2 font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Saving..." : "Save Workout"}
        </button>
      </div>
    </form>
  );
}
