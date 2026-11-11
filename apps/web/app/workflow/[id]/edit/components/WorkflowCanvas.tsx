'use client'

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node as ReactFlowNode,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react'
import type { NodeType, WorkflowData, ValidationResult, Node as WorkflowNode } from 'shared'
import { validateWorkflow, getDefaultConfig } from 'shared'
import CustomNode, { type NodeRunStatus } from './nodes/CustomNode'
import StitchEdge, { type StitchEdgeData } from './edges/StitchEdge'
import NodePalette from './NodePalette'
import ConfigPanel from './ConfigPanel'
import ValidationModal from './ValidationModal'
import { BRANCH_LABELS, NODE_METADATA, getNodeLayer, getNodeTitle } from './nodeInfo'
import { SAMPLE_WORKFLOW } from './sampleWorkflow'

interface WorkflowCanvasProps {
  workflowId: string
  initialData?: WorkflowData
}

/** Mirrors the run statuses from the tech steering doc (subset used by the simulator). */
type RunState = 'idle' | 'running' | 'awaiting_approval' | 'succeeded' | 'failed' | 'cancelled'

interface TimelineStep {
  id: string
  nodeId: string
  title: string
  detail: string
  status: NodeRunStatus
}

const HEADER_HEIGHT = 56
const STEP_DELAY_MS = 900

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function toFlowNodes(data: WorkflowData): ReactFlowNode[] {
  return data.nodes.map((node) => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: { type: node.type, config: node.config },
  }))
}

/** Simulated output for each node type. The real runner will replace this. */
const SIM_LOG: Record<NodeType, string> = {
  Spark: 'Received push to "main" (commit #f8a12c, 3 files changed).',
  Brain: 'Read 3 changed files with read-only tools. 1 suggestion: add a null check in cart.ts:42.',
  Eyes: 'Scanned 3 files: 0 leaked secrets, 0 critical vulnerabilities.',
  Scalpel: 'npm run lint finished: 0 errors, 0 warnings.',
  Heart: 'npm test finished: 12 passed, 0 failed (1.2 s).',
  Fork: 'All checks passed → following the Pass stitch.',
  'Lightning Lever': 'Waiting for a human to pull the lever…',
  'Autopsy Report': 'Report written: AI findings, lint, tests, and approval in one place.',
}

const RUN_STATE_BADGE: Record<RunState, { icon: string; label: string; color: string }> = {
  idle: { icon: '○', label: 'Idle', color: '#a8b5ac' },
  running: { icon: '◐', label: 'Running', color: '#f5e663' },
  awaiting_approval: { icon: '⏸', label: 'Awaiting approval', color: '#f5e663' },
  succeeded: { icon: '✓', label: 'Succeeded', color: '#8bc34a' },
  failed: { icon: '✗', label: 'Failed', color: '#e07a77' },
  cancelled: { icon: '■', label: 'Rejected', color: '#e07a77' },
}

export default function WorkflowCanvas({ workflowId, initialData }: WorkflowCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showIntroBanner, setShowIntroBanner] = useState(true)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)

  // Simulation state
  const [runState, setRunState] = useState<RunState>('idle')
  const [nodeStatus, setNodeStatus] = useState<Record<string, NodeRunStatus>>({})
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null)
  const [traversedEdgeIds, setTraversedEdgeIds] = useState<Set<string>>(new Set())
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([])
  const [showTimelinePanel, setShowTimelinePanel] = useState(false)
  const [showRawLogs, setShowRawLogs] = useState(false)
  const [rawLogs, setRawLogs] = useState<string[]>([])
  const approvalResolver = useRef<((approved: boolean) => void) | null>(null)

  const isBusy = runState === 'running' || runState === 'awaiting_approval'

  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), [])
  const edgeTypes: EdgeTypes = useMemo(() => ({ stitch: StitchEdge }), [])

  useEffect(() => {
    if (localStorage.getItem('flowpilot_hide_intro') === 'true') {
      setShowIntroBanner(false)
    }
  }, [])

  const handleCloseIntroBanner = () => {
    setShowIntroBanner(false)
    localStorage.setItem('flowpilot_hide_intro', 'true')
  }

  // Load initial workflow data, preferring a local backup if one exists
  useEffect(() => {
    let dataToLoad = initialData
    const saved = localStorage.getItem(`flowpilot_workflow_${workflowId}`)
    if (saved) {
      try {
        dataToLoad = JSON.parse(saved)
      } catch {
        // ignore a corrupt backup and fall back to initialData
      }
    }

    if (dataToLoad?.nodes && dataToLoad?.edges) {
      setNodes(toFlowNodes(dataToLoad))
      setEdges(dataToLoad.edges)
      setHasUnsavedChanges(false)
    }
  }, [initialData, workflowId, setNodes, setEdges])

  const fitSoon = useCallback(() => {
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2, duration: 400 }), 50)
  }, [reactFlowInstance])

  const markDirty = () => setHasUnsavedChanges(true)

  const handleLoadTemplate = useCallback(() => {
    setNodes(toFlowNodes(SAMPLE_WORKFLOW))
    setEdges(SAMPLE_WORKFLOW.edges)
    setHasUnsavedChanges(true)
    fitSoon()
  }, [setNodes, setEdges, fitSoon])

  const handleStartBlank = useCallback(() => {
    const startNode: ReactFlowNode = {
      id: generateUUID(),
      type: 'custom',
      position: { x: 120, y: 220 },
      data: { type: 'Spark', config: getDefaultConfig('Spark') },
    }
    setNodes([startNode])
    setEdges([])
    setSelectedNodeId(startNode.id)
    setHasUnsavedChanges(true)
  }, [setNodes, setEdges])

  // Auto-layout: place nodes in columns by their distance from the Spark
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return

    const childrenMap: Record<string, string[]> = {}
    const inDegree: Record<string, number> = {}
    nodes.forEach((n) => {
      childrenMap[n.id] = []
      inDegree[n.id] = 0
    })
    edges.forEach((e) => {
      childrenMap[e.source]?.push(e.target)
      inDegree[e.target] = (inDegree[e.target] || 0) + 1
    })

    const layerMap: Record<string, number> = {}
    const queue: string[] = []
    nodes.forEach((n) => {
      if ((inDegree[n.id] || 0) === 0 || n.data.type === 'Spark') {
        layerMap[n.id] = 0
        queue.push(n.id)
      }
    })
    if (queue.length === 0) {
      layerMap[nodes[0].id] = 0
      queue.push(nodes[0].id)
    }

    // Guard against cycles: a node can't be deeper than the node count
    const maxLayer = nodes.length
    while (queue.length > 0) {
      const current = queue.shift()!
      const nextLayer = (layerMap[current] || 0) + 1
      if (nextLayer > maxLayer) continue
      for (const child of childrenMap[current] || []) {
        if (layerMap[child] === undefined || layerMap[child] < nextLayer) {
          layerMap[child] = nextLayer
          queue.push(child)
        }
      }
    }

    const buckets: Record<number, string[]> = {}
    nodes.forEach((n) => {
      const l = layerMap[n.id] ?? 0
      ;(buckets[l] ||= []).push(n.id)
    })

    setNodes(
      nodes.map((n) => {
        const l = layerMap[n.id] ?? 0
        const bucket = buckets[l]
        const idx = bucket.indexOf(n.id)
        const y = 200 + (idx - (bucket.length - 1) / 2) * 200
        return { ...n, position: { x: 40 + l * 270, y } }
      })
    )
    setHasUnsavedChanges(true)
    fitSoon()
  }, [nodes, edges, setNodes, fitSoon])

  const onConnect = useCallback(
    (connection: Connection) => {
      const branch = connection.sourceHandle ? BRANCH_LABELS[connection.sourceHandle] : undefined
      setEdges((eds) => addEdge({ ...connection, label: branch?.label }, eds))
      markDirty()
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: ReactFlowNode) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  const handleUpdateConfig = useCallback(
    (nodeId: string, newConfig: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n))
      )
      markDirty()
    },
    [setNodes]
  )

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      if (selectedNodeId === nodeId) setSelectedNodeId(null)
      markDirty()
    },
    [selectedNodeId, setNodes, setEdges]
  )

  const addNodeAt = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const newNode: ReactFlowNode = {
        id: generateUUID(),
        type: 'custom',
        position,
        data: { type, config: getDefaultConfig(type) },
      }
      setNodes((nds) => nds.concat(newNode))
      setSelectedNodeId(newNode.id)
      markDirty()
    },
    [setNodes]
  )

  const handleAddNodeFromPalette = useCallback(
    (type: NodeType) => {
      // Drop the node near the middle of the visible canvas
      const center = reactFlowInstance?.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      const jitter = (nodes.length % 5) * 24
      addNodeAt(type, {
        x: (center?.x ?? 240) - 110 + jitter,
        y: (center?.y ?? 160) - 40 + jitter,
      })
    },
    [reactFlowInstance, nodes.length, addNodeAt]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type || !reactFlowInstance || !NODE_METADATA[type]) return
      addNodeAt(type, reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY }))
    },
    [reactFlowInstance, addNodeAt]
  )

  const toWorkflowData = useCallback(
    (): WorkflowData => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type as NodeType,
        position: n.position,
        config: (n.data.config ?? {}) as WorkflowNode['config'],
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        label: e.sourceHandle ? BRANCH_LABELS[e.sourceHandle]?.label : undefined,
      })),
    }),
    [nodes, edges]
  )

  const handleSave = useCallback(async () => {
    const workflowData = toWorkflowData()
    try {
      localStorage.setItem(`flowpilot_workflow_${workflowId}`, JSON.stringify(workflowData))
      try {
        await fetch(`/api/workflows/${workflowId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: workflowId, name: `Workflow ${workflowId}`, data: workflowData }),
        })
      } catch {
        // Server unavailable: the local backup above is enough for the demo
      }
      setHasUnsavedChanges(false)
      setSaveStatus('✓ Saved')
      setTimeout(() => setSaveStatus(null), 2500)
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus('✗ Save failed')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }, [toWorkflowData, workflowId])

  const handleValidate = useCallback(() => {
    const res = validateWorkflow(toWorkflowData())
    setValidationResult(res)
    setIsValidationModalOpen(true)
    return res
  }, [toWorkflowData])

  const log = (message: string) =>
    setRawLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])

  const resolveApproval = (approved: boolean) => {
    approvalResolver.current?.(approved)
    approvalResolver.current = null
  }

  /**
   * Walks the graph from the Spark like the real engine will:
   * one node at a time, following stitches, pausing at the Lightning Lever.
   */
  const handleSimulate = useCallback(async () => {
    if (isBusy) return
    const validation = validateWorkflow(toWorkflowData())
    if (!validation.valid) {
      setValidationResult(validation)
      setIsValidationModalOpen(true)
      return
    }

    const spark = nodes.find((n) => n.data.type === 'Spark')
    if (!spark) return

    const outgoing = (id: string) => edges.filter((e) => e.source === id)
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

    setNodeStatus(Object.fromEntries(nodes.map((n) => [n.id, 'pending' as NodeRunStatus])))
    setTraversedEdgeIds(new Set())
    setActiveEdgeId(null)
    setTimelineSteps([])
    setRawLogs([])
    setShowTimelinePanel(true)
    setShowRawLogs(false)
    setRunState('running')
    log('Run queued → running')

    const queue: string[] = [spark.id]
    const visited = new Set<string>()
    let finalState: RunState = 'succeeded'

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      if (visited.has(nodeId)) continue
      visited.add(nodeId)

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) continue
      const type = node.data.type as NodeType
      const stepId = generateUUID()
      const title = `${NODE_METADATA[type].icon} ${getNodeTitle(type)}`

      setNodeStatus((s) => ({ ...s, [nodeId]: 'running' }))
      setTimelineSteps((prev) => [
        ...prev,
        { id: stepId, nodeId, title, detail: 'Working…', status: 'running' },
      ])
      const updateStep = (patch: Partial<TimelineStep>) =>
        setTimelineSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s)))

      await wait(STEP_DELAY_MS)

      let nextEdges = outgoing(nodeId)

      if (type === 'Lightning Lever') {
        setNodeStatus((s) => ({ ...s, [nodeId]: 'awaiting' }))
        updateStep({ status: 'awaiting', detail: SIM_LOG[type] })
        setRunState('awaiting_approval')
        log('Lightning Lever: run paused, awaiting approval')

        const approved = await new Promise<boolean>((resolve) => {
          approvalResolver.current = resolve
        })

        setRunState('running')
        const decision = approved ? 'Approved' : 'Rejected'
        log(`Lightning Lever: ${decision} by you`)
        setNodeStatus((s) => ({ ...s, [nodeId]: approved ? 'completed' : 'failed' }))
        updateStep({ status: approved ? 'completed' : 'failed', detail: `${decision} by you.` })
        nextEdges = nextEdges.filter((e) => e.sourceHandle === (approved ? 'approve' : 'reject'))
        if (!approved && nextEdges.length === 0) finalState = 'cancelled'
      } else {
        if (type === 'Fork') {
          nextEdges = nextEdges.filter((e) => e.sourceHandle === 'passed')
        }
        log(`${NODE_METADATA[type].subLabel}: ${SIM_LOG[type]}`)
        setNodeStatus((s) => ({ ...s, [nodeId]: 'completed' }))
        updateStep({ status: 'completed', detail: SIM_LOG[type] })
      }

      // Animate the run travelling along each outgoing stitch
      for (const e of nextEdges) {
        setActiveEdgeId(e.id)
        await wait(STEP_DELAY_MS / 2)
        setTraversedEdgeIds((prev) => new Set(prev).add(e.id))
        queue.push(e.target)
      }
      setActiveEdgeId(null)
    }

    // Nodes the run never reached go back to no status
    setNodeStatus((s) =>
      Object.fromEntries(Object.entries(s).filter(([, status]) => status !== 'pending'))
    )
    setRunState(finalState)
    log(
      finalState === 'succeeded'
        ? 'Run succeeded. Autopsy Report is ready.'
        : 'Run stopped: the change was rejected at the Lightning Lever.'
    )
  }, [isBusy, nodes, edges, toWorkflowData])

  const handleResetRun = () => {
    if (isBusy) return
    setRunState('idle')
    setNodeStatus({})
    setTraversedEdgeIds(new Set())
    setShowTimelinePanel(false)
  }

  // Decorate nodes with connection warnings, report variant, and run status
  const processedNodes = useMemo(() => {
    const inDeg: Record<string, number> = {}
    const outDeg: Record<string, number> = {}
    const incomingHandle: Record<string, string | null | undefined> = {}
    edges.forEach((e) => {
      inDeg[e.target] = (inDeg[e.target] || 0) + 1
      outDeg[e.source] = (outDeg[e.source] || 0) + 1
      incomingHandle[e.target] = e.sourceHandle
    })

    return nodes.map((n) => {
      const type = n.data.type as NodeType
      const incoming = inDeg[n.id] || 0
      const out = outDeg[n.id] || 0
      const isUnconnected =
        type === 'Spark' ? out === 0 : type === 'Autopsy Report' ? incoming === 0 : incoming === 0 || out === 0

      let contextVariant: 'passed' | 'failed' | undefined
      if (type === 'Autopsy Report') {
        const h = incomingHandle[n.id]
        if (h === 'failed' || h === 'reject') contextVariant = 'failed'
        else if (h === 'passed' || h === 'approve') contextVariant = 'passed'
      }

      return {
        ...n,
        data: { ...n.data, isUnconnected, contextVariant, runStatus: nodeStatus[n.id] },
      }
    })
  }, [nodes, edges, nodeStatus])

  // Every edge is drawn as a Stitch, colored by branch and run progress
  const processedEdges = useMemo(() => {
    return edges.map((e): Edge<StitchEdgeData> => {
      const branch = e.sourceHandle ? BRANCH_LABELS[e.sourceHandle] : undefined
      const active = e.id === activeEdgeId
      const color = active ? '#f5e663' : branch?.tone === 'pass' ? '#8bc34a' : branch?.tone === 'fail' ? '#c0504d' : '#5d7a68'
      return {
        ...e,
        type: 'stitch',
        label: undefined,
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
        data: {
          tone: branch?.tone ?? 'neutral',
          branchLabel: branch?.label,
          active,
          traversed: traversedEdgeIds.has(e.id),
        },
      }
    })
  }, [edges, activeEdgeId, traversedEdgeIds])

  const runBadge = RUN_STATE_BADGE[runState]
  const rightInset = selectedNode ? 372 : 16

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top toolbar */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/" style={logoStyle} title="Back to the FlowPilot overview">
            ⚡ FlowPilot
          </a>
          <span style={{ color: '#4a6354' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            {workflowId === 'demo' ? 'Sample: AI code review' : workflowId === 'new' ? 'New workflow' : `Workflow ${workflowId}`}
          </span>

          <span
            style={{
              ...pillStyle,
              color: hasUnsavedChanges ? '#f5e663' : '#8bc34a',
              borderColor: hasUnsavedChanges ? 'rgba(245,230,99,0.35)' : 'rgba(139,195,74,0.35)',
            }}
          >
            {hasUnsavedChanges ? '● Unsaved changes' : '✓ Saved'}
          </span>

          <span style={{ ...pillStyle, color: runBadge.color, borderColor: '#24332a' }} aria-live="polite">
            {runBadge.icon} Run: {runBadge.label}
          </span>

          {!showIntroBanner && (
            <button onClick={() => setShowIntroBanner(true)} style={linkButtonStyle}>
              ? How it works
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleAutoLayout} className="fp-btn" title="Arrange nodes left to right">
            ⇢ Auto-arrange
          </button>
          <button onClick={handleValidate} className="fp-btn" title="Check that the workflow is complete">
            ✓ Check workflow
          </button>
          <button onClick={handleSave} className="fp-btn" title="Save this workflow">
            {saveStatus ?? '💾 Save'}
          </button>
          <button
            onClick={handleSimulate}
            disabled={isBusy}
            className="fp-btn fp-btn--primary"
            title="Simulate a GitHub push and run the workflow"
          >
            {isBusy ? '◐ Running…' : '▶ Simulate push'}
          </button>
        </div>
      </header>

      {/* Intro banner */}
      {showIntroBanner && nodes.length > 0 && (
        <div style={{ ...introStyle, right: rightInset }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f5e663', marginBottom: '3px' }}>
                Welcome to the lab
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#e6ede8' }}>
                Each box is a step in your code-check pipeline. The colored stripe shows who does
                the work: <b style={{ color: getNodeLayer('Brain').color }}>AI agent</b>,{' '}
                <b style={{ color: getNodeLayer('Heart').color }}>sandbox runner</b>, or{' '}
                <b style={{ color: getNodeLayer('Lightning Lever').color }}>you</b>. The lines
                between them are stitches that carry the run forward.
              </p>
            </div>
            <button onClick={handleCloseIntroBanner} style={closeButtonStyle} title="Hide this guide">
              ✕
            </button>
          </div>
          <div style={introStepsStyle}>
            <span><b style={stepNum}>1</b> Drag a node from the left panel</span>
            <span><b style={stepNum}>2</b> Drag from a right-side dot to stitch it to the next node</span>
            <span><b style={stepNum}>3</b> Press <b>Simulate push</b> and watch the run</span>
          </div>
        </div>
      )}

      <NodePalette onAddNode={handleAddNodeFromPalette} />

      <div style={{ width: '100%', height: '100%', paddingTop: HEADER_HEIGHT }}>
        <ReactFlow
          nodes={processedNodes}
          edges={processedEdges}
          onNodesChange={(changes) => {
            onNodesChange(changes)
            if (changes.some((c) => c.type === 'position' && c.dragging)) markDirty()
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes)
            if (changes.some((c) => c.type === 'remove')) markDirty()
          }}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'stitch' }}
          connectionLineStyle={{ stroke: '#f5e663', strokeWidth: 2, strokeDasharray: '6 4' }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.3}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#24332a" gap={22} size={1.5} />
          <Controls style={{ left: 304, bottom: 16 }} showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => getNodeLayer((n.data as { type: NodeType }).type).color}
            nodeStrokeWidth={0}
            nodeBorderRadius={4}
            maskColor="rgba(11, 15, 12, 0.8)"
            style={{
              background: '#141b16',
              right: rightInset,
              bottom: showTimelinePanel ? 300 : 16,
            }}
          />
        </ReactFlow>
      </div>

      {/* Empty canvas */}
      {nodes.length === 0 && (
        <div style={emptyWrapStyle}>
          <div style={emptyCardStyle}>
            <div style={{ fontSize: '30px' }}>🧪</div>
            <h3 style={{ fontSize: '19px', fontWeight: 800 }}>The operating table is empty</h3>
            <p style={{ fontSize: '13px', color: '#a8b5ac', lineHeight: 1.55 }}>
              Start from the sample pipeline (push → AI review → lint → tests → approval →
              report), or build your own from a single Spark.
            </p>
            <button onClick={handleLoadTemplate} className="fp-btn fp-btn--primary fp-btn--lg">
              ⚡ Use the sample workflow
            </button>
            <button onClick={handleStartBlank} style={linkButtonStyle}>
              or start with just a Spark
            </button>
          </div>
        </div>
      )}

      <ConfigPanel
        selectedNode={selectedNode}
        onUpdateConfig={handleUpdateConfig}
        onDeleteNode={handleDeleteNode}
        onClose={() => setSelectedNodeId(null)}
      />

      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        result={validationResult}
        onSimulate={handleSimulate}
      />

      {/* Run panel */}
      {showTimelinePanel && (
        <section style={{ ...runPanelStyle, right: rightInset }} aria-label="Run progress">
          <div style={runPanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800 }}>Run</span>
              <span style={{ ...pillStyle, color: runBadge.color, borderColor: '#24332a' }}>
                {runBadge.icon} {runBadge.label}
              </span>
              <span style={{ fontSize: '11px', color: '#7d8c82' }}>
                commit #f8a12c on main · sandbox runner
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setShowRawLogs((v) => !v)} style={linkButtonStyle}>
                {showRawLogs ? 'Show steps' : 'Show raw log'}
              </button>
              <button
                onClick={handleResetRun}
                disabled={isBusy}
                style={closeButtonStyle}
                title={isBusy ? 'Wait for the run to finish' : 'Close and clear run'}
              >
                ✕
              </button>
            </div>
          </div>

          {runState === 'awaiting_approval' && (
            <div style={leverStyle} role="alert">
              <div>
                <div style={{ fontWeight: 800, color: '#f5e663', fontSize: '13px' }}>
                  🎚️ Lightning Lever: your decision
                </div>
                <div style={{ fontSize: '12px', color: '#e6ede8', marginTop: '2px' }}>
                  AI review, lint, and tests are done. Nothing continues until you decide.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => resolveApproval(false)} className="fp-btn" style={{ color: '#e07a77', borderColor: '#c0504d' }}>
                  ✗ Reject
                </button>
                <button onClick={() => resolveApproval(true)} className="fp-btn fp-btn--primary">
                  ✓ Approve
                </button>
              </div>
            </div>
          )}

          {!showRawLogs ? (
            <ol style={{ listStyle: 'none', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {timelineSteps.map((step) => (
                <li key={step.id} style={timelineItemStyle(step.status)}>
                  <span style={{ width: 70, flexShrink: 0, fontSize: '11px', fontWeight: 700, color: STEP_COLOR[step.status] }}>
                    {STEP_LABEL[step.status]}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, width: 190, flexShrink: 0 }}>{step.title}</span>
                  <span style={{ fontSize: '12px', color: '#a8b5ac', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {step.detail}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <pre style={rawLogStyle}>{rawLogs.join('\n')}</pre>
          )}
        </section>
      )}
    </div>
  )
}

const STEP_LABEL: Record<NodeRunStatus, string> = {
  pending: '○ Queued',
  running: '◐ Running',
  completed: '✓ Done',
  failed: '✗ Stopped',
  awaiting: '⏸ Waiting',
}

const STEP_COLOR: Record<NodeRunStatus, string> = {
  pending: '#a8b5ac',
  running: '#f5e663',
  completed: '#8bc34a',
  failed: '#e07a77',
  awaiting: '#f5e663',
}

const timelineItemStyle = (status: NodeRunStatus): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '7px 10px',
  borderRadius: '6px',
  background: status === 'running' || status === 'awaiting' ? 'rgba(245, 230, 99, 0.07)' : '#141b16',
  border: `1px solid ${status === 'running' || status === 'awaiting' ? 'rgba(245,230,99,0.5)' : '#1f2d23'}`,
  minWidth: 0,
})

const headerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: HEADER_HEIGHT,
  zIndex: 30,
  padding: '0 16px',
  background: 'rgba(16, 22, 18, 0.96)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #24332a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const logoStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#f5e663',
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '-0.3px',
}

const pillStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 9px',
  borderRadius: '999px',
  border: '1px solid',
  background: 'rgba(11, 15, 12, 0.6)',
}

const linkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#a8b5ac',
  cursor: 'pointer',
  fontSize: '12px',
  textDecoration: 'underline',
}

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#a8b5ac',
  cursor: 'pointer',
  fontSize: '15px',
  lineHeight: 1,
  padding: '2px 4px',
}

const introStyle: React.CSSProperties = {
  position: 'absolute',
  top: HEADER_HEIGHT + 10,
  left: 308,
  zIndex: 15,
  background: 'rgba(20, 27, 22, 0.96)',
  border: '1px solid #4a6354',
  borderRadius: '10px',
  padding: '12px 16px',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const introStepsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 20px',
  paddingTop: '8px',
  borderTop: '1px solid #24332a',
  fontSize: '12px',
  color: '#a8b5ac',
}

const stepNum: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  marginRight: 4,
  borderRadius: '50%',
  border: '1px solid #4a6354',
  color: '#f5e663',
  fontSize: '10px',
}

const emptyWrapStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  top: HEADER_HEIGHT,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
}

const emptyCardStyle: React.CSSProperties = {
  background: 'rgba(20, 27, 22, 0.97)',
  border: '1px solid #4a6354',
  borderRadius: '14px',
  padding: '30px 34px',
  maxWidth: '440px',
  textAlign: 'center',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
}

const runPanelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 308,
  maxHeight: 280,
  zIndex: 25,
  background: 'rgba(11, 15, 12, 0.97)',
  border: '1px solid #4a6354',
  borderRadius: '10px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
}

const runPanelHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '8px',
  borderBottom: '1px solid #1f2d23',
}

const leverStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #f5e663',
  background: 'rgba(245, 230, 99, 0.07)',
}

const rawLogStyle: React.CSSProperties = {
  overflowY: 'auto',
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: '11.5px',
  lineHeight: 1.6,
  color: '#e6ede8',
  background: '#070a08',
  padding: '8px 10px',
  borderRadius: '6px',
  whiteSpace: 'pre-wrap',
}
