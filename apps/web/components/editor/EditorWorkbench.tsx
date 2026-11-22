'use client'

import {
  Background,
  BackgroundVariant,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type OnDelete,
} from '@xyflow/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getDefaultConfig } from 'shared'
import { PageHeader } from '@/components/app/PageHeader'
import { DEFAULT_EDGE_OPTIONS, FIT_VIEW_OPTIONS, NODE_TYPES, PRO_OPTIONS } from '@/components/flow/config'
import { FitOnResize } from '@/components/flow/FitOnResize'
import { CheckIcon, CompassIcon, DownloadIcon, HelpIcon, PlayIcon, UploadIcon, XIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { FeatureTour, type TourStep } from '@/components/ui/FeatureTour'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { data, type Workflow } from '@/lib/data'
import type { GraphEdge, GraphNode } from '@/lib/data/types'
import { useAction } from '@/lib/data/hooks'
import { newId } from '@/lib/data/ids'
import { useNavigate } from '@/lib/navigation'
import {
  NODE_META,
  nodeData,
  toEditorEdge,
  toEditorNode,
  toGraph,
  type EditorNode,
  type ForkBranch,
} from '@/lib/workflow/graph'
import { nodeAriaLabel, type NodeKind } from '@/lib/workflow/types'
import { validateGraph } from '@/lib/workflow/validate'
import { NodeInspector, type NodePatch } from './NodeInspector'
import { NodePicker } from './NodePicker'
import styles from './WorkflowEditor.module.css'

const DELETE_KEYS = ['Backspace', 'Delete']

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="node-picker"]',
    title: '1. Select Pipeline Nodes',
    content:
      'Choose from automated inspection stages in this panel: AI Reviewer, Security Scan, Test Runner, Code Scalpel, and Human Approval. Click any node to add it to the canvas.',
    placement: 'right',
  },
  {
    target: '[data-tour="workflow-canvas"]',
    title: '2. Build on Visual Canvas',
    content:
      'Design your workflow visually on this canvas. Connect nodes by dragging lines from a node’s right handle to the next node’s left handle. Pan the canvas with Space + Drag.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="node-inspector"]',
    title: '3. Node Configuration & Inspector',
    content:
      'Click any node on the canvas to inspect its configuration in the right panel. Customize test commands, adjust AI prompts, and inspect example outputs.',
    placement: 'left',
  },
  {
    target: '[data-tour="toolbar-export-import"]',
    title: '4. Export & Import Workflows (JSON)',
    content:
      'Your workflows are fully portable! Download any workflow as a JSON file to share with your team or commit to Git, or load an existing workflow anytime.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="toolbar-simulate"]',
    title: '5. Run Workflow Simulation',
    content:
      'Click "Simulate push" in the top-right toolbar to simulate a GitHub push event and watch the pipeline run live: AI review, automated checks, and interactive human approval!',
    placement: 'bottom',
  },
]

export function EditorWorkbench({ workflow }: { workflow: Workflow }) {
  const navigate = useNavigate()
  const { screenToFlowPosition } = useReactFlow<EditorNode, Edge>()
  const canvasRef = useRef<HTMLElement>(null)

  const [initial] = useState(() => ({
    nodes: workflow.graph.nodes.map((n) => toEditorNode(n)),
    edges: workflow.graph.edges.map(toEditorEdge),
  }))
  const [nodes, setNodes, applyNodeChanges] = useNodesState<EditorNode>(initial.nodes)
  const [edges, setEdges, applyEdgeChanges] = useEdgesState<Edge>(initial.edges)
  const [name, setName] = useState(workflow.name)
  const [dirty, setDirty] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [message, setMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    const timer = setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr))
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      const seen = localStorage.getItem('flowpilot_tour_seen')
      if (!seen) {
        const timer = setTimeout(() => {
          setShowTour(true)
        }, 750)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore localStorage error
    }
  }, [])

  const handleTourComplete = useCallback(() => {
    try {
      localStorage.setItem('flowpilot_tour_seen', 'true')
    } catch {
      // ignore
    }
    showToast('Tour completed! You are ready to build workflows.')
  }, [showToast])

  const exportWorkflow = useCallback(() => {
    const dataToExport = {
      name,
      description: workflow.description,
      version: 1,
      exportedAt: new Date().toISOString(),
      graph: toGraph(nodes, edges),
    }
    const jsonStr = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workflow'
    a.download = `${safeName}.flowpilot.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(jsonStr)
    }
    showToast('Workflow exported & JSON copied to clipboard!')
  }, [name, workflow.description, nodes, edges, showToast])

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          const parsed = JSON.parse(text)
          const graph = parsed.graph ?? parsed
          if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
            throw new Error('Invalid JSON format: nodes and edges arrays required.')
          }
          setNodes(graph.nodes.map((n: GraphNode) => toEditorNode(n)))
          setEdges(graph.edges.map((edge: GraphEdge) => toEditorEdge(edge)))
          if (parsed.name && typeof parsed.name === 'string') {
            setName(parsed.name)
          }
          setDirty(true)
          showToast('Workflow successfully loaded from JSON file!')
        } catch (err) {
          showToast(`Failed to import: ${err instanceof Error ? err.message : 'Invalid file'}`)
        } finally {
          if (e.target) e.target.value = ''
        }
      }
      reader.readAsText(file)
    },
    [setNodes, setEdges, showToast],
  )

  const selectedNode = nodes.find((n) => n.selected) ?? null
  const selectedEdge = selectedNode ? null : (edges.find((e) => e.selected) ?? null)

  const validate = useCallback((): string[] => {
    const errors = validateGraph(toGraph(nodes, edges))
    if (!name.trim()) errors.unshift('Give the workflow a name.')
    return errors
  }, [nodes, edges, name])

  // Once a save failed, the list updates live as the user fixes things.
  const errors = showErrors ? validate() : []

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const onNodesChange = useCallback(
    (changes: NodeChange<EditorNode>[]) => {
      if (changes.some((c) => c.type === 'position' || c.type === 'remove' || c.type === 'add')) setDirty(true)
      applyNodeChanges(changes)
    },
    [applyNodeChanges],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      if (changes.some((c) => c.type === 'remove' || c.type === 'add')) setDirty(true)
      applyEdgeChanges(changes)
    },
    [applyEdgeChanges],
  )

  const connect = useCallback(
    (source: string, target: string, handle: string | null) => {
      if (source === target) return
      setEdges((current) => {
        const exists = current.some(
          (e) => e.source === source && e.target === target && (e.sourceHandle ?? null) === handle,
        )
        if (exists) return current
        return addEdge({ id: newId(), source, target, sourceHandle: handle, targetHandle: null }, current)
      })
      setDirty(true)
    },
    [setEdges],
  )

  const onConnect = useCallback((c: Connection) => connect(c.source, c.target, c.sourceHandle), [connect])

  const isValidConnection = useCallback(
    (c: Edge | Connection) =>
      c.source !== c.target &&
      !edges.some(
        (e) =>
          e.source === c.source &&
          e.target === c.target &&
          (e.sourceHandle ?? null) === (c.sourceHandle ?? null),
      ),
    [edges],
  )

  const onDelete: OnDelete<EditorNode, Edge> = useCallback(({ nodes: gone, edges: cut }) => {
    if (gone.length === 1) setMessage(`Deleted ${gone[0].data.title}`)
    else if (gone.length > 1) setMessage(`Deleted ${gone.length} nodes`)
    else if (cut.length > 0) setMessage('Deleted connection')
  }, [])

  const addNode = (kind: NodeKind) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const center = rect
      ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      : { x: 0, y: 0 }
    const nudge = (nodes.length % 5) * 24
    const type = NODE_META[kind].type
    const node = toEditorNode({
      id: newId(),
      type,
      position: { x: center.x - 40 + nudge, y: center.y - 40 + nudge },
      config: getDefaultConfig(type),
    })
    setNodes((current) => [
      ...current.map((n) => (n.selected ? { ...n, selected: false } : n)),
      { ...node, selected: true },
    ])
    setEdges((current) => current.map((e) => (e.selected ? { ...e, selected: false } : e)))
    setDirty(true)
    setMessage(`Added ${node.data.title}. It is selected in the inspector.`)
  }

  const updateNode = (id: string, patch: NodePatch) => {
    setNodes((current) =>
      current.map((n) => {
        if (n.id !== id) return n
        const customTitle = patch.customTitle !== undefined ? patch.customTitle : n.data.customTitle
        const next = nodeData(n.data.type, patch.config ?? n.data.config, customTitle, n.data.status)
        return { ...n, data: next, ariaLabel: nodeAriaLabel(next) }
      }),
    )
    setDirty(true)
  }

  const deleteNode = (id: string) => {
    const title = nodes.find((n) => n.id === id)?.data.title ?? 'node'
    setNodes((current) => current.filter((n) => n.id !== id))
    setEdges((current) => current.filter((e) => e.source !== id && e.target !== id))
    setDirty(true)
    setMessage(`Deleted ${title}`)
  }

  const deleteEdge = (id: string) => {
    setEdges((current) => current.filter((e) => e.id !== id))
    setDirty(true)
    setMessage('Deleted connection')
  }

  const rename = (value: string) => {
    setName(value)
    setDirty(true)
  }

  /**
   * Validates, then stores. False when validation fails (the error list
   * shows why); throws when the request fails.
   */
  const persist = async (): Promise<boolean> => {
    if (validate().length > 0) {
      setShowErrors(true)
      setMessage('')
      return false
    }
    await data.workflows.save(workflow.id, { name, graph: toGraph(nodes, edges) })
    setDirty(false)
    setShowErrors(false)
    setMessage('Saved')
    showToast('Workflow saved successfully!')
    return true
  }

  const saveAction = useAction(persist)

  // Saves first when needed. Stays pending on success: the run page replaces
  // this one, so the button keeps "Starting run…" until then.
  const simulateAction = useAction(
    async () => {
      const ready = dirty ? await persist() : validate().length === 0
      if (!ready) {
        setShowErrors(true)
        return null
      }
      return data.runs.start(workflow.id)
    },
    {
      holdOnSuccess: (run) => run !== null,
      onSuccess: (run) => {
        if (run) navigate.push(`/runs/${run.id}`)
      },
    },
  )

  const save = () => void saveAction.run()
  const simulate = () => void simulateAction.run()
  const busy = saveAction.pending ? 'saving' : simulateAction.pending ? 'starting' : null
  const action = simulateAction.pending || simulateAction.error ? simulateAction : saveAction
  const actionError =
    action.error && `Could not ${action === saveAction ? 'save' : 'start the run'}: ${action.error}`

  const hasSpark = nodes.some((n) => n.data.type === 'Spark')
  const saveState = busy === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'

  // Readable names for keyboard and screen reader users (React Flow's default uses ids).
  const titles = new Map(nodes.map((n) => [n.id, n.data.title]))
  const labelledEdges = edges.map((e) => ({
    ...e,
    ariaLabel: `Connection from ${titles.get(e.source) ?? 'node'}${
      e.sourceHandle ? ` (${e.sourceHandle === 'failed' ? 'Failed' : 'Passed'} branch)` : ''
    } to ${titles.get(e.target) ?? 'node'}`,
  }))

  return (
    <div className={styles.editor}>
      <PageHeader
        title={name.trim() || 'Untitled workflow'}
        actions={
          <>
            <span className={styles.saveState} data-dirty={dirty || undefined}>
              {saveState}
            </span>
            <span data-tour="toolbar-export-import" style={{ display: 'inline-flex', gap: '8px' }}>
              <Button
                variant="secondary"
                icon={<DownloadIcon size={16} />}
                onClick={exportWorkflow}
                title="Download and copy workflow JSON"
              >
                Export
              </Button>
              <Button
                variant="secondary"
                icon={<UploadIcon size={16} />}
                onClick={() => fileInputRef.current?.click()}
                title="Load workflow from JSON file"
              >
                Import
              </Button>
            </span>
            <Button
              onClick={save}
              disabled={busy !== null}
              pending={busy === 'saving'}
              pendingLabel="Saving…"
            >
              Save
            </Button>
            <span data-tour="toolbar-simulate">
              <Button
                variant="primary"
                icon={<PlayIcon />}
                onClick={simulate}
                disabled={busy !== null}
                pending={busy === 'starting'}
                pendingLabel="Starting run…"
              >
                Simulate push
              </Button>
            </span>
          </>
        }
      />

      <p role="status" className="sr-only">
        {message}
      </p>

      <WaitNotice
        pendingText={busy === 'saving' ? 'Saving…' : busy === 'starting' ? 'Starting run…' : null}
        slow={action.slow}
        error={actionError}
        onRetry={action.retry}
      />

      <div role="alert" className={styles.errors}>
        {errors.length > 0 && (
          <>
            <h2 className={styles.errorsTitle}>Fix these before saving</h2>
            <ul className={styles.errorList}>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={styles.body}>
        <NodePicker onAdd={addNode} unavailable={hasSpark ? { spark: 'One per workflow' } : {}} />

        <section ref={canvasRef} className={styles.canvas} aria-label="Workflow canvas" data-tour="workflow-canvas">
          <ReactFlow<EditorNode, Edge>
            nodes={nodes}
            edges={labelledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onDelete={onDelete}
            deleteKeyCode={DELETE_KEYS}
            nodeTypes={NODE_TYPES}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
            fitViewOptions={FIT_VIEW_OPTIONS}
            minZoom={0.25}
            maxZoom={1.75}
            proOptions={PRO_OPTIONS}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--dot)" />
            <FitOnResize options={FIT_VIEW_OPTIONS} />
          </ReactFlow>

          <div className={styles.canvasControls}>
            <button
              type="button"
              className={styles.tourBtn}
              onClick={() => setShowTour(true)}
              aria-label="Start Feature Tour"
              title="Start Feature Tour"
            >
              <CompassIcon size={16} />
              <span>Feature Tour</span>
            </button>
            <button
              type="button"
              className={styles.helpBtn}
              onClick={() => setShowHelp((prev) => !prev)}
              aria-label="Canvas Shortcuts & Help"
              title="Canvas Shortcuts & Help"
            >
              <HelpIcon size={18} />
            </button>
          </div>

          {showHelp && (
            <div className={styles.helpCard}>
              <div className={styles.helpHeader}>
                <h4 className={styles.helpTitle}>Shortcuts & Navigation</h4>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setShowHelp(false)}
                  aria-label="Close guide"
                >
                  <XIcon size={16} />
                </button>
              </div>
              <ul className={styles.helpItems}>
                <li>
                  <span>Pan Canvas</span>
                  <kbd>Space + Drag</kbd>
                </li>
                <li>
                  <span>Zoom In / Out</span>
                  <kbd>Mouse Scroll</kbd>
                </li>
                <li>
                  <span>Delete Node / Edge</span>
                  <kbd>Del / Backspace</kbd>
                </li>
                <li>
                  <span>Connect Nodes</span>
                  <span>Drag handles</span>
                </li>
                <li>
                  <span>Export / Share</span>
                  <span>Export (JSON)</span>
                </li>
              </ul>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--node-hover)' }}>
                <Button
                  size="md"
                  variant="primary"
                  icon={<CompassIcon size={16} />}
                  onClick={() => {
                    setShowHelp(false)
                    setShowTour(true)
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Interactive Tour
                </Button>
              </div>
            </div>
          )}
        </section>

        <NodeInspector
          workflowName={name}
          onRename={rename}
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
          onDeleteEdge={deleteEdge}
          onConnect={(source, target, handle: ForkBranch | null) => connect(source, target, handle)}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {toast && (
        <div className={styles.toast} role="status">
          <CheckIcon size={16} />
          <span>{toast}</span>
        </div>
      )}

      <FeatureTour
        steps={TOUR_STEPS}
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
      />
    </div>
  )
}
