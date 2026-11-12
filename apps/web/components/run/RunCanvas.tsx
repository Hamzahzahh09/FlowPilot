'use client'

import type { Edge } from '@xyflow/react'
import { useMemo } from 'react'
import { Canvas } from '@/components/flow/Canvas'
import type { Run } from '@/lib/data/types'
import type { RunView } from '@/lib/run/reduce'
import { toEditorEdge, toEditorNode } from '@/lib/workflow/graph'

const EDGE_CLASS = { idle: undefined, active: 'stitch-active', done: 'stitch-done' } as const

// Canvas fed by the run reducer. Node and edge arrays only change when a
// status changes, not on every clock tick.
export function RunCanvas({ run, view }: { run: Run; view: RunView }) {
  const statusKey = JSON.stringify(view.nodeStatus)
  const edgeKey = JSON.stringify(view.edgeState)

  const nodes = useMemo(
    () => run.graph.nodes.map((n) => toEditorNode(n, view.nodeStatus[n.id] ?? 'idle')),
    // The keys stand in for view.nodeStatus / view.edgeState, which are new objects on every reduce.
    [run.graph, statusKey],
  )
  const edges = useMemo(
    (): Edge[] =>
      run.graph.edges.map((e) => ({ ...toEditorEdge(e), className: EDGE_CLASS[view.edgeState[e.id] ?? 'idle'] })),
    [run.graph, edgeKey],
  )

  return <Canvas nodes={nodes} edges={edges} mode="view" />
}
