import type { CustomerAcceptance } from '../types';
import {
  Motorcycle,
  StockUnit,
  Customer,
  Booking,
  Sale,
  Payment,
  Refund,
  TestRide,
  Lead,
  StaffTask,
  StockUnitStatus,
  OlxListing,
} from '../types';
import {
  INITIAL_BIKES,
  INITIAL_STOCK_UNITS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_SALES,
  INITIAL_PAYMENTS,
  INITIAL_REFUNDS,
  INITIAL_TEST_RIDES,
  INITIAL_LEADS,
  INITIAL_STAFF_TASKS,
  INITIAL_OFFERS,
  DEALERSHIP_INFO,
  getColorBikeImage,
} from '../data/dealershipData';
import { Offer, DealershipInfo } from '../types';
import { splitGst } from '../lib/currency';
import {
  buildVariantsForModel,
  generateBaseMarketCatalog,
  generateThousandBikesCatalog,
  parseBikesCsv,
} from './marketBikesDatabase';

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface InventoryRealtimeEvent {
  type: 'STOCK_STATUS_CHANGED' | 'SALE_COMPLETED' | 'STOCK_INWARD' | 'BOOKING_RESERVED' | 'OLX_AD_POSTED';
  stockUnitId?: string;
  bikeId: string;
  previousStatus?: StockUnitStatus;
  newStatus?: StockUnitStatus;
  newStockCount: number;
  timestamp: string;
}

export interface DealershipState {
  bikes: Motorcycle[];
  stockUnits: StockUnit[];
  customers: Customer[];
  bookings: Booking[];
  sales: Sale[];
  payments: Payment[];
  refunds: Refund[];
  testRides: TestRide[];
  leads: Lead[];
  tasks: StaffTask[];
  auditLogs: AuditLogEntry[];
  olxListings: OlxListing[];
  offers: Offer[];
  dealershipInfo: DealershipInfo;
  lastRealtimeEvent?: InventoryRealtimeEvent;
}

const OVERRIDES_KEY = 'tby-admin-overrides-v1';

/** Persisted staff overrides: pricing (ex-showroom only), featured flags, offers, dealership info. */
interface BikeOverrideV1 {
  /** variantId -> exShowroomPaise (stored as string to survive BigInt serialization) */
  v?: Record<string, string>;
  feat?: boolean;
}
interface OverridesV1 {
  v: 1;
  bikes: Record<string, BikeOverrideV1>;
  offers: Offer[];
  info: DealershipInfo;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    action: 'SALE_COMPLETED',
    performedBy: 'Suraj Patil (Sales Exec)',
    details: 'Completed Sale & Invoice #TBY-INV-2026-044 for Triumph Speed 400 to Rohan R. Mehta. Advance ₹25,000 adjusted.',
    timestamp: '2026-10-25T11:00:00.000Z',
  },
  {
    id: 'log-02',
    action: 'REFUND_PROCESSED',
    performedBy: 'Rajesh Gokhale (Accountant)',
    details: 'Approved Refund TBY-REF-2026-004 of ₹5,000 for Vikram Joshi. Verified requester is Suraj Patil (different staff).',
    timestamp: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'log-03',
    action: 'STOCK_INWARD',
    performedBy: 'Kiran Mane (Technician)',
    details: 'Inwarded batch of Hunter 350 and Duke 390. PDI checklist signed off.',
    timestamp: '2026-10-24T10:05:00.000Z',
  },
];

class DealershipStore {
  private state: DealershipState;
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = {
      bikes: [
        ...INITIAL_BIKES.map((b) => {
          const rawRupees = Number(b.exShowroomPaise / 100n);
          const variants = b.variants ?? buildVariantsForModel(rawRupees).map((variant, index) =>
            index === 0 ? {
              ...variant,
              exShowroomPaise: b.exShowroomPaise,
              rtoTaxPaise: b.rtoTaxPaise,
              insurancePaise: b.insurancePaise,
              handlingPaise: b.handlingPaise,
            } : variant
          );
          return {
            ...b,
            variants,
            selectedVariantId: variants[0]?.id,
          };
        }),
        // Central Indian-market dataset (unique models, 4 variants each)
        ...generateBaseMarketCatalog(),
      ],
      stockUnits: [...INITIAL_STOCK_UNITS],
      customers: [...INITIAL_CUSTOMERS],
      bookings: [...INITIAL_BOOKINGS],
      sales: [...INITIAL_SALES],
      payments: [...INITIAL_PAYMENTS],
      refunds: [...INITIAL_REFUNDS],
      testRides: [...INITIAL_TEST_RIDES],
      leads: [...INITIAL_LEADS],
      tasks: [...INITIAL_STAFF_TASKS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      offers: INITIAL_OFFERS.map((o) => ({ ...o })),
      dealershipInfo: {
        ...DEALERSHIP_INFO,
        bankDetails: { ...DEALERSHIP_INFO.bankDetails },
      },
      olxListings: [
        {
          id: 'olx-seed-01',
          bikeId: 'used-pulsar-ns200',
          adTitle: '[Certified 1-Owner] 2022 Bajaj Pulsar NS200 ABS - Thane (MH-04)',
          brand: 'Bajaj',
          model: 'Pulsar NS200',
          year: 2022,
          odometerKm: 18400,
          priceInr: 105000,
          category: 'Motorcycles',
          location: 'Khopat, Thane West, Maharashtra',
          description: 'Certified Pre-Owned by The Bike Yard Thane. Single owner, 45-point PDI cleared, 6-month engine warranty. Clean MH-04 Thane RTO documentation and valid insurance.',
          photos: ['/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg'],
          postedBy: 'Suraj Patil (Sales Exec)',
          postedAt: '2026-10-24T09:30:00.000Z',
          olxAdId: 'OLX-THN-84920194',
          status: 'ACTIVE',
          url: 'https://www.olx.in/item/the-bike-yard-thane-certified-pulsar-ns200-iid-84920194',
        },
      ],
    };

    this.recalculateAllStockCounts();
    this.applyOverrides();

    // Initialize cross-tab WebSockets-equivalent real-time sync channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('tby_inventory_realtime');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'INVENTORY_SYNC') {
          this.state = {
            ...this.state,
            ...event.data.payload,
          };
          this.notify(false);
        }
      };
    }
  }

  // --- Select specific variant for a bike (Base, Base Premium, Mid, Top) ---
  public selectBikeVariant(bikeId: string, variantId: string): boolean {
    const bike = this.state.bikes.find((b) => b.id === bikeId);
    if (!bike || !bike.variants) return false;

    const variant = bike.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    bike.selectedVariantId = variant.id;
    bike.variant = variant.name;
    bike.exShowroomPaise = variant.exShowroomPaise;
    bike.rtoTaxPaise = variant.rtoTaxPaise;
    bike.insurancePaise = variant.insurancePaise;
    bike.handlingPaise = variant.handlingPaise;

    this.notify();
    return true;
  }

  // --- Select specific color variant with responsive photo update ---
  public selectBikeColor(bikeId: string, colorName: string): boolean {
    const bike = this.state.bikes.find((b) => b.id === bikeId);
    if (!bike) return false;

    bike.selectedColor = colorName;
    const matchingImg = getColorBikeImage(bike, colorName);
    if (matchingImg) {
      bike.image = matchingImg;
    }

    this.notify();
    return true;
  }

  // --- Capture Lead & Alert Backend Staff ---
  public createLead(params: {
    acceptance?: CustomerAcceptance;
    customerName: string;
    phone: string;
    bikeOfInterest: string;
    source?: 'WALK_IN' | 'WEBSITE' | 'REFERRAL' | 'PHONE';
    notes?: string;
    assignedTo?: string;
  }): { success: boolean; lead: Lead } {
    const newLead: Lead = {
      acceptance: params.acceptance,
      id: `lead-${Date.now()}`,
      customerName: params.customerName.trim(),
      phone: params.phone.trim(),
      bikeOfInterest: params.bikeOfInterest,
      source: params.source || 'WEBSITE',
      stage: 'NEW',
      assignedTo: params.assignedTo || 'Suraj Patil (Online Desk)',
      notes: params.notes || 'Inbound callback request via web showroom.',
      createdAt: new Date().toISOString(),
    };

    this.state.leads.unshift(newLead);
    this.logAudit(
      'LEAD_CAPTURED',
      'Showroom Web Desk',
      `New callback lead registered for ${newLead.customerName} (${newLead.phone}) interested in ${newLead.bikeOfInterest}.`
    );

    this.notify();
    return { success: true, lead: newLead };
  }

  public advanceLeadStage(leadId: string, newStage: Lead['stage'], updatedBy = 'Staff Portal Desk'): boolean {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead) return false;
    lead.stage = newStage;
    this.logAudit(
      'LEAD_STAGE_UPDATED',
      updatedBy,
      `Lead for ${lead.customerName} updated to stage ${newStage}.`
    );
    this.notify();
    return true;
  }

  // --- Import bikes and variants via CSV upload ---
  public importBikesFromCsv(
    csvText: string,
    options?: { staffName?: string; mode?: 'APPEND' | 'REPLACE' } | string
  ): {
    success: boolean;
    count: number;
    errors: string[];
  } {
    const staffName = typeof options === 'string' ? options : options?.staffName || 'Staff Operations';
    const mode = typeof options === 'object' && options?.mode ? options.mode : 'APPEND';

    const { importedCount, bikes, errors } = parseBikesCsv(csvText);
    if (importedCount === 0) {
      return { success: false, count: 0, errors };
    }

    if (mode === 'REPLACE') {
      // Keep certified pre-owned bikes intact if they existed, replace new catalog
      const usedBikes = this.state.bikes.filter((b) => b.isUsed);
      this.state.bikes = [...bikes, ...usedBikes];
    } else {
      // Prepend newly uploaded bikes to the catalogue
      this.state.bikes = [...bikes, ...this.state.bikes];
    }
    this.recalculateAllStockCounts();

    this.logAudit(
      'CSV_MARKET_PRICE_UPLOAD',
      staffName,
      `Imported ${importedCount} motorcycle models via CSV upload (${mode === 'REPLACE' ? 'Catalogue Replaced' : 'Added to Catalogue'}).`
    );

    this.notify();
    return { success: true, count: importedCount, errors };
  }

  // --- Sync 1,000+ Indian Market Variants ---
  public syncThousandMarketVariants(staffName = 'Automated Market Feed'): number {
    const thousandCatalog = generateThousandBikesCatalog();
    this.state.bikes = [...thousandCatalog];
    this.recalculateAllStockCounts();

    this.logAudit(
      'MARKET_CATALOG_SYNC_1000',
      staffName,
      `Synchronized complete Indian market database: 250 models x 4 variants = 1,000 variants.`
    );

    this.notify();
    return thousandCatalog.length * 4;
  }

  // --- OLX 1-Click Second Hand Bike Ad Posting for Backend Staff ---
  public postBikeToOlx(data: {
    bikeId: string;
    customTitle?: string;
    customPriceInr?: number;
    customDescription?: string;
    staffName?: string;
  }): { success: boolean; listing?: OlxListing; error?: string } {
    const bike = this.state.bikes.find((b) => b.id === data.bikeId);
    if (!bike) {
      return { success: false, error: 'Motorcycle not found in inventory.' };
    }

    const price = data.customPriceInr || Number(bike.exShowroomPaise / 100n);
    const title =
      data.customTitle ||
      `[Certified 1-Owner] ${bike.year || 2023} ${bike.brand} ${bike.model} - Thane (MH-04)`;
    const randNum = Math.floor(10000000 + Math.random() * 90000000);
    const olxAdId = `OLX-THN-${randNum}`;
    const slug = `${bike.brand}-${bike.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newListing: OlxListing = {
      id: `olx-${Date.now()}`,
      bikeId: bike.id,
      adTitle: title,
      brand: bike.brand,
      model: bike.model,
      year: bike.year || 2023,
      odometerKm: bike.odometerKm || 15000,
      priceInr: price,
      category: bike.category === 'Scooter' ? 'Scooters' : 'Motorcycles',
      location: 'Khopat, Thane West, Maharashtra (Near Rutu Business Park)',
      description:
        data.customDescription ||
        `The Bike Yard Certified Pre-Owned Machine. Fully inspected 45-point mechanical check. 6-Month engine warranty. Clean MH-04 transfer guaranteed. Immediate delivery at Khopat showroom. Call: +91 98204 55120.`,
      photos: [bike.image],
      postedBy: data.staffName || 'Staff Desk',
      postedAt: new Date().toISOString(),
      olxAdId,
      status: 'ACTIVE',
      url: `https://www.olx.in/item/the-bike-yard-thane-certified-${slug}-iid-${randNum}`,
    };

    // Replace any previous listing for this bike or append
    this.state.olxListings = [
      newListing,
      ...this.state.olxListings.filter((l) => l.bikeId !== bike.id),
    ];

    this.logAudit(
      'OLX_AD_POSTED',
      data.staffName || 'Staff Operations',
      `Posted 1-Click verified ad to OLX India Dealer Marketplace: ${title} at ₹${price.toLocaleString(
        'en-IN'
      )} (Ad ID: ${olxAdId}).`
    );

    this.state.lastRealtimeEvent = {
      type: 'OLX_AD_POSTED',
      bikeId: bike.id,
      newStockCount: bike.inStockCount,
      timestamp: new Date().toISOString(),
    };

    this.notify();
    return { success: true, listing: newListing };
  }

  public removeOlxListing(listingId: string, staffName = 'Staff Operations') {
    const listing = this.state.olxListings.find((l) => l.id === listingId);
    if (listing) {
      this.state.olxListings = this.state.olxListings.filter((l) => l.id !== listingId);
      this.logAudit(
        'OLX_AD_REMOVED',
        staffName,
        `Removed OLX ad ${listing.olxAdId} for ${listing.brand} ${listing.model}.`
      );
      this.notify();
    }
  }

  public getState(): DealershipState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private recalculateAllStockCounts() {
    this.state.bikes.forEach((bike) => {
      const bikeUnits = this.state.stockUnits.filter((u) => u.bikeId === bike.id);
      // Bikes without VIN-tracked units keep their showroom availability seed;
      // VIN-tracked bikes are always derived from the stock ledger.
      if (bikeUnits.length === 0) return;
      bike.inStockCount = bikeUnits.filter((u) => u.status === 'IN_STOCK').length;
    });
  }

  // --- Persist staff overrides (pricing / featured / offers / dealership info) ---
  private saveOverrides() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const bikes: Record<string, BikeOverrideV1> = {};
      for (const b of this.state.bikes) {
        const v: Record<string, string> = {};
        if (b.variants) {
          for (const variant of b.variants) v[variant.id] = variant.exShowroomPaise.toString();
        }
        bikes[b.id] = { v, feat: b.featured ?? false };
      }
      const payload: OverridesV1 = {
        v: 1,
        bikes,
        offers: this.state.offers,
        info: this.state.dealershipInfo,
      };
      window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(payload));
    } catch {
      // Quota or serialization failure — overrides simply won't persist; never crash the showroom.
    }
  }

  private applyOverrides() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(OVERRIDES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OverridesV1;
      if (parsed?.v !== 1) return;

      if (parsed.bikes) {
        for (const [bikeId, ov] of Object.entries(parsed.bikes)) {
          const bike = this.state.bikes.find((b) => b.id === bikeId);
          if (!bike) continue;
          if (ov.v && bike.variants) {
            for (const variant of bike.variants) {
              const stored = ov.v[variant.id];
              if (!stored) continue;
              try {
                const paise = BigInt(stored);
                if (paise > 0n && paise !== variant.exShowroomPaise) {
                  variant.exShowroomPaise = paise;
                  variant.rtoTaxPaise = (paise * 1100n) / 10000n; // MH-04 individual 11%
                }
              } catch {
                /* ignore malformed entry */
              }
            }
            this.syncSelectedVariantSnapshot(bikeId);
          }
          if (typeof ov.feat === 'boolean') bike.featured = ov.feat;
        }
      }

      if (Array.isArray(parsed.offers)) {
        this.state.offers = parsed.offers;
      }
      if (parsed.info && typeof parsed.info === 'object') {
        this.state.dealershipInfo = {
          ...this.state.dealershipInfo,
          ...parsed.info,
          bankDetails: {
            ...this.state.dealershipInfo.bankDetails,
            ...(parsed.info.bankDetails ?? {}),
          },
        };
      }
    } catch {
      // Corrupted overrides — ignore and keep dataset defaults.
    }
  }

  private syncSelectedVariantSnapshot(bikeId: string) {
    const bike = this.state.bikes.find((b) => b.id === bikeId);
    if (!bike || !bike.variants) return;
    const selected =
      bike.variants.find((v) => v.id === bike.selectedVariantId) ?? bike.variants[0];
    if (!selected) return;
    bike.exShowroomPaise = selected.exShowroomPaise;
    bike.rtoTaxPaise = selected.rtoTaxPaise;
    bike.insurancePaise = selected.insurancePaise;
    bike.handlingPaise = selected.handlingPaise;
  }

  private notify(broadcast = true) {
    this.recalculateAllStockCounts();
    this.saveOverrides();
    this.listeners.forEach((listener) => listener());

    if (broadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'INVENTORY_SYNC',
        payload: {
          bikes: this.state.bikes,
          stockUnits: this.state.stockUnits,
          sales: this.state.sales,
          bookings: this.state.bookings,
          lastRealtimeEvent: this.state.lastRealtimeEvent,
        },
      });
    }
  }

  // --- Admin: update a variant's ex-showroom price (RTO auto-recomputed at 11%) ---
  // BUSINESS RULE: staff may ONLY touch dealership-commercial fields.
  // Factory specifications (engine, dimensions, mileage, description) are read-only here.
  public updateVariantPrice(params: {
    bikeId: string;
    variantId: string;
    newExShowroomPaise: bigint;
    staffName: string;
  }): { success: boolean; error?: string } {
    const MAX_PAISE = 10_000_000_000n; // ₹10 crore sanity ceiling
    const MIN_PAISE = 1_000_00n; // ₹1,000 sanity floor
    if (params.newExShowroomPaise < MIN_PAISE || params.newExShowroomPaise > MAX_PAISE) {
      return { success: false, error: 'Price out of plausible range. Enter the ex-showroom price in ₹.' };
    }
    const bike = this.state.bikes.find((b) => b.id === params.bikeId);
    if (!bike || !bike.variants) return { success: false, error: 'Motorcycle not found.' };
    const variant = bike.variants.find((v) => v.id === params.variantId);
    if (!variant) return { success: false, error: 'Variant not found.' };

    const oldPrice = variant.exShowroomPaise;
    variant.exShowroomPaise = params.newExShowroomPaise;
    variant.rtoTaxPaise = (params.newExShowroomPaise * 1100n) / 10000n;
    this.syncSelectedVariantSnapshot(bike.id);

    this.logAudit(
      'PRICE_UPDATED',
      params.staffName,
      `Ex-showroom for ${bike.brand} ${bike.model} (${variant.name}) changed from ₹${(oldPrice / 100n).toLocaleString('en-IN')} to ₹${(params.newExShowroomPaise / 100n).toLocaleString('en-IN')}. RTO MH-04 recomputed at 11%.`
    );
    this.notify();
    return { success: true };
  }

  // --- Admin: toggle a bike's "featured on homepage" merchandising flag ---
  public toggleBikeFeatured(bikeId: string, staffName: string): boolean {
    const bike = this.state.bikes.find((b) => b.id === bikeId);
    if (!bike) return false;
    bike.featured = !bike.featured;
    this.logAudit(
      'FEATURED_TOGGLED',
      staffName,
      `${bike.brand} ${bike.model} ${bike.featured ? 'marked as FEATURED on homepage' : 'removed from featured section'}.`
    );
    this.notify();
    return true;
  }

  // --- Admin: offers CRUD (dealership promotions) ---
  public addOffer(input: Omit<Offer, 'id' | 'createdAt'>, staffName: string): Offer {
    const offer: Offer = {
      ...input,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.offers = [offer, ...this.state.offers];
    this.logAudit('OFFER_CREATED', staffName, `Offer "${offer.title}" created.`);
    this.notify();
    return offer;
  }

  public updateOffer(offerId: string, patch: Partial<Omit<Offer, 'id' | 'createdAt'>>, staffName: string): boolean {
    const offer = this.state.offers.find((o) => o.id === offerId);
    if (!offer) return false;
    Object.assign(offer, patch);
    this.logAudit('OFFER_UPDATED', staffName, `Offer "${offer.title}" updated.`);
    this.notify();
    return true;
  }

  public toggleOfferActive(offerId: string, staffName: string): boolean {
    const offer = this.state.offers.find((o) => o.id === offerId);
    if (!offer) return false;
    offer.active = !offer.active;
    this.logAudit('OFFER_TOGGLED', staffName, `Offer "${offer.title}" ${offer.active ? 'activated' : 'deactivated'}.`);
    this.notify();
    return true;
  }

  public deleteOffer(offerId: string, staffName: string): boolean {
    const offer = this.state.offers.find((o) => o.id === offerId);
    if (!offer) return false;
    this.state.offers = this.state.offers.filter((o) => o.id !== offerId);
    this.logAudit('OFFER_DELETED', staffName, `Offer "${offer.title}" deleted.`);
    this.notify();
    return true;
  }

  // --- Admin: update dealership information (contact / address / hours) ---
  public updateDealershipInfo(
    patch: Partial<Omit<DealershipInfo, 'bankDetails'>> & { bankDetails?: Partial<DealershipInfo['bankDetails']> },
    staffName: string
  ): { success: boolean; error?: string } {
    const next: DealershipInfo = {
      ...this.state.dealershipInfo,
      ...patch,
      bankDetails: {
        ...this.state.dealershipInfo.bankDetails,
        ...(patch.bankDetails ?? {}),
      },
    };
    if (!next.name.trim() || !next.address.trim() || !next.phone.trim()) {
      return { success: false, error: 'Name, address and phone are required.' };
    }
    const digits = next.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return { success: false, error: 'Phone number must contain at least 10 digits.' };
    }
    if (next.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(next.email)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (next.pincode && !/^\d{6}$/.test(next.pincode)) {
      return { success: false, error: 'PIN code must be 6 digits.' };
    }
    this.state.dealershipInfo = next;
    this.logAudit('DEALERSHIP_INFO_UPDATED', staffName, 'Dealership contact / address / hours updated.');
    this.notify();
    return { success: true };
  }

  /** Clear persisted staff overrides. UI should reload the page afterwards. */
  public resetAdminOverrides(staffName: string): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(OVERRIDES_KEY);
    }
    this.logAudit('OVERRIDES_RESET', staffName, 'All persisted staff overrides cleared. Reload to restore dataset defaults.');
    return true;
  }

  public logAudit(action: string, performedBy: string, details: string) {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs = [entry, ...this.state.auditLogs];
    this.notify();
  }

  // --- Real-time Stock Unit Status Update ---
  public updateStockUnitStatus(params: {
    unitId: string;
    newStatus: StockUnitStatus;
    location?: string;
    performedBy: string;
  }): { success: boolean; unit?: StockUnit; error?: string } {
    const unit = this.state.stockUnits.find((u) => u.id === params.unitId);
    if (!unit) return { success: false, error: 'Stock unit not found.' };

    const oldStatus = unit.status;
    unit.status = params.newStatus;
    if (params.location) unit.location = params.location;

    this.recalculateAllStockCounts();
    const bike = this.state.bikes.find((b) => b.id === unit.bikeId);

    const event: InventoryRealtimeEvent = {
      type: 'STOCK_STATUS_CHANGED',
      stockUnitId: unit.id,
      bikeId: unit.bikeId,
      previousStatus: oldStatus,
      newStatus: params.newStatus,
      newStockCount: bike ? bike.inStockCount : 0,
      timestamp: new Date().toISOString(),
    };
    this.state.lastRealtimeEvent = event;

    this.logAudit(
      'STOCK_STATUS_CHANGED',
      params.performedBy,
      `VIN ${unit.chassisNumber} status transitioned from ${oldStatus} to ${params.newStatus}.`
    );

    this.notify();
    return { success: true, unit };
  }

  // --- Booking creation with immediate reservation ---
  public createBooking(params: {
    acceptance?: CustomerAcceptance;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    bikeId: string;
    color: string;
    advanceAmountPaise: bigint;
    tentativeDeliveryDate: string;
    salesExecutiveName?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const bike = this.state.bikes.find((b) => b.id === params.bikeId);
    if (!bike) return { success: false, error: 'Motorcycle not found in catalog.' };

    let customer = this.state.customers.find((c) => c.phone === params.customerPhone);
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        fullName: params.customerName,
        phone: params.customerPhone,
        email: params.customerEmail || `${params.customerPhone}@guest.thebikeyard.in`,
        address: params.customerAddress || 'Thane West, Maharashtra',
        city: 'Thane',
        createdAt: new Date().toISOString(),
      };
      this.state.customers.push(customer);
    }

    // Allocate an available stock unit if present
    const availableUnit = this.state.stockUnits.find(
      (u) =>
        u.bikeId === bike.id &&
        u.status === 'IN_STOCK' &&
        u.color.toLowerCase().includes(params.color.toLowerCase())
    );

    if (availableUnit) {
      availableUnit.status = 'RESERVED';
      availableUnit.location = `Reserved for Booking (${customer.fullName})`;
    }

    const bookingNum = `TBY-BK-2026-${String(this.state.bookings.length + 91).padStart(3, '0')}`;
    const newBooking: Booking = {
      acceptance: params.acceptance,
      id: `book-${Date.now()}`,
      bookingNumber: bookingNum,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      bikeId: bike.id,
      bikeModel: `${bike.brand} ${bike.model}`,
      variant: bike.variant,
      color: params.color,
      advanceAmountPaise: params.advanceAmountPaise,
      status: 'ACTIVE',
      stockUnitId: availableUnit ? availableUnit.id : undefined,
      createdDate: new Date().toISOString(),
      tentativeDeliveryDate: params.tentativeDeliveryDate,
      salesExecutiveName: params.salesExecutiveName || 'Suraj Patil',
    };

    this.state.bookings.unshift(newBooking);

    // Record advance payment
    const paymentReceipt = `TBY-RCP-2026-${String(this.state.payments.length + 192).padStart(3, '0')}`;
    this.state.payments.unshift({
      id: `pay-${Date.now()}`,
      receiptNumber: paymentReceipt,
      referenceType: 'BOOKING',
      referenceId: newBooking.id,
      amountPaise: params.advanceAmountPaise,
      mode: 'UPI',
      transactionRef: `UPI/${Date.now().toString().slice(-8)}/TBY`,
      receivedBy: params.salesExecutiveName || 'Suraj Patil',
      paymentDate: new Date().toISOString(),
      status: 'SUCCESS',
    });

    this.recalculateAllStockCounts();
    this.state.lastRealtimeEvent = {
      type: 'BOOKING_RESERVED',
      stockUnitId: availableUnit?.id,
      bikeId: bike.id,
      newStockCount: bike.inStockCount,
      timestamp: new Date().toISOString(),
    };

    this.logAudit(
      'BOOKING_CREATED',
      params.salesExecutiveName || 'Public Portal',
      `Booking ${bookingNum} confirmed for ${customer.fullName}. Unit reserved in real-time.`
    );

    this.notify();
    return { success: true, booking: newBooking };
  }

  // --- Complete Sale Flow ---
  public completeSale(params: {
    bookingId?: string;
    customerId: string;
    stockUnitId: string;
    accessoriesPaise?: bigint;
    paymentMode: 'NEFT' | 'UPI' | 'CARD' | 'CHEQUE' | 'CASH';
    salesExecutive: string;
  }): { success: boolean; sale?: Sale; error?: string } {
    const stockUnit = this.state.stockUnits.find((u) => u.id === params.stockUnitId);
    if (!stockUnit) return { success: false, error: 'Stock unit not found.' };
    if (stockUnit.status === 'SOLD') {
      return { success: false, error: 'This unit has already been sold.' };
    }

    const bike = this.state.bikes.find((b) => b.id === stockUnit.bikeId);
    if (!bike) return { success: false, error: 'Vehicle specification missing.' };

    const customer = this.state.customers.find((c) => c.id === params.customerId);
    if (!customer) return { success: false, error: 'Customer not found.' };

    let advanceCarried = 0n;
    if (params.bookingId) {
      const booking = this.state.bookings.find((b) => b.id === params.bookingId);
      if (booking) {
        if (booking.status === 'COMPLETED') {
          return { success: false, error: 'Booking advance has already been utilized.' };
        }
        advanceCarried = booking.advanceAmountPaise;
        booking.status = 'COMPLETED';
      }
    }

    // Split Maharashtra GST (Intra-State 18%, CGST 9% + SGST 9%)
    const gstSplit = splitGst(bike.exShowroomPaise, 1800, false);
    const accessories = params.accessoriesPaise || 0n;
    const totalOnRoad =
      bike.exShowroomPaise +
      bike.rtoTaxPaise +
      bike.insurancePaise +
      bike.handlingPaise +
      accessories;

    const remainingToPay = totalOnRoad - advanceCarried;

    // Transition unit status to SOLD
    stockUnit.status = 'SOLD';
    stockUnit.location = `Dispatched to ${customer.fullName} (Thane MH-04)`;

    const invoiceNum = `TBY-INV-2026-${String(this.state.sales.length + 45).padStart(3, '0')}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.fullName,
      stockUnitId: stockUnit.id,
      bikeModel: `${bike.brand} ${bike.model}`,
      chassisNumber: stockUnit.chassisNumber,
      engineNumber: stockUnit.engineNumber,
      exShowroomPaise: bike.exShowroomPaise,
      gstAmountPaise: gstSplit.gstAmountPaise,
      cgstPaise: gstSplit.cgstPaise,
      sgstPaise: gstSplit.sgstPaise,
      igstPaise: 0n,
      rtoPaise: bike.rtoTaxPaise,
      insurancePaise: bike.insurancePaise,
      accessoriesPaise: accessories,
      totalOnRoadPaise: totalOnRoad,
      advanceCarriedPaise: advanceCarried,
      amountPaidPaise: totalOnRoad,
      outstandingPaise: 0n,
      saleDate: new Date().toISOString(),
      salesExecutive: params.salesExecutive,
      status: 'DELIVERED',
    };

    this.state.sales.unshift(newSale);

    if (remainingToPay > 0n) {
      this.state.payments.unshift({
        id: `pay-${Date.now()}`,
        receiptNumber: `TBY-RCP-2026-${String(this.state.payments.length + 193).padStart(3, '0')}`,
        referenceType: 'SALE',
        referenceId: newSale.id,
        amountPaise: remainingToPay,
        mode: params.paymentMode,
        transactionRef: `${params.paymentMode}/TXN/${Date.now().toString().slice(-8)}`,
        receivedBy: params.salesExecutive,
        paymentDate: new Date().toISOString(),
        status: 'SUCCESS',
      });
    }

    this.recalculateAllStockCounts();
    this.state.lastRealtimeEvent = {
      type: 'SALE_COMPLETED',
      stockUnitId: stockUnit.id,
      bikeId: bike.id,
      newStockCount: bike.inStockCount,
      timestamp: new Date().toISOString(),
    };

    this.logAudit(
      'SALE_COMPLETED',
      params.salesExecutive,
      `Sale ${invoiceNum} executed for ${customer.fullName}. Unit ${stockUnit.chassisNumber} marked SOLD.`
    );

    this.notify();
    return { success: true, sale: newSale };
  }

  // --- Inward New Stock Unit ---
  public inwardStockUnit(params: {
    bikeId: string;
    chassisNumber: string;
    engineNumber: string;
    variant: string;
    color: string;
    purchasePricePaise: bigint;
    location: string;
    performedBy: string;
  }): { success: boolean; unit?: StockUnit; error?: string } {
    const existing = this.state.stockUnits.find(
      (u) =>
        u.chassisNumber.toUpperCase() === params.chassisNumber.trim().toUpperCase() ||
        u.engineNumber.toUpperCase() === params.engineNumber.trim().toUpperCase()
    );
    if (existing) {
      return { success: false, error: 'Chassis Number or Engine Number already exists in database.' };
    }

    const bike = this.state.bikes.find((b) => b.id === params.bikeId);
    if (!bike) return { success: false, error: 'Motorcycle catalog reference invalid.' };

    const newUnit: StockUnit = {
      id: `unit-tby-${Date.now().toString().slice(-4)}`,
      chassisNumber: params.chassisNumber.trim().toUpperCase(),
      engineNumber: params.engineNumber.trim().toUpperCase(),
      bikeId: bike.id,
      bikeModel: `${bike.brand} ${bike.model}`,
      variant: params.variant || bike.variant,
      color: params.color,
      purchasePricePaise: params.purchasePricePaise,
      status: 'IN_STOCK',
      location: params.location || 'Yard Bay 1 (Main Showroom)',
      inwardDate: new Date().toISOString(),
      pdiPassed: true,
    };

    this.state.stockUnits.unshift(newUnit);
    this.recalculateAllStockCounts();

    this.state.lastRealtimeEvent = {
      type: 'STOCK_INWARD',
      stockUnitId: newUnit.id,
      bikeId: bike.id,
      newStockCount: bike.inStockCount,
      timestamp: new Date().toISOString(),
    };

    this.logAudit(
      'STOCK_INWARD',
      params.performedBy,
      `Inwarded VIN ${newUnit.chassisNumber} (${bike.model}). In-stock count updated to ${bike.inStockCount}.`
    );

    this.notify();
    return { success: true, unit: newUnit };
  }

  // --- Refund Workflow ---
  public requestRefund(params: {
    bookingId: string;
    amountPaise: bigint;
    reason: string;
    requestedBy: string;
  }): { success: boolean; refund?: Refund; error?: string } {
    const booking = this.state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    const newRefund: Refund = {
      id: `ref-${Date.now()}`,
      refundNumber: `TBY-REF-2026-${String(this.state.refunds.length + 5).padStart(3, '0')}`,
      paymentId: `pay-${booking.id}`,
      bookingNumber: booking.bookingNumber,
      customerName: booking.customerName,
      amountPaise: params.amountPaise,
      reason: params.reason,
      requestedBy: params.requestedBy,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    this.state.refunds.unshift(newRefund);
    this.logAudit(
      'REFUND_REQUESTED',
      params.requestedBy,
      `Refund ${newRefund.refundNumber} for ${booking.customerName} (₹${Number(params.amountPaise) / 100}) queued for authorization.`
    );

    this.notify();
    return { success: true, refund: newRefund };
  }

  public approveRefund(refundId: string, approverName: string, approverRole = 'ACCOUNTANT'): {
    success: boolean;
    error?: string;
  } {
    const refund = this.state.refunds.find((r) => r.id === refundId);
    if (!refund) return { success: false, error: 'Refund record not found.' };

    // RBAC Rule 1: Role check
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT'].includes(approverRole)) {
      return {
        success: false,
        error: `Permission Denied: Role '${approverRole}' cannot approve financial refunds. Only Accountants or Managers can authorize.`,
      };
    }

    // RBAC Rule 2: Separation of duties
    if (refund.requestedBy.toLowerCase().trim() === approverName.toLowerCase().trim()) {
      return {
        success: false,
        error: 'Compliance Violation: Requester cannot self-approve a financial refund. Another authorized staff member must sign off.',
      };
    }

    refund.status = 'COMPLETED';
    refund.approvedBy = approverName;
    refund.processedAt = new Date().toISOString();

    this.logAudit(
      'REFUND_APPROVED',
      approverName,
      `Refund ${refund.refundNumber} (₹${Number(refund.amountPaise) / 100}) approved for ${refund.customerName}.`
    );

    this.notify();
    return { success: true };
  }

  // --- Test Ride Booking ---
  public scheduleTestRide(params: {
    acceptance?: CustomerAcceptance;
    customerName: string;
    customerPhone: string;
    bikeModel: string;
    preferredDate: string;
    preferredTimeSlot: string;
    assignedStaff?: string;
  }): { success: boolean; testRide: TestRide } {
    const assignedStaff = params.assignedStaff || 'Suraj Patil (Test Ride Escort)';
    const testRide: TestRide = {
      acceptance: params.acceptance,
      id: `tr-${Date.now()}`,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      bikeModel: params.bikeModel,
      preferredDate: params.preferredDate,
      preferredTimeSlot: params.preferredTimeSlot,
      hasValidLicense: true,
      status: 'SCHEDULED',
      assignedStaff,
    };

    this.state.testRides.unshift(testRide);

    this.state.leads.unshift({
      acceptance: params.acceptance,
      id: `lead-${Date.now()}`,
      customerName: params.customerName,
      phone: params.customerPhone,
      bikeOfInterest: params.bikeModel,
      source: 'WEBSITE',
      stage: 'TEST_RIDE',
      assignedTo: assignedStaff,
      notes: `Test ride scheduled for ${params.preferredDate} at ${params.preferredTimeSlot}. Assigned pilot: ${assignedStaff}.`,
      createdAt: new Date().toISOString(),
    });

    this.logAudit(
      'TEST_RIDE_BOOKED',
      'Showroom Web Portal',
      `Test ride reserved for ${params.customerName} on ${params.bikeModel}.`
    );

    this.notify();
    return { success: true, testRide };
  }

  // --- Task toggle ---
  public toggleTask(taskId: string) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.notify();
    }
  }

  // --- Grounded AI Chatbot ---
  public queryChatbot(question: string): string {
    const q = question.toLowerCase();

    if (q.includes('price') || q.includes('cost') || q.includes('on road') || q.includes('ex showroom') || q.includes('rate')) {
      const found = this.state.bikes.find(
        (b) => q.includes(b.model.toLowerCase()) || q.includes(b.brand.toLowerCase())
      );
      if (found) {
        const total = found.exShowroomPaise + found.rtoTaxPaise + found.insurancePaise + found.handlingPaise;
        return `At The Bike Yard (Khopat, Thane), the ${found.brand} ${found.model} has an Ex-Showroom price of ₹${(Number(found.exShowroomPaise) / 100).toLocaleString('en-IN')}, with Thane RTO (MH-04) tax of ₹${(Number(found.rtoTaxPaise) / 100).toLocaleString('en-IN')}, and Comprehensive 5-Year IRDAI Insurance of ₹${(Number(found.insurancePaise) / 100).toLocaleString('en-IN')}. The total all-inclusive On-Road Thane price is ₹${(Number(total) / 100).toLocaleString('en-IN')}. We currently have ${found.inStockCount} physical unit(s) in stock.`;
      }
      return `Our verified stock includes the Royal Enfield Hunter 350 (On-Road ₹1,79,089), KTM 390 Duke (On-Road ₹3,69,582), Yamaha Aerox 155 (On-Road ₹1,75,030), and Triumph Speed 400 (On-Road ₹2,80,437). Which specific model's quotation would you like?`;
    }

    if (q.includes('stock') || q.includes('available') || q.includes('delivery') || q.includes('waiting')) {
      const inStockSummary = this.state.stockUnits
        .filter((u) => u.status === 'IN_STOCK')
        .map((u) => `${u.bikeModel} in ${u.color}`)
        .join(', ');
      return `We currently have physical units ready on the showroom floor in Khopat: ${inStockSummary || 'None currently on floor'}. Ready delivery can be arranged within 3-4 working days upon MH-04 Thane RTO documentation and HSRP number plate stamping.`;
    }

    if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('timing') || q.includes('open') || q.includes('contact')) {
      return `The Bike Yard is located at: Shop 4 & 5, Rutu Business Park, Near Cadbury Junction, Khopat, Thane (West) — 400601. We are open Monday to Sunday from 10:00 AM to 8:30 PM. You can reach our sales desk directly at +91 98204 55120.`;
    }

    if (q.includes('finance') || q.includes('loan') || q.includes('emi') || q.includes('interest')) {
      return `We provide on-spot two-wheeler finance at our Khopat showroom through HDFC Bank, ICICI Bank, IDFC FIRST Bank, and Bajaj Finance. Down payments start from ₹15,000 with tenure up to 48 months. Standard interest rates range from 8.99% to 11.5% APR depending on CIBIL score.`;
    }

    if (q.includes('test ride') || q.includes('test drive') || q.includes('ride')) {
      return `Complimentary test rides are available daily for the Hunter 350, KTM 390 Duke, Aerox 155, and Speed 400! Please carry a valid Indian Two-Wheeler Driving License. You can schedule your preferred slot right now through the 'Book Test Ride' button on our showroom page.`;
    }

    if (q.includes('used') || q.includes('second hand') || q.includes('pre owned')) {
      const usedBikes = this.state.bikes.filter((b) => b.isUsed);
      return `Yes! We have certified pre-owned motorcycles backed by our 45-point PDI inspection and 6-month engine warranty. Available now: ${usedBikes.map((b) => `${b.model} (${b.year}) at ₹${(Number(b.exShowroomPaise) / 100).toLocaleString('en-IN')}`).join(' and ')}. All transfer paperwork for MH-04/MH-02/MH-03 is handled by our in-house RTO desk.`;
    }

    return `Welcome to The Bike Yard Khopat, Thane. As an authorized multi-brand premium dealership, I can give you exact On-Road Thane prices, live stock status, test ride slots, or two-wheeler finance options for Royal Enfield, KTM, Yamaha, and Triumph. How can I assist your ride today?`;
  }
}

export const dealershipStore = new DealershipStore();
