import { describe, it, expect } from 'vitest';
import { toPaise, toRupees, formatInr, splitGst, isValidGstRate } from '../../../src/lib/currency';

describe('Currency and GST Calculation Engine', () => {
  it('converts rupees to paise accurately without floating-point error', () => {
    expect(toPaise(149900)).toBe(14990000n);
    expect(toPaise('1,49,900')).toBe(14990000n);
    expect(toPaise(0.5)).toBe(50n);
  });

  it('converts paise to rupees correctly', () => {
    expect(toRupees(14990000n)).toBe(149900);
  });

  it('splits Maharashtra intra-state GST equally into CGST and SGST', () => {
    const taxablePaise = 10000000n; // ₹1,00,000
    const result = splitGst(taxablePaise, 1800, false);

    expect(result.gstAmountPaise).toBe(1800000n); // ₹18,000
    expect(result.cgstPaise).toBe(900000n);       // ₹9,000 (9%)
    expect(result.sgstPaise).toBe(900000n);       // ₹9,000 (9%)
    expect(result.igstPaise).toBe(0n);
    expect(result.totalWithGstPaise).toBe(11800000n);
  });

  it('allocates 100% of GST to IGST for inter-state deliveries', () => {
    const taxablePaise = 10000000n;
    const result = splitGst(taxablePaise, 1800, true);

    expect(result.gstAmountPaise).toBe(1800000n);
    expect(result.cgstPaise).toBe(0n);
    expect(result.sgstPaise).toBe(0n);
    expect(result.igstPaise).toBe(1800000n);
  });

  it('validates GST rate basis points', () => {
    expect(isValidGstRate(1800)).toBe(true);
    expect(isValidGstRate(2800)).toBe(true);
    expect(isValidGstRate(-5)).toBe(false);
    expect(isValidGstRate(12000)).toBe(false);
  });
});
