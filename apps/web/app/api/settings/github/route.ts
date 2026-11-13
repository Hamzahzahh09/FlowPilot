import { githubSettingsPatchSchema } from 'shared'
import { getGithubSettings, patchGithubSettings } from '@/server/github'
import { handle, parseBody, retryOnDrop } from '@/server/http'

export const dynamic = 'force-dynamic'

export function GET() {
  return handle(async () => ({ settings: await retryOnDrop(getGithubSettings) }))
}

export function PATCH(request: Request) {
  return handle(async () => {
    const patch = await parseBody(request, githubSettingsPatchSchema)
    return { settings: await retryOnDrop(() => patchGithubSettings(patch)) }
  })
}
