type CommandCenterHeroProps = {
  user: {
    displayName: string | null;
    primaryEmail: string | null;
  };
};

export function CommandCenterHero({ user }: CommandCenterHeroProps) {
  const signedInLabel = user.displayName ?? user.primaryEmail ?? "Athlete";

  return (
    <header className="glass-panel border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-900/10 to-slate-900/70 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        Powerlifting Progress Tracker
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Command Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Start a workout, log distinct sets, track history, and keep your bodyweight trend in view.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            Signed in as <span className="text-white">{signedInLabel}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white sm:flex-row sm:items-center">
          <button className="rounded-full border border-secondary/30 bg-secondary/10 px-6 py-3 font-semibold transition hover:border-secondary/60 hover:bg-secondary/20">
            Start New Workout
          </button>
          <form action="/handler/sign-out" method="post">
            <button
              type="submit"
              className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white sm:w-auto"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
