# DEBUGGING.md — The Bike Yard

**Product:** The Bike Yard — Complete Dealership Management & Digital Showroom Platform  
**Status:** Draft — Follows PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md, API.md, AGENTS.md, PLAN.md, SETUP.md, FEATURES.md, AUTH_SECURITY.md, MCP.md, INTEGRATIONS.md, TESTING.md  
**Version:** 1.0  
**Source of Truth:** Yes — Debugging and incident resolution playbook

---

## 1. Bug Triage

| Severity | Impact | Examples |
|----------|--------|----------|
| **Critical** | Data loss, security breach, app unavailable, wrong financial totals | Duplicate chassis sold; payment recorded twice; invoice GST wrong; auth bypass |
| **High** | Core workflow broken, permission bypass | Cannot create sale; stock not decrementing; unauthorized document access |
| **Medium** | Non-core feature broken, poor UX | Blog editor fails; chart missing data; slow page load |
| **Low** | Cosmetic, typo, non-blocking | Misaligned button; wrong date format in footer |

**Reproducibility:** Always, Often, Sometimes, Rarely, Unable.
**Affected users:** One, Some, Many, All.

---

## 2. Bug Report Template

```
## Title
[Short, specific description]

## Severity
Critical / High / Medium / Low

## Environment
- Local / Staging / Production
- Browser: [Chrome/Firefox/Safari + version]
- Device: [Desktop/Mobile/Tablet]

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behaviour
[What should happen]

## Actual Behaviour
[What actually happens]

## Evidence
- Screenshots / video
- Console errors (redacted)
- Network logs (redacted)
- Server logs (redacted)

## Reproducibility
Always / Often / Sometimes / Rarely

## Affected Users
One / Some / Many / All

## Recent Changes
[Any recent deploys, config changes, data changes]

## Suspected Cause
[Optional — your hypothesis]
```

---

## 3. Reproduction & Evidence Collection

1. **Reproduce with synthetic or redacted data** — never paste real customer data.
2. **Capture browser console** — filter errors, not full logs.
3. **Capture network requests** — redact Authorization headers, cookies, tokens.
4. **Capture server logs** — redact user IDs, emails, financial data where not needed.
5. **Capture database queries** — Prisma query logs (redact PII).
6. **Record screen** — short video of the issue if UI-related.

---

## 4. Log, Trace & Monitoring Review

| Source | What to Check |
|--------|---------------|
| **Browser console** | JS errors, failed network requests |
| **Next.js server logs** | Server Actions errors, API route errors |
| **Prisma logs** | Slow queries, constraint violations, transaction failures |
| **Auth.js logs** | Failed sign-ins, session errors |
| **Provider logs** | Payment webhook failures, messaging errors |
| **Database logs** | Deadlocks, connection issues, migration errors |
| **Audit log** | Recent privileged/financial actions |

**Tracing:** Enable request ID correlation; follow the request through logs.

---

## 5. Frontend Debugging Workflow

1. **Check browser console** — JS exceptions, failed imports, hydration errors.
2. **Check network tab** — API calls, failed requests, status codes.
3. **Check React DevTools** — component state, props, re-renders.
4. **Verify environment variables** — Next.js `NEXT_PUBLIC_` variables only for client.
5. **Check layout/design** — Tailwind class conflicts, z-index, responsive breakpoints.
6. **Reproduce in incognito** — rule out cache/session issues.
7. **Check server-side rendering** — hydration mismatch, missing data on first render.

---

## 6. API/Backend Debugging Workflow

1. **Check request** — method, URL, headers, body.
2. **Check response** — status code, error format, data.
3. **Check server logs** — errors at route handler or service layer.
4. **Check authorization** — session, role, permission.
5. **Check validation** — Zod schema errors, missing fields.
6. **Check database** — query logs, constraint violations.
7. **Check transactions** — rollback reasons, locking conflicts.

**Tools:** `curl`, browser network tab, Supertest, Prisma Studio.

---

## 7. Database Query, Migration & Transaction Debugging

| Issue | Check |
|-------|-------|
| **Slow query** | Add index; check `EXPLAIN ANALYZE` |
| **Constraint violation** | Duplicate chassis/engine; check unique index |
| **Transaction deadlock** | Lock order; reduce transaction scope |
| **Migration failure** | Schema drift; `prisma migrate status`; resolve conflicts |
| **Missing table/column** | Run migrations; check Prisma schema sync |
| **Data inconsistency** | Run reconciliation queries; check transaction boundaries |

**Safety:** Always take/verify backup before running manual migrations or data repairs.

---

## 8. Authentication/Permission Debugging

1. **Check session** — is the session valid? `next-auth` debug logs.
2. **Check role** — does the user have the required role?
3. **Check permission matrix** — verify against API.md §13.
4. **Check middleware** — route protection logic.
5. **Check service layer** — server-side authorization checks.
6. **Check UI** — are hidden elements actually hidden? (server must still enforce)
7. **Test direct API** — bypass UI with `curl` to verify server-side enforcement.

---

## 9. Payment/Webhook Debugging

1. **Check payment record** — status, amount, method, reference.
2. **Check webhook logs** — signature verification, payload, event ID.
3. **Check idempotency** — was the event already processed?
4. **Check reconciliation** — provider settlement vs internal records.
5. **Check receipt generation** — was a receipt created?
6. **Never edit production payment data manually** — use approved procedure with audit trail.

---

## 10. File Upload & Document Access Debugging

1. **Check file type** — MIME type, extension.
2. **Check file size** — max 10MB.
3. **Check storage provider** — bucket exists, credentials valid.
4. **Check signed URL** — expiry, role permission.
5. **Check access control** — is the user authorized for this document?
6. **Check public access** — document should not be accessible via public URL.

---

## 11. AI/Chatbot Retrieval & Hallucination Investigation

1. **Check input** — what did the user ask?
2. **Check retrieval** — did the bot fetch correct dealership data?
3. **Check response** — does it match the data?
4. **Check for hallucination** — invented price, stock, offer, approval?
5. **Check provider logs** — prompt, context, completion (redacted).
6. **Check knowledge source** — is the data current and approved?
7. **Fix:** tighten retrieval, add guardrails, update knowledge source; never let bot invent data.

---

## 12. Performance & Memory Investigation

| Issue | Check |
|-------|-------|
| **Slow page load** | Bundle size, image sizes, SSR vs client rendering |
| **Slow API** | Query performance, N+1 queries, indexing |
| **Memory leak** | Long-running processes, event listeners, subscriptions |
| **High CPU** | Infinite loops, heavy computation, unoptimized queries |
| **Build time** | Large dependencies, unoptimized imports |

**Tools:** Lighthouse, Next.js bundle analyzer, Prisma query logs, process memory profiling.

---

## 13. Safe Rollback, Feature Flag & Hotfix Workflow

### Rollback
1. Identify last known good commit.
2. Revert or `git revert` the offending commit.
3. Deploy rollback.
4. Verify.

### Feature Flag
- Use feature flags for risky features (payment integration, chatbot).
- Flag off = old behavior, no deployment needed.

### Hotfix
1. Branch from production tag.
2. Minimal fix only.
3. Add regression test.
4. Run full checks.
5. Deploy hotfix.
6. Merge back to main.

---

## 14. Post-Incident Review & Prevention

After every critical/high incident:

1. **Timeline** — what happened, when, who was involved.
2. **Root cause** — not just the symptom.
3. **Impact** — users, data, revenue affected.
4. **Fix** — what was changed.
5. **Regression test** — added to prevent recurrence.
6. **Prevention** — process/tooling changes.
7. **Documentation** — update DEBUGGING.md, TESTING.md, or affected source documents.

---

## 15. Mandatory Safety Rules

- **Reproduce with synthetic or redacted data** — never paste secrets, access tokens, passwords, or unredacted identity documents into logs or AI prompts.
- **Do not edit production data manually** without an approved, recorded procedure.
- **Do not disable authentication, validation, permission checks, or audit logs** to hide an error.
- **Before migrations or data repairs**, take/verify backups and prepare a rollback or recovery plan.
- **Never claim a bug is fixed** until the relevant regression test passes.
- **Keep fixes minimal** — avoid unrelated refactoring during incident response.

---

## 16. Debugging Loop

1. State the observed behaviour and expected behaviour.
2. Identify scope, severity, and recent changes.
3. Reproduce the issue.
4. Form and test one hypothesis at a time.
5. Find the root cause, not just the visible symptom.
6. Implement the smallest safe fix.
7. Add a regression test.
8. Run relevant tests, typecheck, lint, and build.
9. Review the diff and security impact.
10. Document the resolution and prevention action.

---

## 17. Common Failure Categories

| Category | Common Causes |
|----------|--------------|
| **Auth** | Expired session, wrong role, middleware misconfiguration, cookie issues |
| **Stock** | Duplicate chassis, race condition, missing transaction, status sync |
| **Payment** | Webhook signature mismatch, duplicate event, amount mismatch, receipt failure |
| **Invoice** | GST config wrong, immutable snapshot missing, numbering collision |
| **Upload** | File type/size, storage credentials, access control |
| **Chatbot** | Retrieval failure, hallucination, stale knowledge source |
| **Performance** | N+1 queries, missing index, large bundle, unoptimized images |
| **Migration** | Schema drift, conflicting migrations, missing backup |

---

## 18. Incident Severity & Escalation

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| Critical | Immediate | Owner + Lead Architect |
| High | Same day | Lead Architect |
| Medium | Next sprint | Assigned developer |
| Low | Backlog | Assigned developer |

---

**Verification:** DEBUGGING.md is complete and consistent with all previous documents. Debugging fixes must preserve all product, design, architecture, data, API, and security contracts. Contract changes require explicit proposal and document updates after approval.

**Pipeline complete:** All 15 documents generated in order: PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md, API.md, AGENTS.md, README.md, PLAN.md, SETUP.md, FEATURES.md, AUTH_SECURITY.md, MCP.md, INTEGRATIONS.md, TESTING.md, DEBUGGING.md.