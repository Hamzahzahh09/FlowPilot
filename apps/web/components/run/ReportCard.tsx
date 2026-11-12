import { NODE_ICONS } from '@/components/flow/nodeIcons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Run } from '@/lib/data/types'
import { TRIGGER_LABEL, absoluteTime } from '@/lib/format'
import type { RunView } from '@/lib/run/reduce'
import { KIND_BY_TYPE, nodeTitle, operationFor, NODE_META } from '@/lib/workflow/graph'
import { STATUS_LABEL, type NodeStatus } from '@/lib/workflow/types'
import styles from './ReportCard.module.css'

const STEP_LABEL: Record<NodeStatus, string> = { ...STATUS_LABEL, idle: 'Not run' }

/** Steps in the order they started; steps that never ran go last. */
function stepsInRunOrder(run: Run) {
  const firstAt = new Map<string, number>()
  for (const event of run.events) {
    if (event.kind === 'node' && !firstAt.has(event.nodeId)) firstAt.set(event.nodeId, event.at)
  }
  return [...run.graph.nodes].sort(
    (a, b) => (firstAt.get(a.id) ?? Infinity) - (firstAt.get(b.id) ?? Infinity),
  )
}

export function ReportCard({ run, view }: { run: Run; view: RunView }) {
  const lint = view.checks.filter((c) => c.check === 'lint')
  const tests = view.checks.filter((c) => c.check === 'test')
  const duration = view.endedAt !== null ? `${(view.endedAt / 1000).toFixed(1)} s` : 'Not finished'
  const decision =
    view.decision === 'approved' ? 'Approved' : view.decision === 'rejected' ? 'Rejected' : 'No approval step'

  return (
    <article className={styles.report} aria-label="Autopsy report details">
      <section className={styles.decision} aria-labelledby="report-decision">
        <div>
          <h2 id="report-decision" className={styles.decisionTitle}>
            {decision}
          </h2>
          <p className={styles.muted}>
            {view.decision
              ? `Decided at the Lightning Lever by demo@flowpilot.dev. Nothing was merged or changed by the AI.`
              : 'This workflow has no Lightning Lever, so no one was asked to approve it.'}
          </p>
        </div>
        <span>
          <span className="sr-only">Run status: </span>
          <StatusBadge status={view.status} />
        </span>
      </section>

      <dl className={styles.summary}>
        <div className={styles.tile}>
          <dt>AI findings</dt>
          <dd>{view.findings.length}</dd>
        </div>
        <div className={styles.tile}>
          <dt>Lint</dt>
          <dd data-pass={lint.length ? lint.every((c) => c.passed) : undefined}>
            {lint.length === 0 ? 'Not run' : lint.every((c) => c.passed) ? 'Passed' : 'Failed'}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>Tests</dt>
          <dd data-pass={tests.length ? tests.every((c) => c.passed) : undefined}>
            {tests.length === 0 ? 'Not run' : tests.every((c) => c.passed) ? 'Passed' : 'Failed'}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>Duration</dt>
          <dd>{duration}</dd>
        </div>
      </dl>

      <section className={styles.block} aria-labelledby="report-findings">
        <h2 id="report-findings" className={styles.blockTitle}>
          AI findings
        </h2>
        {view.findings.length === 0 ? (
          <p className={styles.muted}>The Brain did not run or found nothing to suggest.</p>
        ) : (
          <ul className={styles.items}>
            {view.findings.map((f) => (
              <li key={`${f.file}:${f.line}`} className={styles.item}>
                <p className={styles.mono}>
                  {f.file}:{f.line} <span className={styles.muted}>· {f.severity === 'warning' ? 'Warning' : 'Suggestion'}</span>
                </p>
                <p>{f.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(
        [
          ['report-lint', 'Lint result', lint],
          ['report-tests', 'Test result', tests],
        ] as const
      ).map(([id, title, checks]) => (
        <section key={id} className={styles.block} aria-labelledby={id}>
          <h2 id={id} className={styles.blockTitle}>
            {title}
          </h2>
          {checks.length === 0 ? (
            <p className={styles.muted}>This check is not part of the workflow.</p>
          ) : (
            <ul className={styles.items}>
              {checks.map((c) => (
                <li key={c.nodeId} className={styles.item}>
                  <p className={styles.checkHead}>
                    <span className={styles.mono}>$ {c.command}</span>
                    <span className={styles.verdict} data-pass={c.passed}>
                      {c.passed ? 'Passed' : 'Failed'}
                    </span>
                  </p>
                  <p>{c.summary}</p>
                  {c.details.length > 0 && (
                    <pre className={styles.details}>{c.details.join('\n')}</pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className={styles.block} aria-labelledby="report-steps">
        <h2 id="report-steps" className={styles.blockTitle}>
          Steps
        </h2>
        <ol className={styles.steps}>
          {stepsInRunOrder(run).map((node) => {
            const kind = KIND_BY_TYPE[node.type]
            const Icon = NODE_ICONS[kind]
            const status = view.nodeStatus[node.id] ?? 'idle'
            return (
              <li key={node.id} className={styles.step} data-status={status}>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className={styles.stepText}>
                  <span>{nodeTitle(node)}</span>
                  <span className={styles.muted}>
                    {NODE_META[kind].themeName} · {operationFor(node.type, node.config)}
                  </span>
                </span>
                <span className={styles.stepStatus}>
                  <span className={styles.dot} aria-hidden="true" />
                  {STEP_LABEL[status]}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      <section className={styles.block} aria-labelledby="report-meta">
        <h2 id="report-meta" className={styles.blockTitle}>
          Run details
        </h2>
        <dl className={styles.meta}>
          <div>
            <dt>Workflow</dt>
            <dd>{run.workflowName}</dd>
          </div>
          <div>
            <dt>Trigger</dt>
            <dd>{TRIGGER_LABEL[run.trigger]}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>
              <time dateTime={run.startedAt}>{absoluteTime(run.startedAt)}</time>
            </dd>
          </div>
          <div>
            <dt>Runner</dt>
            <dd>Hosted sandbox</dd>
          </div>
          <div>
            <dt>Run id</dt>
            <dd className={styles.mono}>{run.id}</dd>
          </div>
        </dl>
      </section>
    </article>
  )
}
