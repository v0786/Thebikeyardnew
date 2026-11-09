# n8n WhatsApp assistant (Meta TEST number only)

This folder contains an importable n8n starter for a **standalone alternative** to the existing backend WhatsApp integration.

## Important repository decision

The main The Bike Yard backend already implements the customer assistant in:
- `backend/src/app/api/integrations/whatsapp/webhook/route.ts`
- `backend/src/lib/integrations/whatsapp/*`

That backend already handles GET verification, POST signature validation, test-mode guard, inbound text parsing, WAMID deduplication, rate limiting, opt-out, human takeover, lead capture, grounded AI and Cloud API replies. It is the recommended source of truth.

**Do not configure Meta to send the same webhook events to both the backend and this n8n workflow.** Doing so can cause duplicate replies. Use the n8n standalone workflow only if the team deliberately chooses n8n instead of the backend for the test-number message loop.

## Files

- `01-meta-get-verification.json` — GET verification challenge.
- `02-meta-post-customer-assistant.json` — POST text-message starter, dedup, state, policy, lead capture, AI and send.
- `03-postgres-schema.sql` — tables for the standalone n8n variant.
- `04-cloudflare-worker.js` — one public callback URL dispatching GET and POST to the two n8n endpoints.
- `.env.example` — required configuration names (no secrets).

## Import

In n8n choose **Workflows → Import from File** and import the two JSON workflows separately. Both are inactive after import.

The two internal webhook paths are intentionally unique:
- GET: `/webhook/whatsapp-verify`
- POST: `/webhook/whatsapp-inbound`

Meta expects one callback URL. Put the Cloudflare Worker in front and configure:
- `N8N_VERIFY_URL` = active GET workflow production URL.
- `N8N_POST_URL` = active POST workflow production URL.

Then use the Worker URL as the Meta callback URL. The Worker preserves Meta's query string on GET and forwards POST bodies.

## Required configuration

Set the variables in `.env.example` in the n8n host's supported environment/secret configuration. The POST Code node intentionally fails closed unless:
- `WHATSAPP_MODE=test`
- `WHATSAPP_PRODUCTION_APPROVED=false`
- `WHATSAPP_PHONE_NUMBER_ID` exactly equals `WHATSAPP_TEST_PHONE_NUMBER_ID`

Assign a PostgreSQL credential to every Postgres node. Assign secure HTTP Bearer credentials or use the host's secret manager for Meta and AI API keys. Never commit tokens, app secrets, recipient phone numbers or production IDs.

## Signature verification

The included Cloudflare Worker validates `X-Hub-Signature-256` using HMAC SHA-256 over the exact raw POST bytes and fails closed if `WHATSAPP_APP_SECRET` is missing or the signature does not match. Set `WHATSAPP_APP_SECRET` as a Cloudflare Worker secret (not a Git file). Do not treat the verify token as a substitute for request-signature validation. The existing backend route also performs this check.

## Known MVP limitations

- The POST workflow handles text messages only; media and status events are ignored.
- The workflow is a starter and must be tested against the installed n8n version before activation.
- Human handover is persisted in the database; a staff notification connector still needs to be configured.
- Add per-sender rate limiting, retries, retention/deletion, monitoring and staff release controls before any wider deployment.
- Configure Meta's `messages` webhook subscription and use only the Meta-provided test phone number and approved test recipient.

## Meta test-number setup

1. Create/open the Meta Developer app and add the WhatsApp product.
2. In WhatsApp → API Setup, use only Meta's test phone number.
3. Add your own WhatsApp account as an allowed test recipient.
4. Record the test Phone Number ID and temporary access token in the secret manager.
5. Configure the Worker callback URL and verify token.
6. Subscribe to the `messages` webhook field.
7. Send test messages and verify the n8n executions and database state.

Do not migrate, disconnect, register, or modify The Bike Yard's real showroom WhatsApp Business number. Production mode remains out of scope.


## Test checklist

- [ ] GET with `hub.mode=subscribe`, correct verify token and challenge returns the exact challenge as plain text (200).
- [ ] GET with wrong token returns 403.
- [ ] POST with missing/invalid `X-Hub-Signature-256` is rejected by the Worker (403).
- [ ] POST from the configured Meta test phone-number ID and text body reaches n8n.
- [ ] Duplicate `wamid` is rejected by the PostgreSQL primary key and does not reach the AI/send branch.
- [ ] Image/audio/video/location messages produce no AI reply.
- [ ] `STOP`, `unsubscribe`, `band karo` or supported Hindi equivalents update the conversation to OPTED_OUT and send one confirmation.
- [ ] `talk to human` stores the message for staff and switches to HUMAN_TAKEOVER.
- [ ] Messages during HUMAN_TAKEOVER do not reach the AI branch.
- [ ] Missing price/stock facts result in staff confirmation language, never invented values.
- [ ] AI timeout/provider failure produces the safe fallback.
- [ ] Wrong test Phone Number ID fails closed.
- [ ] The existing backend webhook and the n8n webhook are never subscribed simultaneously for the same Meta app/test number.

## n8n environment access

Some self-hosted n8n installations restrict `$env` access from Code nodes. If using self-hosted n8n, either configure environment access according to your n8n security policy or replace Code-node `$env` reads with n8n Variables/Credentials. Do not weaken host security casually. n8n Cloud may require adapting these references to supported Variables and Credentials.
