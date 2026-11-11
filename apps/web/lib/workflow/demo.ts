import type { Edge } from '@xyflow/react'
import { nodeAriaLabel, type FlowNodeData, type FlowNodeType } from './types'

// Demo workflow: Spark -> Brain -> (Scalpel | Heart) -> Lightning Lever -> Autopsy.
// Positions are the top-left of each 80x80 box. Labels hang ~50px below the box.

const COL = 200
const ROW = 100

function node(id: string, x: number, y: number, data: Omit<FlowNodeData, 'status'>): FlowNodeType {
  const full: FlowNodeData = { ...data, status: 'idle' }
  return {
    id,
    type: 'flow',
    position: { x, y },
    data: full,
    ariaLabel: nodeAriaLabel(full),
  }
}

export const DEMO_NODES: FlowNodeType[] = [
  node('spark', 0, 0, {
    kind: 'spark',
    title: 'On push',
    themeName: 'Spark',
    operation: 'main branch',
  }),
  node('brain', COL, 0, {
    kind: 'brain',
    title: 'AI code review',
    themeName: 'Brain',
    operation: 'analyze diff',
  }),
  node('scalpel', COL * 2, -ROW, {
    kind: 'scalpel',
    title: 'Run lint',
    themeName: 'Scalpel',
    operation: 'npm run lint',
  }),
  node('heart', COL * 2, ROW, {
    kind: 'heart',
    title: 'Run tests',
    themeName: 'Heart',
    operation: 'npm test',
  }),
  node('lever', COL * 3, 0, {
    kind: 'lever',
    title: 'Human approval',
    themeName: 'Lightning Lever',
    operation: 'wait for you',
  }),
  node('autopsy', COL * 4, 0, {
    kind: 'autopsy',
    title: 'Report',
    themeName: 'Autopsy',
    operation: 'write findings',
  }),
]

function stitch(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

export const DEMO_EDGES: Edge[] = [
  stitch('spark', 'brain'),
  stitch('brain', 'scalpel'),
  stitch('brain', 'heart'),
  stitch('scalpel', 'lever'),
  stitch('heart', 'lever'),
  stitch('lever', 'autopsy'),
]
