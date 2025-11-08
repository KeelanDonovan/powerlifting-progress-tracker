import { z } from "zod";

export const workoutSetSchema = z.object({
  movement: z.string().min(1).max(120),
  loadKg: z.number().nonnegative(),
  reps: z.number().int().positive().max(100),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().max(500).optional(),
  sequence: z.number().int().positive().optional(),
});

export const createWorkoutSchema = z.object({
  performedOn: z.coerce.date().optional(),
  title: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  sets: z.array(workoutSetSchema).max(100).optional(),
});

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
