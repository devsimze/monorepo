'use client'

import React, { createContext, useContext } from 'react'
import {
  useCookieConsent,
  type UseCookieConsentReturn,
} from '@/hooks/useCookieConsent'

export type { ConsentRecord, ConsentCategories } from '@/hooks/useCookieConsent'
export { POLICY_VERSION } from '@/hooks/useCookieConsent'

const CookieConsentContext = createContext<UseCookieConsentReturn | null>(null)

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const value = useCookieConsent()

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsentContext(): UseCookieConsentReturn {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error(
      'useCookieConsentContext must be used within CookieConsentProvider',
    )
  }
  return ctx
}
