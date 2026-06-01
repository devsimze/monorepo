## Summary

Add a landlord verification badge system with admin-managed verification workflow.
This includes a database migration for landlord verification state, backend admin/public endpoints, audit and notification integration, frontend badge display on property cards and landlord snippets, and an admin verification management page.

## Linked issue (recommended)

Closes #1041

## Changes

- Added `backend/migrations/039_landlord_verification.sql` to store landlord verification level and verified timestamp.
- Added backend validation schema: `backend/src/schemas/landlordVerification.ts`.
- Added backend service: `backend/src/services/landlordVerificationService.ts`.
- Added backend routes:
  - `POST /api/v1/admin/landlords/:id/verify`
  - `GET /api/v1/landlords/:id/verification-status`
- Integrated admin verification route into backend app routing.
- Extended landlord profile typing with `verificationLevel`.
- Added frontend `LandlordVerificationBadge` component.
- Display landlord verification badge on property cards and landlord snippets.
- Added admin landlord verification page: `frontend/app/admin/landlords/[id]/page.tsx`.
- Added targeted tests for backend service and frontend badge rendering.

## How to test

- Run backend unit tests:
  - `cd backend && corepack pnpm exec vitest run src/services/landlordVerificationService.test.ts`
- Run frontend unit tests:
  - `cd frontend && corepack pnpm exec vitest run components/__tests__/property-card.test.tsx`
- Verify admin landlord verification endpoint and public verification status with API integration.
- Confirm landlord badge appears for `landlordVerificationLevel` values in property card UI.

## Security Considerations

- No secrets or sensitive data are logged in this feature.
- Admin verification update is protected by admin role check.
- Notification and audit logging are implemented for verification changes.

## Screenshots (if UI)

- N/A for this text summary; UI includes a small verification badge on property cards and an admin page for selecting landlord verification levels.

## Checklist

- [x] I linked an issue (or explained why one is not needed)
- [x] I tested locally
- [x] I did not commit secrets
- [x] I updated docs if needed
- [x] Code follows the project's style guidelines
- [x] CI checks pass
- [ ] If UI changes: I included before/after screenshots
- [ ] If images added/changed: I verified they are optimized and accessible
