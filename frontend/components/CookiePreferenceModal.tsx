'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/useCookieConsent'

interface PreferenceRowProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function PreferenceRow({
  id,
  label,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-foreground/20 py-4 last:border-b-0">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="block text-sm font-bold text-foreground cursor-pointer"
        >
          {label}
          {disabled && (
            <span className="ml-2 text-xs font-normal text-foreground/60">
              (Always active)
            </span>
          )}
        </label>
        <p className="mt-0.5 text-xs text-foreground/70 leading-relaxed">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={`Toggle ${label} cookies`}
        className="mt-0.5 shrink-0"
      />
    </div>
  )
}

export function CookiePreferenceModal() {
  const { consent, isPreferencesOpen, closePreferences, updateConsent, acceptAll } =
    useCookieConsent()

  const [analytics, setAnalytics] = useState(
    consent?.categories.analytics ?? false,
  )
  const [marketing, setMarketing] = useState(
    consent?.categories.marketing ?? false,
  )
  const [functional, setFunctional] = useState(
    consent?.categories.functional ?? false,
  )

  function handleSave() {
    updateConsent({ analytics, marketing, functional })
  }

  function handleAcceptAll() {
    setAnalytics(true)
    setMarketing(true)
    setFunctional(true)
    acceptAll()
  }

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent
        className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] max-w-lg rounded-none p-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="border-b-3 border-foreground bg-foreground px-6 py-4">
          <DialogTitle className="font-mono text-lg font-black text-background">
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2">
          <p className="pt-4 text-sm text-foreground/70">
            Choose which cookies you allow. Strictly necessary cookies are
            always active.
          </p>

          <div className="mt-2">
            <PreferenceRow
              id="cookie-strictly-necessary"
              label="Strictly Necessary"
              description="Required for the site to function. Cannot be disabled."
              checked={true}
              disabled={true}
            />
            <PreferenceRow
              id="cookie-analytics"
              label="Analytics"
              description="Helps us understand how you use the platform (Sentry, PostHog)"
              checked={analytics}
              onCheckedChange={setAnalytics}
            />
            <PreferenceRow
              id="cookie-marketing"
              label="Marketing"
              description="Personalised ads and promotional content"
              checked={marketing}
              onCheckedChange={setMarketing}
            />
            <PreferenceRow
              id="cookie-functional"
              label="Functional"
              description="Enhanced features like live chat and saved preferences"
              checked={functional}
              onCheckedChange={setFunctional}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t-3 border-foreground px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleSave}
            aria-label="Save cookie preferences"
            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleAcceptAll}
            aria-label="Accept all cookies"
            className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
          >
            Accept All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
