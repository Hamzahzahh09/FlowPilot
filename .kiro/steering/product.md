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
- Dark lab look: bg #0B0F0C, panel #141B16, success #8BC34A, active/approval #F5E663, failure #C0504D, text #E6EDE8.
- Status must never rely on color alone (add icon + text label).
- Respect prefers-reduced-motion. Readability beats horror effects.

## Demo mode (judges)
Hosted demo with test account, sample repo containing one lint error and one failing test, a "Simulate push" button, and a sandboxed runner.
