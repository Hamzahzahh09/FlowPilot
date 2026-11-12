import { getDefaultConfig } from 'shared'
import type { TriggerType, WorkflowGraph } from './types'

// Shared by the browser mock (lib/data/mock), the server (server/*) and the
// database seed (db/seed.ts), so all three produce the same demo.

/** Fixed id so links to the demo workflow work in every data source. */
export const DEMO_WORKFLOW_ID = '450e8400-e29b-41d4-a716-446655440000'

export const DEMO_WORKFLOW = {
  id: DEMO_WORKFLOW_ID,
  name: 'Automated code review',
  description: 'AI review, lint and tests in a sandbox, then your approval.',
} as const

const n = (i: number) => `550e8400-e29b-41d4-a716-44665544000${i}`
const e = (i: number) => `650e8400-e29b-41d4-a716-44665544000${i}`

// Spark -> Brain -> (Scalpel | Heart) -> Lightning Lever -> Autopsy Report
export function demoGraph(): WorkflowGraph {
  return {
    nodes: [
      { id: n(1), type: 'Spark', position: { x: 0, y: 0 }, config: { triggerType: 'github_push' } },
      { id: n(2), type: 'Brain', position: { x: 200, y: 0 }, config: getDefaultConfig('Brain') },
      { id: n(3), type: 'Scalpel', position: { x: 400, y: -100 }, config: getDefaultConfig('Scalpel') },
      { id: n(4), type: 'Heart', position: { x: 400, y: 100 }, config: getDefaultConfig('Heart') },
      { id: n(5), type: 'Lightning Lever', position: { x: 600, y: 0 }, config: {} },
      { id: n(6), type: 'Autopsy Report', position: { x: 800, y: 0 }, config: getDefaultConfig('Autopsy Report') },
    ],
    edges: [
      { id: e(1), source: n(1), target: n(2) },
      { id: e(2), source: n(2), target: n(3) },
      { id: e(3), source: n(2), target: n(4) },
      { id: e(4), source: n(3), target: n(5) },
      { id: e(5), source: n(4), target: n(5) },
      { id: e(6), source: n(5), target: n(6) },
    ],
  }
}

/** Starting graph for "New workflow": Spark stitched to a report. */
export function newWorkflowGraph(newId: () => string): WorkflowGraph {
  const spark = newId()
  const report = newId()
  return {
    nodes: [
      { id: spark, type: 'Spark', position: { x: 0, y: 0 }, config: { triggerType: 'manual_simulate' } },
      { id: report, type: 'Autopsy Report', position: { x: 400, y: 0 }, config: { format: 'markdown' } },
    ],
    edges: [{ id: newId(), source: spark, target: report }],
  }
}

export function triggerOf(graph: WorkflowGraph): TriggerType | null {
  const spark = graph.nodes.find((node) => node.type === 'Spark')
  if (!spark) return null
  const config = spark.config as { triggerType?: TriggerType }
  return config.triggerType ?? 'manual_simulate'
}
