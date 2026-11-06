# FlowPilot

> Automate your development workflow. Stay in control.

## Overview

**FlowPilot** is an AI-powered development automation platform designed to streamline software engineering operations. It enables developers to visually design development workflows, automate repetitive engineering tasks using specialized AI agents, integrate seamlessly with GitHub, and execute workflows locally and securely within their development environment.

## Problem Statement

Modern software engineering workflows involve significant friction and cognitive overhead from repetitive, manual tasks:
- Repetitive code maintenance, refactoring, and dependency updates.
- Pull request triaging, automated review orchestration, and release verification.
- Context switching between multiple tools, CLIs, web dashboards, and automation scripts.
- Lack of transparency and trust in autonomous "black-box" AI systems that act without adequate human oversight.

Existing automation platforms either run exclusively in remote CI/CD environments without access to local context, require rigid configuration files, or lack safe human-in-the-loop control mechanisms. FlowPilot bridges this gap by delivering visual workflow design, modular AI agents, and local execution guarantees under developer control.

## Core Capabilities (Planned)

FlowPilot is being designed around five core pillars:

1. **Visual Workflow Designer**: A node-based canvas for authoring, configuring, and inspecting engineering workflows without tedious boilerplate.
2. **AI-Powered Task Agents**: Autonomous yet bounded agents capable of analyzing code, generating diffs, drafting pull requests, and automating routine chores.
3. **GitHub Ecosystem Integration**: Bidirectional synchronization for webhook triggers, status checks, issue management, and pull request reviews.
4. **Local Runner Execution**: A secure local execution environment that runs workflow steps directly where the code, credentials, and local tooling live.
5. **Human-in-the-Loop Governance**: Granular approval gates, dry-run diffs, and execution checkpoints to ensure developers maintain complete authority over code modifications.

## Key Differentiators

- **Developer Control First**: AI agents suggest and execute actions under explicit permissions and review checkpoints rather than opaque autonomous actions.
- **Local-First Execution**: Sensitive source code, local build tools, and proprietary configurations remain within the developer's local perimeter.
- **Visual & Declarative Duality**: Workflows can be manipulated visually via a graph editor or version-controlled as declarative definitions.
- **Modular Agent Architecture**: Discrete, task-focused agents designed for predictable and auditable outcomes.

## Project Status

- **Current Stage**: Pre-development / Foundation (Phase 2: Repository & Project Foundation).
- **Implementation State**: The project is currently in the initial repository initialization and specification stage. No application code, frontend interfaces, backend services, or database engines have been implemented yet.

## Current Development Scope

The current scope is focused exclusively on:
- Establishing repository standards, guidelines, and templates.
- Organizing product, architectural, and technical documentation placeholders.
- Aligning development roadmaps and milestones.

Active implementation of application components (frontend UI, backend API, local runner, workflow engine) will commence in subsequent phases according to the roadmap.

## Documentation References

- **Product Requirements Document (PRD)**: [`docs/product/PRD.md`](docs/product/PRD.md)
- **Architecture Documentation**: [`docs/architecture/README.md`](docs/architecture/README.md)
- **Technical Specifications**: [`docs/technical/README.md`](docs/technical/README.md)
- **Development Roadmap**: [`docs/development/ROADMAP.md`](docs/development/ROADMAP.md)
- **Contributing Guidelines**: [`CONTRIBUTING.md`](CONTRIBUTING.md)

