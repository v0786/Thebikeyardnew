/**
 * Pure integer paise currency library for The Bike Yard.
 * All monetary amounts are stored strictly as BigInt paise (1 INR = 100 paise).
 * Floating-point arithmetic is prohibited for currency.
 */

export function toPaise(rupees: number | string): bigint {
  if (typeof rupees === 'string') {
    const cleaned = rupees.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0n;
    return BigInt(Math.round(num * 100));
  }
  return BigInt(Math.round(rupees * 100));
}

export function toRupees(paise: bigint | number): number {
  if (typeof paise === 'bigint') {
    return Number(paise) / 100;
  }
  return paise / 100;
}

export function formatInr(paise: bigint | number, includeSymbol = true): string {
  const rupees = typeof paise === 'bigint' ? Number(paise / 100n) : Math.floor(paise / 100);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rupees);

  return includeSymbol ? `₹${formatted}` : formatted;
}

export interface GstSplitResult {
  taxableAmountPaise: bigint;
  gstRateBps: number;
  gstAmountPaise: bigint;
  cgstPaise: bigint;
  sgstPaise: bigint;
  igstPaise: bigint;
  totalWithGstPaise: bigint;
}

export function splitGst(
  taxablePaise: bigint,
  gstRateBps = 1800,
  isInterstate = false
): GstSplitResult {
  if (!isValidGstRate(gstRateBps)) {
    throw new Error(`Invalid GST rate in basis points: ${gstRateBps}`);
  }

  const gstAmountPaise = (taxablePaise * BigInt(gstRateBps)) / 10000n;
  let cgstPaise = 0n;
  let sgstPaise = 0n;
  let igstPaise = 0n;

  if (isInterstate) {
    igstPaise = gstAmountPaise;
  } else {
    cgstPaise = gstAmountPaise / 2n;
    sgstPaise = gstAmountPaise - cgstPaise;
  }

  return {
    taxableAmountPaise: taxablePaise,
    gstRateBps,
    gstAmountPaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    totalWithGstPaise: taxablePaise + gstAmountPaise,
  };
}

export function isValidGstRate(bps: number): boolean {
  return Number.isInteger(bps) && bps >= 0 && bps <= 10000;
}
