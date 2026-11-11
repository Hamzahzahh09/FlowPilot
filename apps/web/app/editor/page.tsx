import type { Metadata } from 'next'
import { Editor } from '@/components/editor/Editor'

export const metadata: Metadata = {
  title: 'Editor · FlowPilot',
}

export default function EditorPage() {
  return <Editor />
}
