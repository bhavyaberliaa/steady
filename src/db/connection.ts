import type { PoolConfig } from "pg";

// Local PGlite runs without SSL. Supabase needs SSL; its certificate is
// signed by Supabase's own authority, so we encrypt without verifying the chain.
export function connectionConfig(url = process.env.DATABASE_URL!): PoolConfig {
  const parsed = new URL(url);
  const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  // An sslmode in the URL would override the ssl setting below.
  parsed.searchParams.delete("sslmode");
  return {
    connectionString: parsed.toString(),
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
}
