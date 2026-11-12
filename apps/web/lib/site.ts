import { DEMO_WORKFLOW_ID } from '@/lib/data/mock/seed'

export const REPO_URL = 'https://github.com/Hamzahzahh09/FlowPilot'

// Links to logged-in pages go straight to the page; middleware sends
// visitors without a session to /login?next=<page> and back afterwards.
export const ROUTES = {
  home: '/',
  login: '/login',
  workflows: '/workflows',
  demoWorkflow: `/workflows/${DEMO_WORKFLOW_ID}`,
} as const
