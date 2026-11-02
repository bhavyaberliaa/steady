// Applies the SQL migrations in ./drizzle. Used by `vercel-build` and
// `npm run db:migrate`. Unlike `drizzle-kit migrate`, it prints the real
// database error when something goes wrong.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { connectionConfig } from "../src/db/connection";

const HINTS: Record<string, string> = {
  "28P01": "Wrong database password. Check the password in DATABASE_URL (no [ ] brackets).",
  XX000: "Supabase couldn't match the user. Copy the Transaction pooler string again; the user should look like postgres.<project-ref>.",
  ENOTFOUND: "The database host wasn't found. Check DATABASE_URL was copied whole; special characters in the password must be URL-encoded.",
  ECONNREFUSED: "Nothing is listening at that address. Locally, start the database with `npm run db:local`.",
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw Object.assign(new Error("DATABASE_URL is not set."), { code: "NO_URL" });

  const { hostname, port } = new URL(url);
  console.log(`Migrating database at ${hostname}:${port || 5432} …`);

  const pool = new Pool(connectionConfig(url));
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  // Drizzle wraps database errors; the useful details are on the cause.
  const root = error?.cause ?? error;
  console.error(`Migration failed: ${root?.message ?? error}`);
  if (root?.code) console.error(`Error code: ${root.code}`);
  const hint = HINTS[root?.code];
  if (hint) console.error(`Hint: ${hint}`);
  process.exit(1);
});
