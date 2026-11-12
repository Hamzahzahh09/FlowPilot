// Measures page transitions in a real Chrome via the DevTools protocol.
// No dependencies: Node 22 has fetch and WebSocket built in.
//
//   node scripts/measure-nav.mjs [baseUrl] [rounds]
//
// Per transition it reports two times from the click:
//   route  the new route has rendered (old page content is gone)
//   ready  the page shows real content (no skeleton or "Loading" status)
// Round 1 in `next dev` includes compiling each route on first visit.

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:3000'
const ROUNDS = Number(process.argv[3] ?? 2)
const PORT = 9333
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEMO = '450e8400-e29b-41d4-a716-446655440000'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'fp-measure-'))
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1280,900',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = targets.find((t) => t.type === 'page')
      if (page) return { chrome, profile, wsUrl: page.webSocketDebuggerUrl }
    } catch {}
    await sleep(200)
  }
  throw new Error('Chrome did not start')
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let nextId = 1
  const pending = new Map()
  const waiters = []
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    } else if (msg.method) {
      for (const w of [...waiters]) if (w.method === msg.method) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg.params) }
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  const once = (method) => new Promise((resolve) => waiters.push({ method, resolve }))
  return new Promise((resolve) => (ws.onopen = () => resolve({ send, once, close: () => ws.close() })))
}

// Runs in the page. Clicks `selector` (optionally matching text) and times the
// route change and the ready state.
const STEP = `async ({ selector, text, path }) => {
  const now = () => performance.now()
  const until = (fn, timeout = 15000) => new Promise((resolve, reject) => {
    const start = now()
    const tick = () => {
      let v; try { v = fn() } catch { v = false }
      if (v) return resolve(now())
      if (now() - start > timeout) return reject(new Error('timeout waiting at ' + location.pathname + location.search + ' cookie=' + document.cookie))
      setTimeout(tick, 5)
    }
    tick()
  })
  const main = () => document.querySelector('#main') ?? document.querySelector('main') ?? document.body
  const busy = () => {
    const m = main()
    if (m.querySelector('[data-skeleton]')) return true
    return [...m.querySelectorAll('[role=status]')].some((el) => /^Loading/.test(el.textContent.trim()))
  }
  const candidates = [...document.querySelectorAll(selector)].filter((el) => !text || el.textContent.trim().includes(text))
  const el = candidates[0]
  if (!el) throw new Error('no element ' + selector + ' ' + (text ?? '') + ' on ' + location.pathname)
  for (const child of main().children) child.setAttribute('data-old', '')
  const t0 = now()
  el.click()
  const re = new RegExp(path)
  const route = await until(() => re.test(location.pathname) && !document.querySelector('[data-old]') && main().children.length > 0)
  const ready = await until(() => re.test(location.pathname) && !busy() && main().querySelector('h1'))
  return { route: Math.round(route - t0), ready: Math.round(ready - t0) }
}`

async function main() {
  const { chrome, profile, wsUrl } = await launch()
  const cdp = await connect(wsUrl)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')

  const goto = async (url) => {
    const loaded = cdp.once('Page.loadEventFired')
    await cdp.send('Page.navigate', { url: BASE + url })
    await loaded
    await sleep(300)
  }
  const evaluate = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
    return r.result.value
  }
  const step = (selector, text, path) => evaluate(`(${STEP})(${JSON.stringify({ selector, text, path })})`)
  // Waits until the current page has real content (after a full load).
  const settle = () =>
    evaluate(`new Promise((resolve) => { const t = setInterval(() => { const m = document.querySelector('#main'); if (m && m.querySelector('h1') && !m.querySelector('[data-skeleton]') && ![...m.querySelectorAll('[role=status]')].some((el) => /^Loading/.test(el.textContent.trim()))) { clearInterval(t); resolve(true) } }, 20) })`)

  const results = []
  try {
    for (let round = 1; round <= ROUNDS; round++) {
      await cdp.send('Network.clearBrowserCookies').catch(() => {})
      await cdp.send('Network.enable')
      await cdp.send('Network.clearBrowserCookies')
      await goto('/login?next=/workflows')
      await evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Use demo account')).click()`)
      await sleep(100)
      const record = (name, r) => results.push({ round, name, ...r })

      record('login -> /workflows', await step('button[type=submit]', '', '^/workflows$').catch(async (error) => {
        // Record a stuck login and continue with the session cookie set directly.
        console.error(`round ${round}: login did not reach /workflows: ${error.message}`)
        await goto('/workflows')
        await settle()
        return { route: 'stuck', ready: 'stuck' }
      }))
      record('/workflows -> editor (Open)', await step(`a[href="/workflows/${DEMO}"]`, 'Open', `^/workflows/${DEMO}$`))
      record('editor -> /runners (side nav)', await step('nav a[href="/runners"]', '', '^/runners$'))
      record('/runners -> /workflows (side nav)', await step('nav a[href="/workflows"]', '', '^/workflows$'))
      record('/workflows -> run (Simulate push)', await step('button', 'Simulate push', '^/runs/[0-9a-f-]+$'))
      const runPath = await evaluate('location.pathname')
      // Wait for the lever, approve, wait for the end, then open the report.
      await evaluate(`new Promise((resolve) => { const t = setInterval(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Approve'); if (b && !b.disabled) { clearInterval(t); b.click(); resolve(true) } }, 50) })`)
      await evaluate(`new Promise((resolve) => { const t = setInterval(() => { if (document.querySelector('a[href$="/report"]')) { clearInterval(t); resolve(true) } }, 50) })`)
      record('run -> report (View report)', await step('a[href$="/report"]', 'View report', '^/runs/[0-9a-f-]+/report$'))
      record('report -> run (Live run view)', await step(`a[href="${runPath}"]`, 'Live run view', '^/runs/[0-9a-f-]+$'))
      await goto(`/workflows/${DEMO}`)
      await settle()
      record('full load editor -> run (Simulate push)', await step('button', 'Simulate push', '^/runs/[0-9a-f-]+$'))
    }
  } finally {
    cdp.close()
    chrome.kill()
    await sleep(500)
    try { rmSync(profile, { recursive: true, force: true }) } catch {}
  }

  const width = Math.max(...results.map((r) => r.name.length))
  console.log(`${'transition'.padEnd(width)}  round  route ms  ready ms`)
  for (const r of results) {
    console.log(`${r.name.padEnd(width)}  ${String(r.round).padStart(5)}  ${String(r.route).padStart(8)}  ${String(r.ready).padStart(8)}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
