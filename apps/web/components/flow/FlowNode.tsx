'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  HAS_INPUT,
  HAS_OUTPUT,
  STATUS_LABEL,
  nodeSubtitle,
  type FlowNodeType,
} from '@/lib/workflow/types'
import { NODE_ICONS } from './nodeIcons'
import styles from './FlowNode.module.css'

// 80x80 box with only an icon; label sits below the box (outside the measured
// node) so handles stay centered on the box. Fork has two outputs.
function FlowNodeComponent({ data, selected }: NodeProps<FlowNodeType>) {
  const Icon = NODE_ICONS[data.kind]
  const statusLabel = STATUS_LABEL[data.status]

  return (
    <div className={styles.node} data-status={data.status} data-selected={selected || undefined}>
      {HAS_INPUT[data.kind] && (
        <Handle type="target" position={Position.Left} className={styles.handle} />
      )}

      <div className={styles.box}>
        <Icon size={30} />
      </div>

      {data.kind === 'fork' ? (
        <>
          <Handle
            type="source"
            id="passed"
            position={Position.Right}
            className={styles.handle}
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            id="failed"
            position={Position.Right}
            className={styles.handle}
            style={{ top: '70%' }}
          />
          <span className={`${styles.branch} ${styles.branchPassed}`} aria-hidden="true">
            Passed
          </span>
          <span className={`${styles.branch} ${styles.branchFailed}`} aria-hidden="true">
            Failed
          </span>
        </>
      ) : (
        HAS_OUTPUT[data.kind] && (
          <Handle type="source" position={Position.Right} className={styles.handle} />
        )
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
