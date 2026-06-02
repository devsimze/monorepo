import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 0.05,
  beforeSend(event) {
    // Filter out noise errors
    if (event.exception) {
      const message = event.exception.values?.[0]?.value || ""
      
      // Filter out common noise errors
      const noisePatterns = [
        /Non-Error promise rejection/i,
        /ResizeObserver loop limit exceeded/i,
        /Script error/i,
        /Network request failed/i,
        /Loading chunk \d+ failed/i,
        /Failed to fetch/i,
      ]
      
      if (noisePatterns.some(pattern => pattern.test(message))) {
        return null
      }
    }
    
    // Scrub PII from event data
    if (event.request) {
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers["authorization"]
        delete event.request.headers["cookie"]
      }
    }
    
    // Scrub PII from user data
    if (event.user) {
      delete event.user.email
      delete event.user.phone
      delete event.user.ip_address
    }
    
    // Scrub PII from extra data
    if (event.extra) {
      const extra = event.extra
      delete extra.email
      delete extra.phone
      delete extra.password
    }
    
    return event
  },
})
