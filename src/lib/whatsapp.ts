/** Build a wa.me deep link with a pre-filled message. Defaults to India country code. */
export function whatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
