import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone must be at least 10 digits')
  .max(15, 'Phone must be under 15 digits')
  .regex(/^[0-9+]+$/, 'Invalid phone number format');

export const gstinSchema = z
  .string()
  .length(15, 'GSTIN must be exactly 15 alphanumeric characters')
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format');

export const bookingCreateSchema = z.object({
  customerName: z.string().min(2, 'Customer name required'),
  customerPhone: phoneSchema,
  bikeId: z.string().uuid(),
  color: z.string().min(2),
  advanceAmountPaise: z.bigint().min(100000n, 'Advance must be at least ₹1,000'),
  tentativeDeliveryDate: z.string(),
});

export const stockInwardSchema = z.object({
  chassisNumber: z.string().min(10).max(30),
  engineNumber: z.string().min(6).max(30),
  variantId: z.string().uuid(),
  colorName: z.string().min(2),
  purchasePricePaise: z.bigint().positive(),
  location: z.string().default('Main Showroom'),
});

export const refundApprovalSchema = z.object({
  refundId: z.string().uuid(),
  approverName: z.string().min(2),
  requesterName: z.string().min(2),
}).refine((data) => data.approverName.trim().toLowerCase() !== data.requesterName.trim().toLowerCase(), {
  message: 'Financial Rule Violation: Refund requester cannot approve their own refund.',
  path: ['approverName'],
});
