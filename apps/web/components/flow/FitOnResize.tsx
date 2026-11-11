'use client'

import { useEffect } from 'react'
import { useNodesInitialized, useReactFlow, useStore, type FitViewOptions } from '@xyflow/react'

// fitView only runs once on mount. Refit whenever the pane size changes
// (font load, layout settle, window resize, phone rotation) so every node
// stays visible and centered. Must render inside <ReactFlow>.
export function FitOnResize({ options }: { options: FitViewOptions }) {
  const { fitView } = useReactFlow()
  const ready = useNodesInitialized()
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)

  useEffect(() => {
    if (!ready || width === 0 || height === 0) return
    void fitView(options)
  }, [ready, width, height, fitView, options])

  return null
}
