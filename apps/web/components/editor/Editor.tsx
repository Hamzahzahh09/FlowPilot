'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/AppShell'
import { Inspector } from '@/components/shell/Inspector'
import { LogPanel } from '@/components/shell/LogPanel'
import { TopBar } from '@/components/shell/TopBar'

const WORKFLOW_TABS = [{ id: 'code-review', label: 'code-review' }] as const

export function Editor() {
  const [selectedTab, setSelectedTab] = useState<string>(WORKFLOW_TABS[0].id)

  return (
    <AppShell
      topBar={
        <TopBar
          workflowName="Automated code review"
          tabs={WORKFLOW_TABS}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />
      }
      canvas={null}
      inspector={<Inspector />}
      log={<LogPanel />}
    />
  )
}
