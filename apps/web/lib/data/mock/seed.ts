import { getDefaultConfig } from 'shared'
import { randomHex } from '../ids'
import type { GithubSettings, Run, Runner, Workflow, WorkflowGraph } from '../types'

export type RunnerRecord = Runner & { tokenHash: string }

export type MockState = {
  version: 1
  workflows: Workflow[]
  runs: Run[]
  runners: RunnerRecord[]
  github: GithubSettings
}

/** Same id as db/seed.ts so the demo matches the real database later. */
export const DEMO_WORKFLOW_ID = '450e8400-e29b-41d4-a716-446655440000'

const n = (i: number) => `550e8400-e29b-41d4-a716-44665544000${i}`
const e = (i: number) => `650e8400-e29b-41d4-a716-44665544000${i}`

// Spark -> Brain -> (Scalpel | Heart) -> Lightning Lever -> Autopsy Report
export function demoGraph(): WorkflowGraph {
  return {
    nodes: [
      { id: n(1), type: 'Spark', position: { x: 0, y: 0 }, config: { triggerType: 'github_push' } },
      { id: n(2), type: 'Brain', position: { x: 200, y: 0 }, config: getDefaultConfig('Brain') },
      { id: n(3), type: 'Scalpel', position: { x: 400, y: -100 }, config: getDefaultConfig('Scalpel') },
      { id: n(4), type: 'Heart', position: { x: 400, y: 100 }, config: getDefaultConfig('Heart') },
      { id: n(5), type: 'Lightning Lever', position: { x: 600, y: 0 }, config: {} },
      { id: n(6), type: 'Autopsy Report', position: { x: 800, y: 0 }, config: getDefaultConfig('Autopsy Report') },
    ],
    edges: [
      { id: e(1), source: n(1), target: n(2) },
      { id: e(2), source: n(2), target: n(3) },
      { id: e(3), source: n(2), target: n(4) },
      { id: e(4), source: n(3), target: n(5) },
      { id: e(5), source: n(4), target: n(5) },
      { id: e(6), source: n(5), target: n(6) },
    ],
  }
}

export function createSeed(now: Date = new Date()): MockState {
  const day = 24 * 60 * 60 * 1000
  const iso = (offset: number) => new Date(now.getTime() - offset).toISOString()
  return {
    version: 1,
    workflows: [
      {
        id: DEMO_WORKFLOW_ID,
        name: 'Automated code review',
        description: 'AI review, lint and tests in a sandbox, then your approval.',
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
