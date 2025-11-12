import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  numeric,
  date,
  check,
} from "drizzle-orm/pg-core";
import { usersSync } from "drizzle-orm/neon";
import { sql } from "drizzle-orm";

// BodyWeightEntries Table
export const bodyWeightEntries = pgTable("BodyWeightEntries", {
  id: serial("id").primaryKey(),
  weight_kg: numeric("weight_kg", { precision: 4, scale: 2 }).notNull(),
  logged_on: date("logged_on", { mode: "date" }).notNull().default(sql`CURRENT_DATE`),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => usersSync.id),
});

// Workouts Table
export const workouts = pgTable("Workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  notes: text("notes"),
  performed_on: date("performed_on", { mode: "date" }).notNull().default(sql`CURRENT_DATE`),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at"),
  user_id: text("user_id")
    .notNull()
    .references(() => usersSync.id),
});

export const workoutSets = pgTable(
  "WorkoutSets",
  {
    id: serial("id").primaryKey(),
    exercise: text("exercise").notNull(),
    load_kg: numeric("load_kg", { precision: 5, scale: 2 }).notNull(),
    reps: integer("reps").notNull(),
    rpe: numeric("rpe", { precision: 3, scale: 1 }).notNull(),
    notes: text("notes"),
    user_id: text("user_id")
      .notNull()
      .references(() => usersSync.id),
    workout_id: integer("workout_id")
      .notNull()
      .references(() => workouts.id),
  },
  (table) => [
    check("reps_check", sql`${table.reps} >= 0`),
    check(
      "rpe_check",
      sql`${table.rpe} in (0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0)`
    ),
    check("load_check", sql`${table.load_kg} >= 0.0`)
  ]
);
