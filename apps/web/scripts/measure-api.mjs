// Times API round trips (server + Neon) with the demo session.
//   node scripts/measure-api.mjs [baseUrl] [repeats]
const BASE = process.argv[2] ?? 'http://localhost:3000'
const N = Number(process.argv[3] ?? 5)
const DEMO = '450e8400-e29b-41d4-a716-446655440000'
const headers = { cookie: 'fp_session=demo', 'content-type': 'application/json' }

async function time(name, method, path, body) {
  const ms = []
  for (let i = 0; i < N; i++) {
    const t = performance.now()
    const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    await res.text()
    if (!res.ok) throw new Error(`${name}: ${res.status}`)
    ms.push(performance.now() - t)
  }
  ms.sort((a, b) => a - b)
  console.log(`${name.padEnd(28)} median ${Math.round(ms[Math.floor(N / 2)])} ms  min ${Math.round(ms[0])} ms`)
}

await time('GET /api/workflows', 'GET', '/api/workflows')
await time('GET /api/workflows/[id]', 'GET', `/api/workflows/${DEMO}`)
await time('GET /api/runs', 'GET', '/api/runs')
await time('GET /api/runners', 'GET', '/api/runners')
const t = performance.now()
const res = await fetch(BASE + '/api/runs', { method: 'POST', headers, body: JSON.stringify({ workflowId: DEMO }) })
const { run } = await res.json()
console.log(`${'POST /api/runs'.padEnd(28)} ${Math.round(performance.now() - t)} ms`)
await time('GET /api/runs/[id]', 'GET', `/api/runs/${run.id}`)
