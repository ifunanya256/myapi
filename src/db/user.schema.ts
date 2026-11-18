import { integer, pgTable, varchar, boolean, uuid, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 100 }),
  lastName: varchar({ length: 100 }),
  username: varchar().notNull().unique(),
  email: varchar().notNull().unique(),
  password: varchar().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
