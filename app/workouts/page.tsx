import Link from "next/link";

import { getWorkoutEntries } from "@/app/actions/workoutEntryAction";
import { WorkoutEntryForm } from "@/app/components/dashboard/workout-entry-form";
import { WorkoutEntryList } from "@/app/components/dashboard/workout-entry-list";
import { stackServerApp } from "@/stack/server";

export default async function WorkoutsPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const workouts = await getWorkoutEntries();
  const signedInLabel = user.displayName ?? user.primaryEmail ?? "Athlete";

  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <header className="glass-panel border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/20 to-slate-900/60 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            <Link href="/" className="text-slate-300 transition hover:text-white">
              Dashboard
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-white">Training Log</span>
          </div>
          <div className="mt-3 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Training Sessions</h1>
            <p className="text-sm text-slate-400">Build structured sessions and capture every set.</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Signed in as <span className="text-white">{signedInLabel}</span>
            </p>
          </div>
        </header>

        <section>
          <WorkoutEntryForm />
        </section>

        <section>
          <WorkoutEntryList workouts={workouts} />
        </section>
      </main>
    </div>
  );
}
