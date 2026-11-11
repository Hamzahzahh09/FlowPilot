---
inclusion: always
---

# FlowPilot UI: design and build instructions

## Goal
Build the FlowPilot web UI as a workflow editor in the style of n8n's marketing
canvas: dark, soft, rounded, code-flavored. It must look like a real developer
tool, not a generated landing page. The Frankenstein theme lives only in
copy (node subtitles, report names), never in heavy visuals.

## Stack
- Next.js (App Router), TypeScript, React Flow (@xyflow/react), CSS variables
  in globals.css. Tailwind is allowed only for layout utilities.
- No UI kit with its own look. No icon fonts. No emoji anywhere in the UI.
- Icons: simple inline SVG, 1.75 stroke, rounded caps and joins, 24px grid.

## Design tokens (define once in :root, use everywhere)
--bg #1f1f21; --surface #29292c; --node #343437; --node-hover #3c3c40;
--dot #4a4a50; --edge #6b6b72; --text #f2f2f3; --muted #9a9aa3;
--accent #ff9fb2 (single accent); --ok #7ddba3; --bad #ff8a80; --wait #f2c879.
Radius: container 28px, node 16px, pill 999px, inputs 12px.
Fonts: Geist (UI), Geist Mono (labels, logs, code). Fall back to system fonts.
Provide a light theme via prefers-color-scheme with the same token names.

## Hard rules (do not break)
- Soft, not sharp: no 0 or 2px radii on cards, buttons, nodes, or panels.
- Flat surfaces. No gradients, no neon glow, no drop shadows on cards.
  Status uses a thin ring (box-shadow 0 0 0 2px) in the status color.
- One accent color only. Status colors are used only for status.
- No ALL-CAPS eyebrow labels, no numbered section markers, no hero headline
  with one highlighted word.
- Every status needs a text label too (Idle, Running, Passed, Failed,
  Waiting), never color alone.
- Respect prefers-reduced-motion: disable edge flow and pulse animations.
- Visible keyboard focus on every interactive element; WCAG AA contrast.

## Components to build
1. AppShell: top bar (logo, workflow name, Simulate push button, Reset),
   canvas card (radius 28px), bottom log panel, right inspector panel
   (hidden under 820px).
2. FlowNode (React Flow custom node): an 80x80 rounded-square box with only an
   icon inside. The label sits BELOW the box, centered, in Geist Mono 11px:
   line 1 = title, line 2 = operation in --muted (e.g. "Brain · analyze diff").
   Handles are 10px dots in --edge. Status ring on the box, plus a visually
   hidden status text for screen readers.
3. Edges: bezier, 2px, --edge. Active edge: --accent, dashed 6/8, animated
   dash offset. Finished edge: solid --muted.
4. Canvas: React Flow Background variant Dots, gap 22, size 1.6, color --dot.
   Hide the React Flow attribution only if the license allows it.
5. Tab pills (workflow switcher): mono 13px, radius 999px, selected pill uses
   --accent background with dark text.
6. LogPanel: Geist Mono 12.5px, timestamp column in --muted, aria-live="polite".
   Line colors: AI actions --accent, pass --ok, fail --bad, waiting --wait.
7. ApprovalBar: appears in the log panel header when a run is waiting.
   Approve and Reject buttons have equal size and weight (Reject is not
   hidden or dimmed). Waiting node "breathes" with a soft ring pulse.
8. ReportCard (Autopsy Report): decision, AI findings, lint result, test
   result, per-step status list. Same tokens, no extra decoration.

## Node set for the demo workflow
Spark (On push) -> Brain (AI code review) -> Scalpel (Run lint) and
Heart (Run tests) in parallel -> Lightning Lever (Human approval) ->
Autopsy (Report). Seed data must make one lint error and one failing test.

## Working method
1. Read the product concept in .kiro/specs and the other steering files first.
2. Create or update a spec for this UI (requirements, design, tasks) before
   writing code, then implement task by task.
3. Build in this order: tokens -> AppShell -> FlowNode + canvas -> edges and
   run animation -> LogPanel + ApprovalBar -> inspector -> ReportCard.
4. Keep run state in one typed store (idle/running/ok/fail/wait per node) so
   the UI can later be driven by the real SSE stream. Mock the run locally
   with timed steps for now.
5. After each component, run typecheck and lint, and fix before moving on.
6. Keep components small, typed with TypeScript, no any. No new dependencies
   without asking.

## Acceptance checklist
- Looks soft and rounded; no sharp-cornered boxes anywhere.
- Simulate push animates edges, updates node status, streams log lines,
  pauses at approval, and ends with a report for both Approve and Reject.
- Works at 1280px and 390px wide (canvas scrolls horizontally on mobile).
- Keyboard: nodes focusable, buttons operable, focus ring visible.
- Reduced-motion users see no looping animation.