import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const repairs = pgTable('repairs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  customerName: text('customer_name').notNull(),
  deviceModel: text('device_model').notNull(),
  serialNumber: text('serial_number'),
  status: text('status').notNull().default('W trakcie'),
  faultSummary: text('fault_summary'),
  peakTemp: text('peak_temp'),
  suspectComponent: text('suspect_component'),
  repairCostEstimated: text('repair_cost_estimated'),
  technicianNotes: text('technician_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  repairs: many(repairs),
}));

export const repairsRelations = relations(repairs, ({ one }) => ({
  user: one(users, {
    fields: [repairs.userId],
    references: [users.id],
  }),
}));
