import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, check } from 'drizzle-orm/pg-core';

export const reviews = pgTable('reviews', {
  id: serial().primaryKey(),
  name: text().notNull(),
  rating: integer().notNull(),
  comment: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('reviews_rating_range', sql`${table.rating} between 1 and 5`),
  check('reviews_name_length', sql`length(${table.name}) between 1 and 80`),
  check('reviews_comment_length', sql`length(${table.comment}) between 1 and 1500`),
]);
