'use client'

import { useState } from 'react'
import { Canvas } from '@/components/flow/Canvas'
import { AppShell } from '@/components/shell/AppShell'
import { Inspector } from '@/components/shell/Inspector'
import { LogPanel } from '@/components/shell/LogPanel'
import { TopBar } from '@/components/shell/TopBar'
import { DEMO_EDGES, DEMO_NODES } from '@/lib/workflow/demo'

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
      canvas={<Canvas initialNodes={DEMO_NODES} initialEdges={DEMO_EDGES} />}
      inspector={<Inspector />}
      log={<LogPanel />}
    />
  )
}
