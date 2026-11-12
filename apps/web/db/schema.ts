import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  data: jsonb('data').notNull(), // WorkflowGraph: { nodes: [], edges: [] }
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

/** Run statuses from .kiro/steering/tech.md. */
export const runStatus = pgEnum('run_status', [
  'queued',
  'running',
  'awaiting_approval',
  'succeeded',
  'failed',
  'cancelled',
  'timed_out',
])

export const runs = pgTable(
  'runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowId: uuid('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),
    /** Name at start, so renaming the workflow does not change past runs. */
    workflowName: text('workflow_name').notNull(),
    trigger: text('trigger').notNull(), // 'github_push' | 'manual_simulate'
    status: runStatus('status').notNull().default('queued'),
    graph: jsonb('graph').notNull(), // snapshot at start
    events: jsonb('events').notNull(), // RunEvent[]
    decision: text('decision'), // 'approved' | 'rejected' | null
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    byWorkflow: index('runs_workflow_started_idx').on(t.workflowId, t.startedAt),
  }),
)

export const runners = pgTable('runners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: text('status').notNull().default('offline'), // 'online' | 'offline'
  /** SHA-256 of the token (security.md 8). The plain token is never stored. */
  tokenHash: text('token_hash').notNull().unique(),
  tokenPreview: text('token_preview').notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: createdAt(),
})

/** Single row (id = 1) for the one demo account. */
export const githubSettings = pgTable('github_settings', {
  id: integer('id').primaryKey().default(1),
  repository: text('repository'),
  connectedAt: timestamp('connected_at', { withTimezone: true }),
  // Kept retrievable: the server needs it to verify webhook HMAC signatures
  // and the settings page shows it once for copying into GitHub.
  webhookSecret: text('webhook_secret').notNull(),
  triggerPush: boolean('trigger_push').notNull().default(true),
  triggerPullRequest: boolean('trigger_pull_request').notNull().default(false),
  updatedAt: updatedAt(),
})

export type WorkflowRow = typeof workflows.$inferSelect
export type NewWorkflowRow = typeof workflows.$inferInsert
export type RunRow = typeof runs.$inferSelect
export type RunnerRow = typeof runners.$inferSelect
export type GithubSettingsRow = typeof githubSettings.$inferSelect
