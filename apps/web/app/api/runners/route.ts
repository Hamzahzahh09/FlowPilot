import { runnerCreateInputSchema } from 'shared'
import { handle, parseBody } from '@/server/http'
import { createRunnerToken, listRunners } from '@/server/runners'

export const dynamic = 'force-dynamic'

export function GET() {
  return handle(async () => ({ runners: await listRunners() }))
}

/** Answers with the plain token once; it is not stored or logged. */
export function POST(request: Request) {
  return handle(async () => {
    const { name } = await parseBody(request, runnerCreateInputSchema)
    return createRunnerToken(name)
  })
}
