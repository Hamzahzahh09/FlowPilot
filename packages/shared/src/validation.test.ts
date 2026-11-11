import { describe, it, expect } from 'vitest'
import { validateWorkflow } from './validation'
import type { Node, Edge } from './schemas'

describe('validateWorkflow', () => {
  it('validates a correct workflow', () => {
    const nodes: Node[] = [
      {
        id: 'node-1',
        type: 'Spark',
        position: { x: 0, y: 0 },
        config: { triggerType: 'manual_simulate' },
      },
      {
        id: 'node-2',
        type: 'Autopsy Report',
        position: { x: 100, y: 0 },
        config: { format: 'markdown' },
      },
    ]
    const edges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      },
    ]

    const result = validateWorkflow({ nodes, edges })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects missing Spark node', () => {
    const nodes: Node[] = [
      {
        id: 'node-2',
        type: 'Autopsy Report',
        position: { x: 100, y: 0 },
        config: { format: 'markdown' },
      },
    ]
    const result = validateWorkflow({ nodes, edges: [] })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('The workflow has no Spark (start) node.')
  })
})
