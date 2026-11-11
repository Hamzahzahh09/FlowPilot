# Design Document: Visual Workflow Builder

**Spec**: `spec-workflow-builder.md`  
**Status**: Design Review  
**Updated**: 2026-11-07

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  apps/web (Next.js App Router)                          │
│                                                          │
│  ┌────────────────┐        ┌──────────────────────┐    │
│  │ /workflow/new  │        │ /workflow/[id]/edit  │    │
│  │  (blank)       │        │  (load from DB)      │    │
│  └────────┬───────┘        └──────────┬───────────┘    │
│           │                           │                 │
│           └───────────┬───────────────┘                 │
│                       │                                 │
│           ┌───────────▼────────────┐                    │
│           │  WorkflowCanvas        │                    │
│           │  (React Flow wrapper)  │                    │
│           └────────────────────────┘                    │
│                       │                                 │
│       ┌───────────────┼───────────────┐                │
│       │               │               │                │
│  ┌────▼─────┐  ┌──────▼──────┐  ┌────▼──────┐         │
│  │ NodePalette│  │ CustomNodes │  │ ConfigPanel│       │
│  └──────────┘  └─────────────┘  └───────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │  API Routes                                 │        │
│  │  • POST /api/workflows/[id]  (save)        │        │
│  │  • GET  /api/workflows/[id]  (load)        │        │
│  │  • GET  /api/workflows       (list)        │        │
│  └────────────────────────────────────────────┘        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Drizzle ORM
                       │
         ┌─────────────▼──────────────┐
         │  PostgreSQL                │
         │  ┌─────────────────────┐   │
         │  │ workflows table     │   │
         │  │ • id (uuid, PK)     │   │
         │  │ • name              │   │
         │  │ • description       │   │
         │  │ • data (JSONB)      │   │
         │  │ • createdAt         │   │
         │  │ • updatedAt         │   │
         │  └─────────────────────┘   │
         └────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  packages/shared                                         │
│  • workflowSchema (Zod)                                  │
│  • nodeConfigSchemas (Zod, per node type)                │
│  • ALLOWED_COMMANDS (constant)                           │
│  • validation helpers (cycle detection, etc.)            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

### 2.1 Page Structure

```
app/workflow/[id]/edit/page.tsx
├─ WorkflowCanvas (client component)
   ├─ ReactFlow (from @xyflow/react)
   │  ├─ CustomNode (Spark)
   │  ├─ CustomNode (Brain)
   │  ├─ CustomNode (Eyes)
   │  ├─ CustomNode (Scalpel)
   │  ├─ CustomNode (Heart)
   │  ├─ CustomNode (Fork)
   │  ├─ CustomNode (Lightning Lever)
   │  ├─ CustomNode (Autopsy Report)
   │  └─ CustomEdge (dashed "stitch" style)
   ├─ NodePalette (drag source)
   ├─ ConfigPanel (side panel, conditional)
   ├─ Toolbar (save, new, validate)
   └─ ValidationErrors (toast/banner)
```

### 2.2 Component Responsibilities

**WorkflowCanvas** (`app/workflow/[id]/edit/components/WorkflowCanvas.tsx`)
- Manages React Flow state (nodes, edges, viewport)
- Handles node drag-and-drop from palette
- Coordinates save/load operations
- Triggers validation before save
- Manages selected node state for config panel

**NodePalette** (`components/NodePalette.tsx`)
- Displays 8 node types with icons and names
- Implements drag source for node creation
- Themed styling (Frankenstein lab)

**CustomNode** (`components/nodes/CustomNode.tsx`)
- Single component with `type` prop for rendering variants
- Themed icon and label
- Input/output handles based on type
- Selected state styling
- Click handler to open config panel

**ConfigPanel** (`components/ConfigPanel.tsx`)
- Side panel (right side, 400px width)
- Displays config form based on selected node type
- Real-time validation with Zod
- Close button
- Dispatches updates to workflow state

**CustomEdge** (`components/CustomEdge.tsx`)
- Dashed stroke style (#4A6354, 2px)
- Label support for Fork outputs ("passed", "failed")
- Delete button on hover

**Toolbar** (`components/Toolbar.tsx`)
- Save button (validates first)
- New workflow button
- Workflow name input (inline edit)
- Unsaved changes indicator

**ValidationErrors** (`components/ValidationErrors.tsx`)
- Toast or banner component
- Displays validation errors before save
- Lists all issues (missing Spark, cycles, etc.)

---

## 3. State Management

### 3.1 Workflow State (React Flow)

Use React Flow's built-in state management with controlled components:

```typescript
// WorkflowCanvas.tsx
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const [selectedNode, setSelectedNode] = useState<Node | null>(null);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Track changes
useEffect(() => {
  setHasUnsavedChanges(true);
}, [nodes, edges]);
```

### 3.2 Configuration State

Configuration updates flow through React Flow's node data:

```typescript
// Update node config
const updateNodeConfig = (nodeId: string, config: unknown) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, config } }
        : node
    )
  );
};
```

### 3.3 No Global State

- No Zustand, Redux, or Context API needed
- React Flow manages nodes/edges
- Server state fetched via API routes (no SWR/React Query for MVP)

---

## 4. Data Flow

### 4.1 Save Workflow

```
User clicks "Save"
  → Validate workflow structure (validateWorkflow helper)
  → Validate each node config (Zod schemas)
  → If valid:
      → Serialize to WorkflowSchema (Zod)
      → POST /api/workflows/[id]
      → Server: Validate with Zod
      → Server: Upsert to PostgreSQL (Drizzle)
      → Update updatedAt timestamp
      → Return success
      → Clear unsaved changes flag
  → If invalid:
      → Show ValidationErrors component
      → Prevent save
```

### 4.2 Load Workflow

```
Navigate to /workflow/[id]/edit
  → Server component: Fetch from DB (Drizzle)
  → Pass workflow data as props
  → Client component: Parse data
  → Validate with Zod
  → Convert to React Flow format (nodes, edges)
  → Initialize canvas state
```

### 4.3 Add Node from Palette

```
User drags node from palette
  → onDragEnd handler
  → Generate new node ID (uuid)
  → Create node object with:
      - id
      - type
      - position (drop coordinates)
      - data: { config: defaultConfigForType(type) }
  → Add to nodes state
  → Mark unsaved changes
```

---

## 5. Database Schema (Drizzle ORM)

### 5.1 Schema Definition

**File**: `apps/web/db/schema.ts`

```typescript
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  data: jsonb('data').notNull(), // { nodes: [], edges: [] }
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### 5.2 JSONB Structure

The `data` column stores:

```json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "Spark",
      "position": { "x": 100, "y": 100 },
      "config": { "triggerType": "manual_simulate" }
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "node-uuid",
      "target": "node-uuid",
      "sourceHandle": "passed",
      "label": "passed"
    }
  ]
}
```

### 5.3 Seed Data (Sample Workflow)

**File**: `apps/web/db/seed.ts`

Insert "Automated Code Review" workflow:
- Spark → Brain → Fork → (passed: Lightning Lever, failed: Autopsy Report)
- Default configurations for all nodes

---

## 6. Validation Logic

### 6.1 Structural Validation

**File**: `packages/shared/src/validation.ts`

```typescript
export function validateWorkflow(workflow: Workflow): ValidationResult {
  const errors: string[] = [];

  // Rule 1: Exactly one Spark
  const sparkNodes = workflow.nodes.filter(n => n.type === 'Spark');
  if (sparkNodes.length === 0) errors.push('Workflow must have a Spark node');
  if (sparkNodes.length > 1) errors.push('Workflow can only have one Spark node');

  // Rule 2: Spark has no incoming edges
  const sparkIncoming = workflow.edges.filter(e => 
    sparkNodes.some(s => s.id === e.target)
  );
  if (sparkIncoming.length > 0) {
    errors.push('Spark node cannot have incoming connections');
  }

  // Rule 3: At least one Autopsy Report
  const reportNodes = workflow.nodes.filter(n => n.type === 'Autopsy Report');
  if (reportNodes.length === 0) {
    errors.push('Workflow must have at least one Autopsy Report node');
  }

  // Rule 4: All non-output nodes must have outgoing edges
  const outputNodeIds = new Set(reportNodes.map(n => n.id));
  workflow.nodes.forEach(node => {
    if (outputNodeIds.has(node.id)) return;
    const hasOutgoing = workflow.edges.some(e => e.source === node.id);
    if (!hasOutgoing) {
      errors.push(`Node "${node.type}" must connect to a downstream node`);
    }
  });

  // Rule 5: No cycles
  if (hasCycle(workflow.nodes, workflow.edges)) {
    errors.push('Workflow cannot contain circular dependencies');
  }

  return { valid: errors.length === 0, errors };
}

function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  // Topological sort / DFS cycle detection
  // (implementation details)
}
```

### 6.2 Config Validation (Zod)

Each node type has a Zod schema in `packages/shared/src/schemas.ts`:

```typescript
export const sparkConfigSchema = z.object({
  triggerType: z.enum(['github_push', 'manual_simulate']),
});

export const brainConfigSchema = z.object({
  prompt: z.string().max(500),
  maxSteps: z.number().int().min(1).max(50).default(10),
});

export const scalpelConfigSchema = z.object({
  command: z.enum(ALLOWED_COMMANDS),
});

// etc.
```

---

## 7. Theming

### 7.1 CSS Variables

**File**: `apps/web/app/globals.css`

```css
:root {
  --bg-lab: #0B0F0C;
  --panel-lab: #141B16;
  --node-default: #1F2D23;
  --node-selected: #2A3F30;
  --stitch: #4A6354;
  --success: #8BC34A;
  --active: #F5E663;
  --failure: #C0504D;
  --text-primary: #E6EDE8;
  --text-secondary: #A8B5AC;
}

body {
  background-color: var(--bg-lab);
  color: var(--text-primary);
}

.react-flow__node {
  background: var(--node-default);
  border: 1px solid var(--stitch);
  border-radius: 8px;
}

.react-flow__node.selected {
  background: var(--node-selected);
  border-color: var(--active);
}

.react-flow__edge-path {
  stroke: var(--stitch);
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### 7.2 Node Icons

Use simple SVG icons or Unicode symbols:
- Spark: ⚡
- Brain: 🧠
- Eyes: 👁️
- Scalpel: 🔪
- Heart: ❤️
- Fork: 🔀
- Lightning Lever: ⚡🎚️
- Autopsy Report: 📋

---

## 8. File Structure

```
apps/web/
├─ app/
│  ├─ workflow/
│  │  ├─ [id]/
│  │  │  └─ edit/
│  │  │     ├─ page.tsx (server component, loads workflow)
│  │  │     └─ components/
│  │  │        ├─ WorkflowCanvas.tsx (client, main component)
│  │  │        ├─ NodePalette.tsx
│  │  │        ├─ ConfigPanel.tsx
│  │  │        ├─ Toolbar.tsx
│  │  │        ├─ ValidationErrors.tsx
│  │  │        ├─ nodes/
│  │  │        │  └─ CustomNode.tsx
│  │  │        └─ edges/
│  │  │           └─ CustomEdge.tsx
│  │  └─ new/
│  │     └─ page.tsx (redirects to /workflow/[new-id]/edit)
│  ├─ api/
│  │  └─ workflows/
│  │     ├─ route.ts (GET list)
│  │     └─ [id]/
│  │        └─ route.ts (GET load, POST save)
│  └─ globals.css
├─ db/
│  ├─ schema.ts (Drizzle schema)
│  ├─ seed.ts (sample workflow)
│  └─ client.ts (Drizzle connection)
└─ lib/
   └─ utils.ts (helpers)

packages/shared/
├─ src/
│  ├─ index.ts
│  ├─ constants.ts (ALLOWED_COMMANDS)
│  ├─ schemas.ts (Zod schemas)
│  └─ validation.ts (structural validation)
└─ package.json
```

---

## 9. Dependencies

### apps/web

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "@xyflow/react": "^12.0.0",
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.4",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

### packages/shared

```json
{
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

---

## 10. Implementation Priorities

### Phase 1: Foundation (P0)
1. Database schema + migrations
2. Shared schemas (Zod) + ALLOWED_COMMANDS constant
3. WorkflowCanvas with React Flow setup
4. Basic node rendering (no config yet)

### Phase 2: Interaction (P0)
5. NodePalette + drag-and-drop
6. Edge creation (dashed style)
7. Node deletion, edge deletion
8. Validation logic

### Phase 3: Configuration (P0)
9. ConfigPanel component
10. Node config forms (per type)
11. Config validation (Zod)

### Phase 4: Persistence (P0)
12. API routes (save, load, list)
13. Save workflow with validation
14. Load workflow from DB
15. Seed sample workflow

### Phase 5: Polish (P0)
16. Theming (CSS variables, dark mode)
17. Keyboard accessibility
18. Prefers-reduced-motion
19. Unsaved changes indicator
20. Validation error display

---

## 11. Testing Strategy

### Unit Tests (Vitest)
- `validateWorkflow()` with various invalid structures
- Zod schema validation for each node type
- Cycle detection algorithm

### Integration Tests
- Save workflow → load workflow → verify equality
- Drag node from palette → verify node created
- Connect nodes → verify edge created

### Manual Testing
- Create sample workflow
- Save and reload
- Verify theme in dark mode
- Test keyboard navigation
- Test with prefers-reduced-motion

---

## 12. Out of Scope (This Phase)

- Workflow execution (see workflow-engine spec)
- Realtime collaboration
- Undo/redo
- Workflow templates
- Export/import JSON files
- GitHub webhook integration

---

**Status**: ⏸️ Awaiting design review before generating implementation tasks.
