
import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";
import { BodyWeightEntryForm } from "@/app/components/dashboard/body-weight-entry-form";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <CommandCenterHero user={user} />
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Bodyweight Log</h2>
            <p className="text-sm text-slate-400">Record your daily weight to keep the trendline updated.</p>
          </div>
          <BodyWeightEntryForm />
        </section>
      </main>
    </div>
  );
}
