"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getExerciseE1RMSeries } from "@/app/actions/workoutEntryAction";
import { E1RMPoint } from "@/app/types/workoutEntriesType";

const DEFAULT_EXERCISES = ["Competition Squat", "Competition Bench", "Competition Deadlift"];
const ALLOWED_KEYWORDS = ["squat", "bench", "deadlift"];
const PRIMARY_COLOR = "#38bdf8";

type SeriesMap = Record<string, E1RMPoint[]>;

type E1RMChartProps = {
  exercises: string[];
  initialSeries?: SeriesMap;
  height?: number;
};

const tooltipStyles =
  "rounded-md border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg";

const formatMonthLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export function E1RMChart({ exercises, initialSeries = {}, height = 320 }: E1RMChartProps) {
  const normalizedExercises = useMemo(
    () => exercises.map((e) => e.trim()).filter(Boolean),
    [exercises]
  );

  const eligibleExercises = useMemo(
    () =>
      normalizedExercises.filter((exercise) =>
        ALLOWED_KEYWORDS.some((keyword) => exercise.toLowerCase().includes(keyword))
      ),
    [normalizedExercises]
  );

  const preferredDefault = useMemo(() => {
    const preferred = eligibleExercises.find((ex) =>
      DEFAULT_EXERCISES.some((d) => d.toLowerCase() === ex.toLowerCase())
    );
    return preferred ?? eligibleExercises[0] ?? null;
  }, [eligibleExercises]);

  const [selected, setSelected] = useState<string | null>(preferredDefault);
  const [seriesMap, setSeriesMap] = useState<SeriesMap>(initialSeries);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!eligibleExercises.length) {
      if (selected !== null) setSelected(null);
      return;
    }
    if (selected && eligibleExercises.includes(selected)) return;
    const next =
      preferredDefault && eligibleExercises.includes(preferredDefault)
        ? preferredDefault
        : eligibleExercises[0];
    if (next !== selected) setSelected(next);
  }, [eligibleExercises, preferredDefault, selected]);

  useEffect(() => {
    if (!selected || seriesMap[selected]) return;
    startTransition(async () => {
      const data = await getExerciseE1RMSeries(selected);
      setSeriesMap((current) => (current[selected] ? current : { ...current, [selected]: data }));
    });
  }, [selected, seriesMap]);

  const selectedSeries = selected ? seriesMap[selected] : undefined;

  const { combinedData, monthTicks } = useMemo(() => {
    if (!selectedSeries?.length) {
      return { combinedData: [], monthTicks: [] as string[] };
    }

    const data = selectedSeries.map((point) => ({
      date: point.date,
      value: Number(point.e1rm.toFixed(1)),
    }));

    const ticks: string[] = [];
    let lastMonth = "";
    for (const point of data) {
      const monthKey = point.date.slice(0, 7);
      if (monthKey !== lastMonth) {
        ticks.push(point.date);
        lastMonth = monthKey;
      }
    }

    return { combinedData: data, monthTicks: ticks };
  }, [selectedSeries]);

  const hasData = combinedData.length > 0;

  if (!eligibleExercises.length) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-slate-900/40 p-4 text-sm text-slate-400">
        Log Squat, Bench, or Deadlift sessions to see estimated 1RM trends.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="uppercase tracking-[0.3em] text-slate-500">Exercise</span>
          <select
            value={selected ?? ""}
            onChange={(event) => setSelected(event.target.value || null)}
            className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 font-semibold uppercase tracking-wide text-slate-200 transition focus:border-secondary focus:outline-none disabled:opacity-50"
            disabled={isPending || !eligibleExercises.length}
          >
            {!selected && <option value="">Select exercise</option>}
            {eligibleExercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
          <span className="text-slate-500">
            {selected ? `Showing ${selected}` : "No matching exercises selected"}
          </span>
        </div>
        <span className="text-slate-500">One exercise at a time</span>
      </div>

      {!hasData ? (
        <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-400">
          {isPending
            ? "Loading..."
            : selected
              ? "No data for the selected exercise yet."
              : "Choose an exercise to view trends."}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={combinedData} margin={{ top: 10, right: 10, bottom: 24, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              ticks={monthTicks}
              tickFormatter={formatMonthLabel}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#94a3b8"
              minTickGap={16}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -20,
                fill: "#cbd5e1",
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              tickMargin={8}
              width={70}
              label={{
                value: "e1RM (kg)",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#cbd5e1",
              }}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.25)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length || !selected) return null;
                const first = payload[0].payload as Record<string, unknown>;
                const value = first.value;
                if (typeof value !== "number") return null;
                return (
                  <div className={tooltipStyles}>
                    <div className="text-slate-300">{first.date as string}</div>
                    <div className="flex items-center gap-2">
                      <span>{selected}:</span>
                      <span className="font-semibold">{value.toFixed(1)} kg</span>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={selected ?? "Exercise"}
              stroke={PRIMARY_COLOR}
              fill={PRIMARY_COLOR + "33"}
              strokeWidth={2}
              dot={{ r: 3, stroke: PRIMARY_COLOR, strokeWidth: 1 }}
              activeDot={{ r: 5, stroke: PRIMARY_COLOR, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
