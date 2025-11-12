"use client";

import { FormEvent, useState, useTransition } from "react";

import { addBodyWeightEntry } from "@/app/actions/bodyweightEntryAction";

export function BodyWeightEntryForm() {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await addBodyWeightEntry(weight, new Date(date));
        setSuccess("Entry saved.");
        setWeight("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel flex flex-col gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 text-sm text-white"
    >
      <div>
        <label htmlFor="weight" className="block text-xs uppercase tracking-[0.2em] text-slate-400">
          Weight (kg)
        </label>
        <input
          id="weight"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white placeholder:text-slate-500 focus:border-secondary focus:outline-none"
          placeholder="82.5"
          required
        />
      </div>

      <div>
        <label htmlFor="loggedOn" className="block text-xs uppercase tracking-[0.2em] text-slate-400">
          Date
        </label>
        <input
          id="loggedOn"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white focus:border-secondary focus:outline-none"
          required
        />
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}
      {success && <p className="text-xs text-emerald-300">{success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-secondary/30 bg-secondary/10 px-6 py-2 font-semibold uppercase tracking-wide text-secondary transition hover:border-secondary/60 hover:bg-secondary/20 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Log Weight"}
      </button>
    </form>
  );
}
