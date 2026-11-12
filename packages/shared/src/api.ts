import { z } from 'zod'
import { edgeSchema, getConfigSchema, nodeTypeSchema, positionSchema } from './schemas'
import { validateWorkflow } from './validation'

// Request schemas for apps/web/app/api. Every body is parsed with one of
// these before it reaches the database.

export const MAX_NODES = 100
export const MAX_EDGES = 200

const graphNodeSchema = z
  .object({
    id: z.string().uuid(),
    type: nodeTypeSchema,
    position: positionSchema,
    // Checked per type below. nodeConfigSchema is a union whose `{}` members
    // match any object and would strip fields such as Scalpel's command.
    config: z.record(z.unknown()),
    title: z.string().trim().max(60).optional(),
  })
  .transform((node, ctx) => {
    const parsed = getConfigSchema(node.type).safeParse(node.config)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ ...issue, path: ['config', ...issue.path] })
      }
      return z.NEVER
    }
    return { ...node, config: parsed.data as Record<string, unknown> }
  })

/** A saved workflow graph: valid configs and valid structure. */
export const workflowGraphSchema = z
  .object({
    nodes: z.array(graphNodeSchema).max(MAX_NODES),
    edges: z.array(edgeSchema).max(MAX_EDGES),
  })
  .superRefine((graph, ctx) => {
    const ids = new Set(graph.nodes.map((n) => n.id))
    if (ids.size !== graph.nodes.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Two nodes share the same id.' })
    }
    for (const edge of graph.edges) {
      if (!ids.has(edge.source) || !ids.has(edge.target)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A stitch points at a node that does not exist.' })
        break
      }
    }
    // validateWorkflow only reads id, type and the edges.
    const result = validateWorkflow(graph as Parameters<typeof validateWorkflow>[0])
    for (const message of result.errors) ctx.addIssue({ code: z.ZodIssueCode.custom, message })
  })

export type WorkflowGraphInput = z.infer<typeof workflowGraphSchema>

const workflowName = z.string().trim().min(1).max(100)

export const workflowCreateInputSchema = z.object({ name: workflowName.optional() }).strict()

export const workflowSaveInputSchema = z
  .object({ name: workflowName.optional(), graph: workflowGraphSchema })
  .strict()

export const runStartInputSchema = z.object({ workflowId: z.string().uuid() }).strict()

export const runDecisionInputSchema = z
  .object({ decision: z.enum(['approved', 'rejected']) })
  .strict()

export const runnerCreateInputSchema = z
  .object({ name: z.string().trim().max(60) })
  .strict()

export const repositorySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'Use the form owner/repository, for example octo-org/shop-api.')
  .max(140)

export const githubSettingsPatchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('connect'), repository: repositorySchema }).strict(),
  z.object({ action: z.literal('disconnect') }).strict(),
  z
    .object({
      action: z.literal('triggers'),
      triggers: z.object({ push: z.boolean(), pullRequest: z.boolean() }).strict(),
    })
    .strict(),
])

export type GithubSettingsPatch = z.infer<typeof githubSettingsPatchSchema>
