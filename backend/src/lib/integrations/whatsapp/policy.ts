/**
 * Safety/policy rules for the customer-facing WhatsApp virtual assistant.
 * The assistant must never invent dealership facts and must escalate when unsure.
 */

export const ASSISTANT_IDENTITY =
  "Namaste! Main The Bike Yard ka virtual assistant hoon (automated). I can help with showroom info, bike enquiries, test-ride requests, and callbacks.";

export function isOptOut(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /\b(stop|unsubscribe|cancel|opt\s*out|band\s*karo|mat\s*bhejo)\b/i.test(t);
}

export function wantsHuman(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /\b(human|agent|person|executive|salesman|staff|call\s*me|talk\s*to|manager|complaint|problem)\b|कर्मचारी|मैनेजर|इंसान|बात\s*करनी/i.test(
    t,
  );
}

export function detectLanguageHint(text: string): 'hi' | 'hinglish' | 'en' {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/\b(kya|kaise|kitna|bhai|haan|nahi|chahiye|batao|mujhe|aap|hai|hain|karna|wala)\b/i.test(text)) return 'hinglish';
  return 'en';
}

export function boundReply(text: string, max = 900): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function optOutReply(): string {
  return 'Theek hai — aapko messages band kar diye jayenge. Agar phir help chahiye, kabhi bhi “Hi” bhej sakte hain. (The Bike Yard virtual assistant)';
}

export function handoverReply(): string {
  return 'Main aapko showroom staff se connect karwa deta/diti hoon. Kripya apna naam aur preferred callback time share karein — team aapse confirm karegi. (The Bike Yard virtual assistant)';
}

export function fallbackReply(): string {
  return 'Abhi main exact jawab confirm nahi kar pa raha/rahi. Aap bike model/variant ya apna sawaal thoda clear batayein, ya “call back” likhein — showroom team confirm karegi. (The Bike Yard virtual assistant)';
}

export function policySystemPrompt(): string {
  return [
    'You are The Bike Yard\'s virtual assistant (automated). You help customers only.',
    'Languages: reply in the customer\'s language (Hinglish, Hindi, or English). Keep replies short, warm, useful; ask one relevant question at a time when needed.',
    'Identity: never claim to be a human sales executive. Identify as automated/virtual assistant when appropriate.',
    'Truthfulness: NEVER invent stock, prices, discounts, specifications, delivery dates, finance approval, or availability. Use only VERIFIED facts provided in context.',
    'Missing data: if any requested fact is missing/uncertain/stale, clearly say you will confirm with showroom staff and offer a callback.',
    'EMI: if discussed, label as an estimate and disclose assumptions (interest rate, tenure, down payment) used.',
    'Bookings/test rides: treat as requests, never confirmed until staff/system confirms.',
    'Escalate to staff for: negotiation, complaints, uncertain info, finance eligibility, payment issues, or explicit human request.',
    'Respect opt-out requests (STOP/unsubscribe). Follow WhatsApp/Meta messaging policies; do not send disallowed content.',
  ].join('\n');
}
