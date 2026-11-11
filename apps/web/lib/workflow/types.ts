import type { Node } from '@xyflow/react'

export const NODE_KINDS = ['spark', 'brain', 'scalpel', 'heart', 'lever', 'autopsy'] as const
export type NodeKind = (typeof NODE_KINDS)[number]

export const NODE_STATUSES = ['idle', 'running', 'ok', 'fail', 'wait'] as const
export type NodeStatus = (typeof NODE_STATUSES)[number]

/** Text label for every status, so status never relies on color alone. */
export const STATUS_LABEL: Record<NodeStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  ok: 'Passed',
  fail: 'Failed',
  wait: 'Waiting',
}

// Type alias (not interface) so it satisfies React Flow's Record<string, unknown> constraint.
export type FlowNodeData = {
  kind: NodeKind
  /** Line 1 under the box, plain English, e.g. "AI code review". */
  title: string
  /** Themed name shown on line 2, e.g. "Brain". */
  themeName: string
  /** Operation shown on line 2, e.g. "analyze diff" -> "Brain · analyze diff". */
  operation: string
  status: NodeStatus
}

export type FlowNodeType = Node<FlowNodeData, 'flow'>

/** Kinds without an input handle (triggers) or without an output handle (reports). */
export const HAS_INPUT: Record<NodeKind, boolean> = {
  spark: false,
  brain: true,
  scalpel: true,
  heart: true,
  lever: true,
  autopsy: true,
}

export const HAS_OUTPUT: Record<NodeKind, boolean> = {
  spark: true,
  brain: true,
  scalpel: true,
  heart: true,
  lever: true,
  autopsy: false,
}

export function nodeSubtitle(data: FlowNodeData): string {
  return `${data.themeName} · ${data.operation}`
}

export function nodeAriaLabel(data: FlowNodeData): string {
  return `${data.title}, ${data.themeName}, ${data.operation}, status ${STATUS_LABEL[data.status]}`
}
