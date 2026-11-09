import { prisma } from '../lib/prisma';
import { splitGst } from '../lib/currency';

export interface CompleteSaleInput {
  dealershipId: string;
  customerId: string;
  stockUnitId: string;
  bookingId?: string;
  accessoriesPaise?: bigint;
  paymentMode: 'NEFT' | 'UPI' | 'CARD' | 'CHEQUE' | 'CASH';
  salesExecutive: string;
}

export async function completeSale(input: CompleteSaleInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock and verify stock unit
    const stockUnit = await tx.stockUnit.findUnique({
      where: { id: input.stockUnitId },
      include: { variant: { include: { model: true } } },
    });

    if (!stockUnit) throw new Error('Stock unit not found.');
    if (stockUnit.status === 'SOLD') throw new Error('Stock unit has already been sold.');

    // 2. Verify booking and advance if applicable
    let advanceCarriedPaise = 0n;
    if (input.bookingId) {
      const booking = await tx.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking) throw new Error('Booking record not found.');
      if (booking.status === 'COMPLETED') throw new Error('Booking advance already utilized.');
      advanceCarriedPaise = booking.advanceAmountPaise;

      await tx.booking.update({
        where: { id: input.bookingId },
        data: { status: 'COMPLETED' },
      });
    }

    // 3. Compute GST and On-Road Pricing
    const exShowroom = stockUnit.variant.exShowroomPricePaise;
    const gstSplit = splitGst(exShowroom, 1800, false);
    const accessories = input.accessoriesPaise || 0n;
    const totalOnRoad =
      exShowroom +
      stockUnit.variant.rtoTaxPaise +
      stockUnit.variant.insurancePaise +
      stockUnit.variant.handlingChargesPaise +
      accessories;

    const remainingPaise = totalOnRoad - advanceCarriedPaise;

    // 4. Mark StockUnit as SOLD
    await tx.stockUnit.update({
      where: { id: input.stockUnitId },
      data: { status: 'SOLD', location: 'Dispatched to Customer (Thane MH-04)' },
    });

    // 5. Create Sale
    const saleCount = await tx.sale.count();
    const saleNumber = `TBY-SALE-2026-${String(saleCount + 1).padStart(3, '0')}`;

    const sale = await tx.sale.create({
      data: {
        dealershipId: input.dealershipId,
        customerId: input.customerId,
        stockUnitId: stockUnit.id,
        saleNumber,
        exShowroomPaise: exShowroom,
        gstAmountPaise: gstSplit.gstAmountPaise,
        cgstPaise: gstSplit.cgstPaise,
        sgstPaise: gstSplit.sgstPaise,
        igstPaise: 0n,
        rtoPaise: stockUnit.variant.rtoTaxPaise,
        insurancePaise: stockUnit.variant.insurancePaise,
        accessoriesPaise: accessories,
        totalOnRoadPaise: totalOnRoad,
        advanceCarriedPaise,
        amountPaidPaise: totalOnRoad,
        outstandingPaise: 0n,
        status: 'DELIVERED',
      },
    });

    // 6. Generate GST Invoice
    const invoiceNumber = `TBY-INV-2026-${String(saleCount + 1).padStart(3, '0')}`;
    await tx.invoice.create({
      data: {
        dealershipId: input.dealershipId,
        saleId: sale.id,
        invoiceNumber,
        gstin: '27AABCT9981K1ZT',
        placeOfSupply: '27-Maharashtra',
        gstRateBps: 1800,
        taxableAmountPaise: exShowroom,
        cgstAmountPaise: gstSplit.cgstPaise,
        sgstAmountPaise: gstSplit.sgstPaise,
        igstAmountPaise: 0n,
        totalInvoicePaise: totalOnRoad,
      },
    });

    // 7. Record remaining payment
    if (remainingPaise > 0n) {
      await tx.payment.create({
        data: {
          receiptNumber: `TBY-RCP-2026-${Date.now().toString().slice(-4)}`,
          saleId: sale.id,
          amountPaise: remainingPaise,
          mode: input.paymentMode,
          receivedBy: input.salesExecutive,
          status: 'SUCCESS',
        },
      });
    }

    return sale;
  });
}
