// Checks the loading feedback in a real headless Chrome (DevTools protocol).
//   node scripts/check-loading-ui.mjs [baseUrl]
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:3000'
const PORT = 9334
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEMO = '450e8400-e29b-41d4-a716-446655440000'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const check = (name, ok, extra = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}

const profile = mkdtempSync(join(tmpdir(), 'fp-ui-'))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' })
let wsUrl
for (let i = 0; i < 50 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl
  } catch {}
  if (!wsUrl) await sleep(200)
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let nextId = 1
const pending = new Map()
const waiters = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  } else for (const w of [...waiters]) if (w.method === m.method) (waiters.splice(waiters.indexOf(w), 1), w.resolve())
}
const send = (method, params = {}) => new Promise((r) => { const id = nextId++; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })) })
const once = (method) => new Promise((resolve) => waiters.push({ method, resolve }))
const js = async (expression) => {
  const m = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (m.result?.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description)
  return m.result?.result?.value
}
const goto = async (path) => { const l = once('Page.loadEventFired'); await send('Page.navigate', { url: BASE + path }); await l; await sleep(400) }

try {
  await send('Page.enable')
  await send('Network.enable')

  // Login: status line and busy button right after submit.
  await goto('/login?next=/workflows')
  await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Use demo account')).click()`)
  await sleep(100)
  // Collect status texts while the page unloads (sessionStorage survives).
  await js(`(() => {
    const seen = new Set(); const form = document.querySelector('form')
    const record = () => { const s = form.querySelector('[role=status]')?.textContent.trim(); if (s) seen.add(s)
      const b = form.querySelector('button[type=submit]'); if (b?.getAttribute('aria-busy') === 'true') seen.add('busy:' + b.textContent.trim())
      sessionStorage.setItem('seen', JSON.stringify([...seen])) }
    new MutationObserver(record).observe(form, { subtree: true, childList: true, characterData: true, attributes: true })
    form.querySelector('button[type=submit]').click(); record()
  })()`)
  await once('Page.loadEventFired')
  await sleep(300)
  const seen = JSON.parse((await js(`sessionStorage.getItem('seen')`)) ?? '[]')
  check('login shows "Signing in as demo…"', seen.includes('Signing in as demo…'), JSON.stringify(seen))
  check('login shows "Loading your workspace…"', seen.includes('Loading your workspace…'))
  check('Sign in button is aria-busy with "Signing in…"', seen.includes('busy:Signing in…'))
  check('login lands on /workflows', (await js('location.pathname')) === '/workflows')

  // Workflows: skeleton while loading, then cards.
  await goto('/workflows')
  await js(`new Promise((r) => { const t = setInterval(() => { if (document.querySelector('#main article')) { clearInterval(t); r() } }, 20) })`)
  // Progress bar and route skeleton on a link click.
  const nav = await js(`new Promise((resolve) => {
    const link = document.querySelector('a[href="/workflows/${DEMO}"]'); const t0 = performance.now(); let bar = null, skeleton = false
    const t = setInterval(() => {
      bar ??= document.querySelector('[class*=NavigationProgress_bar]') ? Math.round(performance.now() - t0) : null
      skeleton ||= Boolean(document.querySelector('#main [data-skeleton]'))
      if (location.pathname !== '/' + 'workflows' && document.querySelector('#main h1') && !document.querySelector('#main [data-skeleton]')) { clearInterval(t); resolve({ bar, skeleton }) }
    }, 5)
    link.click()
  })`)
  check('progress bar starts on link click', nav.bar !== null && nav.bar < 100, `${nav.bar} ms`)
  check('editor skeleton shown while loading', nav.skeleton)
  await sleep(600)
  check('progress bar gone after the route rendered', !(await js(`Boolean(document.querySelector('[class*=NavigationProgress_loading]'))`)))

  // Save: pending label, spinner and aria-busy.
  const save = await js(`new Promise((resolve) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Save'); const seen = new Set()
    new MutationObserver(() => { if (b.getAttribute('aria-busy') === 'true') seen.add(b.textContent.trim() + (b.querySelector('[class*=Spinner_spinner]') ? '+spinner' : '')) }).observe(b, { subtree: true, childList: true, attributes: true, characterData: true })
    b.click(); setTimeout(() => resolve([...seen]), 3000)
  })`)
  check('Save shows "Saving…" with spinner and aria-busy', save.includes('Saving…+spinner'), JSON.stringify(save))

  // Slow wait: 12 s latency, Save, then the notice with Retry after 8 s.
  await send('Network.emulateNetworkConditions', { offline: false, latency: 12000, downloadThroughput: -1, uploadThroughput: -1 })
  await js(`[...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Save').click()`)
  await sleep(7000)
  const early = await js(`document.body.innerText.includes('taking longer than usual')`)
  await sleep(1800)
  const slow = await js(`(() => {
    const status = [...document.querySelectorAll('[role=status]')].find((s) => s.textContent.includes('taking longer than usual'))
    return { text: Boolean(status), live: status?.getAttribute('aria-live'), retry: Boolean(status && [...status.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Retry')) }
  })()`)
  check('no slow notice before 8 s', !early)
  check('slow notice after 8 s, polite live region, Retry', slow.text && slow.live === 'polite' && slow.retry, JSON.stringify(slow))
  // Offline: the request fails, then a clear error with Retry.
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
  await js(`[...document.querySelectorAll('[role=status] button')].find((b) => b.textContent.trim() === 'Retry').click()`)
  await sleep(1500)
  const failed = await js(`(() => { const a = [...document.querySelectorAll('[role=alert]')].find((x) => x.textContent.includes('Could not save')); return a ? a.textContent : null })()`)
  check('failed save shows an error with Retry', Boolean(failed) && failed.includes('Retry'), failed ?? '')
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })

  // Reduced motion: spinner and skeleton do not animate.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  const motion = await js(`(() => {
    const s = document.createElement('span'); s.className = [...document.styleSheets].flatMap((x) => { try { return [...x.cssRules] } catch { return [] } }).map((r) => r.selectorText).find((t) => t && /Spinner_spinner/.test(t))?.slice(1) ?? ''
    const k = document.createElement('span'); k.className = [...document.styleSheets].flatMap((x) => { try { return [...x.cssRules] } catch { return [] } }).map((r) => r.selectorText).find((t) => t && /Skeleton_block/.test(t))?.slice(1) ?? ''
    document.body.append(s, k); const r = { spinner: getComputedStyle(s).animationName, skeleton: getComputedStyle(k).animationName, spinnerClass: s.className, skeletonClass: k.className }; s.remove(); k.remove(); return r
  })()`)
  check('reduced motion: spinner is a static dot', motion.spinnerClass && motion.spinner === 'none', JSON.stringify(motion))
  check('reduced motion: skeleton does not pulse', motion.skeletonClass && motion.skeleton === 'none')
} finally {
  ws.close()
  chrome.kill()
  await sleep(500)
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
}
console.log(`${failures} failures`)
process.exit(failures ? 1 : 0)
