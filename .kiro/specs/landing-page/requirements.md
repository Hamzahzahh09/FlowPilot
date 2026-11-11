# Requirements: landing-page

Source of truth for visuals: `.kiro/steering/design.md`. Copy follows
`.kiro/steering/product.md`. Plain language, sentence case, no eyebrow labels,
no emoji, no fade-in-on-scroll.

## Routes
1. `/` SHALL render the landing page.
2. `/editor` SHALL render the workflow editor (moved from `/`).
3. The editor logo SHALL link to `/`. Landing links to the editor SHALL point
   to `/editor`.
4. Old `/workflow/...` routes, `app/api/` and `db/` SHALL stay untouched.

## R1. Top bar
1. Logo (links to `/`), text links "Editor" (`/editor`) and "GitHub"
   (https://github.com/Hamzahzahh09/FlowPilot), and a primary button
   "Open the demo" (`/editor`).

## R2. Hero
1. Two columns at desktop widths, stacked on mobile.
2. Left: one h1 "Automate the workflow. Keep control of the code." in a
   single color; one short paragraph (push to GitHub, AI agent reviews, a
   sandboxed runner lints and tests, the run waits for approval before the
   final report); buttons "Try the demo" (primary) and "Build from scratch"
   (secondary), both to `/editor`.
3. Right: the demo workflow rendered with the real `Canvas` and `FlowNode`
   in read-only mode (no drag, pan, zoom, select or connect), inside a 28px
   rounded card with the dot grid. All 6 nodes visible and centered.
4. Edges MAY loop a running animation (accent, dashed 6/8). WHEN reduced
   motion is preferred THEN the animation SHALL stop.
5. The preview SHALL have an accessible text description of the workflow and
   SHALL not add tab stops.

## R3. How it works
1. Four numbered steps (a real sequence): push, AI review, lint and tests,
   your approval and report.
2. Each step is a 16px-radius card with an icon from the node icon set, a
   title and one sentence. Rendered as an ordered list.

## R4. Three parts, stitched into one pipeline
1. Section intro uses the word "chimera" exactly once.
2. Three 28px-radius cards: probabilistic AI vs deterministic checks,
   autonomy vs human control, cloud vs your machine. Each has a title, one
   short sentence, and a one-line "how FlowPilot stitches it".

## R5. Footer
1. MIT license, "Built with Kiro for Kiroween 2026, Frankenstein category",
   and a link to the GitHub repo.

## R6. Quality
1. Semantic HTML: header, main, section (each with a heading), footer.
   Exactly one h1 on the page.
2. Only design.md tokens. Radius 28 for big cards, 16 for small ones. Flat
   surfaces, one accent color, Inter + JetBrains Mono.
3. Max content width 1120px, generous spacing.
4. Visible focus rings; AA contrast in dark and light themes.
5. Works at 1280px and 390px with no horizontal page scroll.
6. `tsc --noEmit` in `apps/web` and root `pnpm lint` pass after each task.
