'use client'

import { NODE_ICONS } from '@/components/flow/nodeIcons'
import { NODE_META, PICKER_KINDS } from '@/lib/workflow/graph'
import type { NodeKind } from '@/lib/workflow/types'
import styles from './NodePicker.module.css'

interface NodePickerProps {
  onAdd: (kind: NodeKind) => void
  /** Kinds that cannot be added right now, with the reason shown instead of the title. */
  unavailable: Partial<Record<NodeKind, string>>
}

// Buttons, not drag sources, so adding works with keyboard and pointer alike.
export function NodePicker({ onAdd, unavailable }: NodePickerProps) {
  return (
    <section className={styles.picker} aria-labelledby="picker-title" data-tour="node-picker">
      <h2 id="picker-title" className={styles.title}>
        Add a node
      </h2>
      <ul className={styles.list}>
        {PICKER_KINDS.map((kind) => {
          const meta = NODE_META[kind]
          const Icon = NODE_ICONS[kind]
          const reason = unavailable[kind]
          return (
            <li key={kind}>
              <button
                type="button"
                className={styles.item}
                onClick={() => onAdd(kind)}
                disabled={Boolean(reason)}
              >
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{meta.themeName}</span>
                  <span className={styles.sub}>{reason ?? meta.defaultTitle}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
