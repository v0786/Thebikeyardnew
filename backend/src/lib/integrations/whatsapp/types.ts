export interface MetaWebhookVerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

export interface MetaTextMessage {
  body?: string;
}

export interface MetaInboundMessage {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: MetaTextMessage;
}

export interface MetaStatus {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
}

export interface MetaChangeValue {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: MetaInboundMessage[];
  statuses?: MetaStatus[];
}

export interface MetaWebhookEntry {
  id?: string;
  changes?: Array<{ field?: string; value?: MetaChangeValue }>;
}

export interface MetaWebhookPayload {
  object?: string;
  entry?: MetaWebhookEntry[];
}

export interface ParsedInboundText {
  waId: string;
  profileName?: string;
  messageId: string;
  timestamp?: string;
  text: string;
}

export interface SendTextResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}
