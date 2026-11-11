'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type TopBarContextValue = {
  detail: string | null
  setDetail: (detail: string | null) => void
}

const TopBarContext = createContext<TopBarContextValue | null>(null)

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [detail, setDetail] = useState<string | null>(null)
  const value = useMemo(() => ({ detail, setDetail }), [detail])
  return <TopBarContext.Provider value={value}>{children}</TopBarContext.Provider>
}

export function useTopBarDetail(): string | null {
  return useContext(TopBarContext)?.detail ?? null
}

/** Pages call this to show a detail (e.g. the workflow name) after the section in the top bar. */
export function useSetTopBarDetail(detail: string | null): void {
  const setDetail = useContext(TopBarContext)?.setDetail
  useEffect(() => {
    if (!setDetail) return
    setDetail(detail)
    return () => setDetail(null)
  }, [detail, setDetail])
}
