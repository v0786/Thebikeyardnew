import { describe, expect, it } from 'vitest';
import { formatInr, toPaise, toRupees, splitGst } from '../currency';

describe('formatInr', () => {
  it('formats paise into Indian digit grouping', () => {
    expect(formatInr(149_900_00n)).toBe('₹1,49,900');
    expect(formatInr(2_50_00_000_00n)).toBe('₹2,50,00,000');
    expect(formatInr(0n)).toBe('₹0');
  });

  it('can omit the symbol', () => {
    expect(formatInr(76_684_00n, false)).toBe('76,684');
  });
});

describe('toPaise / toRupees', () => {
  it('round-trips amounts', () => {
    expect(toRupees(toPaise('149900'))).toBe(149900);
    expect(toPaise('149900.50')).toBe(14_990_050n);
  });

  it('parses strings with currency symbols and commas', () => {
    expect(toPaise('₹1,49,900.00')).toBe(14_990_000n);
  });
});

describe('splitGst', () => {
  it('splits intra-state GST into CGST + SGST', () => {
    const r = splitGst(100_000_00n, 1800, false);
    expect(r.gstAmountPaise).toBe(18_000_00n);
    expect(r.cgstPaise + r.sgstPaise).toBe(r.gstAmountPaise);
    expect(r.igstPaise).toBe(0n);
  });

  it('routes full GST to IGST for inter-state supply', () => {
    const r = splitGst(100_000_00n, 1800, true);
    expect(r.igstPaise).toBe(r.gstAmountPaise);
    expect(r.cgstPaise).toBe(0n);
  });
});
