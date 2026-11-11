import React from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export interface StitchEdgeData extends Record<string, unknown> {
  tone?: 'pass' | 'fail' | 'neutral'
  branchLabel?: string
  /** The run is currently travelling along this stitch. */
  active?: boolean
  /** The run already went through this stitch. */
  traversed?: boolean
}

export type StitchEdgeType = Edge<StitchEdgeData, 'stitch'>

const TONE_COLOR: Record<NonNullable<StitchEdgeData['tone']>, string> = {
  pass: '#8bc34a',
  fail: '#c0504d',
  neutral: '#5d7a68',
}

/**
 * A "Stitch": the thread that sews two body parts (nodes) together.
 * Drawn as a solid thread with cross-stitch marks on top.
 */
export default function StitchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<StitchEdgeType>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const tone = data?.tone ?? 'neutral'
  const color = data?.active ? '#f5e663' : TONE_COLOR[tone]
  const classNames = [
    'fp-stitch',
    data?.active && 'fp-stitch--active',
    data?.traversed && 'fp-stitch--traversed',
    selected && 'fp-stitch--selected',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className={classNames}
        style={{ stroke: color }}
      />
      {/* Cross-stitch marks sewn over the thread */}
      <path d={path} className="fp-stitch__marks" style={{ stroke: color }} fill="none" />

      {data?.branchLabel && (
        <EdgeLabelRenderer>
          <div
            className={`fp-stitch__label fp-stitch__label--${tone}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {tone === 'pass' ? '✓' : tone === 'fail' ? '✗' : ''} {data.branchLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
