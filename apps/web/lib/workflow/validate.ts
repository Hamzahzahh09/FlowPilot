import { getConfigSchema, validateWorkflow, type NodeType } from 'shared'
import type { WorkflowGraph } from '@/lib/data/types'
import { nodeTitle, type NodeConfig } from './graph'

// Plain messages per config field. Zod's own messages ("Expected number,
// received nan") are not written for people.
const FIELD_MESSAGES: Record<string, string> = {
  triggerType: 'Pick what starts the run.',
  prompt: 'Write a prompt of 1 to 500 characters.',
  maxSteps: 'Use a whole number from 1 to 50.',
  command: 'Pick a command from the allowlist.',
  format: 'Pick a report format.',
}

/** Field name -> message, validated with the shared Zod schema for the node type. */
export function configErrors(type: NodeType, config: NodeConfig): Record<string, string> {
  const result = getConfigSchema(type).safeParse(config)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'config')
    errors[field] = FIELD_MESSAGES[field] ?? issue.message
  }
  return errors
}

/** Structure rules from packages/shared plus per-node config checks. */
export function validateGraph(graph: WorkflowGraph): string[] {
  const errors = [...validateWorkflow(graph).errors]
  for (const node of graph.nodes) {
    const messages = Object.values(configErrors(node.type, node.config))
    if (messages.length > 0) errors.push(`${nodeTitle(node)}: ${messages.join(' ')}`)
  }
  return errors
}
