import type {
  GithubSettings,
  Run,
  RunDecision,
  RunSummary,
  Runner,
  Workflow,
  WorkflowGraph,
  WorkflowSummary,
} from './types'

/**
 * The only data interface pages use. The mock (browser storage) implements it
 * today; an HTTP adapter for app/api can implement it later without changing
 * callers. Every method is async for that reason.
 */
export interface DataSource {
  /** Called after any change. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void

  workflows: {
    list(): Promise<WorkflowSummary[]>
    get(id: string): Promise<Workflow | null>
    create(input?: { name?: string }): Promise<Workflow>
    save(id: string, input: { name?: string; graph: WorkflowGraph }): Promise<Workflow>
    delete(id: string): Promise<void>
    duplicate(id: string): Promise<Workflow>
  }

  runs: {
    list(): Promise<RunSummary[]>
    get(id: string): Promise<Run | null>
    start(workflowId: string): Promise<Run>
    decide(runId: string, decision: RunDecision): Promise<Run>
  }

  runners: {
    list(): Promise<Runner[]>
    /** Returns the plain token once. Only a hash and a preview are stored. */
    createToken(name: string): Promise<{ runner: Runner; token: string }>
  }

  github: {
    get(): Promise<GithubSettings>
    connect(repository: string): Promise<GithubSettings>
    disconnect(): Promise<GithubSettings>
    setTriggers(triggers: GithubSettings['triggers']): Promise<GithubSettings>
  }
}
