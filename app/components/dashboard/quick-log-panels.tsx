"use client";

import Link from "next/link";
import { useState } from "react";

import { WorkoutEntryForm } from "@/app/components/dashboard/workout-entry-form";
import { BodyWeightEntryForm } from "@/app/components/dashboard/body-weight-entry-form";

const ToggleButton = ({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20"
  >
    {isOpen ? "Hide" : "Log"} {label}
  </button>
);

export function QuickLogPanels() {
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showBodyweightForm, setShowBodyweightForm] = useState(false);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-900/40 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Training Log</p>
            <p className="text-sm text-slate-400">Build a session with exercises, loads, reps, and RPE.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/workouts"
              className="text-xs font-semibold uppercase tracking-wide text-secondary transition hover:text-white"
            >
              Open training log
            </Link>
            <ToggleButton
              label="Session"
              isOpen={showWorkoutForm}
              onToggle={() => setShowWorkoutForm((open) => !open)}
            />
          </div>
        </div>
        {showWorkoutForm && <WorkoutEntryForm />}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-900/40 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bodyweight Tracking</p>
            <p className="text-sm text-slate-400">Capture today&apos;s weigh-in quickly.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bodyweight"
              className="text-xs font-semibold uppercase tracking-wide text-secondary transition hover:text-white"
            >
              Open Bodyweight hub
            </Link>
            <ToggleButton
              label="Bodyweight"
              isOpen={showBodyweightForm}
              onToggle={() => setShowBodyweightForm((open) => !open)}
            />
          </div>
        </div>
        {showBodyweightForm && <BodyWeightEntryForm />}
      </div>
    </section>
  );
}
