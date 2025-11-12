"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { bodyWeightEntries } from "@/lib/schema";
import { stackServerApp } from "@/stack/server";

const DASHBOARD_PATH = "/";
const BODYWEIGHT_PATH = "/bodyweight";
const REVALIDATE_PATHS = [DASHBOARD_PATH, BODYWEIGHT_PATH];

const revalidateBodyWeightViews = () => {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
};

const requireUserId = async () => {
  const user = await stackServerApp.getUser({ or: "throw" });
  if (!user.id) throw new Error("Authenticated user is missing an id");
  return user.id;
};

const assertWeightKg = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 999.99) {
    throw new Error("Weight must be a positive number under 1,000 kg.");
  }
  return value.trim();
};

const assertDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date format.");
  return value;
};

// Get Bodyweight Entries
export const getBodyWeightEntries = async () => {
  const userId = await requireUserId();

  return db
    .select()
    .from(bodyWeightEntries)
    .where(eq(bodyWeightEntries.user_id, userId))
    .orderBy(desc(bodyWeightEntries.logged_on));
};

// Add bodyweight entry
export const addBodyWeightEntry = async (weightKg: string, loggedOn: string) => {
  const userId = await requireUserId();
  const sanitizedWeight = assertWeightKg(weightKg);
  const sanitizedDate = assertDateString(loggedOn);

  await db.insert(bodyWeightEntries).values({
    weight_kg: sanitizedWeight,
    logged_on: sanitizedDate,
    user_id: userId,
  });

  revalidateBodyWeightViews();
};

// Delete bodyweight entry
export const deleteBodyWeightEntry = async (entryId: number) => {
  const userId = await requireUserId();

  await db
    .delete(bodyWeightEntries)
    .where(and(eq(bodyWeightEntries.id, entryId), eq(bodyWeightEntries.user_id, userId)));

  revalidateBodyWeightViews();
};

// Edit bodyweight entry
export const editBodyWeightEntry = async (
  entryId: number,
  weightKg: string | null,
  loggedOn: string | null
) => {
  const userId = await requireUserId();

  const updateData: Partial<typeof bodyWeightEntries.$inferInsert> = {};
  if (weightKg !== null) updateData.weight_kg = assertWeightKg(weightKg);
  if (loggedOn !== null) updateData.logged_on = assertDateString(loggedOn);

  if (!Object.keys(updateData).length) {
    throw new Error("Provide at least one field to update.");
  }

  await db
    .update(bodyWeightEntries)
    .set(updateData)
    .where(and(eq(bodyWeightEntries.id, entryId), eq(bodyWeightEntries.user_id, userId)));

  revalidateBodyWeightViews();
};
