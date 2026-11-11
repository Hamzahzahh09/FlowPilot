import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  data: jsonb('data').notNull(), // { nodes: [], edges: [] }
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type WorkflowRow = typeof workflows.$inferSelect
export type NewWorkflowRow = typeof workflows.$inferInsert
