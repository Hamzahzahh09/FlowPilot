'use client'

import { memo, type ComponentType } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  BrainIcon,
  HeartIcon,
  LeverIcon,
  ReportIcon,
  ScalpelIcon,
  SparkIcon,
  type IconProps,
} from '@/components/icons'
import {
  HAS_INPUT,
  HAS_OUTPUT,
  STATUS_LABEL,
  nodeSubtitle,
  type FlowNodeType,
  type NodeKind,
} from '@/lib/workflow/types'
import styles from './FlowNode.module.css'

const ICONS: Record<NodeKind, ComponentType<IconProps>> = {
  spark: SparkIcon,
  brain: BrainIcon,
  scalpel: ScalpelIcon,
  heart: HeartIcon,
  lever: LeverIcon,
  autopsy: ReportIcon,
}

// 80x80 box with only an icon; label sits below the box (outside the measured
// node) so handles stay centered on the box.
function FlowNodeComponent({ data, selected }: NodeProps<FlowNodeType>) {
  const Icon = ICONS[data.kind]
  const statusLabel = STATUS_LABEL[data.status]

  return (
    <div className={styles.node} data-status={data.status} data-selected={selected || undefined}>
      {HAS_INPUT[data.kind] && (
        <Handle type="target" position={Position.Left} className={styles.handle} />
      )}

      <div className={styles.box}>
        <Icon size={30} />
      </div>

      {HAS_OUTPUT[data.kind] && (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}

      <div className={styles.label}>
        <span className={styles.title}>{data.title}</span>
        <span className={styles.operation}>{nodeSubtitle(data)}</span>
        {data.status !== 'idle' && (
          <span className={styles.status} aria-hidden="true">
            {statusLabel}
          </span>
        )}
        <span className="sr-only">Status: {statusLabel}</span>
      </div>
    </div>
  )
}

export const FlowNode = memo(FlowNodeComponent)
