import { z } from 'zod'
import { ALLOWED_COMMANDS } from './constants'

// Node types
export const nodeTypes = [
  'Spark',
  'Brain',
  'Eyes',
  'Scalpel',
  'Heart',
  'Fork',
  'Lightning Lever',
  'Autopsy Report',
] as const

export const nodeTypeSchema = z.enum(nodeTypes)
export type NodeType = z.infer<typeof nodeTypeSchema>

// Node configuration schemas per type
export const sparkConfigSchema = z.object({
  triggerType: z.enum(['github_push', 'manual_simulate']),
})

export const brainConfigSchema = z.object({
  prompt: z.string().min(1).max(500),
  maxSteps: z.number().int().min(1).max(50).default(10),
})

export const eyesConfigSchema = z.object({})

export const scalpelConfigSchema = z.object({
  command: z.enum(ALLOWED_COMMANDS),
})

export const heartConfigSchema = z.object({
  command: z.enum(ALLOWED_COMMANDS),
})

export const forkConfigSchema = z.object({})

export const lightningLeverConfigSchema = z.object({})

export const autopsyReportConfigSchema = z.object({
  format: z.enum(['markdown', 'json']),
})

// Union of all configs
export const nodeConfigSchema = z.union([
  sparkConfigSchema,
  brainConfigSchema,
  eyesConfigSchema,
  scalpelConfigSchema,
  heartConfigSchema,
  forkConfigSchema,
  lightningLeverConfigSchema,
  autopsyReportConfigSchema,
])

// Position
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

// Node
export const nodeSchema = z.object({
  id: z.string().uuid(),
  type: nodeTypeSchema,
  position: positionSchema,
  config: nodeConfigSchema,
})

export type Node = z.infer<typeof nodeSchema>

// Edge
export const edgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  sourceHandle: z.string().optional(),
  label: z.string().optional(),
})

export type Edge = z.infer<typeof edgeSchema>

// Workflow
export const workflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Workflow = z.infer<typeof workflowSchema>

// Workflow data (for JSONB storage)
export const workflowDataSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

export type WorkflowData = z.infer<typeof workflowDataSchema>

// Helper: Get default config for a node type
export function getDefaultConfig(type: NodeType): z.infer<typeof nodeConfigSchema> {
  switch (type) {
    case 'Spark':
      return { triggerType: 'manual_simulate' }
    case 'Brain':
      return { prompt: 'Analyze the code changes and provide insights.', maxSteps: 10 }
    case 'Eyes':
      return {}
    case 'Scalpel':
      return { command: 'npm run lint' }
    case 'Heart':
      return { command: 'npm test' }
    case 'Fork':
      return {}
    case 'Lightning Lever':
      return {}
    case 'Autopsy Report':
      return { format: 'markdown' }
  }
}

// Helper: Get config schema for a node type
export function getConfigSchema(type: NodeType): z.ZodTypeAny {
  switch (type) {
    case 'Spark':
      return sparkConfigSchema
    case 'Brain':
      return brainConfigSchema
    case 'Eyes':
      return eyesConfigSchema
    case 'Scalpel':
      return scalpelConfigSchema
    case 'Heart':
      return heartConfigSchema
    case 'Fork':
      return forkConfigSchema
    case 'Lightning Lever':
      return lightningLeverConfigSchema
    case 'Autopsy Report':
      return autopsyReportConfigSchema
  }
}
