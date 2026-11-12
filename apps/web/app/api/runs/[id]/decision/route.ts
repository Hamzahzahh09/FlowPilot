import { runDecisionInputSchema } from 'shared'
import { handle, idParam, parseBody } from '@/server/http'
import { decideRun } from '@/server/runs'

export const dynamic = 'force-dynamic'

export function POST(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const id = idParam(params.id, 'Run')
    const { decision } = await parseBody(request, runDecisionInputSchema)
    return { run: await decideRun(id, decision) }
  })
}
