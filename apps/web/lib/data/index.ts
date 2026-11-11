import { mockSource } from './mock'
import type { DataSource } from './source'

// Swap this for an HTTP adapter when the backend exists. Pages import `data`
// and the types only, never the mock directly.
export const data: DataSource = mockSource

export { DEMO_WORKFLOW_ID } from './mock/seed'
export type { DataSource } from './source'
export * from './types'
