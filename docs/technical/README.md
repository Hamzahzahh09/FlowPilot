# Technical Documentation

> **Status:** Draft / Technical Specification Placeholder  
> **Product:** FlowPilot

---

## 1. Technology Stack

*Note: Specific framework choices and runtime dependencies are pending architectural sign-off.*

- **Language / Runtime:** TypeScript / Node.js (Targeted)
- **Frontend Framework:** TBD (Pending Phase 1 evaluation)
- **Backend Framework / Runtime:** TBD (Pending Phase 1 evaluation)
- **Database / Persistence:** TBD (Pending Phase 1 evaluation)
- **Local Runner Runtime:** TBD (Targeting cross-platform daemon/CLI)
- **Communication Protocols:** TBD (REST / WebSocket / gRPC)

## 2. Development Environment

*TBD — Prerequisites and local setup instructions will be defined once application scaffolding is introduced.*

- **Node.js**: LTS version (to be specified)
- **Package Manager**: TBD (e.g., `pnpm`, `npm`, or `yarn`)
- **Operating Systems**: Cross-platform support (Linux, macOS, Windows)

## 3. Project Structure

*Target monorepo or modular layout will be confirmed during Phase 1.*

```text
flowpilot/
├── docs/               # Product, architecture, technical, and roadmap docs
├── .github/            # GitHub templates, workflows, and configuration
├── .editorconfig       # Formatting settings across editors
├── .gitignore          # Version control ignore rules
├── CONTRIBUTING.md     # Engineering contribution guidelines
└── README.md           # Project entry point and high-level overview
```

Additional application packages, libraries, or service directories will be added after Phase 1 technical validation.

## 4. Coding Standards

*TBD — Detailed linting, formatting, and style rules will be codified with tooling.*

Preliminary guidelines:
- Strict TypeScript configuration (`strict: true`).
- ESLint and Prettier for automated formatting and code hygiene.
- Pure functions and immutable patterns for core workflow state transitions.
- Comprehensive inline JSDoc/TSDoc for public APIs and domain interfaces.

## 5. Testing Strategy

*TBD — Detailed test configuration will be established alongside the application framework.*

Target test pyramid:
- **Unit Tests**: Domain logic, workflow state transitions, graph validation algorithms.
- **Integration Tests**: Communication between Local Runner and Control Plane, GitHub webhook processing.
- **End-to-End (E2E) Tests**: Full workflow lifecycle execution from visual configuration to simulated local runner execution.

## 6. Security Guidelines

*TBD — Security protocols will be finalized in accordance with the Security Architecture.*

Preliminary standards:
- Zero persistent storage of developer private keys or repository write tokens on remote servers without explicit encryption.
- Dependency audit checks (`npm audit` / automated vulnerability scanning) in CI pipelines.
- Strict input validation and sanitization for all workflow definitions and CLI arguments.

