import { describe, expect, it } from 'vitest';
import { whatsAppLink, telLink } from '../whatsapp';

describe('whatsAppLink', () => {
  it('adds India country code for 10-digit numbers', () => {
    expect(whatsAppLink('+91 98204 55120', 'Hello')).toBe('https://wa.me/919820455120?text=Hello');
  });

  it('encodes the message', () => {
    expect(whatsAppLink('9820455120', 'Price of Duke 390?')).toBe(
      'https://wa.me/919820455120?text=Price%20of%20Duke%20390%3F'
    );
  });

  it('keeps existing country code', () => {
    expect(whatsAppLink('919820455120', 'Hi')).toBe('https://wa.me/919820455120?text=Hi');
  });
});

describe('telLink', () => {
  it('strips spaces', () => {
    expect(telLink('+91 98204 55120')).toBe('tel:+919820455120');
  });
});
