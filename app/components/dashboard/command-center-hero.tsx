type CommandCenterHeroProps = {
  user: {
    displayName: string | null;
    primaryEmail: string | null;
  };
};

export function CommandCenterHero({ user }: CommandCenterHeroProps) {
  const signedInLabel = user.displayName ?? user.primaryEmail ?? "Athlete";

  return (
    <header className="glass-panel border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-900/10 to-slate-900/70 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Powerlifting Progress Tracker
          </p>
          <form action="/handler/sign-out" method="post" className="shrink-0">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-white/40 hover:text-white sm:w-auto"
            >
              Sign Out
            </button>
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Command Center</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Signed in as <span className="text-white">{signedInLabel}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
