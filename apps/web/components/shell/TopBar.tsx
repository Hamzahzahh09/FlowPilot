import Link from 'next/link'
import { LogoIcon, PlayIcon, ResetIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/site'
import { TabPills, type TabItem } from './TabPills'
import styles from './TopBar.module.css'

interface TopBarProps {
  workflowName: string
  tabs: readonly TabItem[]
  selectedTab: string
  onSelectTab: (id: string) => void
  /** Undefined disables the button (run wiring arrives in a later task). */
  onSimulate?: () => void
  onReset?: () => void
}

export function TopBar({
  workflowName,
  tabs,
  selectedTab,
  onSelectTab,
  onSimulate,
  onReset,
}: TopBarProps) {
  return (
    <header className={styles.bar}>
      <Link href={ROUTES.home} className={styles.brand} aria-label="FlowPilot home">
        <span className={styles.logo}>
          <LogoIcon size={20} />
        </span>
        <span className={styles.brandName}>FlowPilot</span>
      </Link>

      <div className={styles.workflow}>
        <h1 className={styles.name}>{workflowName}</h1>
        <TabPills items={tabs} selectedId={selectedTab} onSelect={onSelectTab} label="Workflows" />
      </div>

      <div className={styles.actions}>
        <Button icon={<ResetIcon />} onClick={onReset} disabled={!onReset}>
          Reset
        </Button>
        <Button variant="primary" icon={<PlayIcon />} onClick={onSimulate} disabled={!onSimulate}>
          Simulate push
        </Button>
      </div>
    </header>
  )
}
