import { pgTable, uuid, text, varchar, smallint, timestamp, primaryKey } from "drizzle-orm/pg-core";

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

// Something the user wrote to read in a hard moment. Belongs to exactly one trigger.
export const affirmations = pgTable("affirmations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // "restrict": a trigger can't be deleted while affirmations still use it.
  triggerId: uuid("trigger_id")
    .notNull()
    .references(() => triggers.id, { onDelete: "restrict" }),
  text: varchar("text", { length: 280 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Affirmation = typeof affirmations.$inferSelect;

// Junction table: which users starred which affirmations. One row per star,
// and the pair (user, affirmation) can only appear once.
export const stars = pgTable(
  "stars",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    affirmationId: uuid("affirmation_id")
      .notNull()
      .references(() => affirmations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.affirmationId] })],
);
