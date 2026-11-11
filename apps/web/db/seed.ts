import { db } from './client'
import { workflows } from './schema'
import type { WorkflowData } from 'shared'

/**
 * Seed script: Creates the "Automated Code Review" sample workflow
 * 
 * Workflow structure:
 * Spark → Brain → Fork 
 *                  ├─ passed → Lightning Lever → Autopsy Report
 *                  └─ failed → Autopsy Report
 */
async function seed() {
  if (!db) {
    throw new Error('DATABASE_URL is required to seed database')
  }
  console.log('🌱 Seeding database...')

  const sampleWorkflowData: WorkflowData = {
    nodes: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'Spark',
        position: { x: 100, y: 200 },
        config: { triggerType: 'manual_simulate' },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'Brain',
        position: { x: 300, y: 200 },
        config: {
          prompt: 'Analyze the code changes for potential issues and code quality.',
          maxSteps: 10,
        },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        type: 'Fork',
        position: { x: 500, y: 200 },
        config: {},
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        type: 'Lightning Lever',
        position: { x: 700, y: 100 },
        config: {},
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        type: 'Autopsy Report',
        position: { x: 900, y: 100 },
        config: { format: 'markdown' },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        type: 'Autopsy Report',
        position: { x: 700, y: 300 },
        config: { format: 'markdown' },
      },
    ],
    edges: [
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        source: '550e8400-e29b-41d4-a716-446655440001', // Spark
        target: '550e8400-e29b-41d4-a716-446655440002', // Brain
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        source: '550e8400-e29b-41d4-a716-446655440002', // Brain
        target: '550e8400-e29b-41d4-a716-446655440003', // Fork
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440003',
        source: '550e8400-e29b-41d4-a716-446655440003', // Fork
        target: '550e8400-e29b-41d4-a716-446655440004', // Lightning Lever
        sourceHandle: 'passed',
        label: 'passed',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440004',
        source: '550e8400-e29b-41d4-a716-446655440004', // Lightning Lever
        target: '550e8400-e29b-41d4-a716-446655440005', // Autopsy Report (success)
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440005',
        source: '550e8400-e29b-41d4-a716-446655440003', // Fork
        target: '550e8400-e29b-41d4-a716-446655440006', // Autopsy Report (failed)
        sourceHandle: 'failed',
        label: 'failed',
      },
    ],
  }

  // Insert sample workflow
  await db
    .insert(workflows)
    .values({
      id: '450e8400-e29b-41d4-a716-446655440000',
      name: 'Automated Code Review',
      description:
        'AI-powered code review workflow with linting, testing, and human approval gate.',
      data: sampleWorkflowData,
    })
    .onConflictDoNothing()

  console.log('✅ Sample workflow "Automated Code Review" created')
  console.log('   ID: 450e8400-e29b-41d4-a716-446655440000')

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
