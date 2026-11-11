/**
 * Allowlisted commands for runner execution.
 * This list is shared between the builder UI and the sandbox runner.
 * Only these commands are permitted to run in the sandboxed environment.
 */
export const ALLOWED_COMMANDS = [
  'npm run lint',
  'npm test',
  'npm run build',
] as const

export type AllowedCommand = (typeof ALLOWED_COMMANDS)[number]
