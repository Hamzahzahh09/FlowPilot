# FlowPilot Development Roadmap

> **Status:** Active Roadmap  
> **Current Milestone:** Phase 2 (Repository & Project Foundation)

This document tracks the phased implementation milestones for the **FlowPilot** platform. Development is organized into sequential phases to guarantee architectural integrity, security, and developer control at each step.

---

## Phase Overview

| Phase | Milestone | Status |
| :--- | :--- | :--- |
| **Phase 0** | Product Specification | In Progress / Pending PRD Ingestion |
| **Phase 1** | Architecture & Technical Specification | Planned |
| **Phase 2** | Repository & Project Foundation | **In Progress** |
| **Phase 3** | Core System Development | Planned |
| **Phase 4** | Integrations & AI | Planned |
| **Phase 5** | Testing & MVP Validation | Planned |

---

## Detailed Phases

### Phase 0: Product Specification
- [ ] Ingest official FlowPilot PRD into `docs/product/PRD.md`.
- [ ] Validate functional and non-functional requirements.
- [ ] Define MVP scope boundaries and user personas.
- [ ] Align acceptance criteria and success metrics.

### Phase 1: Architecture & Technical Specification
- [ ] Finalize System Architecture Overview and system diagram.
- [ ] Formulate Component Responsibilities and interface contracts.
- [ ] Specify Communication Architecture (Control Plane ↔ Local Runner ↔ Web UI).
- [ ] Define Security Architecture (sandboxing, token management, permission controls).
- [ ] Select technology stack (frameworks, databases, protocols, tooling).
- [ ] Document initial Architecture Decision Records (ADRs).

### Phase 2: Repository & Project Foundation *(Current Phase)*
- [x] Initialize Git repository foundation.
- [x] Configure base environment settings (`.editorconfig`, `.gitignore`).
- [x] Establish contribution standards (`CONTRIBUTING.md`).
- [x] Create GitHub issue and pull request templates.
- [x] Structure documentation hierarchy (`docs/` tree).
- [ ] Set up continuous integration (CI) linting and validation workflows.
- [ ] Initialize project package workspace once technology stack is confirmed.

### Phase 3: Core System Development
- [ ] Develop Workflow Definition Schema (declarative DAG format).
- [ ] Implement Workflow Execution Engine / Orchestrator.
- [ ] Build Local Runner daemon/CLI with security sandbox.
- [ ] Create Visual Workflow Canvas (graph rendering, node editing, status visualization).
- [ ] Implement human-in-the-loop review and approval checkpoints.

### Phase 4: Integrations & AI
- [ ] Integrate GitHub App / Webhook handlers for triggers and status reporting.
- [ ] Implement AI Agent framework with prompt orchestration and tool calling.
- [ ] Develop automated diff generation and patch validation agents.
- [ ] Connect Local Runner with local developer tools (Git, linters, package managers).

### Phase 5: Testing & MVP Validation
- [ ] End-to-end integration testing (Visual Canvas → Engine → Local Runner → GitHub).
- [ ] Security audits on Local Runner execution boundaries.
- [ ] Performance benchmarking for real-time log streaming and workflow dispatch.
- [ ] Developer pilot testing and feedback collection.
- [ ] MVP release readiness review.

