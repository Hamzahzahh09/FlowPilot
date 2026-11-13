import { runStartInputSchema } from 'shared'
import { handle, parseBody, retryOnDrop } from '@/server/http'
import { listRuns, startRun } from '@/server/runs'

export const dynamic = 'force-dynamic'

export function GET() {
  return handle(async () => ({ runs: await retryOnDrop(listRuns) }))
}

export function POST(request: Request) {
  return handle(async () => {
    const { workflowId } = await parseBody(request, runStartInputSchema)
    return { run: await startRun(workflowId) }
  })
}
