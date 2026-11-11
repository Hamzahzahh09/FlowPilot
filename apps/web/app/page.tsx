import Link from 'next/link'
import type { NodeType } from 'shared'
import {
  LAYER_INFO,
  NODE_METADATA,
  getNodeLayer,
} from './workflow/[id]/edit/components/nodeInfo'

// The sample pipeline shown in the hero, in run order
const PIPELINE: NodeType[] = ['Spark', 'Brain', 'Scalpel', 'Heart', 'Fork', 'Lightning Lever', 'Autopsy Report']

const GLOSSARY: NodeType[] = [
  'Spark',
  'Brain',
  'Eyes',
  'Scalpel',
  'Heart',
  'Fork',
  'Lightning Lever',
  'Autopsy Report',
]

const CHIMERA_PARTS = [
  {
    icon: '🧠',
    name: 'The AI brain',
    tag: 'Probabilistic',
    color: LAYER_INFO.ai.color,
    text: 'An AI agent reads your diff with read-only tools and explains what looks wrong. It suggests. It never edits, commits, or merges.',
  },
  {
    icon: '❤️',
    name: 'The runner body',
    tag: 'Deterministic',
    color: LAYER_INFO.runner.color,
    text: 'Lint and tests run in a sandboxed container: no network, no secrets, time and memory limits, and only allowlisted commands.',
  },
  {
    icon: '🎚️',
    name: 'Your hand on the lever',
    tag: 'Human in the loop',
    color: LAYER_INFO.human.color,
    text: 'The run stops at the Lightning Lever. Nothing moves forward until you read the findings and press Approve or Reject.',
  },
]

export default function Home() {
  return (
    <main className="lp">
      <div className="lp-container">
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">
            ⚡ FlowPilot
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/workflow/new" className="fp-btn">
              New workflow
            </Link>
            <Link href="/workflow/demo/edit" className="fp-btn fp-btn--primary">
              Open the demo
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="lp-hero">
          <span className="lp-eyebrow">🧪 Kiroween 2026 · Frankenstein category</span>
          <h1 className="lp-title">
            Automate the workflow.
            <br />
            <em>Keep control of the code.</em>
          </h1>
          <p className="lp-lead">
            FlowPilot is a visual builder for code-check pipelines. When you push to GitHub, an AI
            agent reviews the change, a sandboxed runner lints and tests it, and the run waits for
            your approval before it writes the final report.
          </p>
          <div className="lp-cta">
            <Link href="/workflow/demo/edit" className="fp-btn fp-btn--primary fp-btn--lg">
              ▶ Try the demo: simulate a push
            </Link>
            <Link href="/workflow/new" className="fp-btn fp-btn--lg">
              Build from scratch
            </Link>
          </div>

          {/* Pipeline preview built from the same metadata as the editor */}
          <div className="lp-pipeline lp-grid-bg" aria-label="Sample FlowPilot pipeline">
            <div className="lp-pipeline__row">
              {PIPELINE.map((type, i) => {
                const meta = NODE_METADATA[type]
                const layer = getNodeLayer(type)
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <span className="lp-thread" aria-hidden />}
                    <div className="lp-step" style={{ ['--accent' as string]: layer.color }}>
                      <div className="lp-step__layer">{layer.label}</div>
                      <div className="lp-step__title">
                        <span aria-hidden>{meta.icon}</span>
                        {meta.title}
                      </div>
                      <div className="lp-step__theme">{meta.subLabel}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="lp-legend">
              {(['trigger', 'ai', 'runner', 'logic', 'human', 'output'] as const).map((l) => (
                <span key={l}>
                  <i className="lp-dot" style={{ background: LAYER_INFO[l].color }} />
                  {LAYER_INFO[l].label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="lp-section">
          <div className="lp-kicker">Why “Frankenstein”?</div>
          <h2 className="lp-section-title">Three different parts, stitched into one pipeline</h2>
          <p className="lp-section-sub">
            Most automation is either a rigid CI script or an AI agent you have to trust blindly.
            FlowPilot sews three parts together so each does what it is good at.
          </p>
          <div className="lp-cards-3">
            {CHIMERA_PARTS.map((part) => (
              <div key={part.name} className="lp-card lp-part" style={{ ['--accent' as string]: part.color }}>
                <div className="lp-part__icon" aria-hidden>
                  {part.icon}
                </div>
                <div className="lp-part__name">{part.name}</div>
                <span className="lp-part__tag">{part.tag}</span>
                <p>{part.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What a run looks like */}
        <section className="lp-section">
          <div className="lp-two-col">
            <div>
              <div className="lp-kicker">What a run looks like</div>
              <h2 className="lp-section-title">Every step is visible</h2>
              <p className="lp-section-sub" style={{ marginBottom: '20px' }}>
                The run lights up node by node on the canvas. Every tool call, command, and result is
                logged, so you can see why the pipeline did what it did.
              </p>
              <ul className="lp-list">
                <li>
                  <span aria-hidden>1.</span>
                  <span>
                    <strong>Push or simulate.</strong> The Spark receives the commit.
                  </span>
                </li>
                <li>
                  <span aria-hidden>2.</span>
                  <span>
                    <strong>AI review.</strong> The Brain reads the diff and writes suggestions.
                  </span>
                </li>
                <li>
                  <span aria-hidden>3.</span>
                  <span>
                    <strong>Lint and test.</strong> The Scalpel and Heart run in the sandbox.
                  </span>
                </li>
                <li>
                  <span aria-hidden>4.</span>
                  <span>
                    <strong>Branch.</strong> The Fork sends failures straight to a report.
                  </span>
                </li>
                <li>
                  <span aria-hidden>5.</span>
                  <span>
                    <strong>You decide.</strong> The Lightning Lever waits for Approve or Reject.
                  </span>
                </li>
                <li>
                  <span aria-hidden>6.</span>
                  <span>
                    <strong>Report.</strong> The Autopsy Report collects everything.
                  </span>
                </li>
              </ul>
            </div>

            <div className="lp-run" aria-label="Example run log">
              <div className="dim">run #42 · commit f8a12c on main · sandbox runner</div>
              <div>
                <span className="ok">✓ Spark </span> received push (3 files changed)
              </div>
              <div>
                <span className="ok">✓ Brain </span> read_file ×3, 1 suggestion
              </div>
              <div className="dim">{'  '}→ cart.ts:42 add a null check for `items`</div>
              <div>
                <span className="bad">✗ Scalpel</span> npm run lint: 1 error
              </div>
              <div className="dim">{'  '}→ src/cart.ts:12 no-unused-vars</div>
              <div>
                <span className="bad">✗ Heart </span> npm test: 11 passed, 1 failed
              </div>
              <div>
                <span className="wait">⑂ Fork </span> checks failed → Fail stitch
              </div>
              <div>
                <span className="ok">📋 Report </span> written: 1 lint error, 1 failing test
              </div>
              <div className="dim" style={{ marginTop: '8px' }}>
                status: failed · nothing was merged · 14.2 s
              </div>
            </div>
          </div>
        </section>

        {/* Glossary */}
        <section className="lp-section">
          <div className="lp-kicker">Lab vocabulary</div>
          <h2 className="lp-section-title">What each body part does</h2>
          <p className="lp-section-sub">
            Each node has a theme name from the lab and a plain-English name. The colored stripe
            matches the stripe on the node in the editor. The lines between nodes are called{' '}
            <strong style={{ color: '#e6ede8' }}>stitches</strong>.
          </p>
          <div className="lp-glossary">
            {GLOSSARY.map((type) => {
              const meta = NODE_METADATA[type]
              const layer = getNodeLayer(type)
              return (
                <div key={type} className="lp-term" style={{ ['--accent' as string]: layer.color }}>
                  <span className="lp-term__icon" aria-hidden>
                    {meta.icon}
                  </span>
                  <div>
                    <div className="lp-term__name">
                      {meta.subLabel}
                      <small>{meta.title}</small>
                    </div>
                    <div className="lp-term__desc">{meta.paletteDesc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Safety */}
        <section className="lp-section">
          <div className="lp-kicker">Safety rules</div>
          <h2 className="lp-section-title">The monster stays on its leash</h2>
          <div className="lp-cards-3" style={{ marginTop: '20px' }}>
            <div className="lp-card">
              <strong>🔒 Allowlisted commands only</strong>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#a8b5ac', lineHeight: 1.55 }}>
                The runner can only run commands like <code>npm run lint</code> and{' '}
                <code>npm test</code>. Free-form text from the AI never reaches a shell.
              </p>
            </div>
            <div className="lp-card">
              <strong>👀 Read-only AI tools</strong>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#a8b5ac', lineHeight: 1.55 }}>
                The agent can read files and diffs. Step count and diff size are capped, and every
                tool call is logged in the run view.
              </p>
            </div>
            <div className="lp-card">
              <strong>📦 Sandboxed, signed jobs</strong>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#a8b5ac', lineHeight: 1.55 }}>
                Jobs are signed and validated. The container runs as non-root with no network and no
                secrets, and secrets are masked in logs.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="lp-section" style={{ textAlign: 'center' }}>
          <h2 className="lp-section-title">See it run in under a minute</h2>
          <p className="lp-section-sub" style={{ margin: '0 auto 24px auto' }}>
            Open the sample workflow, press <strong style={{ color: '#f5e663' }}>Simulate push</strong>,
            and pull the lever yourself.
          </p>
          <Link href="/workflow/demo/edit" className="fp-btn fp-btn--primary fp-btn--lg">
            ⚡ Open the demo
          </Link>
        </section>

        <footer className="lp-footer">
          <span>FlowPilot · built with Kiro for Kiroween 2026</span>
          <span>Next.js · React Flow · Zod · Docker sandbox runner</span>
        </footer>
      </div>
    </main>
  )
}
