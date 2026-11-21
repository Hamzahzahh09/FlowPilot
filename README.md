# FlowPilot ⚡

> **Automate your development workflow. Stay in control.**  
> *A Frankenstein Chimera of Probabilistic AI, Deterministic Pipelines, and Human-in-the-Loop Governance.*

Built for the **Kiroween 2026 Hackathon** (Category: **Frankenstein**).

---

## 🎯 What is FlowPilot?

Modern software engineering suffers from friction: repetitive linting, test suites, context switching across dashboards, and an overwhelming volume of pull requests. While autonomous AI tools promise automated coding, developers frequently mistrust autonomous "black box" systems that might silently introduce bugs or break production.

**FlowPilot** bridges this divide by stitching together three distinct paradigms into a unified, node-based automation platform:

1. **Probabilistic AI Intelligence** (*Brain & Eyes*): Context-aware code analysis, AST inspection, and intelligent review recommendations.
2. **Deterministic Pipelines** (*Scalpel & Heart*): Strict, allowlisted lint checks (`npm run lint`) and automated test suites (`npm test`) executed in a sandboxed runner.
3. **Human-in-the-Loop Governance** (*Lightning Lever*): An explicit approval checkpoint where the developer retains the final decision to approve or reject before actions finalize.
4. **Cloud Persistence** (*Neon Serverless PostgreSQL*): High-performance, serverless database persistence for workflows, execution runs, and autopsy reports.

---

## ⚡ The Frankenstein Chimera Pipeline

FlowPilot embodies the Frankenstein theme through its modular pipeline architecture:

| Concept | Themed Name | Purpose |
| :--- | :--- | :--- |
| **Trigger** | `Spark` | Triggers the workflow upon GitHub push webhooks or manual simulation. |
| **AI Agent** | `Brain` | Reasoning agent scanning code changes and AST diffs. |
| **Security Audit** | `Eyes` | Detects leaked credentials, API keys, and AST vulnerabilities. |
| **Linter** | `Scalpel` | Surgical code hygiene inspection via allowlisted linter commands. |
| **Test Runner** | `Heart` | Vital signs test execution running automated unit and integration tests. |
| **Condition** | `Fork` | Branching junction routing execution into `passed` and `failed` pathways. |
| **Human Gate** | `Lightning Lever` | Halts execution until a human developer explicitly approves or rejects. |
| **Final Summary** | `Autopsy Report` | Terminal node compiling structured markdown/JSON execution reports. |
| **Connection** | `Stitch` | Animated DAG edges connecting nodes across the canvas. |

---

## 🚀 Key Features

- **Visual Workflow Designer**: Powered by React Flow (`@xyflow/react`), featuring a dark, soft, code-flavored design with custom SVG iconography, accessible status rings, and automatic topological DAG layout (`Rapikan Otomatis`).
- **Simulate Push in 1 Click**: Test workflow traversals instantly with simulated GitHub push payloads, animated stitches, real-time step timelines, and interactive approval gates.
- **Neon Cloud Database**: Fully integrated with **Neon Serverless PostgreSQL** via **Drizzle ORM** with connection pooling (`prepare: false`), automated migrations, and instant persistence.
- **Sandbox Runner Execution**: Isolated execution runner adhering to strict command allowlists (`npm run lint`, `npm test`, `npm run build`), protecting developer machines from arbitrary script execution.
- **Structured Autopsy Reports**: Comprehensive run summaries detailing AI recommendations, lint diagnostics, test pass/fail metrics, and human decision timestamps.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript (Strict)
- **Visual Canvas**: React Flow (`@xyflow/react` v12)
- **Database & ORM**: Neon Serverless PostgreSQL + Drizzle ORM + `postgres.js`
- **Validation**: Zod (Shared schemas in `packages/shared`)
- **Monorepo Architecture**: pnpm workspaces (`apps/web`, `packages/runner`, `packages/shared`)
- **Styling**: Vanilla CSS variables, Geist/Inter + JetBrains Mono typography, WCAG AA compliant dark & light tokens
- **Testing & Quality**: Vitest, ESLint (zero errors)

---

## 🏁 Quick Start & Local Setup

### Prerequisites
- Node.js `>= 20.0.0`
- pnpm `>= 9.0.0`
- (Optional) Neon account for live cloud database

### 1. Clone & Install
```bash
git clone https://github.com/Hamzahzahh09/FlowPilot.git
cd FlowPilot
pnpm install
```

### 2. Environment Configuration
Create `.env.local` in the project root:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-cool-leaf-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
*(If no `DATABASE_URL` is provided, FlowPilot operates in offline demo mode using local storage persistence).*

### 3. Database Migration & Seed (Optional)
```bash
pnpm --filter web exec drizzle-kit push:pg
pnpm --filter web exec tsx --env-file=.env.local db/seed.ts
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit & schema tests
pnpm test

# Run linter
pnpm lint

# Build all workspace packages
pnpm -r build
```

---

## 📂 Project Structure

```text
flowpilot/
├── apps/
│   └── web/                   # Next.js 14 web application & visual canvas
│       ├── app/               # App Router pages (/workflows, /runs, /editor, etc.)
│       ├── components/        # Canvas, nodes, inspectors, and landing UI
│       ├── db/                # Neon database client, Drizzle schema, and seed
│       └── lib/               # Shared hooks, store, and data sources
├── packages/
│   ├── runner/                # Sandboxed execution runner and command allowlist
│   └── shared/                # Zod validation schemas, types, and DAG helpers
├── docs/                      # Architectural, technical, and PRD specifications
├── .kiro/                     # Kiro design tokens, specs, and steering documents
├── neon.ts                    # Neon branch policy and service configuration
└── pnpm-workspace.yaml        # Monorepo workspace configuration
```

---

## 📜 License

MIT © 2026 Hamzah
