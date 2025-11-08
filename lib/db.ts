import postgres, { Sql } from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const globalForSql = globalThis as unknown as {
  sqlClient?: Sql<{}>;
};

const sqlClient =
  globalForSql.sqlClient ??
  postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 3,
    idle_timeout: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForSql.sqlClient = sqlClient;
}

export const sql = sqlClient;
export type DbClient = typeof sql;
