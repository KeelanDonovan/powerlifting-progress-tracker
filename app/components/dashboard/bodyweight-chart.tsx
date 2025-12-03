"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BodyWeightEntry } from "@/app/types/bodyWeightEntriesType";

type BodyweightChartProps = {
  entries: BodyWeightEntry[];
  height?: number;
};

type ChartPoint = {
  date: string;
  weight: number;
};

const tooltipStyles =
  "rounded-md border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg";

const formatMonthLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export function BodyweightChart({ entries, height = 320 }: BodyweightChartProps) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const threeMonthsAgoIso = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  }, []);

  const [minDate, setMinDate] = useState<string>(threeMonthsAgoIso);
  const [maxDate, setMaxDate] = useState<string>(todayIso);
  const [minWeight, setMinWeight] = useState<string>("");
  const [maxWeight, setMaxWeight] = useState<string>("");

  const parseNumber = (value: string) => {
    if (!value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const { data, yDomain, monthTicks, hasData, autoLower, autoUpper } = useMemo(() => {
    const minDateObj = minDate ? new Date(minDate) : null;
    const maxDateObj = maxDate ? new Date(maxDate) : null;
    const customMinWeight = parseNumber(minWeight);
    const customMaxWeight = parseNumber(maxWeight);

    const points: ChartPoint[] = [...entries]
      .sort((a, b) => new Date(a.logged_on).getTime() - new Date(b.logged_on).getTime())
      .map((entry) => {
        const weight = Number(entry.weight_kg);
        return {
          date: entry.logged_on,
          weight: Number.isFinite(weight) ? weight : 0,
        };
      });

    const filtered = points.filter((point) => {
      const d = new Date(point.date);
      if (minDateObj && d < minDateObj) return false;
      if (maxDateObj && d > maxDateObj) return false;
      return true;
    });

    const monthTicks: string[] = [];
    let lastMonth = "";
    for (const point of filtered) {
      const monthKey = point.date.slice(0, 7);
      if (monthKey !== lastMonth) {
        monthTicks.push(point.date);
        lastMonth = monthKey;
      }
    }

    if (!filtered.length) {
      return {
        data: filtered,
        yDomain: [0, 1] as [number, number],
        monthTicks,
        hasData: false,
      };
    }

    const weights = filtered.map((p) => p.weight).filter((w) => Number.isFinite(w));
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const spread = Math.max(0, max - min);
    const targetSpread = Math.max(30, spread);
    const padding = Math.max(0.5, targetSpread * 0.05);
    const autoLower = Math.max(0, min - padding);
    let autoUpper = max + padding;
    if (autoUpper - autoLower < targetSpread) {
      autoUpper = autoLower + targetSpread;
    }

    let lower = customMinWeight ?? autoLower;
    let upper = customMaxWeight ?? autoUpper;
    if (!(lower < upper)) {
      lower = autoLower;
      upper = autoUpper;
    }

    return {
      data: filtered,
      yDomain: [lower, upper] as [number, number],
      monthTicks,
      hasData: true,
      autoLower,
      autoUpper,
    };
  }, [entries, minDate, maxDate, minWeight, maxWeight]);

  if (!data.length || !hasData) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-slate-900/40 p-4 text-sm text-slate-400">
        No bodyweight entries in this range yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
      <div className="mb-3 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="uppercase tracking-[0.3em] text-slate-500">Y Range (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder={minWeight}
            value={minWeight}
            onChange={(event) => setMinWeight(event.target.value)}
            className="w-24 rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs text-white focus:border-secondary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder={maxWeight}
            value={maxWeight}
            onChange={(event) => setMaxWeight(event.target.value)}
            className="w-24 rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs text-white focus:border-secondary focus:outline-none"
          />
          <span className="text-slate-500">
            auto: {autoLower.toFixed(1)} – {autoUpper.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="uppercase tracking-[0.3em] text-slate-500">Date Range</span>
          <input
            type="date"
            value={minDate}
            onChange={(event) => setMinDate(event.target.value)}
            className="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs text-white focus:border-secondary focus:outline-none"
          />
          <input
            type="date"
            value={maxDate}
            onChange={(event) => setMaxDate(event.target.value)}
            className="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs text-white focus:border-secondary focus:outline-none"
          />
          <span className="text-slate-500">defaults to last 3 months</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 10 }}>
          <defs>
            <linearGradient id="bwColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            ticks={monthTicks}
            tickFormatter={formatMonthLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="#94a3b8"
            interval={0}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: -10,
              fill: "#cbd5e1",
            }}
          />
          <YAxis
            dataKey="weight"
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
            tickMargin={8}
            width={65}
            domain={yDomain}
            label={{
              value: "Weight (kg)",
              angle: -90,
              position: "insideLeft",
              offset: -5,
              fill: "#cbd5e1",
            }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.25)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as ChartPoint;
              return (
                <div className={tooltipStyles}>
                  <div className="font-semibold">{point.weight.toFixed(2)} kg</div>
                  <div className="text-slate-300">{point.date}</div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#bwColor)"
            dot={{ r: 3, stroke: "#22d3ee", strokeWidth: 1 }}
            activeDot={{ r: 5, stroke: "#22d3ee", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
