import { handle, idParam, notFound } from '@/server/http'
import { getRun } from '@/server/runs'

export const dynamic = 'force-dynamic'

export function GET(_request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const run = await getRun(idParam(params.id, 'Run'))
    if (!run) throw notFound('Run')
    return { run }
  })
}
