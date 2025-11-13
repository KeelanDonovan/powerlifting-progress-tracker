"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";

import { editBodyWeightEntry } from "@/app/actions/bodyweightEntryAction";
import { BodyWeightEntry } from "@/app/types/bodyWeightEntriesType";

const MAX_VISIBLE_ENTRIES = 30;

type BodyWeightEntriesListProps = {
  entries: BodyWeightEntry[];
};

type AlertState = {
  type: "error" | "success";
  text: string;
};

const formatWeight = (value: string) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed.toFixed(2);
  }
  return value;
};

export function BodyWeightEntriesList({ entries }: BodyWeightEntriesListProps) {
  const [entryList, setEntryList] = useState(entries);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState({ weight: "", date: "" });
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEntryList(entries);
  }, [entries]);

  if (!entryList.length) {
    return (
      <div className="glass-panel flex h-full flex-col justify-center rounded-xl border border-white/5 bg-slate-900/40 p-6 text-center text-slate-300">
        <p className="text-lg font-semibold text-white">No entries yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Start logging your weight to build a trendline and highlight progress over time.
        </p>
      </div>
    );
  }

  const sortedEntries = [...entryList].sort(
    (a, b) => new Date(b.logged_on).getTime() - new Date(a.logged_on).getTime()
  );
  const recentEntries = sortedEntries.slice(0, MAX_VISIBLE_ENTRIES);

  const startEditing = (entry: BodyWeightEntry) => {
    setEditingEntryId(entry.id);
    setFormValues({
      weight: entry.weight_kg,
      date: entry.logged_on,
    });
    setAlert(null);
  };

  const cancelEditing = () => {
    setEditingEntryId(null);
    setFormValues({ weight: "", date: "" });
    setAlert(null);
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEntryId) return;

    const weightValue = formValues.weight.trim();
    const dateValue = formValues.date.trim();

    if (!weightValue || !dateValue) {
      setAlert({ type: "error", text: "Enter both weight and date to update the entry." });
      return;
    }

    setAlert(null);
    startTransition(async () => {
      try {
        await editBodyWeightEntry(editingEntryId, weightValue, dateValue);
        setEntryList((prev) =>
          prev.map((entry) =>
            entry.id === editingEntryId ? { ...entry, weight_kg: weightValue, logged_on: dateValue } : entry
          )
        );
        setAlert({ type: "success", text: "Entry updated." });
        setEditingEntryId(null);
        setFormValues({ weight: "", date: "" });
      } catch (error) {
        setAlert({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to update entry.",
        });
      }
    });
  };

  return (
    <div className="glass-panel rounded-xl border border-white/5 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent entries</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Latest {Math.min(entryList.length, MAX_VISIBLE_ENTRIES)} logs
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{entryList.length} total</span>
      </div>
      {alert && (
        <div
          className={`mt-4 rounded-md border px-3 py-2 text-xs ${
            alert.type === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-200"
              : "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
          }`}
        >
          {alert.text}
        </div>
      )}
      <div className="mt-4 divide-y divide-white/5">
        {recentEntries.map((entry) => {
          const isEditing = editingEntryId === entry.id;
          return (
            <article key={entry.id} className="py-3 text-sm text-white">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold tracking-tight">
                    {formatWeight(entry.weight_kg)} kg
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Logged on {entry.logged_on}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEditing(entry)}
                    className="self-start rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-secondary/60 hover:text-secondary"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditing && (
                <form onSubmit={handleUpdate} className="mt-3 grid gap-3 text-xs text-slate-200 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`weight-${entry.id}`} className="uppercase tracking-[0.3em] text-slate-500">
                      Weight (kg)
                    </label>
                    <input
                      id={`weight-${entry.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={formValues.weight}
                      onChange={(event) => setFormValues((current) => ({ ...current, weight: event.target.value }))}
                      className="rounded-md border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-secondary focus:outline-none"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`logged-on-${entry.id}`} className="uppercase tracking-[0.3em] text-slate-500">
                      Date
                    </label>
                    <input
                      id={`logged-on-${entry.id}`}
                      type="date"
                      value={formValues.date}
                      onChange={(event) => setFormValues((current) => ({ ...current, date: event.target.value }))}
                      className="rounded-md border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-secondary focus:outline-none"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 rounded-full border border-white/10 px-4 py-2 font-semibold uppercase tracking-wide text-slate-200 transition hover:border-white/30 hover:text-white"
                      disabled={isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2 font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20 disabled:opacity-50"
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
