
import Link from "next/link";

import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";
import { QuickLogPanels } from "@/app/components/dashboard/quick-log-panels";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <CommandCenterHero user={user} />
        <QuickLogPanels />
      </main>
    </div>
  );
}
