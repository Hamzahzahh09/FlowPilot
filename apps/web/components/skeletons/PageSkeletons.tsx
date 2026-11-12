import type { ReactNode } from 'react'
import editor from '@/components/editor/WorkflowEditor.module.css'
import run from '@/components/run/RunView.module.css'
import { Skeleton, SkeletonPanel, SkeletonRegion } from '@/components/ui/Skeleton'
import list from '@/components/workflows/WorkflowList.module.css'
import styles from './PageSkeletons.module.css'

// Page-shaped placeholders. Used by the route loading.tsx files and while a
// page loads its data, so both waits look the same. Layout classes come from
// the real pages, so the skeleton sits where the content will appear.

interface PageSkeletonProps {
  /** Shown below the header, for example the slow notice. */
  notice?: ReactNode
}

function HeaderSkeleton({ actions = 1, description = true }: { actions?: number; description?: boolean }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <Skeleton width={220} height={28} />
        {description && <Skeleton width={420} height={14} />}
      </div>
      <div className={styles.actions}>
        {Array.from({ length: actions }, (_, i) => (
          <Skeleton key={i} width={i === actions - 1 ? 132 : 92} height={36} pill />
        ))}
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <SkeletonPanel>
      <Skeleton width="60%" height={18} />
      <Skeleton width="90%" height={12} />
      <div className={styles.cardMeta}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.row}>
            <Skeleton width={64} height={12} />
            <Skeleton width={96} height={22} pill />
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Skeleton width={72} height={36} pill />
        <Skeleton width={132} height={36} pill />
      </div>
    </SkeletonPanel>
  )
}

function CanvasSkeleton({ nodes }: { nodes: number }) {
  return (
    <SkeletonPanel container className={styles.canvas}>
      {Array.from({ length: nodes }, (_, i) => (
        <Skeleton key={i} width={80} height={80} />
      ))}
    </SkeletonPanel>
  )
}

export function WorkflowsSkeleton({ notice, header = true }: PageSkeletonProps & { header?: boolean }) {
  return (
    <SkeletonRegion label="Loading workflows…" footer={notice}>
      {header && <HeaderSkeleton />}
      <div className={list.grid}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </SkeletonRegion>
  )
}

export function EditorSkeleton({ notice }: PageSkeletonProps) {
  return (
    <SkeletonRegion label="Loading workflow…" className={editor.editor} footer={notice}>
      <HeaderSkeleton actions={2} description={false} />
      <div className={editor.body}>
        <SkeletonPanel>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={40} />
          ))}
        </SkeletonPanel>
        <CanvasSkeleton nodes={4} />
        <SkeletonPanel>
          <Skeleton width="50%" height={16} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton width="70%" height={12} />
        </SkeletonPanel>
      </div>
    </SkeletonRegion>
  )
}

export function RunSkeleton({ notice }: PageSkeletonProps) {
  return (
    <SkeletonRegion label="Loading run…" className={run.page} footer={notice}>
      <HeaderSkeleton actions={2} />
      <div className={run.body}>
        <CanvasSkeleton nodes={5} />
        <SkeletonPanel container className={styles.log}>
          <Skeleton width={120} height={16} />
          {[70, 55, 80, 45].map((w) => (
            <Skeleton key={w} width={`${w}%`} height={12} />
          ))}
        </SkeletonPanel>
      </div>
    </SkeletonRegion>
  )
}

export function ReportSkeleton({ notice }: PageSkeletonProps) {
  return (
    <SkeletonRegion label="Loading report…" footer={notice}>
      <HeaderSkeleton actions={2} />
      <div className={styles.report}>
        <SkeletonPanel>
          <Skeleton width={160} height={14} />
          <Skeleton width="40%" height={24} />
        </SkeletonPanel>
        <div className={styles.reportGrid}>
          {[0, 1, 2].map((i) => (
            <SkeletonPanel key={i}>
              <Skeleton width="45%" height={16} />
              <Skeleton height={12} />
              <Skeleton width="80%" height={12} />
            </SkeletonPanel>
          ))}
        </div>
        <SkeletonPanel>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.row}>
              <Skeleton width={180} height={12} />
              <Skeleton width={80} height={22} pill />
            </div>
          ))}
        </SkeletonPanel>
      </div>
    </SkeletonRegion>
  )
}
