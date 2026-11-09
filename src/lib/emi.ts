/**
 * EMI (Equated Monthly Instalment) calculator.
 * Uses integer paise for principal; rate math uses float64 which is sufficient
 * for display purposes (final EMI is rounded to whole paise).
 */

export const SHOWROOM_EMI_DEFAULTS = { downPaymentPercent: 20, annualRatePercent: 8.99, months: 36 };

export interface EmiResult {
  /** Monthly instalment in paise */
  emiPaise: bigint;
  /** Total amount paid over the tenure in paise */
  totalPaymentPaise: bigint;
  /** Total interest paid over the tenure in paise */
  totalInterestPaise: bigint;
  /** Loan (financed) amount in paise */
  principalPaise: bigint;
}

export function computeEmi(
  onRoadPaise: bigint,
  downPaymentPaise: bigint,
  annualRatePercent: number,
  months: number
): EmiResult {
  if (months <= 0) throw new Error('Tenure must be at least 1 month');
  if (annualRatePercent < 0) throw new Error('Interest rate cannot be negative');

  const principalPaise = onRoadPaise - downPaymentPaise;
  if (principalPaise <= 0n) {
    return { emiPaise: 0n, totalPaymentPaise: 0n, totalInterestPaise: 0n, principalPaise: 0n };
  }

  const principal = Number(principalPaise) / 100;
  const r = annualRatePercent / 12 / 100;

  if (r === 0) {
    // Zero-interest: split principal evenly; quoted EMI floors to whole paise.
    return {
      emiPaise: principalPaise / BigInt(months),
      totalPaymentPaise: principalPaise,
      totalInterestPaise: 0n,
      principalPaise,
    };
  }

  const factor = Math.pow(1 + r, months);
  const emiRupees = (principal * r * factor) / (factor - 1);
  const emiPaise = BigInt(Math.round(emiRupees * 100));
  const totalPaymentPaise = emiPaise * BigInt(months);
  const totalInterestPaise = totalPaymentPaise - principalPaise;

  return { emiPaise, totalPaymentPaise, totalInterestPaise, principalPaise };
}
