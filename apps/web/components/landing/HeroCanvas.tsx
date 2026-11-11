'use client'

import type { Edge } from '@xyflow/react'
import { Canvas } from '@/components/flow/Canvas'
import { DEMO_EDGES, DEMO_NODES } from '@/lib/workflow/demo'
import type { FlowNodeType } from '@/lib/workflow/types'
import styles from './Hero.module.css'

// Every stitch loops the "running" dash. globals.css stops it under reduced motion.
const HERO_EDGES: Edge[] = DEMO_EDGES.map((edge) => ({
  ...edge,
  className: 'stitch-active',
  focusable: false,
  selectable: false,
}))

// Per-node flags as well as the Canvas props: the server render uses React
// Flow's store defaults, so without these the first paint has tab stops.
const HERO_NODES: FlowNodeType[] = DEMO_NODES.map((node) => ({
  ...node,
  focusable: false,
  selectable: false,
  draggable: false,
  connectable: false,
}))

const DESCRIPTION =
  'Demo workflow: on push, AI code review, then lint and tests in parallel, ' +
  'then human approval, then the report.'

export function HeroCanvas() {
  return (
    <div className={styles.canvasCard} role="img" aria-label={DESCRIPTION}>
      <Canvas initialNodes={HERO_NODES} initialEdges={HERO_EDGES} readOnly />
    </div>
  )
}
