'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, CopyIcon } from '@/components/icons'
import { Button } from './Button'

interface CopyButtonProps {
  value: string
  /** What is copied, for screen readers, e.g. "webhook URL". */
  what: string
}

type State = 'idle' | 'copied' | 'failed'

export function CopyButton({ value, what }: CopyButtonProps) {
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const timer = window.setTimeout(() => setState('idle'), 2500)
    return () => window.clearTimeout(timer)
  }, [state])

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard not available')
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
  }

  const label = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed, select the text' : 'Copy'

  return (
    <>
      <Button icon={state === 'copied' ? <CheckIcon /> : <CopyIcon />} onClick={() => void copy()}>
        {label}
        {state === 'idle' && <span className="sr-only"> {what}</span>}
      </Button>
      <span role="status" className="sr-only">
        {state === 'copied' ? `Copied the ${what}` : state === 'failed' ? `Could not copy the ${what}` : ''}
      </span>
    </>
  )
}
