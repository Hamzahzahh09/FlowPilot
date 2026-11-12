import { apiSource } from './api'
import { mockSource } from './mock'
import type { DataSource } from './source'

// Neon through app/api by default. NEXT_PUBLIC_DATA_SOURCE=mock keeps all
// data in this browser (offline work, no database). Pages import `data` and
// the types only, never an adapter directly.
export const data: DataSource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' ? mockSource : apiSource

export { DEMO_WORKFLOW_ID } from './demo'
export type { DataSource } from './source'
export * from './types'
