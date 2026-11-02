import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { connectionConfig, databaseUrl } from "./src/db/connection";

// Locally, `npm run db:generate` needs DATABASE_URL from .env.local.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// drizzle-kit takes SSL settings only with separate fields, not with a URL.
const url = new URL(databaseUrl()!);
const { ssl } = connectionConfig(url.toString());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: ssl as boolean | { rejectUnauthorized: boolean },
  },
});
