export interface CustomerAcceptance { version: string; acceptedAt: string; }

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'SALES_EXEC'
  | 'ACCOUNTANT'
  | 'INSURANCE_STAFF'
  | 'RTO_STAFF';

export type StockUnitStatus =
  | 'IN_STOCK'
  | 'RESERVED'
  | 'SOLD'
  | 'IN_TRANSIT'
  | 'PDI_PENDING'
  | 'DISPLAY';

export type BookingStatus =
  | 'ACTIVE'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SaleStatus =
  | 'DRAFT'
  | 'INVOICED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED';

export type RefundStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DISBURSED'
  | 'REJECTED';

export interface BikeVariant {
  id: string;
  name: string; // e.g. Base, Base Premium, Mid, Top
  exShowroomPaise: bigint;
  rtoTaxPaise: bigint;
  insurancePaise: bigint;
  handlingPaise: bigint;
  features?: string[];
}

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  variants?: BikeVariant[];
  selectedVariantId?: string;
  category: 'Commuter' | 'Roadster' | 'Sport' | 'Adventure' | 'Cruiser' | 'Scooter';
  exShowroomPaise: bigint;
  rtoTaxPaise: bigint;
  insurancePaise: bigint;
  handlingPaise: bigint;
  engineCc: number;
  powerBhp: number;
  torqueNm: number;
  mileageKmpl: number;
  kerbWeightKg: number;
  fuelCapacityL: number;
  availableColors: { name: string; hex: string; image?: string }[];
  selectedColor?: string;
  images?: Record<string, string>;
  isUsed?: boolean;
  year?: number;
  odometerKm?: number;
  inStockCount: number;
  image: string;
  description: string;
  /** Merchandising flag — staff may toggle in admin (dealership-specific, not a factory spec) */
  featured?: boolean;
  /** ISO date the unit was inwarded / arrived at the showroom (for "Latest arrivals") */
  arrivedAt?: string;
}

export interface DealershipInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  rtoCode: string;
  phone: string;
  landline: string;
  email: string;
  gstin: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };
  openingHours: string;
}

export type OfferType = 'EXCHANGE' | 'FINANCE' | 'ACCESSORY' | 'WARRANTY' | 'FESTIVE' | 'GENERAL';

export interface Offer {
  id: string;
  type: OfferType;
  title: string;
  description: string;
  badge?: string;
  validTill?: string; // ISO date
  active: boolean;
  createdAt: string;
}

export interface StockUnit {
  id: string;
  chassisNumber: string;
  engineNumber: string;
  bikeId: string;
  bikeModel: string;
  variant: string;
  color: string;
  purchasePricePaise: bigint;
  status: StockUnitStatus;
  location: string;
  inwardDate: string;
  pdiPassed: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  panNumber?: string;
  aadhaarNumber?: string;
  createdAt: string;
}

export interface Booking {
  acceptance?: CustomerAcceptance;
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bikeId: string;
  bikeModel: string;
  variant: string;
  color: string;
  advanceAmountPaise: bigint;
  status: BookingStatus;
  stockUnitId?: string;
  createdDate: string;
  tentativeDeliveryDate: string;
  salesExecutiveName: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  stockUnitId: string;
  bikeModel: string;
  chassisNumber: string;
  engineNumber: string;
  exShowroomPaise: bigint;
  gstAmountPaise: bigint;
  cgstPaise: bigint;
  sgstPaise: bigint;
  igstPaise: bigint;
  rtoPaise: bigint;
  insurancePaise: bigint;
  accessoriesPaise: bigint;
  totalOnRoadPaise: bigint;
  advanceCarriedPaise: bigint;
  amountPaidPaise: bigint;
  outstandingPaise: bigint;
  saleDate: string;
  salesExecutive: string;
  status: SaleStatus;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  referenceType: 'BOOKING' | 'SALE';
  referenceId: string;
  amountPaise: bigint;
  mode: 'UPI' | 'NEFT' | 'CARD' | 'CASH' | 'CHEQUE';
  transactionRef: string;
  receivedBy: string;
  paymentDate: string;
  status: PaymentStatus;
}

export interface Refund {
  id: string;
  refundNumber: string;
  paymentId: string;
  bookingNumber: string;
  customerName: string;
  amountPaise: bigint;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface TestRide {
  acceptance?: CustomerAcceptance;
  id: string;
  customerName: string;
  customerPhone: string;
  bikeModel: string;
  preferredDate: string;
  preferredTimeSlot: string;
  hasValidLicense: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  assignedStaff: string;
}

export interface Lead {
  acceptance?: CustomerAcceptance;
  id: string;
  customerName: string;
  phone: string;
  bikeOfInterest: string;
  source: 'WALK_IN' | 'WEBSITE' | 'REFERRAL' | 'PHONE';
  stage: 'NEW' | 'CONTACTED' | 'TEST_RIDE' | 'QUOTATION' | 'BOOKED' | 'LOST';
  assignedTo: string;
  notes: string;
  createdAt: string;
}

export interface StaffTask {
  id: string;
  title: string;
  category: 'PDI' | 'DOCUMENTATION' | 'DELIVERY' | 'FOLLOW_UP';
  assignedTo: string;
  dueTime: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OlxListing {
  id: string;
  bikeId: string;
  adTitle: string;
  brand: string;
  model: string;
  year: number;
  odometerKm: number;
  priceInr: number;
  category: string;
  location: string;
  description: string;
  photos: string[];
  postedBy: string;
  postedAt: string;
  olxAdId: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  url: string;
}

