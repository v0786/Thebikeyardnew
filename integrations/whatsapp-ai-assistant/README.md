# The Bike Yard — AI WhatsApp Sales Assistant

> Project planning and Meta test-number setup guide. This document is the initial source of truth for building and validating the WhatsApp assistant before connecting the showroom's real WhatsApp Business number.

## 1. Project goal

Build an AI-powered WhatsApp assistant for The Bike Yard that can respond to customer enquiries in natural Hinglish, Hindi, and English; answer questions using verified dealership information; capture sales leads; and hand conversations to showroom staff when needed.

The first milestone uses Meta's **test phone number** only. The existing showroom WhatsApp Business App number must not be migrated, disconnected, or modified during this phase.

## 2. Initial success criteria

The first working milestone is complete when:

1. A developer-controlled WhatsApp account can message Meta's test number.
2. Meta delivers the inbound message to our verified webhook.
3. The backend validates and parses the webhook event.
4. The assistant generates a safe, relevant reply.
5. The backend sends the reply through the WhatsApp Cloud API.
6. Duplicate webhook deliveries do not cause duplicate replies.
7. Errors are logged without exposing access tokens or customer secrets.

Start with a simple greeting and general FAQ response. Add live catalogue, pricing, stock, EMI, and lead workflows only after the message loop is reliable.

## 2a. Implementation status (repo — honest)

**Safety:** Meta **test number only**. The existing showroom WhatsApp Business App number must **not** be migrated, disconnected, or modified. Production behavior is blocked unless `WHATSAPP_MODE=production` **and** `WHATSAPP_PRODUCTION_APPROVED=true` (owner approval + Meta eligibility required).

**Implemented in repo (software foundations, test-mode guarded):**
- Additive Prisma models/enums: `WhatsappConversation`, `WhatsappMessage`, `WhatsappWebhookEvent`, `WhatsappLeadLink`, `WhatsappAuditLog` (+ status/mode/direction enums) in `backend/prisma/schema.prisma` (validated with dummy `DATABASE_URL`; **DB migration/deploy still required**).
- Env placeholders in `backend/.env.example` (`WHATSAPP_*`, `AI_*`, `CORS_ORIGINS`). **No secrets committed.**
- Isolated module: `backend/src/lib/integrations/whatsapp/*` — config/guards, webhook challenge verification, `X-Hub-Signature-256` validation (when `WHATSAPP_APP_SECRET` set), Meta Cloud API text send (timeout, safe errors), payload parsing (text-only), dedup (DB unique claim + bounded in-memory fallback), sender rate limit, policy (opt-out/human/handoff/language hints/no-invention rules), verified env knowledge block, AI adapter (`gemini`/`none` fallback), conversation processing (inbound store, opt-out, human takeover suppression, lead intent capture best-effort, reply store).
- Routes (Node runtime): `GET/POST /api/integrations/whatsapp/webhook`; protected admin `GET /api/integrations/whatsapp/status`, `GET /api/integrations/whatsapp/admin/conversations`, `GET/PATCH /api/integrations/whatsapp/admin/conversations/[id]` (takeover `AI|HUMAN` + audit log).
- Tests (Vitest): `backend/tests/integrations/whatsapp/*.test.ts` + `backend/vitest.config.ts` — security, parsing, policy, config safety, dedup fallback, webhook route (verify, bad signature, duplicate processing, unsupported events). **Backend:** `npx vitest run` **29 passed (7 files)**; `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` **clean** (as of this implementation pass).

**Operational TODOs (cannot be completed from this environment):**
- M1: create Meta developer app/WhatsApp product, add test recipient, obtain/rotate tokens, record IDs (dashboard).
- M2 live: deploy backend with public HTTPS webhook URL, set `WHATSAPP_VERIFY_TOKEN`/secrets, configure Meta callback + subscriptions, verify challenge end-to-end.
- M3 live: set `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` (test number), confirm replies on real Meta test loop.
- M4 config: set `AI_PROVIDER`/`AI_MODEL`/keys (e.g., Gemini) as approved.
- M5: connect **authoritative** catalogue/pricing/inventory sources (never guess); add validated tool/data layer.
- M6 ops: deploy Postgres, run Prisma migration/generate in target env, add staff inbox UI + notifications, define consent/retention.
- M7/M8: monitoring/alerts/backups/access controls/privacy notices; **owner approval + Meta eligibility** before any production number work.

## 2b. Optional n8n starter

An optional n8n standalone starter is available in [`n8n/`](./n8n/README.md), including importable GET/POST workflows, PostgreSQL schema, environment example, and a Cloudflare Worker dispatcher with Meta HMAC signature validation.

**Important:** the existing backend integration described above remains the recommended source of truth. Do not point the same Meta app/test number at both the backend webhook and the n8n webhook at the same time, or duplicate replies may occur. The n8n package is inactive by default and requires credentials, environment configuration, and test validation before use.

## 3. Proposed architecture

```text
Customer WhatsApp
       |
       v
Meta WhatsApp Cloud API (test number)
       |
       v
Webhook endpoint (HTTPS)
       |
       v
Backend: verify, parse, deduplicate
       |
       v
Conversation / AI service
       |
       +----> Dealership knowledge and approved data
       |
       v
Reply policy and safety checks
       |
       v
WhatsApp Cloud API
       |
       v
Customer receives reply
```

### Recommended implementation direction

- Reuse the existing The Bike Yard backend where practical, rather than creating a second unrelated backend.
- Keep WhatsApp integration in a clearly isolated module so it can be maintained independently.
- Use TypeScript and the backend's existing framework and conventions.
- Use the existing PostgreSQL/Prisma direction for durable message, lead, and conversation records once database deployment is ready.
- Keep the AI provider behind an adapter so the model/provider can be changed without rewriting WhatsApp integration.
- Use a publicly reachable HTTPS webhook for Meta callbacks. During local development, use a secure tunnel such as Cloudflare Tunnel or ngrok; do not expose a development server directly.

## 4. Feature scope

### Phase 1 — WhatsApp connection and reliable message loop

- Meta developer app and WhatsApp product setup.
- Meta-provided test phone number.
- Add a permitted recipient/test number.
- Temporary access token for initial testing.
- Webhook verification and inbound message handling.
- Outbound text reply through Cloud API.
- Signature/verification checks, request validation, deduplication, and structured logs.

### Phase 2 — AI conversation engine

- Natural Hinglish, Hindi, and English responses.
- Friendly, concise showroom-sales tone.
- Conversation context with bounded history.
- Prompt and response policy owned by the application.
- Fallback response when the AI provider is unavailable.
- Never claim to be a human sales executive; the assistant should identify itself as The Bike Yard's virtual assistant when appropriate.

### Phase 3 — Dealership knowledge and tools

The assistant may answer only from approved, current dealership data:

- Brands and motorcycle catalogue.
- Model, variant, colour, and verified specifications.
- Ex-showroom and on-road price breakdown for Thane (MH-04).
- Offers with validity and terms.
- Stock availability, only when connected to a current inventory source.
- Showroom address, opening hours, and contact details.
- Indicative EMI calculations using disclosed assumptions.

If data is missing or stale, the assistant must say it will confirm with showroom staff. It must not invent prices, offers, specifications, delivery dates, or stock.

### Phase 4 — Lead capture and staff handover

- Capture customer name (if offered), interested model, intent, and preferred callback time.
- Capture test-ride requests as requests, not confirmed appointments.
- Store consent and relevant conversation metadata.
- Notify staff through an agreed channel once selected.
- Support a human takeover state so the AI does not reply while staff is handling the conversation.
- Allow staff to resume AI assistance after explicitly returning the conversation to the assistant.

### Phase 5 — Admin, analytics, and production readiness

- Conversation inbox and lead status.
- Human takeover controls.
- Audit log for staff actions and important data changes.
- Delivery/error monitoring and retry handling.
- Rate limiting, retention policy, access controls, backups, and operational alerts.
- Production number onboarding only after owner approval and Meta eligibility checks.

## 5. Meta test-number setup checklist

Complete these steps in the Meta developer dashboard:

1. Sign in at [Meta for Developers](https://developers.facebook.com/).
2. Create an app for The Bike Yard AI (choose the business-oriented app type available in the current dashboard).
3. Add the **WhatsApp** product and open its API setup page.
4. Locate the Meta-provided test phone number.
5. Add a developer-controlled WhatsApp recipient number and complete Meta's recipient verification flow.
6. Record the displayed Phone Number ID and WhatsApp Business Account ID.
7. Generate/use the temporary access token for initial testing.
8. Send a first test message from the dashboard or a small backend test script.
9. Configure a publicly reachable HTTPS webhook URL and verify the webhook challenge.
10. Subscribe the app to the WhatsApp message webhook events required for inbound messages and delivery status.

Meta's dashboard labels and onboarding steps can change. Follow the current instructions shown in the app and the official documentation:

- [WhatsApp Cloud API — Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [WhatsApp Cloud API — Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [WhatsApp Cloud API — Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages)

### Credentials and identifiers

Keep these values in a local environment file or hosting-provider secret manager only:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_VERIFY_TOKEN` (a random value created by us for webhook verification)
- `WHATSAPP_APP_SECRET` (only if needed for webhook signature validation)
- AI provider API key, when an AI provider is selected
- Database connection string, when database persistence is enabled

Never commit real values, temporary tokens, app secrets, customer phone numbers, or production credentials to Git. Add example variable names with empty or placeholder values to an `.env.example` file only. Rotate any token that is accidentally exposed.

## 6. Webhook requirements

The webhook implementation must:

- Support Meta's GET verification challenge.
- Accept POST events over HTTPS.
- Validate the request and, where configured, verify Meta's request signature using the app secret and raw request body.
- Process only supported WhatsApp message/status event types.
- Ignore unsupported event types safely.
- Deduplicate inbound messages using Meta's message ID.
- Acknowledge valid webhook requests quickly; process AI generation asynchronously if needed.
- Retry transient outbound failures safely without sending duplicate customer replies.
- Avoid logging access tokens, full message bodies, or unnecessary personal data.

## 7. Conversation and response rules

The assistant should:

- Use the customer's language where practical: Hinglish, Hindi, or English.
- Keep replies short, warm, and useful; ask one relevant question at a time.
- Identify itself as an automated/virtual assistant when appropriate.
- Never pretend a test booking, test ride, callback, or reservation is confirmed until the dealership system or staff confirms it.
- Never invent stock, price, discounts, finance approval, or delivery commitments.
- Treat EMI as an estimate and disclose the interest rate, tenure, down payment, and other assumptions used.
- Escalate negotiation, complaints, uncertain information, finance eligibility, payment issues, and requests for a human.
- Respect opt-out requests and applicable WhatsApp/Meta messaging policies.
- Send business-initiated messages only in accordance with the applicable opt-in, template, and customer-service-window rules.

## 8. Data model — initial proposal

The final schema should follow the existing backend conventions. Likely records include:

- **Conversation:** WhatsApp contact identifier, status, assigned staff member, last message timestamp, AI/human mode.
- **Message:** provider message ID, conversation ID, direction, message type, delivery status, timestamp, and minimal required content.
- **Lead:** customer contact, interested bike/model, enquiry type, preferred callback/test-ride details, status, source.
- **WebhookEvent:** provider event/message ID, processing status, received timestamp, and safe error metadata.
- **AuditLog:** staff takeover, status changes, and other important operational actions.

Do not store more customer data than is necessary. Define retention and deletion procedures before production launch.

## 9. Testing plan

### Local and Meta test-number checks

- Valid webhook verification challenge succeeds.
- Invalid verification token is rejected.
- Inbound text message is parsed correctly.
- A single inbound message produces at most one reply.
- Duplicate webhook delivery does not produce a second reply.
- Outbound API errors are handled and logged safely.
- AI timeout/provider failure returns a graceful fallback or hands off to staff.
- Hinglish, Hindi, English, unclear questions, and unsupported questions are tested.
- Prompt-injection attempts cannot override system rules or expose secrets.
- Missing price/stock data results in an honest confirmation request, not a guess.
- Human takeover prevents automated replies until the conversation is released.

### Before connecting the showroom's real number

- Owner has approved the integration.
- Meta Business ownership and required permissions are confirmed.
- Number migration/coexistence eligibility is checked in the current Meta onboarding flow.
- Impact on the existing WhatsApp Business App is understood and approved.
- Production token, webhook, database, monitoring, backups, and privacy notices are ready.
- Staff have tested the human handover process.

**Do not disconnect, delete, migrate, or change the existing showroom WhatsApp Business number as part of the test-number milestone.**

## 10. Delivery milestones

| Milestone | Deliverable | Status |
|---|---|---|
| M0 | Project plan and setup guide | Documented |
| M1 | Meta test app, test recipient, first API message | **Operational — pending** (requires Meta developer app, test recipient, tokens; not available in this environment) |
| M2 | Verified webhook receives inbound messages | **Code implemented (repo)** — `GET/POST /api/integrations/whatsapp/webhook` with verify challenge, signature validation, parsing, dedup, safe ack; **live verification pending** public HTTPS webhook URL + Meta subscription + creds |
| M3 | Automated basic reply loop | **Code implemented (repo, guarded)** — inbound text → policy/AI → Cloud API send, test-mode guards; **live loop pending** configured Meta test credentials + deployed DB/webhook |
| M4 | AI Hinglish conversation engine | **Code implemented (repo)** — adapter-based provider (`gemini`/`none` fallback), Hinglish/Hindi/English hinting, bounded history, grounded system prompt; **provider config pending** |
| M5 | Approved catalogue/price/FAQ tools | **Partial scaffolding** — verified env-configured knowledge block + strict “confirm with staff / never guess” policy; **pending** authoritative live catalogue/pricing/inventory tool integration and DB-backed source of truth |
| M6 | Lead capture and human handover | **Code implemented (repo)** — intent capture, WhatsApp lead/conversation records, opt-out, human takeover state, protected admin conversation list/detail/takeover APIs; **pending** deployed Postgres migration, staff UI wiring, notifications, release flow UX |
| M7 | Admin operations, monitoring, production checks | **Partial (repo)** — status endpoint, safe logging, rate limiting, audit hooks in takeover flow; **pending** ops monitoring/alerts, retention/deletion, backups, access controls, hosted deployment runbook |
| M8 | Owner-approved production number onboarding | **Not started / blocked by design** — requires owner approval + Meta eligibility checks; `WHATSAPP_PRODUCTION_APPROVED` guard prevents unsafe production assumptions. **Do not migrate/change the real showroom number.** |

## 11. Open decisions

Resolve these during implementation, not by guessing:

- Which AI provider/model will be used?
- Where will the backend be hosted?
- Which database environment will store conversations and leads?
- How should staff receive new lead and handover notifications?
- Which staff roles can view conversations and take over?
- What customer data retention period will the dealership approve?
- Which exact catalogue, pricing, and inventory source is authoritative?

## 12. Immediate next action

Create the Meta developer app, add the WhatsApp product, and open **WhatsApp → API Setup**. Then share a screenshot with secrets and phone numbers masked. We will verify the test recipient and send the first message before writing the webhook integration.

---

**Project:** The Bike Yard AI WhatsApp Sales Assistant  
**Repository:** `v0786/The-bike-yard`  
**Documentation location:** `integrations/whatsapp-ai-assistant/README.md`  
**Scope of this document:** Plan + test-number setup + **repo implementation status** (software foundations present; live Meta/DB/deployment/approvals remain operational). Backend `POST /api/sales` remains intentionally disabled (503) by design.
