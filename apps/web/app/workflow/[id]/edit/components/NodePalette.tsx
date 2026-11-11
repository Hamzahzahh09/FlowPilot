'use client'

import React, { useState } from 'react'
import type { NodeType } from 'shared'
import { LAYER_INFO, NODE_METADATA, type NodeLayer } from './nodeInfo'

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

// Grouped in the order a run flows through them
const PALETTE_GROUPS: { layer: NodeLayer; types: NodeType[] }[] = [
  { layer: 'trigger', types: ['Spark'] },
  { layer: 'ai', types: ['Brain'] },
  { layer: 'runner', types: ['Scalpel', 'Heart', 'Eyes'] },
  { layer: 'logic', types: ['Fork'] },
  { layer: 'human', types: ['Lightning Lever'] },
  { layer: 'output', types: ['Autopsy Report'] },
]

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fp-btn"
        style={{ position: 'absolute', top: 68, left: 16, zIndex: 20, color: '#f5e663' }}
        title="Open the node panel"
      >
        ☰ Nodes →
      </button>
    )
  }

  return (
    <aside
      aria-label="Node palette"
      style={{
        position: 'absolute',
        top: 66,
        left: 16,
        bottom: 16,
        width: '280px',
        zIndex: 20,
        background: 'rgba(20, 27, 22, 0.97)',
        border: '1px solid #24332a',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #24332a',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800 }}>Body parts</div>
          <div style={{ fontSize: '11.5px', color: '#a8b5ac', marginTop: '2px' }}>
            Drag onto the canvas, or press +
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{ background: 'transparent', border: 'none', color: '#a8b5ac', cursor: 'pointer', fontSize: '14px' }}
          title="Collapse panel"
        >
          ←
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 14px 10px' }}>
        {PALETTE_GROUPS.map(({ layer, types }) => {
          const info = LAYER_INFO[layer]
          return (
            <section key={layer} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 2px 6px 2px' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: info.color }} />
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.7px',
                    textTransform: 'uppercase',
                    color: info.color,
                  }}
                >
                  {info.label}
                </span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#7d8c82', margin: '0 2px 6px 2px', lineHeight: 1.4 }}>
                {info.description}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {types.map((type) => {
                  const item = NODE_METADATA[type]
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => onDragStart(e, type)}
                      className="fp-palette-item"
                      style={{ ['--accent' as string]: info.color }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', width: 22, textAlign: 'center' }} aria-hidden>
                          {item.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{item.title}</div>
                          <div style={{ fontSize: '10.5px', color: '#7d8c82', fontFamily: 'ui-monospace, Menlo, monospace' }}>
                            {item.subLabel}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddNode(type)
                          }}
                          aria-label={`Add ${item.title} to the canvas`}
                          title={`Add ${item.title}`}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${info.color}`,
                            color: info.color,
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: '#a8b5ac', lineHeight: 1.4, marginTop: '5px' }}>
                        {item.paletteDesc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
