## Summary

This PR implements four user-facing and compliance features across the Shelterflex monorepo:

1. **#1038 — Map-Based Property Discovery**: Interactive Leaflet/OpenStreetMap map view for the property listings page
2. **#1036 — Whistleblower Fraud Report Submission & Admin Review**: Anonymous public fraud report form with admin management dashboard
3. **#1035 — Tenant Data Export & Right to Erasure**: NDPA-compliant data portability and account deletion for tenants
4. **#1034 — Cookie Consent Banner & Preference Center**: NDPA-compliant consent management with per-category controls

## Linked Issues

Closes #1038, Closes #1036, Closes #1035, Closes #1034

## Changes

### #1038 — Map-Based Property Discovery (Leaflet/OpenStreetMap)

- **Dependencies**: Added `leaflet`, `react-leaflet`, `@types/leaflet` to `frontend/package.json`
- **`frontend/components/PropertyMap.tsx`**: `MapContainer` centred on Lagos (6.5244°N, 3.3792°E) at zoom 12; custom `L.divIcon` branded pin markers avoid the broken default Leaflet marker image path in Next.js static builds; Leaflet CSS imported inside the component to avoid hydration issues; properties without valid coordinates are silently excluded (no runtime errors)
- **`frontend/components/MapListingCard.tsx`**: Compact popup card with property thumbnail, price badge (₦Xk/yr), bedroom count, and "View Details" CTA linking to `/properties/{id}`
- **`frontend/app/properties/map/page.tsx`**: Full-page map view loaded client-side only via `dynamic(() => import(...), { ssr: false })`; filter sidebar (city, bedrooms, price range); on mobile a Vaul bottom-sheet replaces the sidebar; filter state managed in URL params; re-renders pins without full page reload
- **`frontend/app/properties/page.tsx`**: Added "Map View" toggle button to the search toolbar, preserving active query-string filters when navigating to `/properties/map`

### #1036 — Whistleblower Anonymous Report Submission & Admin Review Flow

**Backend:**
- **`backend/src/schemas/whistleblowerReport.ts`**: Zod schemas — `createReportSchema` (reportType enum, description ≥20 chars, optional evidenceUrl/contactEmail), `updateReportStatusSchema` (status enum + mandatory note), `listReportsQuerySchema`
- **`backend/src/repositories/WhistleblowerRepository.ts`**: In-memory store (no DB migration required); strips `encryptedContactEmail` and `ipAddress` from all public-facing types
- **`backend/src/services/whistleblowerReportService.ts`**: Generates `WB-XXXXXX` reference codes (6 uppercase alphanumeric via `crypto.randomBytes`); encrypts contact email with AES-256-CBC (IV per submission, stored as `iv:cipher` base64)
- **`backend/src/routes/whistleblowerReports.ts`**: `POST /api/v1/reports` (public, IP rate-limited 5/hr via in-memory Map); `GET /api/v1/reports/admin/reports` (admin only); `PATCH /api/v1/reports/admin/reports/:id/status` (admin only, mandatory note)

**Frontend:**
- **`frontend/app/report/page.tsx`**: Public form — no account required; four report type selectors; optional evidence URL and encrypted contact email; WB-XXXXXX reference code shown on confirmation screen
- **`frontend/app/admin/reports/page.tsx`**: Admin list with type/status filter chips; expandable per-report status-update panel requiring a mandatory note; live refresh

### #1035 — Tenant Data Export & Right to Erasure (NDPA compliance)

**Backend:**
- **`backend/src/repositories/DataExportRepository.ts`**: In-memory export job store; status flow: `pending → processing → ready → expired`
- **`backend/src/services/tenantDataExportService.ts`**: `requestExport()` creates a pending job and fires non-blocking async `processJob()`; sets placeholder signed S3 URL + 48h expiry when ready
- **`backend/src/routes/tenantDataExport.ts`**: `POST /api/v1/tenant/data-export/request` (202, returns jobId); `GET /api/v1/tenant/data-export/:jobId` (returns status + downloadUrl + expiresAt)
- **`backend/src/routes/tenantErasure.ts`**: `POST /api/v1/tenant/erasure/request`; blocked with descriptive 409 if tenant has an active deal; returns requestId + confirmBy (30 days)

**Frontend:**
- **`frontend/app/tenant/privacy/page.tsx`**: "My Data" settings page; "Request Data Export" with 5-second auto-polling and live status badge (Queued → Processing → Ready → Expired); "Request Account Deletion" with two-step confirm dialog and active-deal error handling

### #1034 — Cookie Consent Banner & Preference Center (NDPA compliance)

- **`frontend/hooks/useCookieConsent.ts`**: Reads/writes `shelterflex_cookie_consent` JSON to localStorage; all reads are deferred post-mount via `useEffect` (zero SSR/hydration mismatch); bumping `POLICY_VERSION` clears stale consent and re-shows the banner
- **`frontend/contexts/CookieConsentContext.tsx`**: React context provider wrapping the hook; wired into root layout
- **`frontend/components/CookieConsentBanner.tsx`**: Fixed bottom banner that renders only after mount; three actions: Accept All, Reject Non-Essential, Manage Preferences; ARIA-labelled, fully keyboard-navigable
- **`frontend/components/CookiePreferenceModal.tsx`**: Radix `Dialog` with per-category `Switch` toggles — Strictly Necessary (always-on, disabled), Analytics, Marketing, Functional; focus trap provided by Radix
- **`frontend/app/layout.tsx`**: Wrapped with `CookieConsentProvider`; `CookieConsentBanner` mounted at root
- **`frontend/components/footer.tsx`**: "Cookie Settings" link opens the preference modal from anywhere in the app

## How to test

- [ ] `/properties` — "Map View" button visible; clicking it loads `/properties/map` with filters preserved
- [ ] `/properties/map` — map renders centred on Lagos, markers appear for properties with coordinates; popup shows MapListingCard; sidebar filters update pins without page reload
- [ ] Mobile `/properties/map` — bottom-sheet filter drawer opens correctly
- [ ] `/report` — submit report without login; verify WB-XXXXXX reference code displayed
- [ ] `/admin/reports` — admin list loads; filters work; status update with mandatory note succeeds
- [ ] `/tenant/privacy` — "Request Data Export" queues job; status badge updates on polling; "Request Account Deletion" two-step flow shows confirmBy date
- [ ] First visit (no localStorage consent) — cookie banner appears at bottom
- [ ] "Accept All" — banner dismisses; consent saved to localStorage
- [ ] "Manage Preferences" — modal opens with category toggles; custom save works
- [ ] Footer "Cookie Settings" link — preference modal opens

## Security Considerations

- Contact emails in fraud reports are encrypted at rest (AES-256-CBC) and never returned in plaintext via any API
- Fraud report endpoint is IP rate-limited (5 per hour) without requiring authentication
- All tenant data export and erasure endpoints are JWT-authenticated and scoped to the requesting tenant's own data
- No PII is required for anonymous fraud report submission

## Checklist

- [x] I linked issues
- [x] I did not commit secrets
- [x] Code follows the project's neobrutalist design system
- [x] Backend routes registered in `app.ts` for both `/api/v1/` and test-mode `/api/` prefixes
- [x] All Leaflet imports are client-side only (zero SSR errors)
- [x] Cookie consent reads localStorage only after mount (zero hydration mismatches)
