
import Link from "next/link";

import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";
import { QuickLogPanels } from "@/app/components/dashboard/quick-log-panels";
import { BodyweightChart } from "@/app/components/dashboard/bodyweight-chart";
import { getBodyWeightEntries } from "@/app/actions/bodyweightEntryAction";
import {
  getWorkoutExercises,
  getExerciseE1RMSeries,
} from "@/app/actions/workoutEntryAction";
import { E1RMChart } from "@/app/components/dashboard/e1rm-chart";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const bodyweightEntries = await getBodyWeightEntries();
  const exercises = await getWorkoutExercises();
  const initialSeries: Record<string, { date: string; e1rm: number }[]> = {};
  for (const ex of exercises.slice(0, 3)) {
    initialSeries[ex] = await getExerciseE1RMSeries(ex);
  }
  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <CommandCenterHero user={user} />
        <QuickLogPanels />
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bodyweight trend</p>
              <h2 className="text-lg font-semibold text-white">Bodyweight over time</h2>
            </div>
            <Link
              href="/bodyweight"
              className="text-xs font-semibold uppercase tracking-wide text-secondary transition hover:text-white"
            >
              Open bodyweight hub
            </Link>
          </div>
          <BodyweightChart entries={bodyweightEntries} />
        </section>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Strength trend</p>
              <h2 className="text-lg font-semibold text-white">Estimated 1RM over time</h2>
            </div>
            <Link
              href="/workouts"
              className="text-xs font-semibold uppercase tracking-wide text-secondary transition hover:text-white"
            >
              Open training log
            </Link>
          </div>
          <E1RMChart exercises={exercises} initialSeries={initialSeries} />
        </section>
      </main>
    </div>
  );
}
