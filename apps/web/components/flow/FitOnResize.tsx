'use client'

import { useEffect, useRef } from 'react'
import { useNodesInitialized, useReactFlow, useStore, type FitViewOptions } from '@xyflow/react'

// fitView only runs once on mount. Refit when the pane size changes (layout
// settle, window resize, phone rotation) so every node stays visible and
// centered. Adding a node does not refit, so the editor view does not jump.
// Must render inside <ReactFlow>.
export function FitOnResize({ options }: { options: FitViewOptions }) {
  const { fitView } = useReactFlow()
  const ready = useNodesInitialized()
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const lastSize = useRef('')

  useEffect(() => {
    if (!ready || width === 0 || height === 0) return
    const size = `${width}x${height}`
    if (size === lastSize.current) return
    lastSize.current = size
    void fitView(options)
  }, [ready, width, height, fitView, options])

  return null
}
