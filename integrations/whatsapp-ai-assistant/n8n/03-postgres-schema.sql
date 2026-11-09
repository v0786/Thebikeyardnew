CREATE TABLE IF NOT EXISTS processed_messages (
  message_id TEXT PRIMARY KEY,
  wa_id TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wa_conversations (
  wa_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (mode IN ('ACTIVE','HUMAN_TAKEOVER','OPTED_OUT')),
  opted_out_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wa_messages (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT,
  wa_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('IN','OUT')),
  message_type TEXT NOT NULL,
  intent TEXT,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  body_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wa_leads (
  id BIGSERIAL PRIMARY KEY,
  wa_id TEXT NOT NULL,
  intent TEXT NOT NULL,
  customer_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRM_WITH_STAFF',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wa_leads_wa_id_created_idx ON wa_leads(wa_id,created_at DESC);
