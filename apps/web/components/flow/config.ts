import type { DefaultEdgeOptions, FitViewOptions, NodeTypes, ProOptions } from '@xyflow/react'
import { FlowNode } from './FlowNode'

// Module-level constants so React Flow does not re-register them each render.
export const NODE_TYPES: NodeTypes = { flow: FlowNode }

// Bezier edges. Run states come from edge classNames (stitch-active, stitch-done).
export const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = { type: 'default' }

// React Flow is MIT licensed; hiding the attribution is allowed.
export const PRO_OPTIONS: ProOptions = { hideAttribution: true }

// fitView measures only the 80x80 boxes; 0.2 padding leaves room for the labels.
export const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.2, minZoom: 0.25, maxZoom: 1.25 }
