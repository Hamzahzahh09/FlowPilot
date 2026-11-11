'use client'

import React from 'react'
import type { Node as ReactFlowNode } from '@xyflow/react'
import type { NodeType } from 'shared'
import { ALLOWED_COMMANDS } from 'shared'
import { NODE_METADATA, getNodeLayer } from './nodeInfo'

interface ConfigPanelProps {
  selectedNode: ReactFlowNode | null
  onUpdateConfig: (nodeId: string, newConfig: Record<string, unknown>) => void
  onDeleteNode: (nodeId: string) => void
  onClose: () => void
}

export default function ConfigPanel({
  selectedNode,
  onUpdateConfig,
  onDeleteNode,
  onClose,
}: ConfigPanelProps) {
  if (!selectedNode) return null

  const nodeType = (selectedNode.data?.type as NodeType) || 'Spark'
  const config = (selectedNode.data?.config as Record<string, unknown>) || {}
  const meta = NODE_METADATA[nodeType]
  const layer = getNodeLayer(nodeType)

  const handleFieldChange = (key: string, value: unknown) => {
    onUpdateConfig(selectedNode.id, { ...config, [key]: value })
  }

  const commandSelect = (fallback: string, hint: string) => (
    <div>
      <label style={labelStyle} htmlFor="fp-command">
        Command
      </label>
      <select
        id="fp-command"
        value={(config.command as string) || fallback}
        onChange={(e) => handleFieldChange('command', e.target.value)}
        style={inputStyle}
      >
        {ALLOWED_COMMANDS.map((cmd) => (
          <option key={cmd} value={cmd}>
            {cmd}
          </option>
        ))}
      </select>
      <span style={hintStyle}>{hint}</span>
      <div style={{ ...noteStyle, marginTop: '10px' }}>
        🔒 Only allowlisted commands can run. The runner never executes free-form text from the AI
        or from you.
      </div>
    </div>
  )

  return (
    <aside
      aria-label="Node settings"
      style={{
        position: 'absolute',
        top: 66,
        right: 16,
        bottom: 16,
        width: '340px',
        zIndex: 20,
        background: 'rgba(20, 27, 22, 0.97)',
        border: '1px solid #24332a',
        borderTop: `3px solid ${layer.color}`,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #24332a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }} aria-hidden>
            {meta.icon}
          </span>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: 800 }}>{meta.title}</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              <span style={{ color: layer.color, fontWeight: 700 }}>{layer.label}</span>
              <span style={{ color: '#7d8c82' }}> · {meta.subLabel}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#a8b5ac', cursor: 'pointer', fontSize: '16px' }}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={sectionTitle}>What this step does</div>
          <p style={{ fontSize: '12.5px', lineHeight: 1.55 }}>{meta.purpose}</p>
        </div>

        <div>
          <div style={sectionTitle}>Example output</div>
          <div style={sampleStyle}>{meta.sampleOutput}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '14px', borderTop: '1px solid #24332a' }}>
          <div style={sectionTitle}>Settings</div>

          {nodeType === 'Spark' && (
            <div>
              <label style={labelStyle} htmlFor="fp-trigger">
                Start the run when…
              </label>
              <select
                id="fp-trigger"
                value={(config.triggerType as string) || 'manual_simulate'}
                onChange={(e) => handleFieldChange('triggerType', e.target.value)}
                style={inputStyle}
              >
                <option value="manual_simulate">I press “Simulate push”</option>
                <option value="github_push">Code is pushed to GitHub</option>
              </select>
              <span style={hintStyle}>Use Simulate push to try the workflow without a real repository.</span>
            </div>
          )}

          {nodeType === 'Brain' && (
            <>
              <div>
                <label style={labelStyle} htmlFor="fp-prompt">
                  Instructions for the AI reviewer
                </label>
                <textarea
                  id="fp-prompt"
                  rows={4}
                  maxLength={500}
                  value={(config.prompt as string) || ''}
                  onChange={(e) => handleFieldChange('prompt', e.target.value)}
                  placeholder="e.g. Look for bugs, security issues, and unclear logic in the changed files."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <span style={hintStyle}>
                  Tell the AI what to look for. It can read code but can’t change it.
                </span>
              </div>
              <div>
                <label style={labelStyle} htmlFor="fp-steps">
                  Max agent steps: {(config.maxSteps as number) || 10}
                </label>
                <input
                  id="fp-steps"
                  type="range"
                  min={1}
                  max={50}
                  value={(config.maxSteps as number) || 10}
                  onChange={(e) => handleFieldChange('maxSteps', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: layer.color }}
                />
                <span style={hintStyle}>Caps how many tool calls the agent can make in one run.</span>
              </div>
            </>
          )}

          {nodeType === 'Scalpel' &&
            commandSelect('npm run lint', 'The lint command to run. If unsure, pick npm run lint.')}

          {nodeType === 'Heart' &&
            commandSelect('npm test', 'The test command to run. If unsure, pick npm test.')}

          {nodeType === 'Fork' && (
            <div style={noteStyle}>
              Stitch the <strong style={{ color: '#8bc34a' }}>✓ Pass</strong> handle to the next step
              for a clean run, and the <strong style={{ color: '#e07a77' }}>✗ Fail</strong> handle to
              where problems should go (usually a report).
            </div>
          )}

          {nodeType === 'Lightning Lever' && (
            <div style={{ ...noteStyle, borderColor: 'rgba(245,230,99,0.4)', color: '#f5e663' }}>
              The run pauses here. You review the AI findings and test results, then press Approve or
              Reject. This is what keeps you in control of the code.
            </div>
          )}

          {nodeType === 'Autopsy Report' && (
            <div>
              <label style={labelStyle} htmlFor="fp-format">
                Report format
              </label>
              <select
                id="fp-format"
                value={(config.format as string) || 'markdown'}
                onChange={(e) => handleFieldChange('format', e.target.value)}
                style={inputStyle}
              >
                <option value="markdown">Markdown (.md), easy to read</option>
                <option value="json">JSON (.json), for other tools</option>
              </select>
            </div>
          )}

          {nodeType === 'Eyes' && (
            <div style={noteStyle}>No settings needed. It scans every changed file automatically.</div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #24332a' }}>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="fp-btn"
          style={{ width: '100%', justifyContent: 'center', color: '#e07a77', borderColor: '#c0504d', background: 'rgba(192,80,77,0.1)' }}
        >
          🗑 Delete this node
        </button>
      </div>
    </aside>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: '10.5px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.7px',
  color: '#7d8c82',
  marginBottom: '6px',
}

const sampleStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: '11.5px',
  color: '#c9d4cc',
  lineHeight: 1.5,
  background: '#070a08',
  border: '1px solid #24332a',
  borderRadius: '6px',
  padding: '10px 12px',
  wordBreak: 'break-word',
}

const noteStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '6px',
  background: '#0b0f0c',
  border: '1px solid #24332a',
  fontSize: '11.5px',
  color: '#a8b5ac',
  lineHeight: 1.5,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  background: '#0b0f0c',
  border: '1px solid #4a6354',
  color: '#e6ede8',
  fontSize: '12.5px',
  fontFamily: 'inherit',
}

const hintStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#a8b5ac',
  marginTop: '5px',
  lineHeight: 1.4,
}
