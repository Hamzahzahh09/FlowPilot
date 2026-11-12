'use client'

import { useEffect } from 'react'
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
} from '@xyflow/react'
import { FitOnResize } from '@/components/flow/FitOnResize'
import type { FlowNodeType } from '@/lib/workflow/types'
import { DEFAULT_EDGE_OPTIONS, FIT_VIEW_OPTIONS, NODE_TYPES, PRO_OPTIONS } from './config'

interface CanvasProps {
  nodes: FlowNodeType[]
  edges: Edge[]
  /**
   * static: a picture (landing hero). No pan, zoom or focus; page scroll passes through.
   * view: run view. Pan, zoom and focusable nodes, but no editing.
   */
  mode?: 'static' | 'view'
}

// Read-only canvas. Editing lives in components/editor.
export function Canvas({ nodes: sourceNodes, edges: sourceEdges, mode = 'view' }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>(sourceNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(sourceEdges)
  const view = mode === 'view'

  // Copy new data onto the existing node objects so React Flow keeps the
  // measured sizes (replacing nodes would hide and re-measure them).
  useEffect(() => {
    setNodes((prev) => {
      const byId = new Map(prev.map((node) => [node.id, node]))
      return sourceNodes.map((node) => {
        const existing = byId.get(node.id)
        return existing ? { ...existing, data: node.data, ariaLabel: node.ariaLabel } : node
      })
    })
  }, [sourceNodes, setNodes])

  useEffect(() => {
    setEdges(sourceEdges)
  }, [sourceEdges, setEdges])

  return (
    <ReactFlow<FlowNodeType, Edge>
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={NODE_TYPES}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable={false}
      nodesFocusable={view}
      edgesFocusable={false}
      panOnDrag={view}
      panOnScroll={false}
      zoomOnScroll={view}
      zoomOnPinch={view}
      zoomOnDoubleClick={view}
      preventScrolling={view}
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
