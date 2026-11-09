/**
 * Verified dealership knowledge for the WhatsApp assistant.
 * Returns ONLY approved/configured facts; missing facts trigger "confirm with staff".
 */

export interface VerifiedKnowledge {
  dealershipName: string;
  location: string;
  address?: string;
  hours?: string;
  phone?: string;
  brandsNote: string;
  rtoNote: string;
  canConfirm: string[];
  cannotGuess: string[];
}

function env(name: string): string | undefined {
  const v = (process.env[name] ?? '').trim();
  return v || undefined;
}

export function getVerifiedKnowledge(): VerifiedKnowledge {
  return {
    dealershipName: env('DEALERSHIP_NAME') || 'The Bike Yard',
    location: env('DEALERSHIP_LOCATION') || 'Thane (MH-04), Maharashtra',
    address: env('DEALERSHIP_ADDRESS'),
    hours: env('DEALERSHIP_HOURS'),
    phone: env('DEALERSHIP_PHONE'),
    brandsNote:
      env('DEALERSHIP_BRANDS_NOTE') ||
      'Authorised focus includes Honda, Suzuki, TVS and other leading brands (confirm exact model availability with staff).',
    rtoNote: 'On-road pricing references Thane (MH-04) where applicable; final quote must be confirmed by staff.',
    canConfirm: ['showroom location/contact/hours (if configured)', 'general enquiry/test-ride/callback requests'],
    cannotGuess: ['live stock', 'exact on-road/offer price', 'delivery dates', 'finance approval', 'unverified specs'],
  };
}

export function knowledgePromptBlock(): string {
  const k = getVerifiedKnowledge();
  const lines = [
    `VERIFIED DEALERSHIP FACTS (use only these; otherwise confirm with staff):`,
    `- Name: ${k.dealershipName}`,
    `- Location: ${k.location}`,
    `- Address: ${k.address ?? 'Not configured — ask staff to confirm.'}`,
    `- Hours: ${k.hours ?? 'Not configured — ask staff to confirm.'}`,
    `- Phone: ${k.phone ?? 'Not configured — ask staff to confirm.'}`,
    `- Brands: ${k.brandsNote}`,
    `- RTO: ${k.rtoNote}`,
    `- NEVER guess: ${k.cannotGuess.join(', ')}.`,
  ];
  return lines.join('\n');
}
