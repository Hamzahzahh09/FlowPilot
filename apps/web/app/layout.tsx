import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowPilot: automate the workflow, keep control of the code',
  description:
    'A visual builder for code-check pipelines: AI review, sandboxed lint and tests, and human approval before every report.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
