# Design: landing-page

## Routes and files (apps/web)
```
app/page.tsx                 landing (server component)
app/editor/page.tsx          editor (moved from app/page.tsx)
components/landing/
  Landing.module.css         container, section spacing, shared headings
  LandingHeader.tsx          logo, Editor, GitHub, Open the demo
  Hero.tsx                   copy + buttons + HeroCanvas
  HeroCanvas.tsx             client: read-only Canvas with looping edges
  HowItWorks.tsx             task 3
  ThreeParts.tsx             task 4
  LandingFooter.tsx          task 4
components/ui/ButtonLink.tsx Link styled like Button (shared CSS module)
lib/site.ts                  REPO_URL and route constants
```
Landing sections are server components. Only `HeroCanvas` is a client
component, because React Flow needs the browser.

## Layout
- `.container`: `max-width: 1120px; margin-inline: auto; padding-inline: 24px`
  (16px under 640px).
- Section spacing: 96px between sections on desktop, 64px on mobile.
- Hero grid: `minmax(0, 5fr) minmax(0, 6fr)` with gap 48px; one column under
  900px, with copy first and canvas below.
- Hero canvas card: `--surface` background, radius 28px, height 360px
  (300px on mobile).

## Read-only canvas
`Canvas` gets a `readOnly` prop. When true it sets `nodesDraggable`,
`nodesConnectable`, `elementsSelectable`, `nodesFocusable`, `edgesFocusable`,
`panOnDrag`, `panOnScroll`, `zoomOnScroll`, `zoomOnPinch`,
`zoomOnDoubleClick` and `preventScrolling` to false, so page scrolling over
the card still works. The hero also sets `focusable`, `selectable`,
`draggable` and `connectable` to false on each node and edge, because the
server render uses React Flow's defaults and would otherwise ship tab stops.
`FitOnResize` keeps all nodes centered at any width.
The card wrapper has `role="img"` and an `aria-label` that lists the
workflow steps, so screen readers get one description and no tab stops.

## Edge animation
Shared class `stitch-active` in `globals.css` (also used by builder task 5):
`stroke: var(--accent); stroke-dasharray: 6 8;` and keyframes that move
`stroke-dashoffset` by 14 (one dash period) per cycle. Under
`prefers-reduced-motion: reduce` the animation is `none` and the dashes stay
static. The hero applies it through each edge's `className`.

## Buttons as links
`ButtonLink` wraps `next/link` with the same classes as `Button`
(primary and secondary), so links and buttons look identical.

## Copy
- h1: "Automate the workflow. Keep control of the code."
- Lead: "Push to GitHub and FlowPilot takes it from there. An AI agent reviews
  the change, a sandboxed runner lints and tests it, and the run waits for
  your approval before it writes the final report."

## Responsive and accessibility pass (task 5)
Checked in headless Edge at 1280px (dark, light) and 390px: one h1, one header/main/footer, no horizontal page scroll, every Tab stop shows a focus ring and the hero preview adds none, hero edge animation is `none` under reduced motion. Contrast follows the AA token values in app-pages design.md.

