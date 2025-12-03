import Link from "next/link";

import { BodyWeightEntryForm } from "@/app/components/dashboard/body-weight-entry-form";
import { BodyWeightEntriesList } from "@/app/components/dashboard/body-weight-entries-list";
import { getBodyWeightEntries } from "@/app/actions/bodyweightEntryAction";
import { BodyweightChart } from "@/app/components/dashboard/bodyweight-chart";
import { stackServerApp } from "@/stack/server";

export default async function BodyWeightPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const entries = await getBodyWeightEntries();
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
            <span className="text-white">Bodyweight</span>
          </div>
          <div className="mt-3 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Bodyweight Hub</h1>
            <p className="text-sm text-slate-400">
              Capture daily weigh-ins, observe fluctuations, and keep your trendline current.
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Signed in as <span className="text-white">{signedInLabel}</span>
            </p>
          </div>
        </header>
        <section>
          <BodyWeightEntryForm />
        </section>
        <section className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trendline</p>
            <h2 className="text-lg font-semibold text-white">Bodyweight over time</h2>
          </div>
          <BodyweightChart entries={entries} />
        </section>
        <section>
          <BodyWeightEntriesList entries={entries} />
        </section>
      </main>
    </div>
  );
}
