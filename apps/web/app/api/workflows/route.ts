import { workflowCreateInputSchema } from 'shared'
import { handle, parseBody } from '@/server/http'
import { createWorkflow, listWorkflows } from '@/server/workflows'

export const dynamic = 'force-dynamic'

export function GET() {
  return handle(async () => ({ workflows: await listWorkflows() }))
}

export function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, workflowCreateInputSchema)
    return { workflow: await createWorkflow(input) }
  })
}
