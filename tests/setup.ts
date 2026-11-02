import { vi } from "vitest";

// Swap the real database for a fresh in-memory Postgres (PGlite) in every test
// file, with the same migrations Vercel runs. The app code under test is unchanged.
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const schema = await import("@/db/schema");
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return { db };
});
