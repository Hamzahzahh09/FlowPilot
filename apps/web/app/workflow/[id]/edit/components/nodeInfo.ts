import type { NodeType } from 'shared'

/**
 * FlowPilot stitches three kinds of "body parts" together:
 * a probabilistic AI, a deterministic runner, and a human holding the lever.
 * Each node belongs to one layer so users can see which part does what.
 */
export type NodeLayer = 'trigger' | 'ai' | 'runner' | 'logic' | 'human' | 'output'

export interface LayerInfo {
  label: string
  /** Short explanation shown as a tooltip and in the palette group header. */
  description: string
  color: string
}

export const LAYER_INFO: Record<NodeLayer, LayerInfo> = {
  trigger: {
    label: 'Trigger',
    description: 'Starts a run when code is pushed or you press Simulate.',
    color: '#f2994a',
  },
  ai: {
    label: 'AI agent',
    description: 'Probabilistic. Reads the diff and suggests fixes using read-only tools.',
    color: '#b48cf0',
  },
  runner: {
    label: 'Runner',
    description: 'Deterministic. Runs allowlisted commands in a sandbox.',
    color: '#4fc3b0',
  },
  logic: {
    label: 'Logic',
    description: 'Routes the run based on the previous result.',
    color: '#7fa7d9',
  },
  human: {
    label: 'Human',
    description: 'Pauses the run until a person approves or rejects.',
    color: '#f5e663',
  },
  output: {
    label: 'Output',
    description: 'Collects everything that happened into one report.',
    color: '#8bc34a',
  },
}

export interface NodeMetadata {
  type: NodeType
  /** Plain-English action, e.g. "Run tests". */
  title: string
  /** Frankenstein theme name, e.g. "Heart". */
  subLabel: string
  icon: string
  layer: NodeLayer
  paletteDesc: string
  purpose: string
  sampleOutput: string
  /** One-line summary shown inside the node on the canvas. */
  summary: (config: Record<string, unknown>) => string
}

export const NODE_METADATA: Record<NodeType, NodeMetadata> = {
  Spark: {
    type: 'Spark',
    title: 'On code push',
    subLabel: 'Spark',
    icon: '⚡',
    layer: 'trigger',
    paletteDesc: 'Starts the workflow when new code is pushed to GitHub.',
    purpose:
      'Every workflow begins here. A GitHub push (or the Simulate button) sends the commit into the lab and the run starts.',
    sampleOutput: '✓ Trigger fired: received commit #f8a12c on branch "main"',
    summary: (c) =>
      c.triggerType === 'github_push' ? 'GitHub push webhook' : 'Manual simulate',
  },
  Brain: {
    type: 'Brain',
    title: 'AI code review',
    subLabel: 'Brain',
    icon: '🧠',
    layer: 'ai',
    paletteDesc: 'An AI agent reads the diff and suggests fixes.',
    purpose:
      'Calls the AI agent with read-only tools. It reads the changed files, looks for bugs and risky logic, and writes suggestions. It never edits code on its own.',
    sampleOutput:
      '💡 AI: "calculateTotal() looks fine, but add a null check for `items` on line 42."',
    summary: (c) => `Max ${typeof c.maxSteps === 'number' ? c.maxSteps : 10} agent steps`,
  },
  Eyes: {
    type: 'Eyes',
    title: 'Security scan',
    subLabel: 'Eyes',
    icon: '👁️',
    layer: 'runner',
    paletteDesc: 'Looks for leaked secrets and known vulnerabilities.',
    purpose:
      'Scans the changed files for leaked API keys or passwords and checks dependencies for known vulnerabilities.',
    sampleOutput: '✓ Security: 0 leaked secrets, 0 critical issues in 3 changed files.',
    summary: () => 'Secrets + dependency check',
  },
  Scalpel: {
    type: 'Scalpel',
    title: 'Lint code',
    subLabel: 'Scalpel',
    icon: '🔪',
    layer: 'runner',
    paletteDesc: 'Runs the linter to catch style and syntax problems.',
    purpose:
      "Runs your project's linter inside the sandbox runner. Only allowlisted commands can run.",
    sampleOutput: '✗ Lint: npm run lint found 1 error (no-unused-vars in src/cart.ts:12).',
    summary: (c) => (typeof c.command === 'string' ? c.command : 'npm run lint'),
  },
  Heart: {
    type: 'Heart',
    title: 'Run tests',
    subLabel: 'Heart',
    icon: '❤️',
    layer: 'runner',
    paletteDesc: 'Runs the test suite and reports pass or fail.',
    purpose:
      'Runs the test suite inside the sandbox runner. The result (pass or fail) is passed on to the next node, usually a Fork.',
    sampleOutput: '✓ Tests: 12 run, 12 passed (1.2 s).',
    summary: (c) => (typeof c.command === 'string' ? c.command : 'npm test'),
  },
  Fork: {
    type: 'Fork',
    title: 'Pass / fail branch',
    subLabel: 'Fork',
    icon: '🔀',
    layer: 'logic',
    paletteDesc: 'Sends the run down the Pass or Fail path.',
    purpose:
      'Checks the result of the previous steps. If everything passed, the run follows the Pass stitch. Otherwise it follows the Fail stitch.',
    sampleOutput: '🔀 All checks passed → following the [Pass] stitch.',
    summary: () => 'Routes on previous result',
  },
  'Lightning Lever': {
    type: 'Lightning Lever',
    title: 'Human approval',
    subLabel: 'Lightning Lever',
    icon: '🎚️',
    layer: 'human',
    paletteDesc: 'Pauses the run until you approve or reject.',
    purpose:
      'Stops the run and waits for a person. Nothing after this node happens until you pull the lever: Approve or Reject.',
    sampleOutput: '⏸️ Awaiting approval… approved by @dev at 08:30.',
    summary: () => 'Waits for Approve / Reject',
  },
  'Autopsy Report': {
    type: 'Autopsy Report',
    title: 'Run report',
    subLabel: 'Autopsy Report',
    icon: '📋',
    layer: 'output',
    paletteDesc: 'Collects AI findings, test results, and approvals in one report.',
    purpose:
      'The end of the line. It gathers the AI review, lint and test results, and the approval decision into a single readable report.',
    sampleOutput: '📋 Report: "Status: PASSED | AI: 1 suggestion | Tests: 12/12 | Approved"',
    summary: (c) => (c.format === 'json' ? 'JSON report' : 'Markdown report'),
  },
}

export function getNodeTitle(type: NodeType, contextVariant?: 'passed' | 'failed'): string {
  if (type === 'Autopsy Report') {
    if (contextVariant === 'passed') return 'Report: passed'
    if (contextVariant === 'failed') return 'Report: failed'
  }
  return NODE_METADATA[type]?.title || type
}

export function getNodeSubLabel(type: NodeType): string {
  return NODE_METADATA[type]?.subLabel || type
}

export function getNodeIcon(type: NodeType): string {
  return NODE_METADATA[type]?.icon || '⚙️'
}

export function getNodeLayer(type: NodeType): LayerInfo {
  return LAYER_INFO[NODE_METADATA[type]?.layer ?? 'logic']
}

/** Edge branch labels keyed by source handle id. */
export const BRANCH_LABELS: Record<string, { label: string; tone: 'pass' | 'fail' }> = {
  passed: { label: 'Pass', tone: 'pass' },
  approve: { label: 'Approved', tone: 'pass' },
  failed: { label: 'Fail', tone: 'fail' },
  reject: { label: 'Rejected', tone: 'fail' },
}
