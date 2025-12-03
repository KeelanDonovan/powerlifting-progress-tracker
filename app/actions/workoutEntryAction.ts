"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { workouts, workoutSets } from "@/lib/schema";
import { WorkoutEntry, E1RMPoint } from "@/app/types/workoutEntriesType";
import { stackServerApp } from "@/stack/server";

const DASHBOARD_PATH = "/";
const WORKOUTS_PATH = "/workouts";
const REVALIDATE_PATHS = [DASHBOARD_PATH, WORKOUTS_PATH];

const revalidateWorkoutViews = () => {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
};

const requireUserId = async () => {
  const user = await stackServerApp.getUser({ or: "throw" });
  if (!user.id) throw new Error("Authenticated user is missing an id");
  return user.id;
};

const assertDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date format.");
  return value;
};

const assertTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Give your workout a title.");
  if (trimmed.length > 120) throw new Error("Workout title is too long.");
  return trimmed;
};

const assertNotes = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > 1000) throw new Error("Notes should be under 1,000 characters.");
  return trimmed;
};

type WorkoutSetInput = {
  exercise: string;
  loadKg: string;
  reps: number;
  rpe: number;
  notes?: string;
};

type SanitizedSet = {
  exercise: string;
  load_kg: string;
  reps: number;
  rpe: string;
  notes: string | null;
};

const assertExercise = (value: string, index: number) => {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Set ${index + 1}: exercise is required.`);
  if (trimmed.length > 120) throw new Error(`Set ${index + 1}: exercise name is too long.`);
  return trimmed;
};

const assertLoadKg = (value: string | number, index: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 999.99) {
    throw new Error(`Set ${index + 1}: load must be between 0 and 1,000 kg.`);
  }
  return parsed.toFixed(2);
};

const assertReps = (value: number | string, index: number) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 1000) {
    throw new Error(`Set ${index + 1}: reps must be a whole number above 0.`);
  }
  return parsed;
};

const assertRpe = (value: number | string, index: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    throw new Error(`Set ${index + 1}: RPE must be between 0 and 10.`);
  }
  if (Math.abs(parsed * 2 - Math.round(parsed * 2)) > 1e-6) {
    throw new Error(`Set ${index + 1}: RPE should use 0.5 steps (e.g., 7, 7.5, 8).`);
  }
  return parsed.toFixed(1);
};

const assertSets = (sets: WorkoutSetInput[]): SanitizedSet[] => {
  if (!Array.isArray(sets) || sets.length === 0) throw new Error("Add at least one set.");

  return sets.map((set, index) => ({
    exercise: assertExercise(set.exercise, index),
    load_kg: assertLoadKg(set.loadKg, index),
    reps: assertReps(set.reps, index),
    rpe: assertRpe(set.rpe, index),
    notes: assertNotes(set.notes),
  }));
};

export const getWorkoutExercises = async (): Promise<string[]> => {
  const userId = await requireUserId();
  const rows = await db
    .selectDistinct({ exercise: workoutSets.exercise })
    .from(workoutSets)
    .where(eq(workoutSets.user_id, userId));

  return rows
    .map((row) => row.exercise?.trim())
    .filter((val): val is string => Boolean(val))
    .sort((a, b) => a.localeCompare(b));
};

const calculateE1RM = (loadKg: string, reps: number) => {
  const load = Number(loadKg);
  if (!Number.isFinite(load) || !Number.isFinite(reps) || reps <= 0) return null;
  const denom = 1 - reps * 0.0333;
  if (denom <= 0) return null;
  return load / denom;
};

export const getExerciseE1RMSeries = async (exercise: string): Promise<E1RMPoint[]> => {
  const userId = await requireUserId();
  const sanitizedExercise = exercise.trim();
  if (!sanitizedExercise) throw new Error("Exercise is required.");

  const rows = await db
    .select({
      date: workouts.performed_on,
      load: workoutSets.load_kg,
      reps: workoutSets.reps,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workout_id, workouts.id))
    .where(
      and(
        eq(workoutSets.user_id, userId),
        eq(workouts.user_id, userId),
        eq(workoutSets.exercise, sanitizedExercise)
      )
    );

  const bestByDate = new Map<string, number>();
  for (const row of rows) {
    const e1rm = calculateE1RM(String(row.load), row.reps);
    if (!e1rm) continue;
    const currentBest = bestByDate.get(row.date);
    if (!currentBest || e1rm > currentBest) {
      bestByDate.set(row.date, e1rm);
    }
  }

  return Array.from(bestByDate.entries())
    .map(([date, e1rm]) => ({ date, e1rm }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const addWorkoutEntry = async (
  title: string,
  performedOn: string,
  sets: WorkoutSetInput[],
  notes?: string
) => {
  const userId = await requireUserId();
  const sanitizedTitle = assertTitle(title);
  const sanitizedDate = assertDateString(performedOn);
  const sanitizedNotes = assertNotes(notes);
  const sanitizedSets = assertSets(sets);

  const [workout] = await db
    .insert(workouts)
    .values({
      title: sanitizedTitle,
      notes: sanitizedNotes,
      performed_on: sanitizedDate,
      user_id: userId,
      updated_at: new Date(),
    })
    .returning({ id: workouts.id });

  if (!workout?.id) throw new Error("Failed to save workout.");

  await db.insert(workoutSets).values(
    sanitizedSets.map((set) => ({
      ...set,
      workout_id: workout.id,
      user_id: userId,
    }))
  );

  revalidateWorkoutViews();
};

export const getWorkoutEntries = async (): Promise<WorkoutEntry[]> => {
  const userId = await requireUserId();

  const rows = await db
    .select({
      workout: workouts,
      set: workoutSets,
    })
    .from(workouts)
    .leftJoin(
      workoutSets,
      and(eq(workoutSets.workout_id, workouts.id), eq(workoutSets.user_id, userId))
    )
    .where(eq(workouts.user_id, userId))
    .orderBy(desc(workouts.performed_on), desc(workouts.created_at), desc(workoutSets.id));

  const workoutMap = new Map<number, WorkoutEntry>();

  for (const row of rows) {
    const { workout, set } = row;
    if (!workoutMap.has(workout.id)) {
      workoutMap.set(workout.id, { ...workout, sets: [] });
    }
    if (set) {
      workoutMap.get(workout.id)!.sets.push(set);
    }
  }

  return Array.from(workoutMap.values());
};
