import { workflowSaveInputSchema } from 'shared'
import { handle, idParam, notFound, parseBody, retryOnDrop } from '@/server/http'
import { deleteWorkflow, getWorkflow, saveWorkflow } from '@/server/workflows'

export const dynamic = 'force-dynamic'

type Context = { params: { id: string } }

export function GET(_request: Request, { params }: Context) {
  return handle(async () => {
    const workflow = await retryOnDrop(() => getWorkflow(idParam(params.id, 'Workflow')))
    if (!workflow) throw notFound('Workflow')
    return { workflow }
  })
}

export function PUT(request: Request, { params }: Context) {
  return handle(async () => {
    const id = idParam(params.id, 'Workflow')
    const input = await parseBody(request, workflowSaveInputSchema)
    return { workflow: await retryOnDrop(() => saveWorkflow(id, input)) }
  })
}

export function DELETE(_request: Request, { params }: Context) {
  return handle(async () => {
    const id = idParam(params.id, 'Workflow')
    await retryOnDrop(() => deleteWorkflow(id))
    return { ok: true }
  })
}
