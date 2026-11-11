import type { Node, Edge, Workflow } from './schemas'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const NODE_LABELS: Record<string, string> = {
  Spark: 'Spark: On Push',
  Brain: 'Brain: AI Reviewer',
  Eyes: 'Eyes: Security Scan',
  Scalpel: 'Scalpel: Lint',
  Heart: 'Heart: Run Tests',
  Fork: 'Fork: Pass / Fail',
  'Lightning Lever': 'Lightning Lever: Approval',
  'Autopsy Report': 'Autopsy Report',
}

/**
 * Validates workflow structural constraints with beginner-friendly English guidance:
 * - Exactly one Spark node
 * - Spark has no incoming edges
 * - At least one Autopsy Report node
 * - All non-output nodes have outgoing edges
 * - No circular dependencies
 */
export function validateWorkflow(workflow: Pick<Workflow, 'nodes' | 'edges'>): ValidationResult {
  const errors: string[] = []

  // Rule 1: Exactly one Spark
  const sparkNodes = workflow.nodes.filter((n) => n.type === 'Spark')
  if (sparkNodes.length === 0) {
    errors.push("The workflow has no Spark (start) node. Add 'Spark: On Push' from the left panel.")
  }
  if (sparkNodes.length > 1) {
    errors.push("A workflow can only have one Spark node. Remove the extra Spark nodes.")
  }

  // Rule 2: Spark has no incoming edges
  if (sparkNodes.length > 0) {
    const sparkIncoming = workflow.edges.filter((e) =>
      sparkNodes.some((s) => s.id === e.target)
    )
    if (sparkIncoming.length > 0) {
      errors.push("The Spark node starts the workflow, so nothing can connect into it. Remove the stitches pointing at Spark.")
    }
  }

  // Rule 3: At least one Autopsy Report
  const reportNodes = workflow.nodes.filter((n) => n.type === 'Autopsy Report')
  if (reportNodes.length === 0) {
    errors.push("The workflow has no Autopsy Report. Add one at the end so every run produces a report.")
  }

  // Rule 4: All non-output nodes must have outgoing edges
  const outputNodeIds = new Set(reportNodes.map((n) => n.id))
  workflow.nodes.forEach((node) => {
    if (outputNodeIds.has(node.id)) return
    const hasOutgoing = workflow.edges.some((e) => e.source === node.id)
    if (!hasOutgoing) {
      const nodeName = NODE_LABELS[node.type] || node.type
      errors.push(`'${nodeName}' is not connected to a next step. Drag from its right handle to the next node.`)
    }
  })

  // Rule 5: No cycles
  if (hasCycle(workflow.nodes, workflow.edges)) {
    errors.push('The workflow contains a loop. Stitches must flow one way, from left to right.')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Detects cycles in the workflow graph using DFS
 */
function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const graph = buildGraph(nodes, edges)
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recStack.add(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        return true // Cycle detected
      }
    }

    recStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true
    }
  }

  return false
}

/**
 * Builds an adjacency list representation of the workflow graph
 */
function buildGraph(nodes: Node[], edges: Edge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()

  // Initialize all nodes
  nodes.forEach((node) => {
    graph.set(node.id, [])
  })

  // Add edges
  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || []
    neighbors.push(edge.target)
    graph.set(edge.source, neighbors)
  })

  return graph
}
