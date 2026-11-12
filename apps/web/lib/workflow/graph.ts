import type { Edge, Node } from '@xyflow/react'
import type { NodeType } from 'shared'
import type { GraphEdge, GraphNode, WorkflowGraph } from '@/lib/data/types'
import { nodeAriaLabel, type FlowNodeData, type NodeKind, type NodeStatus } from './types'

export type NodeConfig = GraphNode['config']

/** Eyes is not offered in the picker; older data that has it shows with the Brain icon. */
export const KIND_BY_TYPE: Record<NodeType, NodeKind> = {
  Spark: 'spark',
  Brain: 'brain',
  Eyes: 'brain',
  Scalpel: 'scalpel',
  Heart: 'heart',
  Fork: 'fork',
  'Lightning Lever': 'lever',
  'Autopsy Report': 'autopsy',
}

export type NodeMeta = {
  type: NodeType
  themeName: string
  defaultTitle: string
  description: string
}

export const NODE_META: Record<NodeKind, NodeMeta> = {
  spark: {
    type: 'Spark',
    themeName: 'Spark',
    defaultTitle: 'On push',
    description: 'Starts a run on a push, or when you press Simulate push.',
  },
  brain: {
    type: 'Brain',
    themeName: 'Brain',
    defaultTitle: 'AI code review',
    description: 'An AI agent reads the diff with read-only tools and suggests fixes.',
  },
  scalpel: {
    type: 'Scalpel',
    themeName: 'Scalpel',
    defaultTitle: 'Run lint',
    description: 'Runs the linter in the sandbox.',
  },
  heart: {
    type: 'Heart',
    themeName: 'Heart',
    defaultTitle: 'Run tests',
    description: 'Runs the test suite in the sandbox.',
  },
  fork: {
    type: 'Fork',
    themeName: 'Fork',
    defaultTitle: 'Pass or fail',
    description: 'Takes the Passed branch when every check before it passed, otherwise Failed.',
  },
  lever: {
    type: 'Lightning Lever',
    themeName: 'Lightning Lever',
    defaultTitle: 'Human approval',
    description: 'Pauses the run until you approve or reject.',
  },
  autopsy: {
    type: 'Autopsy Report',
    themeName: 'Autopsy',
    defaultTitle: 'Report',
    description: 'Writes the Autopsy report with every finding and result.',
  },
}

/** Order in the node picker. */
export const PICKER_KINDS: readonly NodeKind[] = ['spark', 'brain', 'scalpel', 'heart', 'fork', 'lever', 'autopsy']

export const FORK_BRANCHES = ['passed', 'failed'] as const
export type ForkBranch = (typeof FORK_BRANCHES)[number]
export const BRANCH_LABEL: Record<ForkBranch, string> = { passed: 'Passed', failed: 'Failed' }

export function operationFor(type: NodeType, config: NodeConfig): string {
  const c = config as Record<string, unknown>
  switch (type) {
    case 'Spark':
      return c.triggerType === 'github_push' ? 'on push' : 'manual'
    case 'Brain':
      return 'analyze diff'
    case 'Eyes':
      return 'scan code'
    case 'Scalpel':
    case 'Heart':
      return typeof c.command === 'string' ? c.command : 'no command'
    case 'Fork':
      return 'passed or failed'
    case 'Lightning Lever':
      return 'wait for you'
    case 'Autopsy Report':
      return c.format === 'json' ? 'JSON report' : 'markdown report'
  }
}

/** React Flow node data in the editor: display fields plus the stored type and config. */
export type EditorNodeData = FlowNodeData & {
  type: NodeType
  config: NodeConfig
  customTitle?: string
}
export type EditorNode = Node<EditorNodeData, 'flow'>

export function nodeData(
  type: NodeType,
  config: NodeConfig,
  customTitle?: string,
  status: NodeStatus = 'idle',
): EditorNodeData {
  const kind = KIND_BY_TYPE[type]
  const meta = NODE_META[kind]
  return {
    kind,
    type,
    config,
    customTitle,
    title: customTitle?.trim() || meta.defaultTitle,
    themeName: type === 'Eyes' ? 'Eyes' : meta.themeName,
    operation: operationFor(type, config),
    status,
  }
}

export function toEditorNode(node: GraphNode, status: NodeStatus = 'idle'): EditorNode {
  const data = nodeData(node.type, node.config, node.title, status)
  return { id: node.id, type: 'flow', position: node.position, data, ariaLabel: nodeAriaLabel(data) }
}

export function toEditorEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
  }
}

/** Back to the stored shape (mirrors shared WorkflowData). */
export function toGraph(nodes: EditorNode[], edges: Edge[]): WorkflowGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.type,
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      config: n.data.config,
      ...(n.data.customTitle?.trim() ? { title: n.data.customTitle.trim() } : {}),
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.sourceHandle ? { sourceHandle: e.sourceHandle, label: e.sourceHandle } : {}),
    })),
  }
}

export function nodeTitle(node: GraphNode): string {
  return node.title?.trim() || NODE_META[KIND_BY_TYPE[node.type]].defaultTitle
}
