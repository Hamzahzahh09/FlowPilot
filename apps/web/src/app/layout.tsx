import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FlowPilot',
  description: 'AI-powered development automation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
