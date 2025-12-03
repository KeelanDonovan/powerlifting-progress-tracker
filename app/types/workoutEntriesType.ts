import { workouts, workoutSets } from "@/lib/schema";

export type Workout = typeof workouts.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;

export type WorkoutEntry = Workout & {
  sets: WorkoutSet[];
};

export type E1RMPoint = {
  date: string;
  e1rm: number;
};
