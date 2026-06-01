import { useCallback, useSyncExternalStore, useState } from 'react'

export const POLICY_VERSION = '1.0'

const STORAGE_KEY = 'shelterflex_cookie_consent'

export interface ConsentCategories {
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export interface ConsentRecord {
  version: string
  timestamp: string
  categories: ConsentCategories
}

function readStoredConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentRecord
  } catch {
    return null
  }
}

function writeConsent(record: ConsentRecord): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage unavailable — fail silently
  }
}

function buildRecord(categories: ConsentCategories): ConsentRecord {
  return {
    version: POLICY_VERSION,
    timestamp: new Date().toISOString(),
    categories,
  }
}

// Module-level singleton store so same-tab writes are reflected without storage events
type Listener = () => void
const _listeners = new Set<Listener>()
let _snapshot: ConsentRecord | null = null
let _initialized = false

function _subscribe(listener: Listener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

function _getClientSnapshot(): ConsentRecord | null {
  if (!_initialized) {
    _initialized = true
    _snapshot = readStoredConsent()
  }
  return _snapshot
}

function _setSnapshot(record: ConsentRecord | null): void {
  _snapshot = record
  _initialized = true
  _listeners.forEach((l) => l())
}

const _getServerSnapshot = (): ConsentRecord | null => null

const _subscribeEmpty = (): (() => void) => () => {}
const _getLoadedClient = (): boolean => true
const _getLoadedServer = (): boolean => false

export interface UseCookieConsentReturn {
  consent: ConsentRecord | null
  hasConsent: (category: keyof ConsentCategories) => boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  updateConsent: (categories: Partial<ConsentCategories>) => void
  isLoaded: boolean
  showBanner: boolean
  openPreferences: () => void
  isPreferencesOpen: boolean
  closePreferences: () => void
}

export function useCookieConsent(): UseCookieConsentReturn {
  const consent = useSyncExternalStore(_subscribe, _getClientSnapshot, _getServerSnapshot)
  const isLoaded = useSyncExternalStore(_subscribeEmpty, _getLoadedClient, _getLoadedServer)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  const showBanner =
    isLoaded && (consent === null || consent.version !== POLICY_VERSION)

  const hasConsent = useCallback(
    (category: keyof ConsentCategories): boolean => {
      return consent?.categories[category] ?? false
    },
    [consent],
  )

  const acceptAll = useCallback(() => {
    const record = buildRecord({
      analytics: true,
      marketing: true,
      functional: true,
    })
    writeConsent(record)
    _setSnapshot(record)
    setIsPreferencesOpen(false)
  }, [])

  const rejectNonEssential = useCallback(() => {
    const record = buildRecord({
      analytics: false,
      marketing: false,
      functional: false,
    })
    writeConsent(record)
    _setSnapshot(record)
    setIsPreferencesOpen(false)
  }, [])

  const updateConsent = useCallback(
    (categories: Partial<ConsentCategories>) => {
      const current = consent?.categories ?? {
        analytics: false,
        marketing: false,
        functional: false,
      }
      const record = buildRecord({ ...current, ...categories })
      writeConsent(record)
      _setSnapshot(record)
      setIsPreferencesOpen(false)
    },
    [consent],
  )

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true)
  }, [])

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false)
  }, [])

  return {
    consent,
    hasConsent,
    acceptAll,
    rejectNonEssential,
    updateConsent,
    isLoaded,
    showBanner,
    openPreferences,
    isPreferencesOpen,
    closePreferences,
  }
}
