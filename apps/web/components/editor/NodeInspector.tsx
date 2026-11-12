'use client'

import type { Edge } from '@xyflow/react'
import { useState } from 'react'
import { ALLOWED_COMMANDS } from 'shared'
import { Inspector } from '@/components/shell/Inspector'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField } from '@/components/ui/FormFields'
import { TextField } from '@/components/ui/TextField'
import {
  BRANCH_LABEL,
  FORK_BRANCHES,
  NODE_META,
  type EditorNode,
  type ForkBranch,
  type NodeConfig,
} from '@/lib/workflow/graph'
import { HAS_OUTPUT } from '@/lib/workflow/types'
import { configErrors } from '@/lib/workflow/validate'
import styles from './NodeInspector.module.css'

export type NodePatch = { config?: NodeConfig; customTitle?: string }

interface NodeInspectorProps {
  workflowName: string
  onRename: (name: string) => void
  nodes: EditorNode[]
  edges: Edge[]
  selectedNode: EditorNode | null
  selectedEdge: Edge | null
  onUpdateNode: (id: string, patch: NodePatch) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
  onConnect: (source: string, target: string, handle: ForkBranch | null) => void
}

export function NodeInspector(props: NodeInspectorProps) {
  const { selectedNode, selectedEdge } = props
  return (
    <Inspector>
      {selectedNode ? (
        <NodeDetails key={selectedNode.id} node={selectedNode} {...props} />
      ) : selectedEdge ? (
        <EdgeDetails edge={selectedEdge} {...props} />
      ) : (
        <WorkflowDetails {...props} />
      )}
    </Inspector>
  )
}

function titleOf(nodes: EditorNode[], id: string): string {
  return nodes.find((n) => n.id === id)?.data.title ?? 'Unknown node'
}

function WorkflowDetails({ workflowName, onRename, nodes, edges }: NodeInspectorProps) {
  return (
    <div className={styles.section}>
      <TextField
        label="Workflow name"
        value={workflowName}
        maxLength={100}
        onChange={(e) => onRename(e.target.value)}
        error={workflowName.trim() ? null : 'Give the workflow a name.'}
      />
      <p className={styles.note}>
        Select a node to configure it, or add one from Add a node. Connect nodes by dragging from a
        node&apos;s right handle to another node&apos;s left handle, or with Connect to in this panel.
      </p>
      <p className={styles.meta}>
        {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}, {edges.length}{' '}
        {edges.length === 1 ? 'connection' : 'connections'}
      </p>
    </div>
  )
}

function EdgeDetails({ edge, nodes, onDeleteEdge }: NodeInspectorProps & { edge: Edge }) {
  const branch = edge.sourceHandle as ForkBranch | null | undefined
  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>Connection</h3>
      <p className={styles.meta}>
        {titleOf(nodes, edge.source)} to {titleOf(nodes, edge.target)}
        {branch && BRANCH_LABEL[branch] ? ` (${BRANCH_LABEL[branch]} branch)` : ''}
      </p>
      <Button onClick={() => onDeleteEdge(edge.id)}>Delete connection</Button>
    </div>
  )
}

const TRIGGER_OPTIONS = [
  { value: 'github_push', label: 'On push to GitHub' },
  { value: 'manual_simulate', label: 'Manual (Simulate push)' },
] as const

const COMMAND_OPTIONS = ALLOWED_COMMANDS.map((c) => ({ value: c, label: c }))

const FORMAT_OPTIONS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
] as const

function NodeDetails({
  node,
  nodes,
  edges,
  onUpdateNode,
  onDeleteNode,
  onDeleteEdge,
  onConnect,
}: NodeInspectorProps & { node: EditorNode }) {
  const { type, kind, config } = node.data
  const meta = NODE_META[kind]
  const errors = configErrors(type, config)
  const cfg = config as Record<string, unknown>
  // The merged object is checked with the shared Zod schema on every change and on save.
  const setConfig = (patch: Record<string, unknown>) =>
    onUpdateNode(node.id, { config: { ...cfg, ...patch } as NodeConfig })

  const isFork = kind === 'fork'
  const outgoing = edges.filter((e) => e.source === node.id)
  const targets = nodes.filter((n) => n.id !== node.id && n.data.type !== 'Spark')
  const [target, setTarget] = useState('')
  const [branch, setBranch] = useState<ForkBranch>('passed')

  const prompt = typeof cfg.prompt === 'string' ? cfg.prompt : ''
  const maxSteps = typeof cfg.maxSteps === 'number' && !Number.isNaN(cfg.maxSteps) ? cfg.maxSteps : ''

  return (
    <div className={styles.section}>
      <div>
        <h3 className={styles.heading}>{node.data.title}</h3>
        <p className={styles.meta}>
          {meta.themeName} · {meta.description}
        </p>
      </div>

      <TextField
        label="Title"
        value={node.data.customTitle ?? ''}
        placeholder={meta.defaultTitle}
        maxLength={40}
        hint="Shown under the node. Leave empty to use the default."
        onChange={(e) => onUpdateNode(node.id, { customTitle: e.target.value })}
      />

      {type === 'Spark' && (
        <SelectField
          label="Trigger"
          options={TRIGGER_OPTIONS}
          value={String(cfg.triggerType ?? '')}
          error={errors.triggerType}
          onChange={(e) => setConfig({ triggerType: e.target.value })}
        />
      )}

      {type === 'Brain' && (
        <>
          <TextAreaField
            label="Prompt"
            value={prompt}
            maxLength={500}
            hint={`${prompt.length} of 500 characters`}
            error={errors.prompt}
            onChange={(e) => setConfig({ prompt: e.target.value })}
          />
          <TextField
            label="Max agent steps"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            value={maxSteps}
            hint="Caps how many tool calls the agent can make in one run."
            error={errors.maxSteps}
            onChange={(e) =>
              setConfig({ maxSteps: e.target.value === '' ? Number.NaN : Number(e.target.value) })
            }
          />
        </>
      )}

      {(type === 'Scalpel' || type === 'Heart') && (
        <SelectField
          label="Command"
          options={COMMAND_OPTIONS}
          value={String(cfg.command ?? '')}
          hint="Only allowlisted commands can run in the sandbox."
          error={errors.command}
          onChange={(e) => setConfig({ command: e.target.value })}
        />
      )}

      {type === 'Autopsy Report' && (
        <SelectField
          label="Format"
          options={FORMAT_OPTIONS}
          value={String(cfg.format ?? '')}
          error={errors.format}
          onChange={(e) => setConfig({ format: e.target.value })}
        />
      )}

      {(type === 'Fork' || type === 'Lightning Lever') && (
        <p className={styles.note}>No settings. {meta.description}</p>
      )}

      {HAS_OUTPUT[kind] && (
        <div className={styles.group}>
          <h4 className={styles.subheading}>Next steps</h4>
          {outgoing.length === 0 ? (
            <p className={styles.note}>Not connected yet.</p>
          ) : (
            <ul className={styles.connections}>
              {outgoing.map((edge) => {
                const name = titleOf(nodes, edge.target)
                const b = edge.sourceHandle as ForkBranch | null | undefined
                const label = b && BRANCH_LABEL[b] ? `${BRANCH_LABEL[b]}: ${name}` : name
                return (
                  <li key={edge.id}>
                    <span>{label}</span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => onDeleteEdge(edge.id)}
                      aria-label={`Remove connection to ${label}`}
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <SelectField
            label="Connect to"
            options={[
              { value: '', label: 'Choose a node' },
              ...targets.map((t) => ({ value: t.id, label: `${t.data.title} (${t.data.themeName})` })),
            ]}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          {isFork && (
            <SelectField
              label="Branch"
              options={FORK_BRANCHES.map((b) => ({ value: b, label: BRANCH_LABEL[b] }))}
              value={branch}
              onChange={(e) => setBranch(e.target.value === 'failed' ? 'failed' : 'passed')}
            />
          )}
          <Button
            disabled={!target}
            onClick={() => {
              onConnect(node.id, target, isFork ? branch : null)
              setTarget('')
            }}
          >
            Add connection
          </Button>
        </div>
      )}

      <div className={styles.group}>
        <Button onClick={() => onDeleteNode(node.id)}>Delete node</Button>
        <p className={styles.note}>Or select it on the canvas and press Delete.</p>
      </div>
    </div>
  )
}
