'use client'

import React from 'react'
import type { ValidationResult } from 'shared'

interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
  result: ValidationResult | null
  onSimulate?: () => void
}

export default function ValidationModal({ isOpen, onClose, result, onSimulate }: ValidationModalProps) {
  if (!isOpen || !result) return null

  const accent = result.valid ? '#8bc34a' : '#c0504d'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-validation-title"
        style={{
          background: '#141b16',
          border: '1px solid #24332a',
          borderTop: `3px solid ${accent}`,
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          padding: '22px 24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span
            aria-hidden
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: '50%',
              border: `1px solid ${accent}`,
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            {result.valid ? '✓' : '!'}
          </span>
          <div>
            <h3 id="fp-validation-title" style={{ fontSize: '17px', fontWeight: 800 }}>
              {result.valid ? 'Workflow is ready to run' : 'A few things need fixing'}
            </h3>
            <p style={{ marginTop: '4px', fontSize: '12.5px', color: '#a8b5ac', lineHeight: 1.45 }}>
              {result.valid
                ? 'Every node is stitched in and the workflow meets all the rules.'
                : `Fix ${result.errors.length === 1 ? 'this issue' : `these ${result.errors.length} issues`} before you simulate a push:`}
            </p>
          </div>
        </div>

        {!result.valid ? (
          <ul style={listStyle('rgba(192, 80, 77, 0.35)')}>
            {result.errors.map((error, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', lineHeight: 1.45 }}>
                <span style={{ color: '#e07a77', fontWeight: 800 }} aria-hidden>
                  ✗
                </span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul style={listStyle('rgba(139, 195, 74, 0.35)')}>
            {[
              'One Spark starts the run',
              'Stitches flow one way, with no loops',
              'Every path ends in an Autopsy Report',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', color: '#c9d4cc' }}>
                <span style={{ color: '#8bc34a', fontWeight: 800 }} aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="fp-btn">
            {result.valid ? 'Close' : 'Close and fix'}
          </button>
          {result.valid && onSimulate && (
            <button
              onClick={() => {
                onClose()
                onSimulate()
              }}
              className="fp-btn fp-btn--primary"
            >
              ▶ Simulate push now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const listStyle = (border: string): React.CSSProperties => ({
  listStyle: 'none',
  background: '#0b0f0c',
  border: `1px solid ${border}`,
  borderRadius: '8px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '240px',
  overflowY: 'auto',
})
