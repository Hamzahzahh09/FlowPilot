import type { CSSProperties, ReactNode } from 'react'
import styles from './Skeleton.module.css'

type Size = number | string

interface SkeletonProps {
  width?: Size
  height?: Size
  /** Rounded ends, for button and badge shapes. */
  pill?: boolean
  style?: CSSProperties
  className?: string
}

/** One grey block. Decorative: the surrounding SkeletonRegion carries the label. */
export function Skeleton({ width = '100%', height = 14, pill, style, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.block, pill ? styles.pill : '', className].filter(Boolean).join(' ')}
      style={{ width, height, ...style }}
    />
  )
}

interface SkeletonPanelProps {
  children?: ReactNode
  /** Container radius (28px) for canvas-sized panels; cards use 16px. */
  container?: boolean
  className?: string
  style?: CSSProperties
}

export function SkeletonPanel({ children, container, className, style }: SkeletonPanelProps) {
  return (
    <div
      aria-hidden="true"
      className={[styles.panel, container ? styles.container : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}

interface SkeletonRegionProps {
  /** Read by screen readers, for example "Loading workflows…". */
  label: string
  children: ReactNode
  className?: string
  /** Shown below the skeleton, for example the slow notice. */
  footer?: ReactNode
}

/** Wraps a page skeleton. `data-skeleton` marks it for tests and measurements. */
export function SkeletonRegion({ label, children, className, footer }: SkeletonRegionProps) {
  return (
    <div data-skeleton="" className={className}>
      <p role="status" aria-live="polite" className="sr-only">
        {label}
      </p>
      {footer}
      {children}
    </div>
  )
}
