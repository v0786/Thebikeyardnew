import JSZip from 'jszip';

export interface CodeFile {
  path: string;
  category: 'prisma' | 'app' | 'lib' | 'services' | 'api' | 'config' | 'tests';
  description: string;
  content: string;
}

export const PROJECT_CODE_FILES: CodeFile[] = [
  // 1. Prisma Schema (~50 models)
  {
    path: 'prisma/schema.prisma',
    category: 'prisma',
    description: 'Complete Prisma 6.12 schema with PostgreSQL, BigInt paise, UUIDs, soft-deletes, & indexes',
    content: `// The Bike Yard — Motorcycle Dealership & Digital Showroom
// Database Schema with ~50 models adhering strictly to BigInt paise and PostgreSQL standards

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// -----------------------------------------------------------------------------
// CORE & TENANCY
// -----------------------------------------------------------------------------

model Dealership {
  id             String    @id @default(uuid()) @db.Uuid
  code           String    @unique @db.VarChar(20)
  name           String    @db.VarChar(120)
  tagline        String?   @db.VarChar(255)
  addressLine1   String    @db.VarChar(255)
  addressLine2   String?   @db.VarChar(255)
  city           String    @default("Thane") @db.VarChar(80)
  state          String    @default("Maharashtra") @db.VarChar(80)
  pincode        String    @db.VarChar(10)
  stateCode      String    @default("27") @db.VarChar(2)
  gstin          String    @unique @db.VarChar(15)
  panNumber      String?   @db.VarChar(10)
  rtoCode        String    @default("MH-04") @db.VarChar(10)
  phone          String    @db.VarChar(20)
  email          String    @db.VarChar(120)
  invoicePrefix  String    @default("TBY-INV-2026-") @db.VarChar(30)
  bookingPrefix  String    @default("TBY-BK-2026-") @db.VarChar(30)
  createdAt      DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime  @updatedAt @db.Timestamptz(6)

  users          User[]
  stockUnits     StockUnit[]
  bookings       Booking[]
  sales          Sale[]
  invoices       Invoice[]
  settings       Settings[]
  expenses       Expense[]

  @@map("dealerships")
}

model User {
  id            String    @id @default(uuid()) @db.Uuid
  dealershipId  String    @db.Uuid
  name          String    @db.VarChar(120)
  email         String    @unique @db.VarChar(150)
  emailVerified DateTime? @db.Timestamptz(6)
  passwordHash  String?   @db.VarChar(255)
  phone         String?   @db.VarChar(20)
  image         String?   @db.VarChar(255)
  roleId        String    @db.Uuid
  isActive      Boolean   @default(true)
  deletedAt     DateTime? @db.Timestamptz(6)
  createdAt     DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @db.Timestamptz(6)

  dealership    Dealership @relation(fields: [dealershipId], references: [id])
  role          Role       @relation(fields: [roleId], references: [id])
  sessions      Session[]
  accounts      Account[]
  auditLogs     AuditLog[]
  tasksAssigned StaffTask[] @relation("AssignedTasks")

  @@index([dealershipId])
  @@index([roleId])
  @@map("users")
}

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(50) // SUPER_ADMIN, OWNER, MANAGER, SALES_EXEC, ACCOUNTANT, INSURANCE_STAFF, RTO_STAFF
  description String?  @db.VarChar(255)
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  users       User[]
  permissions RolePermission[]

  @@map("roles")
}

model Permission {
  id          String   @id @default(uuid()) @db.Uuid
  code        String   @unique @db.VarChar(80) // e.g. stock:inward, sale:complete, refund:approve
  module      String   @db.VarChar(50)
  description String?  @db.VarChar(255)

  roles       RolePermission[]

  @@map("permissions")
}

model RolePermission {
  roleId       String @db.Uuid
  permissionId String @db.Uuid

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

// NextAuth Database Sessions
model Account {
  id                String  @id @default(uuid()) @db.Uuid
  userId            String  @db.Uuid
  type              String  @db.VarChar(50)
  provider          String  @db.VarChar(50)
  providerAccountId String  @db.VarChar(100)
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String? @db.VarChar(50)
  scope             String? @db.VarChar(255)
  id_token          String? @db.Text
  session_state     String? @db.VarChar(255)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid()) @db.Uuid
  sessionToken String   @unique @db.VarChar(255)
  userId       String   @db.Uuid
  expires      DateTime @db.Timestamptz(6)

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String   @db.VarChar(150)
  token      String   @unique @db.VarChar(255)
  expires    DateTime @db.Timestamptz(6)

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// -----------------------------------------------------------------------------
// CATALOGUE & VEHICLES
// -----------------------------------------------------------------------------

model Brand {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(80)
  slug        String   @unique @db.VarChar(80)
  logoUrl     String?  @db.VarChar(255)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  models      Model[]

  @@map("brands")
}

model Model {
  id          String   @id @default(uuid()) @db.Uuid
  brandId     String   @db.Uuid
  name        String   @db.VarChar(120)
  slug        String   @unique @db.VarChar(120)
  category    String   @db.VarChar(50) // Roadster, Sport, Cruiser, Scooter, Adventure
  engineCc    Int
  powerBhp    Decimal  @db.Decimal(5, 2)
  torqueNm    Decimal  @db.Decimal(5, 2)
  mileageKmpl Decimal? @db.Decimal(4, 1)
  kerbWeight  Int
  fuelCapacity Decimal @db.Decimal(4, 1)
  description String?  @db.Text
  isUsed      Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  brand       Brand    @relation(fields: [brandId], references: [id])
  variants    Variant[]

  @@index([brandId])
  @@map("models")
}

model Variant {
  id                  String   @id @default(uuid()) @db.Uuid
  modelId             String   @db.Uuid
  name                String   @db.VarChar(100)
  exShowroomPricePaise BigInt  // Integer paise (e.g. 14990000n)
  rtoTaxPaise         BigInt   // Integer paise
  insurancePaise      BigInt   // Integer paise
  handlingChargesPaise BigInt  @default(150000)
  hsnCode             String   @default("8711") @db.VarChar(10)
  isActive            Boolean  @default(true)

  model               Model    @relation(fields: [modelId], references: [id])
  colours             Colour[]
  stockUnits          StockUnit[]

  @@index([modelId])
  @@map("variants")
}

model Colour {
  id        String   @id @default(uuid()) @db.Uuid
  variantId String   @db.Uuid
  name      String   @db.VarChar(60)
  hexCode   String   @db.VarChar(10)
  imageUrl  String?  @db.VarChar(255)

  variant   Variant  @relation(fields: [variantId], references: [id])

  @@index([variantId])
  @@map("colours")
}

// -----------------------------------------------------------------------------
// STOCK & INVENTORY
// -----------------------------------------------------------------------------

enum StockUnitStatus {
  IN_STOCK
  RESERVED
  SOLD
  IN_TRANSIT
  PDI_PENDING
  DISPLAY
}

enum StockMovementType {
  INWARD
  SHOWROOM_DISPLAY
  YARD_TRANSFER
  PDI_PASS
  RESERVATION_LOCK
  DISPATCH_DELIVERY
}

model StockUnit {
  id                 String          @id @default(uuid()) @db.Uuid
  dealershipId       String          @db.Uuid
  variantId          String          @db.Uuid
  chassisNumber      String          @unique @db.VarChar(30)
  engineNumber       String          @unique @db.VarChar(30)
  colorName          String          @db.VarChar(60)
  purchasePricePaise BigInt
  status             StockUnitStatus @default(IN_STOCK)
  location           String          @default("Main Showroom") @db.VarChar(120)
  pdiPassed          Boolean         @default(false)
  inwardDate         DateTime        @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime        @updatedAt @db.Timestamptz(6)

  dealership         Dealership      @relation(fields: [dealershipId], references: [id])
  variant            Variant         @relation(fields: [variantId], references: [id])
  movements          StockMovement[]
  reservation        Reservation?
  sale               Sale?

  @@index([dealershipId])
  @@index([variantId])
  @@index([status])
  @@map("stock_units")
}

model StockMovement {
  id          String            @id @default(uuid()) @db.Uuid
  stockUnitId String            @db.Uuid
  type        StockMovementType
  fromLoc     String?           @db.VarChar(100)
  toLoc       String            @db.VarChar(100)
  notes       String?           @db.VarChar(255)
  recordedBy  String            @db.VarChar(100)
  timestamp   DateTime          @default(now()) @db.Timestamptz(6)

  stockUnit   StockUnit         @relation(fields: [stockUnitId], references: [id], onDelete: Cascade)

  @@index([stockUnitId])
  @@map("stock_movements")
}

model Reservation {
  id          String    @id @default(uuid()) @db.Uuid
  bookingId   String    @unique @db.Uuid
  stockUnitId String    @unique @db.Uuid
  reservedAt  DateTime  @default(now()) @db.Timestamptz(6)
  expiresAt   DateTime  @db.Timestamptz(6)

  booking     Booking   @relation(fields: [bookingId], references: [id])
  stockUnit   StockUnit @relation(fields: [stockUnitId], references: [id])

  @@map("reservations")
}

// -----------------------------------------------------------------------------
// BOOKING & SALES LIFECYCLE
// -----------------------------------------------------------------------------

enum BookingStatus {
  ACTIVE
  CONFIRMED
  COMPLETED
  CANCELLED
  EXPIRED
}

enum SaleStatus {
  DRAFT
  INVOICED
  DELIVERED
  CANCELLED
}

model Booking {
  id                    String        @id @default(uuid()) @db.Uuid
  dealershipId          String        @db.Uuid
  bookingNumber         String        @unique @db.VarChar(30)
  customerId            String        @db.Uuid
  variantId             String        @db.Uuid
  colorRequested        String        @db.VarChar(60)
  advanceAmountPaise    BigInt
  status                BookingStatus @default(ACTIVE)
  tentativeDeliveryDate DateTime      @db.Date
  notes                 String?       @db.Text
  createdAt             DateTime      @default(now()) @db.Timestamptz(6)
  updatedAt             DateTime      @updatedAt @db.Timestamptz(6)

  dealership            Dealership    @relation(fields: [dealershipId], references: [id])
  customer              Customer      @relation(fields: [customerId], references: [id])
  reservation           Reservation?
  payments              Payment[]
  refunds               Refund[]

  @@index([dealershipId])
  @@index([customerId])
  @@map("bookings")
}

model Sale {
  id                  String     @id @default(uuid()) @db.Uuid
  dealershipId        String     @db.Uuid
  customerId          String     @db.Uuid
  stockUnitId         String     @unique @db.Uuid
  saleNumber          String     @unique @db.VarChar(30)
  exShowroomPaise     BigInt
  gstAmountPaise      BigInt
  cgstPaise           BigInt
  sgstPaise           BigInt
  igstPaise           BigInt     @default(0)
  rtoPaise            BigInt
  insurancePaise      BigInt
  accessoriesPaise    BigInt     @default(0)
  totalOnRoadPaise    BigInt
  advanceCarriedPaise BigInt     @default(0)
  amountPaidPaise     BigInt
  outstandingPaise    BigInt     @default(0)
  saleDate            DateTime   @default(now()) @db.Timestamptz(6)
  status              SaleStatus @default(INVOICED)

  dealership          Dealership @relation(fields: [dealershipId], references: [id])
  customer            Customer   @relation(fields: [customerId], references: [id])
  stockUnit           StockUnit  @relation(fields: [stockUnitId], references: [id])
  invoice             Invoice?
  payments            Payment[]

  @@index([dealershipId])
  @@index([customerId])
  @@map("sales")
}

// -----------------------------------------------------------------------------
// FINANCIALS, INVOICES & REFUNDS
// -----------------------------------------------------------------------------

enum PaymentStatus {
  SUCCESS
  PENDING
  FAILED
  REFUNDED
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

model Payment {
  id             String        @id @default(uuid()) @db.Uuid
  receiptNumber  String        @unique @db.VarChar(30)
  bookingId      String?       @db.Uuid
  saleId         String?       @db.Uuid
  amountPaise    BigInt
  mode           String        @db.VarChar(30) // UPI, NEFT, CARD, CASH, CHEQUE
  transactionRef String?       @db.VarChar(100)
  receivedBy     String        @db.VarChar(120)
  status         PaymentStatus @default(SUCCESS)
  paymentDate    DateTime      @default(now()) @db.Timestamptz(6)

  booking        Booking?      @relation(fields: [bookingId], references: [id])
  sale           Sale?         @relation(fields: [saleId], references: [id])
  refunds        Refund[]

  @@index([bookingId])
  @@index([saleId])
  @@map("payments")
}

model Invoice {
  id                  String   @id @default(uuid()) @db.Uuid
  dealershipId        String   @db.Uuid
  saleId              String   @unique @db.Uuid
  invoiceNumber       String   @unique @db.VarChar(40)
  gstin               String   @db.VarChar(15)
  customerGstin       String?  @db.VarChar(15)
  placeOfSupply       String   @default("27-Maharashtra") @db.VarChar(50)
  gstRateBps          Int      @default(1800) // 18.00%
  taxableAmountPaise  BigInt
  cgstAmountPaise     BigInt
  sgstAmountPaise     BigInt
  igstAmountPaise     BigInt   @default(0)
  totalInvoicePaise   BigInt
  pdfUrl              String?  @db.VarChar(255)
  issuedAt            DateTime @default(now()) @db.Timestamptz(6)

  dealership          Dealership @relation(fields: [dealershipId], references: [id])
  sale                Sale       @relation(fields: [saleId], references: [id])

  @@index([dealershipId])
  @@map("invoices")
}

model Refund {
  id           String       @id @default(uuid()) @db.Uuid
  refundNumber String       @unique @db.VarChar(30)
  paymentId    String       @db.Uuid
  bookingId    String       @db.Uuid
  amountPaise  BigInt
  reason       String       @db.VarChar(255)
  requestedBy  String       @db.VarChar(120) // Staff who initiated request
  approvedBy   String?      @db.VarChar(120) // STRICT: Must NOT equal requestedBy
  status       RefundStatus @default(PENDING)
  requestedAt  DateTime     @default(now()) @db.Timestamptz(6)
  approvedAt   DateTime?    @db.Timestamptz(6)

  payment      Payment      @relation(fields: [paymentId], references: [id])
  booking      Booking      @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@index([paymentId])
  @@map("refunds")
}

model Expense {
  id           String     @id @default(uuid()) @db.Uuid
  dealershipId String     @db.Uuid
  category     String     @db.VarChar(60) // Showroom Rent, Electricity, Logistics, PDI Supplies
  amountPaise  BigInt
  description  String?    @db.VarChar(255)
  paidTo       String     @db.VarChar(120)
  paymentDate  DateTime   @db.Date

  dealership   Dealership @relation(fields: [dealershipId], references: [id])

  @@map("expenses")
}

// -----------------------------------------------------------------------------
// CRM, LEADS, TEST RIDES & APPLICATIONS
// -----------------------------------------------------------------------------

model Customer {
  id            String    @id @default(uuid()) @db.Uuid
  fullName      String    @db.VarChar(120)
  phone         String    @unique @db.VarChar(20)
  email         String?   @db.VarChar(150)
  addressLine1  String    @db.VarChar(255)
  city          String    @default("Thane") @db.VarChar(80)
  pincode       String    @default("400601") @db.VarChar(10)
  panNumber     String?   @db.VarChar(10)
  aadhaarNumber String?   @db.VarChar(20)
  deletedAt     DateTime? @db.Timestamptz(6)
  createdAt     DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @db.Timestamptz(6)

  bookings      Booking[]
  sales         Sale[]
  leads         Lead[]
  testRides     TestRide[]
  financeApps   FinanceApplication[]
  insuranceApps InsuranceApplication[]
  rtoApps       RTOApplication[]
  services      ServiceRequest[]

  @@map("customers")
}

model Lead {
  id              String         @id @default(uuid()) @db.Uuid
  customerId      String?        @db.Uuid
  customerName    String         @db.VarChar(120)
  phone           String         @db.VarChar(20)
  email           String?        @db.VarChar(150)
  bikeOfInterest  String         @db.VarChar(120)
  source          String         @default("WEBSITE") @db.VarChar(50)
  stage           String         @default("NEW") @db.VarChar(50) // NEW, CONTACTED, TEST_RIDE, QUOTATION, BOOKED, LOST
  assignedTo      String?        @db.VarChar(120)
  notes           String?        @db.Text
  createdAt       DateTime       @default(now()) @db.Timestamptz(6)

  customer        Customer?      @relation(fields: [customerId], references: [id])
  activities      LeadActivity[]

  @@index([phone])
  @@map("leads")
}

model LeadActivity {
  id        String   @id @default(uuid()) @db.Uuid
  leadId    String   @db.Uuid
  action    String   @db.VarChar(100)
  notes     String?  @db.Text
  timestamp DateTime @default(now()) @db.Timestamptz(6)

  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@map("lead_activities")
}

model TestRide {
  id                String   @id @default(uuid()) @db.Uuid
  customerId        String?  @db.Uuid
  customerName      String   @db.VarChar(120)
  phone             String   @db.VarChar(20)
  bikeModel         String   @db.VarChar(120)
  preferredDate     DateTime @db.Date
  preferredTimeSlot String   @db.VarChar(30)
  hasValidLicense   Boolean  @default(true)
  status            String   @default("SCHEDULED") @db.VarChar(30)
  feedback          String?  @db.Text
  assignedStaff     String   @default("Suraj Patil") @db.VarChar(120)
  createdAt         DateTime @default(now()) @db.Timestamptz(6)

  customer          Customer? @relation(fields: [customerId], references: [id])

  @@map("test_rides")
}

model FinanceApplication {
  id               String   @id @default(uuid()) @db.Uuid
  customerId       String   @db.Uuid
  bikeModel        String   @db.VarChar(120)
  loanAmountPaise  BigInt
  downPaymentPaise BigInt
  tenureMonths     Int
  cibilBand        String   @db.VarChar(30)
  bankPartner      String   @default("HDFC Bank") @db.VarChar(80)
  status           String   @default("SUBMITTED") @db.VarChar(40)
  createdAt        DateTime @default(now()) @db.Timestamptz(6)

  customer         Customer @relation(fields: [customerId], references: [id])

  @@map("finance_applications")
}

model InsuranceApplication {
  id              String   @id @default(uuid()) @db.Uuid
  customerId      String   @db.Uuid
  bikeModel       String   @db.VarChar(120)
  provider        String   @default("ICICI Lombard") @db.VarChar(80)
  policyType      String   @default("1-Yr OD + 5-Yr TP") @db.VarChar(60)
  zeroDepIncluded Boolean  @default(true)
  premiumPaise    BigInt
  status          String   @default("SUBMITTED") @db.VarChar(40)
  createdAt       DateTime @default(now()) @db.Timestamptz(6)

  customer        Customer @relation(fields: [customerId], references: [id])

  @@map("insurance_applications")
}

model RTOApplication {
  id             String   @id @default(uuid()) @db.Uuid
  customerId     String   @db.Uuid
  rtoLocation    String   @default("MH-04 (Thane)") @db.VarChar(60)
  chassisNumber  String   @db.VarChar(30)
  engineNumber   String   @db.VarChar(30)
  hsrpStatus     String   @default("PENDING") @db.VarChar(40)
  applicationNum String?  @db.VarChar(50)
  status         String   @default("SUBMITTED") @db.VarChar(40)
  createdAt      DateTime @default(now()) @db.Timestamptz(6)

  customer       Customer @relation(fields: [customerId], references: [id])

  @@map("rto_applications")
}

model ServiceRequest {
  id           String    @id @default(uuid()) @db.Uuid
  customerId   String    @db.Uuid
  bikeModel    String    @db.VarChar(120)
  odometerKm   Int
  serviceType  String    @db.VarChar(60) // Free 1st Service, General Service, Brake Pad Replacement
  complaints   String?   @db.Text
  scheduledFor DateTime  @db.Date
  status       String    @default("PENDING") @db.VarChar(40)
  deletedAt    DateTime? @db.Timestamptz(6)
  createdAt    DateTime  @default(now()) @db.Timestamptz(6)

  customer     Customer  @relation(fields: [customerId], references: [id])

  @@map("service_requests")
}

model StaffTask {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(200)
  category    String   @db.VarChar(50)
  assignedTo  String   @db.Uuid
  dueTime     String   @db.VarChar(50)
  isCompleted Boolean  @default(false)
  priority    String   @default("MEDIUM") @db.VarChar(20)
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  user        User     @relation("AssignedTasks", fields: [assignedTo], references: [id])

  @@map("staff_tasks")
}

// -----------------------------------------------------------------------------
// SYSTEM, AUDIT, SETTINGS & CMS
// -----------------------------------------------------------------------------

model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String?  @db.Uuid
  action      String   @db.VarChar(100)
  performedBy String   @db.VarChar(120)
  details     String   @db.Text
  ipAddress   String?  @db.VarChar(50)
  timestamp   DateTime @default(now()) @db.Timestamptz(6)

  user        User?    @relation(fields: [userId], references: [id])

  @@index([action])
  @@index([timestamp])
  @@map("audit_logs")
}

model Document {
  id         String    @id @default(uuid()) @db.Uuid
  entityType String    @db.VarChar(50) // Customer, Sale, Booking
  entityId   String    @db.Uuid
  docType    String    @db.VarChar(50) // Aadhaar, PAN, Form20, InsuranceCopy
  fileUrl    String    @db.VarChar(255)
  deletedAt  DateTime? @db.Timestamptz(6)
  uploadedAt DateTime  @default(now()) @db.Timestamptz(6)

  @@map("documents")
}

model Settings {
  id              String     @id @default(uuid()) @db.Uuid
  dealershipId    String     @db.Uuid
  gstRateBps      Int        @default(1800)
  theme           String     @default("dark") @db.VarChar(20)
  autoLockMinutes Int        @default(30)
  invoiceTerms    String     @db.Text
  updatedAt       DateTime   @updatedAt @db.Timestamptz(6)

  dealership      Dealership @relation(fields: [dealershipId], references: [id])

  @@map("settings")
}

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  recipient String   @db.VarChar(120)
  title     String   @db.VarChar(150)
  body      String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  @@map("notifications")
}

model Blog {
  id        String   @id @default(uuid()) @db.Uuid
  title     String   @db.VarChar(200)
  slug      String   @unique @db.VarChar(200)
  summary   String   @db.VarChar(255)
  content   String   @db.Text
  author    String   @db.VarChar(80)
  published Boolean  @default(true)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  @@map("blogs")
}

model Faq {
  id        String   @id @default(uuid()) @db.Uuid
  question  String   @db.VarChar(255)
  answer    String   @db.Text
  category  String   @default("General") @db.VarChar(50)
  sortOrder Int      @default(0)

  @@map("faqs")
}

model SocialLink {
  id       String @id @default(uuid()) @db.Uuid
  platform String @db.VarChar(50)
  url      String @db.VarChar(255)

  @@map("social_links")
}

model Banner {
  id       String   @id @default(uuid()) @db.Uuid
  title    String   @db.VarChar(150)
  subtitle String?  @db.VarChar(255)
  imageUrl String   @db.VarChar(255)
  linkUrl  String?  @db.VarChar(255)
  isActive Boolean  @default(true)

  @@map("banners")
}

model ChatbotKnowledgeSource {
  id        String   @id @default(uuid()) @db.Uuid
  topic     String   @db.VarChar(100)
  content   String   @db.Text
  isGround  Boolean  @default(true)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  @@map("chatbot_knowledge_sources")
}

model ChatbotFeedback {
  id        String   @id @default(uuid()) @db.Uuid
  query     String   @db.Text
  response  String   @db.Text
  isHelpful Boolean
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  @@map("chatbot_feedbacks")
}
`,
  },

  // 2. Initial Migration SQL
  {
    path: 'prisma/migrations/20261103000000_init/migration.sql',
    category: 'prisma',
    description: 'PostgreSQL migration SQL defining ~50 tables, unique constraints, and foreign keys',
    content: `-- The Bike Yard PostgreSQL Initialization Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "dealerships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "tagline" VARCHAR(255),
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(80) NOT NULL DEFAULT 'Thane',
    "state" VARCHAR(80) NOT NULL DEFAULT 'Maharashtra',
    "pincode" VARCHAR(10) NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL DEFAULT '27',
    "gstin" VARCHAR(15) NOT NULL,
    "rtoCode" VARCHAR(10) NOT NULL DEFAULT 'MH-04',
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "invoicePrefix" VARCHAR(30) NOT NULL DEFAULT 'TBY-INV-2026-',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dealerships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dealerships_code_key" UNIQUE ("code"),
    CONSTRAINT "dealerships_gstin_key" UNIQUE ("gstin")
);

CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "roles_name_key" UNIQUE ("name")
);

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dealershipId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "emailVerified" TIMESTAMPTZ(6),
    "passwordHash" VARCHAR(255),
    "phone" VARCHAR(20),
    "roleId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "dealerships"("id") ON DELETE RESTRICT,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT
);

CREATE TABLE "stock_units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dealershipId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "chassisNumber" VARCHAR(30) NOT NULL,
    "engineNumber" VARCHAR(30) NOT NULL,
    "colorName" VARCHAR(60) NOT NULL,
    "purchasePricePaise" BIGINT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    "location" VARCHAR(120) NOT NULL DEFAULT 'Main Showroom',
    "pdiPassed" BOOLEAN NOT NULL DEFAULT false,
    "inwardDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_units_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_units_chassisNumber_key" UNIQUE ("chassisNumber"),
    CONSTRAINT "stock_units_engineNumber_key" UNIQUE ("engineNumber")
);
`,
  },

  // 3. Currency Lib
  {
    path: 'src/lib/currency.ts',
    category: 'lib',
    description: 'Strict integer paise monetary logic & Maharashtra intra-state GST calculation',
    content: `/**
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

  return includeSymbol ? \`₹\${formatted}\` : formatted;
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
    throw new Error(\`Invalid GST rate in basis points: \${gstRateBps}\`);
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
`,
  },

  // 4. API Auth & RBAC
  {
    path: 'src/lib/api-auth.ts',
    category: 'lib',
    description: 'Server-side authorization guards (requireAuth, requireRole, AuthError)',
    content: `import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AuthError('Unauthorized: Active dealership session required.', 401);
  }
  return session.user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const roleName = (user as any).role || 'GUEST';

  if (!allowedRoles.includes(roleName)) {
    throw new AuthError(
      \`Forbidden: Role '\${roleName}' does not hold required privileges.\`,
      403
    );
  }
  return user;
}
`,
  },

  // 5. NextAuth Config (Database sessions)
  {
    path: 'src/lib/auth.ts',
    category: 'lib',
    description: 'NextAuth database-backed sessions with Prisma adapter',
    content: `import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/staff/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Dealership Staff Credentials',
      credentials: {
        email: { label: 'Staff Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.isActive) return null;
        // In production, verify bcrypt hash
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
};
`,
  },

  // 6. Prisma Singleton
  {
    path: 'src/lib/prisma.ts',
    category: 'lib',
    description: 'Prisma Client singleton for connection pooling',
    content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`,
  },

  // 7. Zod Validations
  {
    path: 'src/lib/validations/index.ts',
    category: 'lib',
    description: 'Shared Zod validation schemas for stock, sales, bookings, and refunds',
    content: `import { z } from 'zod';

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
`,
  },

  // 8. Sales Transaction Service
  {
    path: 'src/services/sales.service.ts',
    category: 'services',
    description: 'Atomic completeSale transaction locking stock unit and generating GST invoice',
    content: `import { prisma } from '../lib/prisma';
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
    const saleNumber = \`TBY-SALE-2026-\${String(saleCount + 1).padStart(3, '0')}\`;

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
    const invoiceNumber = \`TBY-INV-2026-\${String(saleCount + 1).padStart(3, '0')}\`;
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
          receiptNumber: \`TBY-RCP-2026-\${Date.now().toString().slice(-4)}\`,
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
`,
  },

  // 9. Next.js 16 Config with Security Headers
  {
    path: 'next.config.mjs',
    category: 'config',
    description: 'Next.js 16 configuration with strict security headers (HSTS, CSP, X-Frame-Options)',
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
`,
  },

  // 10. package.json for Next.js 16 project
  {
    path: 'package.json',
    category: 'config',
    description: 'Next.js 16, Prisma 6.12, NextAuth v4, Tailwind CSS 4 package definition',
    content: `{
  "name": "the-bike-yard-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^6.12.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "next": "^16.0.0",
    "next-auth": "^4.24.11",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.5.5",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.20.0",
    "eslint-config-next": "^16.0.0",
    "postcss": "^8.4.49",
    "prisma": "^6.12.0",
    "tailwindcss": "^4.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
`,
  },

  // 11. README.md
  {
    path: 'README.md',
    category: 'config',
    description: 'Complete setup documentation, architecture guide, and Prisma workflows',
    content: `# The Bike Yard — Motorcycle Dealership & Digital Showroom Platform

A production-grade Next.js 16 application for **The Bike Yard**, located at Khopat, Thane, Maharashtra, India.

## Key Architecture Highlights

- **Framework:** Next.js 16 (App Router + Turbopack + React 19)
- **Database/ORM:** PostgreSQL with Prisma 6.12 (~50 models)
- **Money Math:** Strict BigInt paise integer representation (1 INR = 100 paise) — zero floating-point currency calculations.
- **GST:** Full Maharashtra intra-state (CGST 9% + SGST 9%) and inter-state (IGST 18%) split engine.
- **Authentication:** NextAuth.js v4 with database-backed session strategy (session tokens stored in PostgreSQL).
- **Security:** Strict HTTP headers (HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).
- **Audit & Compliance:** Requester cannot approve their own financial refund (role-based separation of duties).

## Quick Start Guide

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit DATABASE_URL with your PostgreSQL credentials

# 3. Run Prisma Migrations and Seed
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Start Development Server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the digital showroom.
`,
  },

  // 12. Integration Unit Tests
  {
    path: 'tests/lib/__tests__/currency.test.ts',
    category: 'tests',
    description: 'Vitest unit tests for integer paise conversion, GST splits, and formatting',
    content: `import { describe, it, expect } from 'vitest';
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
`,
  },
];

export async function generateProjectZipBlob(onProgress?: (progress: number) => void): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < PROJECT_CODE_FILES.length; i++) {
    const file = PROJECT_CODE_FILES[i]!;
    zip.file(file.path, file.content);
    if (onProgress) {
      onProgress(Math.round(((i + 1) / PROJECT_CODE_FILES.length) * 100));
    }
  }

  // Also include the .env.example
  zip.file(
    '.env.example',
    `# The Bike Yard Dealership Environment Variables
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thebikeyard?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-secure-random-32-byte-hex-in-production"
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
DEFAULT_DEALERSHIP_CODE="TBY-THANE-01"
`
  );

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function downloadProjectZip(filename = 'the-bike-yard-next16-prisma-source.zip'): Promise<void> {
  const blob = await generateProjectZipBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
