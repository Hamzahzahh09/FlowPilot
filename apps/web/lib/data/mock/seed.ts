import { randomHex } from '../ids'
import { DEMO_WORKFLOW, demoGraph } from '../demo'
import type { GithubSettings, Run, Runner, Workflow } from '../types'

export type RunnerRecord = Runner & { tokenHash: string }

export type MockState = {
  version: 1
  workflows: Workflow[]
  runs: Run[]
  runners: RunnerRecord[]
  github: GithubSettings
}

export { DEMO_WORKFLOW_ID, demoGraph } from '../demo'

export function createSeed(now: Date = new Date()): MockState {
  const day = 24 * 60 * 60 * 1000
  const iso = (offset: number) => new Date(now.getTime() - offset).toISOString()
  return {
    version: 1,
    workflows: [
      {
        ...DEMO_WORKFLOW,
        graph: demoGraph(),
        createdAt: iso(3 * day),
        updatedAt: iso(2 * 60 * 60 * 1000),
      },
    ],
    runs: [],
    runners: [
      {
        id: 'runner-sandbox',
        name: 'Hosted sandbox',
        status: 'online',
        lastSeenAt: iso(30 * 1000),
        createdAt: iso(3 * day),
        tokenPreview: 'fpr_…sbx1',
        tokenHash: '',
      },
      {
        id: 'runner-laptop',
        name: 'My laptop',
        status: 'offline',
        lastSeenAt: iso(2 * day),
        createdAt: iso(3 * day),
        tokenPreview: 'fpr_…7c2e',
        tokenHash: '',
      },
    ],
    github: {
      repository: null,
      connectedAt: null,
      webhookPath: '/api/github/webhook',
      webhookSecret: `whsec_${randomHex(20)}`,
      triggers: { push: true, pullRequest: false },
    },
  }
}
