# Specification: Visual Workflow Builder

**Module**: `apps/web` (workflow builder UI)  
**Status**: Draft - Requirements Review  
**Created**: 2026-11-07  
**Dependencies**: `@xyflow/react`, `packages/shared` (Zod schemas), PostgreSQL

---

## 1. Overview

The Visual Workflow Builder is a node-based canvas interface that allows developers to design automation workflows by dragging and connecting themed workflow nodes. It provides a visual representation of the workflow logic without requiring code, while maintaining declarative JSON storage for version control and execution.

This specification covers **design and persistence only**. Workflow execution is out of scope (see `workflow-engine` spec).

---

## 2. Goals

- **Visual Design**: Enable intuitive workflow creation through drag-and-drop node composition
- **Themed Experience**: Deliver a cohesive Frankenstein lab aesthetic with meaningful terminology
- **Configuration**: Allow per-node configuration through an accessible side panel
- **Persistence**: Store workflows as validated JSON in PostgreSQL for reliable execution
- **Foundation**: Establish the data model and UI patterns for the entire workflow system

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Node Palette
- **FR-1.1**: Display a vertical palette containing all 8 node types: Spark, Brain, Eyes, Scalpel, Heart, Fork, Lightning Lever, Autopsy Report
- **FR-1.2**: Each node type displays its themed icon and name
- **FR-1.3**: Users can drag nodes from the palette onto the canvas
- **FR-1.4**: Palette remains visible and accessible while editing workflows

#### FR-2: Canvas Operations
- **FR-2.1**: Users can add nodes to the canvas by dragging from the palette
- **FR-2.2**: Users can reposition nodes by dragging them on the canvas
- **FR-2.3**: Users can delete nodes using a delete button or keyboard shortcut
- **FR-2.4**: Users can pan the canvas by dragging the background
- **FR-2.5**: Users can zoom the canvas using mouse wheel or zoom controls
- **FR-2.6**: Canvas state persists during the editing session

#### FR-3: Node Connections ("Stitches")
- **FR-3.1**: Users can connect nodes by dragging from an output handle to an input handle
- **FR-3.2**: Connections are visually styled as dashed lines (themed as "stitches")
- **FR-3.3**: Users can delete connections by selecting and pressing delete
- **FR-3.4**: Fork nodes have 2 fixed output handles labeled "passed" and "failed"
- **FR-3.5**: Nodes may accept multiple incoming connections (join pattern)
- **FR-3.6**: Spark has no input handle; Autopsy Report has no output handle

#### FR-4: Node Configuration Panel
- **FR-4.1**: Clicking a node opens a side panel displaying its configuration options
- **FR-4.2**: Each node type has a specific configuration schema (defined in requirements below)
- **FR-4.3**: Configuration changes are immediately reflected in the workflow state
- **FR-4.4**: Panel displays validation errors for invalid configurations
- **FR-4.5**: Panel can be closed, collapsing back to canvas-only view

#### FR-5: Workflow Persistence
- **FR-5.1**: Users can save the current workflow to PostgreSQL (overwrites previous version)
- **FR-5.2**: Workflows are stored as JSON containing nodes, edges, and metadata
- **FR-5.3**: Workflow JSON is validated against a shared Zod schema before saving
- **FR-5.4**: Users can load existing workflows from the database
- **FR-5.5**: Users can create new blank workflows
- **FR-5.6**: Unsaved changes are indicated in the UI

#### FR-7: Sample Workflow
- **FR-7.1**: A seeded workflow named "Automated Code Review" exists by default
- **FR-7.2**: Sample workflow structure: Spark → Brain → Fork → (passed: Lightning Lever, failed: Autopsy Report) → Autopsy Report
- **FR-7.3**: Alternate join pattern: Spark → Scalpel → Lightning Lever, Spark → Heart → Lightning Lever (both feed approval gate)
- **FR-7.4**: Sample workflow has valid default configuration for all nodes
- **FR-7.5**: Users can load and modify the sample workflow

#### FR-6: Workflow Validation
- **FR-6.1**: Workflows must have exactly one Spark (trigger) node
- **FR-6.2**: Spark node must have no incoming edges
- **FR-6.3**: Workflows must have at least one Autopsy Report (output) node
- **FR-6.4**: All nodes except Autopsy Report must connect to at least one downstream node
- **FR-6.5**: Nodes may have multiple incoming edges (join pattern allowed)
- **FR-6.6**: No circular dependencies are allowed
- **FR-6.7**: Validation errors are displayed in the UI before save is allowed

### 3.2 Node Type Specifications

#### Node: Spark (Trigger)
- **Purpose**: Initiates workflow execution based on an event
- **Configuration**:
  - `triggerType`: enum ["github_push", "manual_simulate"]
- **Connections**: 0 inputs, 1 output

#### Node: Brain (AI Agent)
- **Purpose**: Runs AI agent analysis with configured tools
- **Configuration**:
  - `prompt`: string (system prompt for the agent, max 500 chars)
  - `maxSteps`: number (default 10, max 50)
- **Connections**: 1 input, 1 output

#### Node: Eyes (Code Analysis)
- **Purpose**: Performs static code analysis (placeholder for future)
- **Configuration**: None (empty object)
- **Connections**: 1 input, 1 output

#### Node: Scalpel (Linter)
- **Purpose**: Runs linting checks
- **Configuration**:
  - `command`: enum derived from `ALLOWED_COMMANDS` constant in `packages/shared` (default: "npm run lint")
- **Connections**: 1+ inputs, 1 output

#### Node: Heart (Test Runner)
- **Purpose**: Executes test suite
- **Configuration**:
  - `command`: enum derived from `ALLOWED_COMMANDS` constant in `packages/shared` (default: "npm test")
- **Connections**: 1+ inputs, 1 output

#### Node: Fork (Conditional)
- **Purpose**: Branches workflow based on previous step result
- **Configuration**: None (empty object)
- **Connections**: 1 input, 2 fixed outputs ("passed" path, "failed" path)

#### Node: Lightning Lever (Approval Gate)
- **Purpose**: Pauses workflow for human approval/rejection
- **Configuration**: None (empty object)
- **Connections**: 1 input, 2 outputs (approve path, reject path)

#### Node: Autopsy Report (Output)
- **Purpose**: Generates and delivers workflow results
- **Configuration**:
  - `format`: enum ["markdown", "json"]
- **Connections**: 1 input, 0 outputs

### 3.3 Data Model Requirements

#### Command Allowlist Constant (in `packages/shared`)
```typescript
export const ALLOWED_COMMANDS = [
  "npm run lint",
  "npm test",
  "npm run build",
] as const;
```
- Builder UI derives command enums from this constant
- Runner validates incoming commands against this same list
- Default commands use `npm` (not `pnpm`)

#### Workflow Schema (Zod, in `packages/shared`)
```typescript
{
  id: string (uuid)
  name: string (1-100 chars)
  description: string (optional, max 500 chars)
  createdAt: timestamp
  updatedAt: timestamp
  nodes: array of Node
  edges: array of Edge
}
```

#### Node Schema
```typescript
{
  id: string (uuid)
  type: NodeType enum
  position: {x: number, y: number}
  config: object (type-specific, validated per node type)
}
```

#### Edge Schema
```typescript
{
  id: string (uuid)
  source: string (node id)
  target: string (node id)
  sourceHandle?: string (for Fork outputs)
  label?: string (for Fork condition labels)
}
```

### 3.4 Theme Requirements

#### Colors (Frankenstein Lab Theme)
- Background: `#0B0F0C`
- Panel background: `#141B16`
- Node default: `#1F2D23`
- Node selected: `#2A3F30`
- Edge (stitch): `#4A6354` dashed
- Success state: `#8BC34A`
- Active/approval state: `#F5E663`
- Failure state: `#C0504D`
- Text primary: `#E6EDE8`
- Text secondary: `#A8B5AC`

#### Typography
- Interface font: system sans-serif stack
- Code/technical: monospace
- Node names: themed vocabulary (Spark, Brain, etc.)

#### Visual Style
- Nodes: rounded corners (8px), subtle border, themed icon
- Edges: 2px dashed stroke, animated dash on hover
- Shadows: subtle, greenish tint
- Interactive states: must not rely on color alone (icon + label)
- Respect `prefers-reduced-motion` (disable animations)

### 3.5 Non-Functional Requirements

#### Accessibility
- **NFR-1**: Node status uses icon + text label (not color alone)
- **NFR-2**: Main actions (add node, save, load) are keyboard accessible
- **NFR-3**: UI respects `prefers-reduced-motion` (disables animations)

#### Data Integrity
- **NFR-4**: Schema validation occurs before database write
- **NFR-5**: Invalid workflows cannot be saved (validation errors shown)

#### Developer Experience
- **NFR-6**: TypeScript strict mode with no `any` unless justified
- **NFR-7**: Zod schemas are single source of truth for validation
- **NFR-8**: React Flow state and PostgreSQL state are synchronized

#### Internationalization
- **NFR-9**: All UI text in English

---

## 4. Out of Scope

The following are explicitly **not included** in this specification:

- **Workflow Execution**: Running workflows, status updates, logs (see `workflow-engine` spec)
- **GitHub Integration**: Webhook handling, real push events (see product P1)
- **Collaboration**: Multi-user editing, presence, comments
- **Templates**: Pre-built workflow templates (product P2)
- **History**: Version history browsing, diff view (product P2)
- **Undo/Redo**: Canvas operation history (future enhancement)
- **Export/Import**: Download/upload workflow JSON files (future enhancement)
- **AI Node Execution**: Actual AI tool calling (see `ai-agent-tools` spec)
- **Runner Integration**: Job submission, sandbox execution (see `sandbox-runner` spec)

---

## 5. Dependencies

### External Packages
- `@xyflow/react` - Canvas and node rendering
- `zod` - Schema validation
- `drizzle-orm` - PostgreSQL database access
- `next` - App Router, API routes

### Internal Packages
- `packages/shared` - Workflow, Node, and Edge Zod schemas

### Infrastructure
- PostgreSQL database (Neon or Supabase)
- Table: `workflows` with JSONB column for workflow data

---

## 6. Success Criteria

The workflow builder is complete when:

1. ✅ A user can create a new workflow from a blank canvas
2. ✅ A user can drag all 8 node types onto the canvas
3. ✅ A user can connect nodes with dashed "stitch" edges
4. ✅ A user can configure each node type through the side panel
5. ✅ A user can save a valid workflow to PostgreSQL (overwrites existing)
6. ✅ A user can load an existing workflow from PostgreSQL
7. ✅ Validation prevents saving invalid workflows (missing Spark, cycles, etc.)
8. ✅ The UI correctly applies the Frankenstein lab theme
9. ✅ All accessibility requirements are met (icon+text, keyboard, motion)
10. ✅ The "Automated Code Review" sample workflow exists and is loadable

---

## 7. Next Steps (After Requirements Approval)

1. **Design Phase**: UI mockups, component hierarchy, state management approach
2. **Schema Definition**: Zod schemas in `packages/shared`
3. **Database Setup**: Drizzle schema and migrations
4. **Implementation Tasks**: Broken down by component and feature

---

**Status**: ⏸️ Awaiting requirements review and approval before proceeding to design phase.

