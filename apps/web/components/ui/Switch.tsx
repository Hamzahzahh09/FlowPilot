'use client'

import { useId } from 'react'
import styles from './Switch.module.css'

interface SwitchProps {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

// role="switch" with a visible On/Off text, so the state is not shown by color or position alone.
export function Switch({ label, description, checked, disabled, onChange }: SwitchProps) {
  const id = useId()
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={`${id}-label`} className={styles.label}>
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className={styles.description}>
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <span className={styles.state} aria-hidden="true">
          {checked ? 'On' : 'Off'}
        </span>
      </button>
    </div>
  )
}
