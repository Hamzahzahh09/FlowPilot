import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { workflows } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { workflowDataSchema, type WorkflowData } from 'shared'
import WorkflowCanvas from './components/WorkflowCanvas'
import { SAMPLE_WORKFLOW } from './components/sampleWorkflow'

interface PageProps {
  params: {
    id: string
  }
}

const DEMO_WORKFLOW: WorkflowData = SAMPLE_WORKFLOW

async function getWorkflow(id: string): Promise<WorkflowData | null> {
  if (!db) {
    return DEMO_WORKFLOW
  }

  try {
    const result = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1)

    if (result.length === 0) {
      return DEMO_WORKFLOW
    }

    const workflow = result[0]
    const parseResult = workflowDataSchema.safeParse(workflow.data)
    if (!parseResult.success) {
      console.error('Invalid workflow data:', parseResult.error)
      return DEMO_WORKFLOW
    }

    return parseResult.data
  } catch (error) {
    console.warn('Database query failed, falling back to demo workflow:', error)
    return DEMO_WORKFLOW
  }
}

export default async function WorkflowEditPage({ params }: PageProps) {
  const workflowData = await getWorkflow(params.id)

  if (!workflowData) {
    notFound()
  }

  return <WorkflowCanvas workflowId={params.id} initialData={workflowData} />
}
