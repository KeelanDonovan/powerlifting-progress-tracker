CREATE TABLE "BodyWeightEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"weight_kg" numeric(4, 2) NOT NULL,
	"logged_on" date DEFAULT '2025-11-12' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WorkoutSets" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise" text NOT NULL,
	"load_kg" numeric(5, 2) NOT NULL,
	"reps" integer NOT NULL,
	"rpe" numeric(3, 1) NOT NULL,
	"notes" text,
	"user_id" text NOT NULL,
	"workout_id" integer NOT NULL,
	CONSTRAINT "reps_check" CHECK ("WorkoutSets"."reps" >= 0),
	CONSTRAINT "rpe_check" CHECK ("WorkoutSets"."rpe" in (0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0)),
	CONSTRAINT "load_check" CHECK ("WorkoutSets"."load_kg" >= 0.0)
);
--> statement-breakpoint
CREATE TABLE "Workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"performed_on" date DEFAULT '2025-11-12' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "BodyWeightEntries" ADD CONSTRAINT "BodyWeightEntries_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkoutSets" ADD CONSTRAINT "WorkoutSets_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkoutSets" ADD CONSTRAINT "WorkoutSets_workout_id_Workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."Workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Workouts" ADD CONSTRAINT "Workouts_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE no action ON UPDATE no action;