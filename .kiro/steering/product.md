# FlowPilot — Product Steering

FlowPilot is an AI-powered developer workflow automation platform built for the
Kiroween 2026 hackathon, category **Frankenstein** ("stitch together a chimera
of technologies into one app"). Tagline: *Automate the workflow. Keep control of the code.*

## Core idea
GitHub push event -> AI agent analysis -> lint/test in a runner -> human approval -> report.
The chimera: probabilistic AI + deterministic pipeline + a human who holds the lever.

## Scope (solo, ~4 weeks) — priorities
- P0: visual builder, workflow engine, Simulate push, sandbox runner (lint/test), AI agent with 4-5 tools, approval, realtime logs, report.
- P1: minimal Local Runner, pull request trigger, real GitHub webhook.
- P2: history, templates. Do NOT build P2 before P0/P1 are stable.
- Feature freeze on 30 Nov 2026. After that: bug fixes and polish only.

## Frankenstein theme vocabulary (use in UI copy and code naming)
| Concept | Themed name |
|---|---|
| Trigger | Spark |
| AI Agent | Brain |
| Code analysis | Eyes |
| Linter | Scalpel |
| Run tests | Heart |
| Condition | Fork |
| Approval | Lightning Lever |
| Report | Autopsy Report |
| Edge between nodes | Stitch |

## Design rules
`.kiro/steering/design.md` is the source of truth for all visuals. Summary:
- Dark, soft, rounded developer-tool look in the style of n8n's canvas.
  Tokens: bg #1f1f21, surface #29292c, node #343437, text #f2f2f3,
  muted #9a9aa3, single accent #ff9fb2; status colors ok #7ddba3,
  bad #ff8a80, wait #f2c879 (status only). Light theme uses the same token names.
- Radius: containers 28px, nodes 16px, pills 999px. Flat surfaces: no
  gradients, no glow, no card shadows.
- The Frankenstein theme lives in copy (node names, report names), never in
  heavy visuals. No emoji.
- Status must never rely on color alone (always a text label too).
- Respect prefers-reduced-motion. Readability beats horror effects.

## Demo mode (judges)
Hosted demo with test account, sample repo containing one lint error and one failing test, a "Simulate push" button, and a sandboxed runner.
