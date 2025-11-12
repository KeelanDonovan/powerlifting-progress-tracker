import { BodyWeightEntry } from "@/app/types/bodyWeightEntriesType";

const MAX_VISIBLE_ENTRIES = 30;

type BodyWeightEntriesListProps = {
  entries: BodyWeightEntry[];
};

const formatWeight = (value: string) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed.toFixed(2);
  }
  return value;
};

export function BodyWeightEntriesList({ entries }: BodyWeightEntriesListProps) {
  if (!entries.length) {
    return (
      <div className="glass-panel flex h-full flex-col justify-center rounded-xl border border-white/5 bg-slate-900/40 p-6 text-center text-slate-300">
        <p className="text-lg font-semibold text-white">No entries yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Start logging your weight to build a trendline and highlight progress over time.
        </p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.logged_on).getTime() - new Date(a.logged_on).getTime()
  );
  const recentEntries = sortedEntries.slice(0, MAX_VISIBLE_ENTRIES);

  return (
    <div className="glass-panel rounded-xl border border-white/5 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent entries</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Latest {Math.min(entries.length, MAX_VISIBLE_ENTRIES)} logs
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{entries.length} total</span>
      </div>
      <div className="mt-4 divide-y divide-white/5">
        {recentEntries.map((entry) => (
          <article key={entry.id} className="flex flex-col gap-1 py-3 text-sm text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-semibold tracking-tight">{formatWeight(entry.weight_kg)} kg</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Logged on {entry.logged_on}
            </p>
          </div>
        </article>
      ))}
    </div>
  </div>
);
}
