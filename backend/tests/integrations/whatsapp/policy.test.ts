import { describe, expect, it } from 'vitest';
import { boundReply, detectLanguageHint, fallbackReply, isOptOut, wantsHuman } from '@/lib/integrations/whatsapp/policy';

describe('WhatsApp assistant policy', () => {
  it('detects opt-out requests', () => {
    expect(isOptOut('STOP')).toBe(true);
    expect(isOptOut('please unsubscribe')).toBe(true);
    expect(isOptOut('Hunter 350 price')).toBe(false);
  });

  it('detects human escalation requests', () => {
    expect(wantsHuman('I want to talk to a human')).toBe(true);
    expect(wantsHuman('call me back')).toBe(true);
    expect(wantsHuman('EMI options?')).toBe(false);
  });

  it('detects language hints', () => {
    expect(detectLanguageHint('Price kya hai?')).toBe('hinglish');
    expect(detectLanguageHint('मुझे कीमत बताओ')).toBe('hi');
    expect(detectLanguageHint('What is the price?')).toBe('en');
  });

  it('bounds overly long replies', () => {
    expect(boundReply('x'.repeat(2000), 50).length).toBeLessThanOrEqual(50);
  });

  it('fallback reply is honest and non-inventive', () => {
    const r = fallbackReply().toLowerCase();
    expect(r).toContain('confirm');
    expect(r).toContain('virtual assistant');
  });
});
