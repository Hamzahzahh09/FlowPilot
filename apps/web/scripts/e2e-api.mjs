// End-to-end API check against a running server and its database.
// Creates one workflow ("E2E check") and two runs; leaves them in place.
//   node scripts/e2e-api.mjs [baseUrl]
const BASE = process.argv[2] ?? 'http://localhost:3000'
const DEMO = '450e8400-e29b-41d4-a716-446655440000'
const headers = { cookie: 'fp_session=demo', 'content-type': 'application/json' }
let failures = 0

async function call(path, { method = 'GET', body, cookie = true } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: 'manual',
    headers: cookie ? headers : { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {}
  return { status: res.status, json, location: res.headers.get('location') }
}

function check(name, ok, extra = '') {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function waitFor(runId, status, timeoutMs = 20000) {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    const r = await call('/api/runs')
    if (r.json?.runs?.find((x) => x.id === runId)?.status === status) return true
    await sleep(500)
  }
  return false
}

let r = await call('/api/workflows', { cookie: false })
check('API without session is 401', r.status === 401)

r = await call(`/api/workflows/${DEMO}`)
const demo = r.json?.workflow
check('get demo workflow', r.status === 200 && demo?.graph.nodes.length === 6)
check(
  'Scalpel command kept (allowlisted)',
  ['npm run lint', 'npm test', 'npm run build'].includes(demo?.graph.nodes.find((n) => n.type === 'Scalpel')?.config.command),
)

r = await call('/api/workflows', { method: 'POST', body: { name: 'E2E check' } })
const wf = r.json?.workflow
check('create workflow', r.status === 200 && wf?.name === 'E2E check')

const bad = structuredClone(demo.graph)
bad.nodes.find((n) => n.type === 'Scalpel').config.command = 'rm -rf /'
r = await call(`/api/workflows/${wf.id}`, { method: 'PUT', body: { graph: bad } })
check('command outside allowlist is 400', r.status === 400)

r = await call(`/api/workflows/${wf.id}`, { method: 'PUT', body: { graph: demo.graph } })
check('save valid graph', r.status === 200)

r = await call('/api/runs', { method: 'POST', body: { workflowId: wf.id } })
const run1 = r.json?.run
check('start run', r.status === 200 && run1?.events.length > 0)
r = await call(`/api/runs/${run1.id}/decision`, { method: 'POST', body: { decision: 'approved' } })
check('decide before the lever is 409', r.status === 409)
check('run 1 reaches awaiting_approval', await waitFor(run1.id, 'awaiting_approval'))
r = await call(`/api/runs/${run1.id}/decision`, { method: 'POST', body: { decision: 'approved' } })
check('approve', r.status === 200)
r = await call(`/api/runs/${run1.id}/decision`, { method: 'POST', body: { decision: 'rejected' } })
check('second decision is 409', r.status === 409)
check('approved run succeeds', await waitFor(run1.id, 'succeeded'))

r = await call('/api/runs', { method: 'POST', body: { workflowId: wf.id } })
const run2 = r.json?.run
check('run 2 reaches awaiting_approval', await waitFor(run2.id, 'awaiting_approval'))
r = await call(`/api/runs/${run2.id}/decision`, { method: 'POST', body: { decision: 'rejected' } })
check('reject', r.status === 200)
check('rejected run fails', await waitFor(run2.id, 'failed'))

r = await call('/api/workflows')
const card = r.json?.workflows?.find((w) => w.id === wf.id)
check('workflow card shows the last run', card?.lastRun?.id === run2.id && card.lastRun.status === 'failed')

for (const [from, to] of [
  ['/workflow', '/workflows'],
  [`/workflow/${DEMO}/edit`, `/workflows/${DEMO}`],
]) {
  r = await call(from)
  check(`redirect ${from}`, r.status === 307 && r.location?.endsWith(to))
}
for (const page of ['/workflows', `/workflows/${DEMO}`, `/runs/${run1.id}`, `/runs/${run1.id}/report`]) {
  r = await call(page)
  check(`page ${page}`, r.status === 200)
}

console.log(`${failures} failures`)
process.exit(failures ? 1 : 0)
