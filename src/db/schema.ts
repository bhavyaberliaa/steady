import { pgTable, uuid, text, smallint, timestamp } from "drizzle-orm/pg-core";

// One row per account. Passwords are never stored, only their bcrypt hash.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  // 0 = Sunday … 6 = Saturday
  briefingDay: smallint("briefing_day").notNull().default(0),
  googleRefreshToken: text("google_refresh_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

// A mood or situation, e.g. "Can't sleep" 🌙. Affirmations are grouped by trigger.
export const triggers = pgTable("triggers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🌿"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Trigger = typeof triggers.$inferSelect;
