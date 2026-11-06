# Architecture Documentation

> **Status:** Draft / Architectural Specification Placeholder  
> **Product:** FlowPilot

---

## 1. System Architecture Overview

*TBD — Pending Phase 1 Architecture Specification.*

FlowPilot is planned as a hybrid development automation platform connecting a visual orchestration layer with a local execution runner and AI agent services. Detailed system diagrams and architectural top-level models will be documented here once formalized.

## 2. Core Components

The preliminary component boundary under consideration consists of:
- **Web / Visual Canvas**: User interface for visual workflow design, execution monitoring, and configuration.
- **Control Plane / Orchestration Service**: Coordinates workflow execution states, triggers, and integrations.
- **Local Runner**: Lightweight execution agent running on the developer's local machine to safely perform commands, filesystem operations, and Git tasks.
- **AI Agent Service**: Provider integration for LLM-driven task reasoning, diff generation, and code transformation.
- **GitHub Integration Service**: Connector managing webhooks, pull requests, issues, and API interactions.

*Detailed component definitions will be established in Phase 1.*

## 3. Component Responsibilities

| Component | Responsibility Scope | Status |
| :--- | :--- | :--- |
| **Visual Workflow Canvas** | Authoring, DAG rendering, human approval interface | TBD |
| **Control Plane** | State management, dispatching workflow steps | TBD |
| **Local Runner** | Sandboxed local command execution, file tree operations | TBD |
| **AI Agent Service** | Prompt orchestration, tool invocation, diff synthesis | TBD |
| **GitHub Connector** | Webhook verification, PR / issue mutations, status reporting | TBD |

## 4. Communication Architecture

*TBD — Pending Phase 1 Architecture Specification.*

Planned areas of specification:
- Client-to-Control-Plane protocols (e.g., HTTP/REST, WebSocket, or gRPC).
- Local Runner to Control Plane communication channel (e.g., secure bidirectional WebSocket or polling).
- Event streaming for real-time execution logs and progress indicators.

## 5. Execution Architecture

*TBD — Pending Phase 1 Architecture Specification.*

Planned areas of specification:
- Workflow Directed Acyclic Graph (DAG) lifecycle and step resolution.
- Human-in-the-loop review pause and resume mechanics.
- Error handling, timeouts, retry policies, and rollback mechanisms.
- Local Runner execution context isolation.

## 6. Security Architecture

*TBD — Pending Phase 1 Architecture Specification.*

Key security priorities to be detailed:
- Secret management and local credential boundaries (ensuring sensitive API tokens and SSH keys never leave the local environment).
- Local Runner execution permissions, command allowlists/denylists, and filesystem sandboxing.
- Secure token exchange and authentication between components.
- Audit logging for all automated actions and agent modifications.

## 7. Architecture Decisions

Architectural Decision Records (ADRs) will be maintained in this section or in dedicated sub-documents (`docs/architecture/decisions/`):

- **ADR-001**: *TBD*
