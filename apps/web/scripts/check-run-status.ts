// Checks that the SQL status (server/runs.ts liveStatus) matches the JS
// timeline status (runStatusAt) for every run. Read-only apart from the
// status sync the list does anyway.
//   npx tsx --env-file=.env.local scripts/check-run-status.ts
import { runStatusAt } from '../lib/data/runStatus'
import { getRun, listRuns } from '../server/runs'

async function main() {
  // A fresh run passes through queued, running and awaiting_approval.
  if (process.argv.includes('--fresh')) {
    const { startRun } = await import('../server/runs')
    const { DEMO_WORKFLOW_ID } = await import('../lib/data/demo')
    const run = await startRun(DEMO_WORKFLOW_ID)
    for (const wait of [0, 400, 1500, 4000, 6000]) {
      await new Promise((r) => setTimeout(r, wait))
      const sqlStatus = (await listRuns()).find((r) => r.id === run.id)?.status
      // Same instant as closely as possible: JS right after the query.
      const js = runStatusAt(run)
      console.log(`fresh run +${wait} ms: sql ${sqlStatus}, js ${js}${sqlStatus === js ? '' : '  (differs)'}`)
    }
  }
  const list = await listRuns()
  let mismatches = 0
  for (const summary of list) {
    const run = await getRun(summary.id)
    if (!run) continue
    const js = runStatusAt(run)
    if (js !== summary.status) {
      mismatches++
      console.log(`mismatch ${run.id}: sql ${summary.status}, js ${js}`)
    }
  }
  console.log(`${list.length} runs checked, ${mismatches} mismatches`)
  process.exit(mismatches ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
