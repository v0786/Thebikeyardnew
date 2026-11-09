# The Bike Yard — Checklist

Generated from the source-of-truth documents in `docs/` (v1.1), `tracker.md`, `PRODUCTION_READINESS_REPORT.md`, and `DECISIONS.md`.
**Status snapshot:** Wednesday 2026-11-04 | Commit c46c742 (main)

---

## Legend

- [ ] To do / open
- [x] Done
- [~] In progress / partial

---

## A. Open Owner Decisions (BLOCK production deployment)

These are unresolved owner inputs tracked in `DECISIONS.md` §"Open Owner Decisions" and `tracker.md` "Open Owner Decisions". Live payments and invoices are blocked until they are answered.

- [ ] **D1 — GSTIN and applicable GST rate(s)** — needed for invoice generation (CGST/SGST/IGST split basis points). Owner + qualified tax professional must approve before `POST /api/admin/invoices` goes live.
- [ ] **D3 — Invoice numbering prefix/sequence** — needed for billing.
- [ ] **D4 — Payment gateway provider** — needed for live payment recording. Stub remains for MVP until selected.
- [ ] **D5 — Finance partners (banks/NBFCs)** — needed for finance module.
- [ ] **D6 — Insurance providers** — needed for insurance module.
- [ ] **D7 — WhatsApp Business API availability + templates** — needed for messaging.
- [ ] Document retention durations — DATABASE §3.6, API §14 — owner approval needed before production launch.
- [ ] Refund approval policy thresholds — AUTH_SECURITY §4.3 (requester cannot self-approve); owner must confirm.

> NOTE: D2 (dealership type) and D8 (dark mode) can proceed independently — they are NOT blocking.

---

## B. Tracker Items In Progress / Not Started

From `tracker.md` (statuses NS/IP/BL). The completed (CO) items are excluded.

### Phase 0 — Repository Audit
- [~] TRACKER-05 Document baseline environment setup — `.env.example` present; Node 22, npm 10 available (IP)

### Phase 2 — Public Website
- [ ] PHASE-2-07 Responsive layouts and mobile testing (NS) — depends PHASE-2-01 to PHASE-2-05

### Phase 3 — Admin Dashboard
- [ ] PHASE-3-05 Admin forms (create/edit brands, models, variants, colours) (NS) — depends PHASE-3-03

### Phase 5 — Financial & Service Interfaces
- [~] PHASE-5-01 Payment recording and allocations (IP) — depends PHASE-1-05, PHASE-3-03
- [~] PHASE-5-02 GST invoices with CGST/SGST/IGST split (IP) — depends PHASE-1-05, PHASE-5-01
- [~] PHASE-5-03 Refund lifecycle (pending → approved → completed/rejected) (IP) — depends PHASE-1-05

### Phase 8 — Staff Portal, Tasks & Notifications
- [ ] P8-3 Notifications (NS) — depends P8-2

### Phase 9 — Reports & Analytics
- [~] P9-2 Sales/revenue charts (IP) — depends P5-5, P6-1
- [ ] P9-3 Best-selling variants (NS) — depends P5-5
- [ ] P9-4 Stock ageing (NS) — depends P4-3
- [ ] P9-5 Salesperson performance (NS) — depends P5-5, P1-1
- [ ] P9-6 Export reports (NS) — depends P9-1 to P9-5

### Phase 10 — Blogs, Social Media, FAQ, Settings
- [~] P10-1 Blogs management (IP) — depends P1-2
- [~] P10-2 Social media links (IP) — depends P1-2
- [~] P10-3 FAQ management (IP) — depends P1-2
- [ ] P10-5 Public social/FAQ display (NS) — depends P10-2, P10-3

### Phase 11 — AI Chatbot Integration
- [~] P11-1 Chatbot knowledge source (IP) — depends P3-1, P10-3
- [~] P11-2 Chatbot responses (IP) — depends P11-1
- [ ] P11-3 Chatbot enquiry collection (NS) — depends P11-2, P5-2
- [~] P11-4 No hallucination guard (IP) — depends P11-2

### Phase 12 — Testing, Security & Production Readiness
- [~] P12-3 E2E tests (IP) — all phases; Playwright suite written but browser execution blocked by container network isolation
- [ ] P12-8 Deployment configuration (NS) — depends P12-7; `vercel.json` created but platform env vars not set

### Additional Technical Readiness Tasks
All TRACKER-12 through TRACKER-20 are CO except:
- [ ] (none remaining — all additional technical readiness tasks complete)

---

## C. Production Blockers (must resolve before production)

From `PRODUCTION_READINESS_REPORT.md` §4 "Critical Blockers".

- [ ] #1 GST configuration — GSTIN, applicable GST rate(s), HSN/SAC codes not verified (owner + tax professional)
- [ ] #2 Payment gateway provider not selected (INTEGRATIONS §2)
- [ ] #3 Security review / penetration test not performed (TESTING §15 gate; AUTH_SECURITY §16)
- [ ] #4 Deployment configuration incomplete — env vars not set in platform (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, STORAGE_PROVIDER, S3_*)
- [ ] #5 Rollback plan not prepared (DEBUGGING §13)
- [ ] #6 Refund approval policy not confirmed (AUTH_SECURITY §4.3)
- [ ] #7 Document retention durations not confirmed (DATABASE §3.6, API §14)

---

## D. Pre-Deployment Checklist (in order)

From `PRODUCTION_READINESS_REPORT.md` §6.

- [ ] 1. Owner approvals: GST configuration, refund policy, document retention
- [ ] 2. Security review: penetration test by qualified consultant
- [ ] 3. Browser-based E2E tests: run in non-containerized environment where Playwright can reach localhost
- [ ] 4. Staging environment: provision PostgreSQL, run `prisma migrate deploy`, seed, run integration + E2E tests
- [ ] 5. Platform env vars: set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, STORAGE_PROVIDER, S3_*
- [ ] 6. Rollback plan: document and test
- [ ] 7. UAT sign-off: owner walkthrough of all MVP features

> **Do not deploy to production yet.** Deploy to staging first, verify, then production. Never deploy to production directly from this branch.

---

## E. Technical Readiness (all passing — verify before any release)

From `PRODUCTION_READINESS_REPORT.md` §3.

- [x] TypeScript typecheck (`npx tsc --noEmit`) — 0 errors
- [x] Production build (`npx next build`) — PASSED (no ignored errors; `ignoreBuildErrors: true` removed)
- [x] ESLint (`npx eslint .`) — 0 errors, 5 warnings
- [x] Unit + integration tests (`npx vitest run`) — 88/88 passed
- [x] Genuine PostgreSQL integration — 11 integration tests passed
- [x] Accessibility audit (WCAG 2.1 AA) — PASSED
- [x] Security review — PASSED
- [x] Backup & restore (pg_dump / pg_restore) — Verified
- [~] Playwright E2E — Installed + suite written; blocked by container network isolation (run elsewhere)

---

## F. Environment Limitations (documented, not code defects)

From `PRODUCTION_READINESS_REPORT.md` §5.

- [ ] Browser-based Playwright E2E cannot run in this container (browser in separate network namespace cannot reach `localhost:3000`) — run in normal environment.
- [ ] axe-core programmatic API not available in Node; DOM-based equivalent audit used instead.

---

## G. Team Assignments (to be assigned)

From `tracker.md` "Team Assignments".

- [ ] Lead Architect / Team Lead — To be assigned
- [ ] UI/UX Designer — To be assigned
- [ ] Frontend Engineer — To be assigned
- [ ] Backend Engineer — To be assigned
- [ ] Database Engineer — To be assigned
- [ ] Security Engineer — To be assigned
- [ ] QA Engineer — To be assigned

---

## Recommended Next Step (per DOCUMENTATION_STATUS.md §6)

1. Owner reviews the 6 unresolved decisions (D1–D7) and provides input on GSTIN, payment gateway, finance/insurance partners, WhatsApp API.
2. On approval, proceed to Phase 6 — complete payment/refund/invoice implementation using DATABASE.md v1.1 schemas and API.md v1.1 contracts.
3. Before Phase 6, obtain professional GST/tax review to validate CGST/SGST/IGST split logic and basis-point rate conversion.
4. Continue frontend development through Phases 5–8, coordinating API contracts with the Backend Engineer.
5. Run the full verification loop (TypeScript, lint, tests, security review) before marking any phase complete.

> **Do not begin live payment processing until owner approves GST configuration and refund policy.**

---

**Sources:** `tracker.md`, `PRODUCTION_READINESS_REPORT.md`, `DECISIONS.md`, `DOCUMENTATION_STATUS.md`, `docs/` (15 v1.1 documents).