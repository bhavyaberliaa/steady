import type { PoolConfig } from "pg";

// On Vercel, the Supabase integration sets POSTGRES_URL (the pooled
// connection). Locally, DATABASE_URL points at the PGlite server.
export function databaseUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL;
}

// Local PGlite runs without SSL. Supabase needs SSL; its certificate is
// signed by Supabase's own authority, so we encrypt without verifying the chain.
export function connectionConfig(url = databaseUrl()!): PoolConfig {
  const parsed = new URL(url);
  const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  // Query options like sslmode would override the ssl setting below.
  parsed.search = "";
  return {
    connectionString: parsed.toString(),
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
}
