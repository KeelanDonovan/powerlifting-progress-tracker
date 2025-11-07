
import { stackServerApp } from "@/stack/server";
import { CommandCenterHero } from "@/app/components/dashboard/command-center-hero";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  return (
    <div className="min-h-screen bg-transparent">
      <main className="page-shell space-y-6">
        <CommandCenterHero user={user} />
      </main>
    </div>
  );
}
