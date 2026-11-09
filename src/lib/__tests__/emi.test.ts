import { describe, expect, it } from 'vitest';
import { computeEmi } from '../emi';

describe('computeEmi', () => {
  const onRoad = 200_000_00n; // ₹2,00,000 in paise

  it('computes a standard 36-month EMI at 8.99% APR', () => {
    const down = (onRoad * 20n) / 100n; // 20% down
    const result = computeEmi(onRoad, down, 8.99, 36);
    // Principal ₹1,60,000 → EMI ≈ ₹5,079 (±₹2 rounding tolerance)
    const emiRupees = Number(result.emiPaise) / 100;
    expect(emiRupees).toBeGreaterThan(5000);
    expect(emiRupees).toBeLessThan(5200);
    expect(result.principalPaise).toBe(onRoad - down);
    expect(result.totalPaymentPaise).toBe(result.emiPaise * 36n);
    expect(result.totalInterestPaise).toBe(result.totalPaymentPaise - result.principalPaise);
  });

  it('handles 0% interest without dividing by zero', () => {
    const result = computeEmi(onRoad, 0n, 0, 24);
    expect(result.emiPaise).toBe(onRoad / 24n);
    expect(result.totalInterestPaise).toBe(0n);
  });

  it('returns zeros when fully paid (down payment covers price)', () => {
    const result = computeEmi(onRoad, onRoad, 10, 36);
    expect(result.emiPaise).toBe(0n);
    expect(result.principalPaise).toBe(0n);
  });

  it('rejects invalid tenure', () => {
    expect(() => computeEmi(onRoad, 0n, 10, 0)).toThrow();
  });

  it('rejects negative rate', () => {
    expect(() => computeEmi(onRoad, 0n, -1, 12)).toThrow();
  });
});
