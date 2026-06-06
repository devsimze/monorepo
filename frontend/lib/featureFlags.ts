/**
 * Feature Flag Context — Provider and Hook
 *
 * Usage:
 *   // In a client component:
 *   const isEnabled = useFeatureFlag('STAKING_ENABLED')
 *
 * Provider:
 *   Wrap your root layout with <FeatureFlagProvider> once.
 *   It starts with static defaults (SSR-safe) and hydrates from
 *   GET /api/config/feature-flags after mount.
 *
 * Adding a new flag: add it to frontend/config/featureFlags.ts — done.
 */
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { defaultFlags, type FlagName, type FlagMap } from '@/config/featureFlags'

const FlagContext = createContext<FlagMap>({ ...defaultFlags })

export function FeatureFlagProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [flags, setFlags] = useState<FlagMap>({ ...defaultFlags })

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) return

    fetch(`${backendUrl}/api/config/feature-flags`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((r) => {
        if (!r.ok) return
        return r.json()
      })
      .then((body) => {
        if (body?.data && typeof body.data === 'object') {
          setFlags((prev) => ({ ...prev, ...(body.data as Partial<FlagMap>) }))
        }
      })
      .catch(() => {
        // Fall back to static defaults silently — never break the app.
      })
  }, [])

  // React.createElement avoids JSX so this file can stay .ts
  return React.createElement(FlagContext.Provider, { value: flags }, children)
}

/** Returns whether the given feature flag is enabled. Returns the static
 *  default during SSR / before the fetch resolves. */
export function useFeatureFlag(flag: FlagName): boolean {
  return useContext(FlagContext)[flag]
}

// Re-export for convenience; components can import FlagName from here.
export type { FlagName, FlagMap }
