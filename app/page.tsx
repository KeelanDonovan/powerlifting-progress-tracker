
import Link from "next/link";

import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <CommandCenterHero user={user} />
        <section className="glass-panel flex flex-col gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bodyweight Tracking</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Log your weight on the Bodyweight Tracking Hub</h2>
          </div>
          <div>
            <Link
              href="/bodyweight"
              className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20"
            >
              Open bodyweight Hub
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
