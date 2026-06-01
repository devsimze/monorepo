'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { CookiePreferenceModal } from '@/components/CookiePreferenceModal'

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectNonEssential, openPreferences, isLoaded } =
    useCookieConsent()

  if (!isLoaded || !showBanner) {
    return <CookiePreferenceModal />
  }

  return (
    <>
      <div
        role="region"
        aria-label="Cookie consent"
        className="fixed bottom-0 left-0 z-50 w-full border-t-3 border-foreground bg-foreground text-background shadow-[0_-4px_0px_0px_rgba(26,26,26,1)]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-background/90">
            We use cookies to improve your experience. See our{' '}
            <Link
              href="/cookies"
              className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Cookie Policy
            </Link>
            .
          </p>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              onClick={rejectNonEssential}
              aria-label="Reject non-essential cookies"
              className="border-2 border-background bg-transparent text-background font-bold hover:bg-background/10 transition-colors"
            >
              Reject Non-Essential
            </Button>
            <Button
              onClick={openPreferences}
              aria-label="Manage cookie preferences"
              className="border-2 border-background bg-transparent text-background font-bold hover:bg-background/10 transition-colors"
            >
              Manage Preferences
            </Button>
            <Button
              onClick={acceptAll}
              aria-label="Accept all cookies"
              className="border-3 border-background bg-primary font-bold text-foreground shadow-[4px_4px_0px_0px_rgba(255,254,249,0.4)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,254,249,0.4)]"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferenceModal />
    </>
  )
}
