import type { DataSource } from './source'
import type { GithubSettings, Run, RunSummary, Runner, Workflow, WorkflowSummary } from './types'

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

async function mutate<T>(path: string, method: string, body: unknown): Promise<T> {
  const result = await request<T>(path, { method, body })
  emit()
  return result
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
      orNull(request<{ workflow: Workflow }>(`/api/workflows/${id(workflowId)}`).then((r) => r.workflow)),
    create: async (input) =>
      (await mutate<{ workflow: Workflow }>('/api/workflows', 'POST', input ?? {})).workflow,
    save: async (workflowId, input) =>
      (await mutate<{ workflow: Workflow }>(`/api/workflows/${id(workflowId)}`, 'PUT', input)).workflow,
  },

  runs: {
    list: async () => (await request<{ runs: RunSummary[] }>('/api/runs')).runs,
    get: (runId) => orNull(request<{ run: Run }>(`/api/runs/${id(runId)}`).then((r) => r.run)),
    start: async (workflowId) => (await mutate<{ run: Run }>('/api/runs', 'POST', { workflowId })).run,
    decide: async (runId, decision) =>
      (await mutate<{ run: Run }>(`/api/runs/${id(runId)}/decision`, 'POST', { decision })).run,
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
