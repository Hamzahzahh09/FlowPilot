import type { DataSource } from './source'
import type { GithubSettings, Run, RunStatus, RunSummary, Runner, Workflow, WorkflowSummary } from './types'

// HTTP adapter for app/api (Neon). Same interface as the browser mock, so
// pages do not change. Mutations notify subscribers so useQuery reloads.

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

type ErrorBody = { error?: string; details?: string[] }

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? 'GET',
    headers: init?.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const { error, details } = (body ?? {}) as ErrorBody
    const message = error ?? `Request failed (${response.status})`
    throw new HttpError(response.status, details && details.length > 0 ? `${message} ${details.join(' ')}` : message)
  }
  // The route handlers in app/api define these shapes.
  return body as T
}

async function mutate<T>(path: string, method: string, body: unknown, keep?: (result: T) => void): Promise<T> {
  const result = await request<T>(path, { method, body })
  // Before emit: subscribers reload right away and should find the handoff.
  keep?.(result)
  emit()
  return result
}

// A mutation's response is the fresh resource. The next `get` of it (the
// page navigated to, or the reload after emit) uses it once instead of
// fetching it again. Short-lived so stale data is never served later.
const HANDOFF_MS = 10_000
const handoff = new Map<string, { value: unknown; until: number }>()

function hand(key: string, value: unknown) {
  handoff.set(key, { value, until: Date.now() + HANDOFF_MS })
}

function take<T>(key: string): T | undefined {
  const entry = handoff.get(key)
  handoff.delete(key)
  return entry && entry.until > Date.now() ? (entry.value as T) : undefined
}

async function cached<T>(key: string, load: () => Promise<T | null>): Promise<T | null> {
  return take<T>(key) ?? load()
}

// A run whose timeline already holds its final status never changes again
// (the timeline is computed up front; only a decision rewrites it, and that
// comes before the final status). Keep those for the tab, so moving between
// the live view and the report does not fetch the same run again.
const FINAL: ReadonlySet<RunStatus> = new Set(['succeeded', 'failed', 'cancelled', 'timed_out'])
const finishedRuns = new Map<string, Run>()

function remember(run: Run | null): Run | null {
  if (run && run.events.some((e) => e.kind === 'run' && FINAL.has(e.status))) finishedRuns.set(run.id, run)
  return run
}

/** Missing resources are null, like in the mock. */
async function orNull<T>(load: Promise<T>): Promise<T | null> {
  try {
    return await load
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null
    throw error
  }
}

const id = (value: string) => encodeURIComponent(value)

export const apiSource: DataSource = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  workflows: {
    list: async () => (await request<{ workflows: WorkflowSummary[] }>('/api/workflows')).workflows,
    get: (workflowId) =>
      cached(`workflow:${workflowId}`, () =>
        orNull(request<{ workflow: Workflow }>(`/api/workflows/${id(workflowId)}`).then((r) => r.workflow)),
      ),
    create: async (input) =>
      (
        await mutate<{ workflow: Workflow }>('/api/workflows', 'POST', input ?? {}, (r) =>
          hand(`workflow:${r.workflow.id}`, r.workflow),
        )
      ).workflow,
    save: async (workflowId, input) =>
      (
        await mutate<{ workflow: Workflow }>(`/api/workflows/${id(workflowId)}`, 'PUT', input, (r) =>
          hand(`workflow:${r.workflow.id}`, r.workflow),
        )
      ).workflow,
  },

  runs: {
    list: async () => (await request<{ runs: RunSummary[] }>('/api/runs')).runs,
    get: async (runId) =>
      finishedRuns.get(runId) ??
      remember(
        await cached(`run:${runId}`, () =>
          orNull(request<{ run: Run }>(`/api/runs/${id(runId)}`).then((r) => r.run)),
        ),
      ),
    start: async (workflowId) =>
      (await mutate<{ run: Run }>('/api/runs', 'POST', { workflowId }, (r) => hand(`run:${r.run.id}`, r.run))).run,
    decide: async (runId, decision) =>
      (
        await mutate<{ run: Run }>(`/api/runs/${id(runId)}/decision`, 'POST', { decision }, (r) =>
          hand(`run:${r.run.id}`, r.run),
        )
      ).run,
  },

  runners: {
    list: async () => (await request<{ runners: Runner[] }>('/api/runners')).runners,
    createToken: (name) => mutate<{ runner: Runner; token: string }>('/api/runners', 'POST', { name }),
  },

  github: {
    get: async () => (await request<{ settings: GithubSettings }>('/api/settings/github')).settings,
    connect: async (repository) =>
      (await mutate<{ settings: GithubSettings }>('/api/settings/github', 'PATCH', { action: 'connect', repository }))
        .settings,
    disconnect: async () =>
      (await mutate<{ settings: GithubSettings }>('/api/settings/github', 'PATCH', { action: 'disconnect' }))
        .settings,
    setTriggers: async (triggers) =>
      (await mutate<{ settings: GithubSettings }>('/api/settings/github', 'PATCH', { action: 'triggers', triggers }))
        .settings,
  },
}
