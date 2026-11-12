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
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getDefaultConfig } from 'shared'
import { PageHeader } from '@/components/app/PageHeader'
import { DEFAULT_EDGE_OPTIONS, FIT_VIEW_OPTIONS, NODE_TYPES, PRO_OPTIONS } from '@/components/flow/config'
import { FitOnResize } from '@/components/flow/FitOnResize'
import { PlayIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { data, type Workflow } from '@/lib/data'
import { newId } from '@/lib/data/ids'
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

export function EditorWorkbench({ workflow }: { workflow: Workflow }) {
  const router = useRouter()
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
  const [busy, setBusy] = useState<'saving' | 'starting' | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [message, setMessage] = useState('')

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

  /** Validates, then stores. Returns true when the workflow is saved and valid. */
  const save = async (): Promise<boolean> => {
    setSaveError(null)
    if (validate().length > 0) {
      setShowErrors(true)
      setMessage('')
      return false
    }
    setBusy('saving')
    try {
      await data.workflows.save(workflow.id, { name, graph: toGraph(nodes, edges) })
      setDirty(false)
      setShowErrors(false)
      setMessage('Saved')
      return true
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error))
      return false
    } finally {
      setBusy(null)
    }
  }

  const simulate = async () => {
    const ready = dirty ? await save() : validate().length === 0
    if (!ready) {
      setShowErrors(true)
      return
    }
    setBusy('starting')
    try {
      const run = await data.runs.start(workflow.id)
      router.push(`/runs/${run.id}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error))
      setBusy(null)
    }
  }

  const hasSpark = nodes.some((n) => n.data.type === 'Spark')
  const saveState = busy === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'

  return (
    <div className={styles.editor}>
      <PageHeader
        title={name.trim() || 'Untitled workflow'}
        actions={
          <>
            <span className={styles.saveState} data-dirty={dirty || undefined}>
              {saveState}
            </span>
            <Button onClick={() => void save()} disabled={busy !== null}>
              Save
            </Button>
            <Button variant="primary" icon={<PlayIcon />} onClick={() => void simulate()} disabled={busy !== null}>
              {busy === 'starting' ? 'Starting…' : 'Simulate push'}
            </Button>
          </>
        }
      />

      <p role="status" className="sr-only">
        {message}
      </p>

      <div role="alert" className={styles.errors}>
        {(errors.length > 0 || saveError) && (
          <>
            <h2 className={styles.errorsTitle}>Fix these before saving</h2>
            <ul className={styles.errorList}>
              {saveError && <li>{saveError}</li>}
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={styles.body}>
        <NodePicker onAdd={addNode} unavailable={hasSpark ? { spark: 'One per workflow' } : {}} />

        <section ref={canvasRef} className={styles.canvas} aria-label="Workflow canvas">
          <ReactFlow<EditorNode, Edge>
            nodes={nodes}
            edges={edges}
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
    </div>
  )
}
