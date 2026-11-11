'use client'

import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type DefaultEdgeOptions,
  type Edge,
  type FitViewOptions,
  type NodeTypes,
  type ProOptions,
} from '@xyflow/react'
import { FitOnResize } from '@/components/flow/FitOnResize'
import { FlowNode } from '@/components/flow/FlowNode'
import type { FlowNodeType } from '@/lib/workflow/types'

// Defined at module level so React Flow does not re-register types each render.
const NODE_TYPES: NodeTypes = { flow: FlowNode }

// Bezier edges. Full idle/active/done styling arrives with the custom edge in task 5.
const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = { type: 'default' }

// React Flow is MIT licensed; hiding the attribution is allowed.
const PRO_OPTIONS: ProOptions = { hideAttribution: true }

// fitView measures only the 80x80 boxes; 0.2 padding leaves room for the labels.
// minZoom is low enough that the whole graph fits a 390px-wide card.
const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.2, minZoom: 0.25, maxZoom: 1.25 }

interface CanvasProps {
  initialNodes: FlowNodeType[]
  initialEdges: Edge[]
}

export function Canvas({ initialNodes, initialEdges }: CanvasProps) {
  const [nodes, , onNodesChange] = useNodesState<FlowNodeType>(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges)

  return (
    <ReactFlow<FlowNodeType, Edge>
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodesConnectable={false}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      minZoom={0.25}
      maxZoom={1.75}
      proOptions={PRO_OPTIONS}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--dot)" />
      <FitOnResize options={FIT_VIEW_OPTIONS} />
    </ReactFlow>
  )
}
