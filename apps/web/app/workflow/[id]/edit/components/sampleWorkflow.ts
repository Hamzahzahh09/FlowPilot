import type { WorkflowData } from 'shared'

/**
 * Sample workflow used by the demo page and the "Use template" button:
 * Spark → Brain → Scalpel → Heart → Fork → (Pass) Lever → Report / (Fail) Report
 */
export const SAMPLE_WORKFLOW: WorkflowData = {
  nodes: [
    {
      id: 'sample-spark',
      type: 'Spark',
      position: { x: 40, y: 200 },
      config: { triggerType: 'manual_simulate' },
    },
    {
      id: 'sample-brain',
      type: 'Brain',
      position: { x: 300, y: 200 },
      config: {
        prompt: 'Review the changed code for bugs, security issues, and unclear logic.',
        maxSteps: 10,
      },
    },
    {
      id: 'sample-scalpel',
      type: 'Scalpel',
      position: { x: 560, y: 200 },
      config: { command: 'npm run lint' },
    },
    {
      id: 'sample-heart',
      type: 'Heart',
      position: { x: 820, y: 200 },
      config: { command: 'npm test' },
    },
    {
      id: 'sample-fork',
      type: 'Fork',
      position: { x: 1080, y: 192 },
      config: {},
    },
    {
      id: 'sample-lever',
      type: 'Lightning Lever',
      position: { x: 1340, y: 90 },
      config: {},
    },
    {
      id: 'sample-report-pass',
      type: 'Autopsy Report',
      position: { x: 1600, y: 90 },
      config: { format: 'markdown' },
    },
    {
      id: 'sample-report-fail',
      type: 'Autopsy Report',
      position: { x: 1340, y: 330 },
      config: { format: 'markdown' },
    },
  ],
  edges: [
    { id: 'e-spark-brain', source: 'sample-spark', target: 'sample-brain' },
    { id: 'e-brain-scalpel', source: 'sample-brain', target: 'sample-scalpel' },
    { id: 'e-scalpel-heart', source: 'sample-scalpel', target: 'sample-heart' },
    { id: 'e-heart-fork', source: 'sample-heart', target: 'sample-fork' },
    {
      id: 'e-fork-lever',
      source: 'sample-fork',
      target: 'sample-lever',
      sourceHandle: 'passed',
      label: 'Pass',
    },
    {
      id: 'e-fork-report-fail',
      source: 'sample-fork',
      target: 'sample-report-fail',
      sourceHandle: 'failed',
      label: 'Fail',
    },
    {
      id: 'e-lever-report',
      source: 'sample-lever',
      target: 'sample-report-pass',
      sourceHandle: 'approve',
      label: 'Approved',
    },
  ],
}
