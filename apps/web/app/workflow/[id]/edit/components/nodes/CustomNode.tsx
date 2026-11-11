import React from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { NodeType } from 'shared'
import { NODE_METADATA, getNodeTitle, getNodeLayer } from '../nodeInfo'

export type NodeRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting'

export interface CustomNodeData extends Record<string, unknown> {
  type: NodeType
  config: unknown
  isUnconnected?: boolean
  contextVariant?: 'passed' | 'failed'
  runStatus?: NodeRunStatus
}

export type CustomNodeType = Node<CustomNodeData>

// Which handles each node type exposes
const NODE_HANDLES: Record<NodeType, { input: boolean; output: 'single' | 'branch' | 'none' }> = {
  Spark: { input: false, output: 'single' },
  Brain: { input: true, output: 'single' },
  Eyes: { input: true, output: 'single' },
  Scalpel: { input: true, output: 'single' },
  Heart: { input: true, output: 'single' },
  Fork: { input: true, output: 'branch' },
  'Lightning Lever': { input: true, output: 'branch' },
  'Autopsy Report': { input: true, output: 'none' },
}

const BRANCH_HANDLES: Partial<
  Record<NodeType, { id: string; label: string; tone: 'pass' | 'fail' }[]>
> = {
  Fork: [
    { id: 'passed', label: 'Pass', tone: 'pass' },
    { id: 'failed', label: 'Fail', tone: 'fail' },
  ],
  'Lightning Lever': [
    { id: 'approve', label: 'Approve', tone: 'pass' },
    { id: 'reject', label: 'Reject', tone: 'fail' },
  ],
}

// Status never relies on color alone: every state has an icon and a text label
const STATUS_CHIP: Record<NodeRunStatus, { icon: string; label: string; className: string }> = {
  pending: { icon: '○', label: 'Queued', className: 'fp-chip--pending' },
  running: { icon: '◐', label: 'Running', className: 'fp-chip--running' },
  completed: { icon: '✓', label: 'Done', className: 'fp-chip--done' },
  failed: { icon: '✗', label: 'Failed', className: 'fp-chip--failed' },
  awaiting: { icon: '⏸', label: 'Awaiting approval', className: 'fp-chip--running' },
}

export default function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
  const nodeType = data.type
  const meta = NODE_METADATA[nodeType]
  const layer = getNodeLayer(nodeType)
  const title = getNodeTitle(nodeType, data.contextVariant)
  const handles = NODE_HANDLES[nodeType]
  const config = (data.config ?? {}) as Record<string, unknown>
  const status = data.runStatus
  const branches = BRANCH_HANDLES[nodeType] ?? []

  const classNames = [
    'fp-node',
    selected && 'fp-node--selected',
    data.isUnconnected && 'fp-node--unconnected',
    status && `fp-node--${status}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      style={{ ['--accent' as string]: layer.color }}
      aria-label={`${title} (${meta.subLabel})${status ? `, ${STATUS_CHIP[status].label}` : ''}`}
    >
      {data.isUnconnected && (
        <div className="fp-node__warning" title="This node is not connected to the workflow yet">
          ⚠ Not connected
        </div>
      )}

      {handles.input && (
        <Handle type="target" position={Position.Left} className="fp-handle fp-handle--in" />
      )}

      <div className="fp-node__header">
        <span className="fp-node__layer" title={layer.description}>
          {layer.label}
        </span>
        <span className="fp-node__theme">{meta.subLabel}</span>
      </div>

      <div className="fp-node__body">
        <div className="fp-node__icon" aria-hidden>
          {meta.icon}
        </div>
        <div className="fp-node__text">
          <div className="fp-node__title">{title}</div>
          <div className="fp-node__summary">{meta.summary(config)}</div>
        </div>
      </div>

      {status && (
        <div className={`fp-chip ${STATUS_CHIP[status].className}`}>
          <span aria-hidden>{STATUS_CHIP[status].icon}</span>
          {STATUS_CHIP[status].label}
        </div>
      )}

      {handles.output === 'single' && (
        <Handle type="source" position={Position.Right} className="fp-handle fp-handle--out" />
      )}

      {handles.output === 'branch' && (
        <div className="fp-node__branches">
          {branches.map((b) => (
            <div key={b.id} className={`fp-branch fp-branch--${b.tone}`}>
              <span>
                {b.tone === 'pass' ? '✓' : '✗'} {b.label}
              </span>
              <Handle
                type="source"
                id={b.id}
                position={Position.Right}
                className={`fp-handle fp-handle--${b.tone}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
