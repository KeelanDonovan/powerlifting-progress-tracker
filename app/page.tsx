
import Link from "next/link";

import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";
import { QuickLogPanels } from "@/app/components/dashboard/quick-log-panels";
import { BodyweightChart } from "@/app/components/dashboard/bodyweight-chart";
import { getBodyWeightEntries } from "@/app/actions/bodyweightEntryAction";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const bodyweightEntries = await getBodyWeightEntries();
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
      </main>
    </div>
  );
}
