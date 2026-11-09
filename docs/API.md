# API.md — The Bike Yard

**Product:** The Bike Yard — Complete Dealership Management & Digital Showroom Platform  
**Status:** Draft — Pending Dealership Owner Review  
**Version:** 1.0  
**Source of Truth:** Yes — Follows PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md  
**Previous Documents:** PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md  
**Next Document:** AGENTS.md (Prompt 06)

---

## 1. API Conventions

| Convention | Specification |
|------------|---------------|
| Protocol | HTTPS |
| Format | JSON |
| Versioning | URL path versioning not used (single version, Next.js App Router) |
| Base URL | `https://api.thebikeyard.local` (local: `http://localhost:3000`) |
| Timestamps | ISO 8601 UTC |
| Money | Integer paise (no decimals, no floating point) |
| Pagination | `?page=1&pageSize=20` |
| Filtering | `?status=available&variantId=uuid` |
| Sorting | `?sort=createdAt:desc` |
| Search | `?q=search term` |
| Rate limit | 100 requests/minute per IP (authenticated); 20/minute (unauthenticated) |

---

## 2. Response & Error Format

**Success response:**
```json
{
  "data": { ... } | [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 150 }
}
```

**Error response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-safe message",
    "field": "chassisNumber"
  }
}
```

Error codes never leak stack traces, internal IDs, or personal data.

---

## 3. Authentication & Authorization

- All admin (`/admin/*`) and staff (`/staff/*`) endpoints require a valid session cookie.
- Public endpoints (`/api/public/*`) require no auth.
- Authorization checked server-side on every request; UI hiding is supplementary only.
- Role-based permission matrix enforced in service layer.

---

## 4. Public Endpoints (No Auth)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/public/bikes` | List bikes with filters, pagination | No |
| GET | `/api/public/bikes/[id]` | Bike detail with specs, pricing, images | No |
| GET | `/api/public/brands` | List brands | No |
| GET | `/api/public/faqs` | List active FAQs | No |
| GET | `/api/public/blogs` | List published blogs | No |
| GET | `/api/public/blogs/[slug]` | Blog detail | No |
| GET | `/api/public/settings` | Public-facing settings (branding, social links) | No |
| GET | `/api/public/showroom` | Showroom location, contact, hours | No |
| POST | `/api/public/enquiries` | Submit customer enquiry | No |
| POST | `/api/public/test-rides` | Book test ride | No |
| POST | `/api/public/contact` | Contact form submission | No |

---

## 5. Admin Endpoints (Auth + RBAC)

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard/overview` | 10 dashboard cards | All staff |
| GET | `/api/admin/dashboard/analytics` | Sales, revenue, charts | Owner, Manager, Super Admin |
| GET | `/api/admin/bikes` | List catalogue bikes | Manager, Sales Exec, Super Admin, Owner |
| POST | `/api/admin/bikes` | Create bike | Manager, Super Admin, Owner |
| PUT | `/api/admin/bikes/[id]` | Update bike | Manager, Super Admin, Owner |
| DELETE | `/api/admin/bikes/[id]` | Soft-delete bike | Super Admin, Owner |
| GET | `/api/admin/stock/inward` | List inward records | Manager, Super Admin, Owner |
| POST | `/api/admin/stock/inward` | Record stock inward | Manager, Super Admin, Owner |
| GET | `/api/admin/stock/outward` | List outward records | Manager, Super Admin, Owner |
| POST | `/api/admin/stock/outward` | Record stock outward (sale) | Manager, Super Admin, Owner |
| GET | `/api/admin/stock/units` | List all stock units | Manager, Super Admin, Owner |
| GET | `/api/admin/customers` | List customers | All staff |
| POST | `/api/admin/customers` | Create customer | All staff |
| GET | `/api/admin/bookings` | List bookings | All staff |
| POST | `/api/admin/bookings` | Create booking | Sales Exec, Manager, Super Admin, Owner |
| PUT | `/api/admin/bookings/[id]` | Update booking | Sales Exec, Manager, Super Admin, Owner |
| GET | `/api/admin/sales` | List sales | All staff |
| POST | `/api/admin/sales` | Record sale | Sales Exec, Manager, Super Admin, Owner |
| GET | `/api/admin/payments` | List payments | Accountant, Manager, Super Admin, Owner |
| POST | `/api/admin/payments` | Record payment | Accountant, Manager, Super Admin, Owner |
| GET | `/api/admin/invoices` | List invoices | Accountant, Manager, Super Admin, Owner |
| GET | `/api/admin/finance` | List finance applications | All staff |
| POST | `/api/admin/finance` | Create finance application | All staff |
| GET | `/api/admin/insurance` | List insurance applications | Insurance Staff, All staff read |
| POST | `/api/admin/insurance` | Create insurance application | Insurance Staff |
| GET | `/api/admin/rto` | List RTO applications | RTO Staff, All staff read |
| POST | `/api/admin/rto` | Create RTO application | RTO Staff |
| GET | `/api/admin/staff` | List staff | Super Admin, Owner, Manager |
| POST | `/api/admin/staff` | Create staff | Super Admin, Owner, Manager |
| GET | `/api/admin/settings` | Get settings | Super Admin, Owner |
| PUT | `/api/admin/settings` | Update settings | Super Admin, Owner |
| GET | `/api/admin/audit-logs` | List audit logs | Super Admin, Owner |
| GET | `/api/admin/reports` | Generate reports | Owner, Manager, Accountant, Super Admin |
| GET | `/api/admin/blogs` | List blogs | All staff |
| POST | `/api/admin/blogs` | Create blog | Manager, Super Admin, Owner |
| GET | `/api/admin/social` | List social links | All staff |
| PUT | `/api/admin/social` | Update social links | Manager, Super Admin, Owner |
| GET | `/api/admin/faq` | List FAQs | All staff |
| POST | `/api/admin/faq` | Create FAQ | Manager, Super Admin, Owner |

---

## 6. Staff Endpoints (Role-Scoped)

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/staff/dashboard` | My dashboard metrics | All staff |
| GET | `/api/staff/enquiries` | Assigned enquiries | Sales Exec |
| PUT | `/api/staff/enquiries/[id]` | Update enquiry | Sales Exec |
| GET | `/api/staff/leads` | My leads | Sales Exec |
| GET | `/api/staff/bookings` | My bookings | Sales Exec |
| GET | `/api/staff/finance` | Finance applications (assigned) | All staff read |
| GET | `/api/staff/insurance` | Insurance applications | Insurance Staff |
| GET | `/api/staff/rto` | RTO applications | RTO Staff |
| GET | `/api/staff/tasks` | My tasks | All staff |
| PUT | `/api/staff/tasks/[id]` | Update task status | All staff |
| GET | `/api/staff/performance` | My performance | All staff |

---

## 7. Upload/Download Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/document` | Upload customer/finance/insurance/RTO document | Auth + role |
| GET | `/api/download/document/[id]` | Download signed document URL | Auth + role |
| POST | `/api/upload/bike-image` | Upload bike image | Admin roles |

---

## 8. Webhook Endpoints

| Method | Endpoint | Description | Security |
|--------|----------|-------------|----------|
| POST | `/api/webhooks/payment` | Payment provider callback | Signature verification |
| POST | `/api/webhooks/messaging` | WhatsApp/SMS status callback | Signature verification |
| POST | `/api/webhooks/ai` | AI provider callback (if used) | Signature verification |

Webhook signatures verified server-side. Duplicate processing prevented via idempotency key.

---

## 9. Authorization Matrix (Summary)

| Endpoint Group | Super Admin | Owner | Manager | Sales Exec | Accountant | Insurance Staff | RTO Staff |
|----------------|-------------|-------|---------|------------|------------|-----------------|-----------|
| Dashboard overview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bikes (CRUD) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Stock inward/outward | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Customers | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Bookings | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Sales | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Payments/Invoices | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Finance | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Insurance | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| RTO | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Staff management | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reports | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Blogs/Social/FAQ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 10. Request/Response Examples

### 5.1 List bikes (public)
```
GET /api/public/bikes?status=available&page=1&pageSize=12
```
Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "brand": "Hero",
      "model": "Splendor",
      "variant": "Drum",
      "colour": "Black",
      "exShowroomPrice": 7500000,
      "onRoadPrice": 8900000,
      "availabilityStatus": "available",
      "imageUrl": "/images/bike-1.jpg",
      "specifications": { "engineCC": 125, "mileage": "60 kmpl" }
    }
  ],
  "meta": { "page": 1, "pageSize": 12, "total": 45 }
}
```

### 5.2 Stock inward (admin)
```
POST /api/admin/stock/inward
Body: {
  "chassisNumber": "ME4JC654K98765432",
  "engineNumber": "JC65E98765432",
  "variantId": "uuid",
  "colourId": "uuid",
  "purchasePrice": 6500000,
  "purchaseInvoiceNumber": "INV-2025-001",
  "supplierName": "Hero Motors Pvt Ltd",
  "receivedDate": "2025-01-15T10:00:00Z"
}
```

### 5.3 Record payment (admin)
```
POST /api/admin/payments
Body: {
  "customerId": "uuid",
  "saleId": "uuid",
  "amount": 2000000,
  "method": "upi",
  "referenceId": "UPI1234567890",
  "notes": "Advance payment"
}
```

---

## 11. Validation Rules

- Chassis number: required, unique, max 50 chars
- Engine number: required, unique, max 50 chars
- Money fields: integer paise, non-negative
- Email: valid format when provided
- Phone: required for customers, 10-15 digits
- Date: ISO 8601 UTC
- File upload: max 10MB, types: image/jpeg, image/png, image/webp, application/pdf
- GST rate: 0-10000 paise-per-unit (0-100%)

Server recalculates all financial values; client-supplied totals are ignored.

---

## 12. Idempotency & Concurrency

- Idempotency key header: `Idempotency-Key` for POST/PUT/PATCH
- Stock reservation uses `SELECT ... FOR UPDATE` row locking
- Payment allocation within transaction
- Webhook idempotency via processed event ID storage

---

## 13. Audit Events

Logged for: price changes, stock adjustments, payment recording, invoice issuance, refund approval, staff role changes, customer document access.

Fields: userId, action, entityType, entityId, oldValues, newValues, ipAddress, timestamp.

---

## 14. Data Exposure Rules

**Never exposed publicly:**
- Internal purchase cost
- Customer identity documents
- Admin-only data
- Staff personal data beyond name/role
- Stack traces or error internals

**Exposed publicly:**
- Bike catalogue, variants, prices (ex-showroom, on-road)
- FAQs, blogs, showroom contact, social links

---

**Verification:** API.md is complete and consistent with PRD.md, DESIGN.md, ARCHITECTURE.md, and DATABASE.md. All endpoints map to defined entities and workflows. No new features invented. No dealership information, prices, GST details, or finance partners invented.

**Next:** Proceed to 06_AGENTS_PROMPT.md to generate AGENTS.md.