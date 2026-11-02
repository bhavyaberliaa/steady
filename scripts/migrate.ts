// Applies the SQL migrations in ./drizzle. Used by `vercel-build` and
// `npm run db:migrate`. Unlike `drizzle-kit migrate`, it prints the real
// database error when something goes wrong.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { connectionConfig, databaseUrl } from "../src/db/connection";

const HINTS: Record<string, string> = {
  "28P01": "Wrong database password. On Vercel, connect Supabase under Storage so POSTGRES_URL is set for you.",
  XX000: "Supabase couldn't match the user. Copy the Transaction pooler string again; the user should look like postgres.<project-ref>.",
  ENOTFOUND: "The database host wasn't found. Check the connection string was copied whole.",
  ECONNREFUSED: "Nothing is listening at that address. Locally, start the database with `npm run db:local`.",
};

async function main() {
  const url = databaseUrl();
  if (!url) throw Object.assign(new Error("Neither POSTGRES_URL nor DATABASE_URL is set."), { code: "NO_URL" });

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
