import { createSeed, type MockState } from './seed'

const KEY = 'flowpilot:v1'

let cache: MockState | null = null
const listeners = new Set<() => void>()

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Shallow shape check. This is demo data in the user's own browser, so a
// mismatch just falls back to the seed instead of failing hard.
function isState(value: unknown): value is MockState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<MockState>
  return (
    v.version === 1 &&
    Array.isArray(v.workflows) &&
    Array.isArray(v.runs) &&
    Array.isArray(v.runners) &&
    typeof v.github === 'object' &&
    v.github !== null
  )
}

function persist(state: MockState): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: keep working in memory for this tab.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function readState(): MockState {
  if (cache) return cache
  if (!isBrowser()) return createSeed()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isState(parsed)) {
        cache = parsed
        return cache
      }
    }
  } catch {
    // Corrupt JSON: fall through to the seed.
  }
  cache = createSeed()
  persist(cache)
  return cache
}

export function writeState(next: MockState): void {
  cache = next
  persist(next)
  emit()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Keep tabs in sync.
if (isBrowser()) {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return
    cache = null
    emit()
  })
}
