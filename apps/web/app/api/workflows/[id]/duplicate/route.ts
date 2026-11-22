import { handle, idParam, retryOnDrop } from '@/server/http'
import { duplicateWorkflow } from '@/server/workflows'

export const dynamic = 'force-dynamic'

type Context = { params: { id: string } }

export function POST(_request: Request, { params }: Context) {
  return handle(async () => {
    const id = idParam(params.id, 'Workflow')
    const workflow = await retryOnDrop(() => duplicateWorkflow(id))
    return { workflow }
  })
}
