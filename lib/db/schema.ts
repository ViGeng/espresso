import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Users table - lab members who drink coffee
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  color: text('color').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Coffee beans table
export const coffeeBeans = sqliteTable('coffee_beans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  origin: text('origin'),
  roastLevel: text('roast_level'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Coffee drinking records
export const coffeeDrinking = sqliteTable('coffee_drinking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  makerId: integer('maker_id').references(() => users.id),  // Who made the coffee (optional)
  drinkerIds: text('drinker_ids'),  // JSON array of drinker user IDs (optional)
  beanId: integer('bean_id').references(() => coffeeBeans.id),
  cups: integer('cups').notNull().default(1),
  notes: text('notes'),
  recordedAt: text('recorded_at').notNull().default(new Date().toISOString()),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CoffeeBean = typeof coffeeBeans.$inferSelect;
export type NewCoffeeBean = typeof coffeeBeans.$inferInsert;
export type CoffeeDrinking = typeof coffeeDrinking.$inferSelect;
export type NewCoffeeDrinking = typeof coffeeDrinking.$inferInsert;
