import { sql, type DbClient } from "@/lib/db";
import type {
  CreateWorkoutInput,
  WorkoutSetInput,
} from "@/lib/validation/workouts";

type WorkoutRow = {
  id: string;
  userId: string;
  performedOn: Date;
  title: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutSetRow = {
  id: string;
  workoutId: string;
  sequence: number;
  movement: string;
  loadKg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
  createdAt: Date;
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const hasOwn = <T extends object>(obj: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(obj, key);

export async function createWorkoutWithSets(
  userId: string,
  data: CreateWorkoutInput,
) {
  return sql.begin(async (trx) => {
    const performedOn = data.performedOn ?? new Date();

    const [workout] = await trx<WorkoutRow[]>`
      INSERT INTO "Workout" ("userId", "performedOn", "title", "notes")
      VALUES (${userId}, ${performedOn}, ${data.title ?? null}, ${
        data.notes ?? null
      })
      RETURNING
        "id",
        "userId",
        "performedOn",
        "title",
        "notes",
        "createdAt",
        "updatedAt"
    `;

    if (!workout) {
      throw new Error("Unable to create workout.");
    }

    const sets: WorkoutSetRow[] = [];

    if (data.sets?.length) {
      for (const [index, set] of data.sets.entries()) {
        const sequence = set.sequence ?? index + 1;
        const [inserted] = await trx<WorkoutSetRow[]>`
          INSERT INTO "WorkoutSet"
            ("workoutId","sequence","movement","loadKg","reps","rpe","notes")
          VALUES (${workout.id}, ${sequence}, ${set.movement}, ${
            set.loadKg
          }, ${set.reps}, ${set.rpe ?? null}, ${set.notes ?? null})
          RETURNING
            "id",
            "workoutId",
            "sequence",
            "movement",
            "loadKg",
            "reps",
            "rpe",
            "notes",
            "createdAt"
        `;

        if (inserted) {
          sets.push(inserted);
        }
      }
    }

    return { workout, sets };
  });
}

export async function addSetToWorkout(
  userId: string,
  workoutId: string,
  input: WorkoutSetInput,
) {
  return sql.begin(async (trx) => {
    await assertWorkoutOwnership(userId, workoutId, trx);

    const [{ maxSequence }] = await trx<{ maxSequence: number | null }[]>`
      SELECT MAX("sequence")::int AS "maxSequence"
      FROM "WorkoutSet"
      WHERE "workoutId" = ${workoutId}
      FOR UPDATE
    `;

    const sequence = input.sequence ?? (maxSequence ?? 0) + 1;

    const [set] = await trx<WorkoutSetRow[]>`
      INSERT INTO "WorkoutSet"
        ("workoutId","sequence","movement","loadKg","reps","rpe","notes")
      VALUES (${workoutId}, ${sequence}, ${input.movement}, ${
        input.loadKg
      }, ${input.reps}, ${input.rpe ?? null}, ${input.notes ?? null})
      RETURNING
        "id",
        "workoutId",
        "sequence",
        "movement",
        "loadKg",
        "reps",
        "rpe",
        "notes",
        "createdAt"
    `;

    if (!set) {
      throw new Error("Unable to add set.");
    }

    if (input.sequence !== undefined) {
      await resequenceWorkoutSets(trx, workoutId);
    }

    return set;
  });
}

export async function updateWorkoutSet(
  userId: string,
  workoutId: string,
  setId: string,
  updates: Partial<WorkoutSetInput>,
) {
  return sql.begin(async (trx) => {
    const [existing] = await trx<WorkoutSetRow[]>`
      SELECT ws.*
      FROM "WorkoutSet" ws
      JOIN "Workout" w ON w."id" = ws."workoutId"
      WHERE ws."id" = ${setId} AND ws."workoutId" = ${workoutId} AND w."userId" = ${userId}
      FOR UPDATE
    `;

    if (!existing) {
      throw new NotFoundError("Set not found.");
    }

    const next: WorkoutSetRow = {
      ...existing,
      movement: hasOwn(updates, "movement")
        ? (updates.movement as string | undefined) ?? ""
        : existing.movement,
      loadKg: hasOwn(updates, "loadKg")
        ? (updates.loadKg as number | undefined) ?? existing.loadKg
        : existing.loadKg,
      reps: hasOwn(updates, "reps")
        ? (updates.reps as number | undefined) ?? existing.reps
        : existing.reps,
      rpe: hasOwn(updates, "rpe")
        ? (updates.rpe as number | null | undefined) ?? null
        : existing.rpe,
      notes: hasOwn(updates, "notes")
        ? (updates.notes as string | null | undefined) ?? null
        : existing.notes,
      sequence: hasOwn(updates, "sequence")
        ? (updates.sequence as number | undefined) ?? existing.sequence
        : existing.sequence,
    };

    const [set] = await trx<WorkoutSetRow[]>`
      UPDATE "WorkoutSet"
      SET
        "movement" = ${next.movement},
        "loadKg" = ${next.loadKg},
        "reps" = ${next.reps},
        "rpe" = ${next.rpe},
        "notes" = ${next.notes},
        "sequence" = ${next.sequence}
      WHERE "id" = ${setId} AND "workoutId" = ${workoutId}
      RETURNING
        "id",
        "workoutId",
        "sequence",
        "movement",
        "loadKg",
        "reps",
        "rpe",
        "notes",
        "createdAt"
    `;

    if (!set) {
      throw new NotFoundError("Set not found.");
    }

    if (hasOwn(updates, "sequence")) {
      await resequenceWorkoutSets(trx, workoutId);
    }

    return set;
  });
}

export async function deleteWorkoutSet(
  userId: string,
  workoutId: string,
  setId: string,
) {
  return sql.begin(async (trx) => {
    const [deleted] = await trx<WorkoutSetRow[]>`
      DELETE FROM "WorkoutSet" ws
      USING "Workout" w
      WHERE
        ws."id" = ${setId}
        AND ws."workoutId" = ${workoutId}
        AND w."id" = ws."workoutId"
        AND w."userId" = ${userId}
      RETURNING
        ws."id",
        ws."workoutId",
        ws."sequence",
        ws."movement",
        ws."loadKg",
        ws."reps",
        ws."rpe",
        ws."notes",
        ws."createdAt"
    `;

    if (!deleted) {
      throw new NotFoundError("Set not found.");
    }

    await resequenceWorkoutSets(trx, workoutId);
    return deleted;
  });
}

export async function deleteWorkout(userId: string, workoutId: string) {
  const [deleted] = await sql<WorkoutRow[]>`
    DELETE FROM "Workout"
    WHERE "id" = ${workoutId} AND "userId" = ${userId}
    RETURNING
      "id",
      "userId",
      "performedOn",
      "title",
      "notes",
      "createdAt",
      "updatedAt"
  `;

  if (!deleted) {
    throw new NotFoundError("Workout not found.");
  }

  return deleted;
}

async function assertWorkoutOwnership(
  userId: string,
  workoutId: string,
  client: DbClient = sql,
) {
  const [result] = await client<{ exists: boolean }[]>`
    SELECT EXISTS(
      SELECT 1 FROM "Workout" WHERE "id" = ${workoutId} AND "userId" = ${userId}
    ) AS "exists"
  `;

  if (!result?.exists) {
    throw new NotFoundError("Workout not found.");
  }
}

async function resequenceWorkoutSets(client: DbClient, workoutId: string) {
  await client`
    WITH ordered AS (
      SELECT
        "id",
        ROW_NUMBER() OVER (ORDER BY "sequence") AS rn
      FROM "WorkoutSet"
      WHERE "workoutId" = ${workoutId}
    )
    UPDATE "WorkoutSet" ws
    SET "sequence" = ordered.rn
    FROM ordered
    WHERE ws."id" = ordered."id"
  `;
}
