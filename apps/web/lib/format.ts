import type { TriggerType } from '@/lib/data'

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "2 hours ago", "yesterday", "just now". */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return 'just now'
  for (const [unit, size] of UNITS) {
    if (abs >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(Math.round(seconds / 60), 'minute')
}

const dtf = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })

/** Full date for tooltips and <time title>. */
export function absoluteTime(iso: string): string {
  return dtf.format(new Date(iso))
}

export const TRIGGER_LABEL: Record<TriggerType, string> = {
  github_push: 'On push',
  manual_simulate: 'Manual',
}
