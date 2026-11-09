# ARCHITECTURE.md — The Bike Yard

**Product:** The Bike Yard — Complete Dealership Management & Digital Showroom Platform  
**Status:** Draft — Pending Dealership Owner Review  
**Version:** 1.0  
**Source of Truth:** Yes — Follows PRD.md and DESIGN.md as authoritative  
**Previous Documents:** PRD.md (Prompt 01), DESIGN.md (Prompt 02)  
**Next Document:** DATABASE.md (Prompt 04)

---

## 1. Recommended Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (App Router, React) | Single repo for public website, admin dashboard, and staff portal; Server Components reduce client JS; SSR/SSG for public pages |
| Language | TypeScript | Type safety across frontend and backend; shared types between API and UI |
| UI Styling | Tailwind CSS | Utility-first; aligns with DESIGN.md tokens; dark mode support via class strategy |
| Component Library | shadcn/ui | Accessible primitives (dialog, table, form, dropdown-menu); copy-paste source code, no hidden runtime |
| Backend | Next.js API Routes + Server Actions | Server-side business logic; keeps permissions and financial calculations server-side; shared with frontend |
| Database | PostgreSQL | Relational integrity for chassis/engine uniqueness, transactions, foreign keys; hosted on a managed provider |
| ORM | Prisma | Type-safe database client; migrations; seeding; fits relational model |
| Authentication | Auth.js (NextAuth) | Session-based auth; role-based access; provider-agnostic; secrets server-side |
| Charts | Recharts | Dashboard analytics (line, bar, donut); React-native |
| Forms | React Hook Form + Zod | Client validation with server re-validation; Zod schemas shared with API |
| File Storage | S3-compatible (e.g., AWS S3, Cloudflare R2, MinIO locally) | Bike images, customer documents, invoices; provider-interface abstraction |
| PDF Generation | PDFKit or similar (Node.js) | Invoice, receipt, booking document generation server-side |
| AI | Pluggable provider (LangChain-style abstraction or direct SDK) | Chatbot retrieval over dealership-managed content; provider swappable |
| Deployment | Vercel (or Docker-capable platform) | Next.js-native deployment; preview deployments per branch |
| Testing | Vitest + React Testing Library + Playwright | Unit, component, and E2E coverage |

**No technologies beyond those justified by the product are included.**

---

## 2. Application Architecture

### 2.1 High-Level Structure

One application, one central database, three interfaces, shared business logic.

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Public Site  │  │ Admin Portal │  │ Staff Portal     │  │
│  │ (pages/)     │  │ (admin/)     │  │ (staff/)         │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────────┘  │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           ▼                                 │
│              ┌──────────────────────┐                       │
│              │  Server Actions /    │                       │
│              │  API Routes (shared) │                       │
│              └──────────┬───────────┘                       │
│                         │                                     │
│              ┌──────────▼───────────┐                       │
│              │  Business Logic Layer │                       │
│              │  (services, valid.)   │                       │
│              └──────────┬───────────┘                       │
│                         │                                     │
│              ┌──────────▼───────────┐                       │
│              │  Prisma ORM           │                       │
│              └──────────┬───────────┘                       │
│                         │                                     │
│              ┌──────────▼───────────┐                       │
│              │  PostgreSQL          │                       │
│              │  (central database)  │                       │
│              └──────────────────────┘                       │
│                         │                                     │
│              ┌──────────▼───────────┐                       │
│              │  S3-compatible Storage│                      │
│              │  (images, documents) │                       │
│              └──────────────────────┘                       │
│                         │                                     │
│              ┌──────────▼───────────┐                       │
│              │  External Providers   │                       │
│              │  (payment, AI, msg)   │                       │
│              └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Interface Boundaries

| Interface | Route Prefix | Auth Required | Primary Purpose |
|-----------|-------------|---------------|-----------------|
| Public Website | `/` | No (except admin-only routes hidden) | Browse bikes, enquire, book test ride, chatbot |
| Admin Dashboard | `/admin` | Yes (RBAC) | Full dealership operations |
| Staff Portal | `/staff` | Yes (role-scoped) | Assigned tasks, leads, bookings |

Shared code lives in `lib/`, `services/`, `validators/`, `components/ui/`.

---

## 3. Frontend/Backend Boundaries

### 3.1 Server-Side Business Logic

All business rules that affect money, stock, permissions, or data integrity run **server-only**:

- Price calculations (ex-showroom → on-road → final selling price)
- Stock reservation and decrement (transactions)
- Payment allocation and receipt generation
- Invoice number generation and GST calculation
- Role-based authorization checks
- Chassis/engine number uniqueness validation
- Webhook signature verification (payment/messaging providers)

Client-side code may:
- Validate UX (form fields, loading states)
- Display data fetched from server
- Submit forms to Server Actions

Client code **never** supplies trusted totals, prices, permissions, or stock status.

### 3.2 API Contract

- Next.js Server Actions for form mutations within the app
- API Routes (`/api/...`) for external webhooks and potential future mobile clients
- JSON response format: `{ data, error, meta }`
- Error responses: `{ error: { code, message } }` — no stack traces or internal details to client

---

## 4. Repository & Folder Structure

```
the-bike-yard/
├── docs/                         # Project documentation (PRD, DESIGN, ARCHITECTURE, etc.)
├── prisma/
│   ├── schema.prisma             # Data model
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Seed data (fictional, clearly marked)
├── public/                       # Static assets (logos, favicons, placeholder images)
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── (public)/             # Public website routes
│   │   │   ├── page.tsx          # Home
│   │   │   ├── bikes/[slug]/     # Bike detail
│   │   │   ├── finance/          # Finance info
│   │   │   ├── insurance/        # Insurance info
│   │   │   ├── rto/              # RTO info
│   │   │   ├── services/         # Services
│   │   │   ├── blogs/[slug]/     # Blog detail
│   │   │   ├── about/            # About
│   │   │   ├── contact/          # Contact
│   │   │   ├── faq/              # FAQ
│   │   │   └── layout.tsx        # Public layout
│   │   ├── (admin)/              # Admin dashboard routes
│   │   │   ├── dashboard/        # Overview
│   │   │   ├── sales/            # Sales management
│   │   │   ├── inventory/        # Stock inward/outward/management
│   │   │   ├── customers/        # Customer management
│   │   │   ├── bookings/         # Booking management
│   │   │   ├── finance/          # Finance management
│   │   │   ├── insurance/        # Insurance management
│   │   │   ├── rto/              # RTO registration
│   │   │   ├── payments/         # Payments
│   │   │   ├── invoices/         # Bills & invoices
│   │   │   ├── staff/            # Staff management
│   │   │   ├── tasks/            # Daily tasks
│   │   │   ├── reports/          # Reports & analytics
│   │   │   ├── blogs/            # Blogs management
│   │   │   ├── social/           # Social media
│   │   │   ├── faq/              # FAQ management
│   │   │   ├── requirements/     # Requirements
│   │   │   └── settings/         # Settings
│   │   ├── (staff)/              # Staff portal routes
│   │   │   ├── dashboard/        # My Dashboard
│   │   │   ├── enquiries/        # Customer Enquiries
│   │   │   ├── leads/            # Sales Leads
│   │   │   ├── bookings/         # Bookings
│   │   │   ├── insurance/        # Insurance Forms
│   │   │   ├── registration/     # Registration Forms
│   │   │   ├── finance/          # Finance Applications
│   │   │   ├── service/          # Service Requests
│   │   │   ├── tasks/            # Daily Tasks
│   │   │   └── performance/      # My Performance
│   │   ├── api/                  # API Routes (webhooks, shared endpoints)
│   │   │   ├── webhooks/         # Payment, messaging webhooks
│   │   │   └── ...
│   │   ├── auth/                 # Auth.js routes (sign-in, sign-out, callback)
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Root redirect
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, dialog, table, etc.)
│   │   ├── public/               # Public website components (Hero, BikeCard, etc.)
│   │   ├── admin/                # Admin dashboard components
│   │   ├── staff/                # Staff portal components
│   │   └── shared/               # Shared components (Navbar, Footer, Chatbot)
│   ├── lib/                      # Shared utilities
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # Auth.js configuration
│   │   ├── validations/          # Zod schemas (shared client/server)
│   │   ├── currency.ts           # Money handling (paise integers)
│   │   ├── date.ts               # UTC storage, Asia/Kolkata display
│   │   ├── storage.ts            # S3-compatible storage abstraction
│   │   ├── pdf.ts                # PDF generation
│   │   ├── ai.ts                 # AI provider abstraction
│   │   └── notifications.ts      # Notification abstraction
│   ├── services/                 # Business logic layer
│   │   ├── bike.service.ts       # Catalogue, variants, pricing
│   │   ├── stock.service.ts      # Inward, outward, reservations
│   │   ├── customer.service.ts   # CRM
│   │   ├── sales.service.ts      # Sales, deliveries
│   │   ├── payment.service.ts    # Payments, receipts, invoices
│   │   ├── finance.service.ts    # Loan applications
│   │   ├── insurance.service.ts  # Insurance policies
│   │   ├── rto.service.ts        # Registration cases
│   │   ├── staff.service.ts      # Staff, roles, permissions
│   │   ├── task.service.ts       # Daily tasks
│   │   ├── blog.service.ts       # CMS
│   │   ├── settings.service.ts   # Appearance/business settings
│   │   ├── audit.service.ts      # Activity logging
│   │   └── chatbot.service.ts    # AI chatbot retrieval
│   ├── middleware.ts             # Route protection, RBAC enforcement
│   ├── types/                    # TypeScript type declarations
│   └── styles/                   # Global CSS, Tailwind config, design tokens
├── .env.example                  # Safe example environment variables
├── .env.local                    # Local secrets (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── vitest.config.ts              # Test configuration
```

**Responsibility of each major directory:**

| Directory | Responsibility |
|-----------|---------------|
| `prisma/` | Data model, migrations, seed |
| `src/app/` | Route handlers, page components, layout |
| `src/components/ui/` | Atomic, accessible UI primitives |
| `src/components/public/` | Public-facing UI (bike cards, hero, filters) |
| `src/components/admin/` | Admin-specific UI (data tables, forms, charts) |
| `src/components/staff/` | Staff-scoped UI (task lists, lead cards) |
| `src/components/shared/` | Cross-interface UI (chatbot, navbar, footer) |
| `src/lib/` | Low-level utilities (Prisma, Auth, storage, currency) |
| `src/services/` | Business logic, transactions, validation |
| `src/middleware.ts` | Route guards, role enforcement |

---

## 5. Authentication & Authorization Integration

### 5.1 Authentication Strategy

- **Provider:** Auth.js (NextAuth) with Credentials provider for staff login
- **Session strategy:** Database-backed sessions (JWT not required; session stored in DB)
- **Passwords:** bcrypt/argon2 hashed server-side; never stored plain text
- **Cookies:** `HttpOnly`, `Secure`, `SameSite=lax`
- **Session expiry:** Configurable (e.g., 8 hours idle); refresh on activity
- **Sign-out:** Invalidates server-side session

### 5.2 Authorization Strategy

- **Roles:** Super Admin, Owner, Manager, Sales Executive, Accountant, Insurance Staff, RTO Staff
- **Permissions:** Fine-grained per module/action (read, create, update, delete, approve)
- **Enforcement:** Server-side in middleware and Service layer; UI hiding is supplementary only
- **Route protection:** Middleware checks session + role before rendering admin/staff pages
- **API protection:** Server Actions and API Routes verify permissions on every call

### 5.3 Authorization Matrix (Summary)

| Route/Action | Super Admin | Owner | Manager | Sales Exec | Accountant | Insurance Staff | RTO Staff |
|--------------|-------------|-------|---------|------------|------------|-----------------|-----------|
| Dashboard overview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bike catalogue (CRUD) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Stock inward/outward | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Customer management | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Bookings | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Sales | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Payments/invoices | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Finance applications | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Insurance applications | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| RTO registration | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Staff management | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Reports | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 6. Database Access Pattern & Transaction Boundaries

### 6.1 Access Pattern

- All database access goes through Prisma client
- Service layer wraps Prisma calls; routes/controllers never call Prisma directly
- Read operations use `findUnique`, `findMany` with `select` to avoid over-fetching
- Write operations go through Service methods that enforce business rules

### 6.2 Transaction Boundaries

Database transactions are required for:

| Operation | Transaction Scope |
|-----------|-------------------|
| Stock inward | Create purchase record + create bike unit + update stock count (atomic) |
| Stock reservation | Create booking + mark unit as reserved (atomic) |
| Sale completion | Create sale + mark unit as sold + create payment + create invoice (atomic) |
| Payment allocation | Create payment + update outstanding + create receipt (atomic) |
| Refund | Create refund + reverse payment allocation + reopen stock if needed (atomic) |
| Booking cancellation | Release reservation + mark unit as available + refund advance (atomic) |

Isolation level: `ReadCommitted` (default) with explicit `prisma.$transaction()`.

---

## 7. File/Document Storage Strategy

### 7.1 Abstraction

Storage provider is abstracted behind `src/lib/storage.ts` with interface:

```ts
interface StorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<{ url: string }>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn: number): Promise<string>
}
```

### 7.2 What Is Stored

- Bike images (catalogue and detail gallery)
- Customer identity documents (uploaded during finance/insurance/RTO)
- Insurance policy documents
- RTO registration documents
- Generated invoices and receipts (PDF)
- Branding assets (logo, favicon)

### 7.3 Security

- Private bucket; no public read access
- Signed URLs for document download (time-limited)
- Customer documents accessible only to authorized staff roles
- File type validation (images: JPEG/PNG/WebP; documents: PDF only)
- File size limits enforced server-side
- Virus scanning recommended for production (optional integration)

### 7.4 Provider

- Development: Local filesystem or MinIO (S3-compatible)
- Production: AWS S3 or Cloudflare R2
- Switchable via interface abstraction

---

## 8. Background Jobs, Notifications & Scheduled Tasks

### 8.1 Background Jobs

- **Invoice/PDF generation:** Triggered on sale completion; stored to storage
- **Payment reconciliation:** Daily job matching provider webhooks to internal records
- **Follow-up reminders:** Daily check for pending enquiries older than configurable threshold
- **Stock alerts:** Daily check for low stock or units pending too long
- **Daily closing:** End-of-day reconciliation job (cash, UPI, bank, card collections)

### 8.2 Implementation

- Next.js Cron (Vercel Cron) or external scheduler for scheduled tasks
- Queue abstraction for future migration to BullMQ/Redis if volume justifies it
- Jobs are idempotent (safe to retry)

### 8.3 Notifications

- **In-app:** Database notifications table; shown in dashboard bell
- **Email:** Abstraction layer; provider TBD (SendGrid/AWS SES/etc.)
- **SMS/WhatsApp:** Abstraction layer; provider TBD (Twilio/WhatsApp Business/etc.)
- Templates defined; provider integration optional for MVP

---

## 9. Search, Logging, Monitoring, Error Handling & Backups

### 9.1 Search

- Full-text search via PostgreSQL `ILIKE` or `tsvector` for bikes, customers, enquiries
- No external search engine (Elasticsearch/Algolia) justified for MVP

### 9.2 Logging

- Structured JSON logs (pino or similar)
- Request ID correlation
- Log levels: error, warn, info, debug
- Financial and privileged actions logged with user ID and timestamp

### 9.3 Monitoring

- Uptime monitoring (platform-provided)
- Error tracking (Sentry or similar; optional for MVP)
- Database query performance monitoring

### 9.4 Error Handling

- Server: try/catch at service layer; structured error responses
- Client: error boundaries, retry buttons, user-safe messages (no internal details)
- Unhandled promise rejections logged and reported

### 9.5 Backups

- Database: Managed provider automated daily backups; point-in-time recovery
- Storage: Versioning enabled; cross-region replication recommended
- Backup restoration tested quarterly (procedure documented in DEBUGGING.md)

---

## 10. Deployment Environments

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| Local | Developer workstation | Synthetic seed data | Developer only |
| Test/Staging | Pre-production validation | Synthetic/anonymized data | Team + owner |
| Production | Live dealership | Real customer data | Public (site), staff (admin/staff) |

### Deployment Flow

1. Feature branch → PR → Preview deployment (Vercel)
2. PR merged to `main` → Staging deployment
3. Owner approval → Production deployment (manual trigger or tag)
4. Database migrations run via `prisma migrate deploy` in CI/CD

---

## 11. Configuration & Environment Variables

### 11.1 Strategy

- `.env.example` committed with safe placeholder values
- `.env.local` gitignored; never committed
- Production secrets injected via platform environment variables
- All secrets server-side only (`NEXT_PUBLIC_` prefix only for truly public values)

### 11.2 Required Environment Variables

| Variable | Purpose | Example (placeholder) |
|----------|---------|----------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/bikeyard` |
| `NEXTAUTH_SECRET` | Auth.js session signing key | `32-byte-random-string` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `STORAGE_PROVIDER` | `s3` or `local` | `local` |
| `S3_BUCKET_NAME` | Storage bucket | `bikeyard-dev` |
| `S3_ACCESS_KEY_ID` | Storage credentials | `AKIA...` |
| `S3_SECRET_ACCESS_KEY` | Storage credentials | `...` |
| `AI_PROVIDER` | `openai` or `anthropic` or `stub` | `stub` |
| `AI_API_KEY` | AI provider key | `sk-...` |
| `PAYMENT_PROVIDER` | Payment adapter | `stub` |
| `BASE_URL` | Public site URL | `https://thebikeyard.example.com` |

**Never** include real secrets, API keys, passwords, or production database URLs in documentation.

---

## 12. Scalability, Performance, Accessibility & Security

### Scalability
- Modular monolith; services can be extracted later if justified
- Database read replicas optional for reporting queries
- CDN for static assets and bike images

### Performance
- Public pages: SSG/ISR for bike catalogue; ISR revalidation on stock/price changes
- Admin: Server Components; minimal client JS
- Images: Optimized via Next.js Image; lazy loading
- Database: Indexes on frequently queried fields (chassis number, customer email, status, date)

### Accessibility
- WCAG 2.1 AA target
- Keyboard navigation, focus rings, contrast, labels
- Respect `prefers-reduced-motion`

### Security
- Server-side authorization enforcement
- CSRF protection (Auth.js handles)
- XSS: Content Security Policy, output encoding
- SQL injection: Prisma parameterized queries
- Upload security: File type/size validation, virus scanning recommended
- Secrets: Server-side only; no secrets in bundle

---

## 13. Architecture Diagrams (Mermaid)

### 13.1 System Overview

```mermaid
graph TD
    Customer[Customer Browser] -->|HTTPS| Public[Public Website /]
    Staff[Staff Browser] -->|HTTPS| StaffPortal[Staff Portal /staff]
    Admin[Admin Browser] -->|HTTPS| AdminPortal[Admin Dashboard /admin]
    
    Public --> Next[Next.js Application]
    StaffPortal --> Next
    AdminPortal --> Next
    
    Next --> Auth[(Auth.js Sessions)]
    Next --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
    
    Next --> Storage[S3-compatible Storage]
    Next --> AI[AI Provider]
    Next --> Pay[Payment Provider]
    Next --> Msg[Messaging Provider]
    
    Next --> Webhooks[Webhook Endpoints]
    Pay -.->|callback| Webhooks
    Msg -.->|callback| Webhooks
```

### 13.2 Stock Transaction Flow

```mermaid
sequenceDiagram
    participant SE as Sales Executive
    participant SA as Server Action
    participant SVC as Stock Service
    participant DB as PostgreSQL
    
    SE->>SA: Submit sale (chassis, customer, payment)
    SA->>SVC: validateBikeAvailable(chassis)
    SVC->>DB: SELECT ... FOR UPDATE (lock unit)
    DB-->>SVC: unit status = available
    SVC->>SVC: validate chassis/engine uniqueness
    SVC->>DB: BEGIN TRANSACTION
    SVC->>DB: CREATE sale record
    SVC->>DB: UPDATE unit status = sold
    SVC->>DB: CREATE payment + receipt
    SVC->>DB: CREATE invoice (immutable snapshot)
    SVC->>DB: COMMIT
    DB-->>SVC: success
    SVC-->>SA: sale complete
    SA-->>SE: confirmation + invoice
```

---

## 14. Key Technical Decisions & Alternatives Rejected

| Decision | Choice | Alternative Rejected | Reason |
|----------|--------|---------------------|--------|
| Architecture | Modular monolith | Microservices | Single dealership; distributed services add operational complexity not justified |
| Frontend | Next.js App Router | React SPA + separate API | Shared logic across 3 interfaces; SSR benefits public SEO |
| Database | PostgreSQL | MongoDB | Relational integrity required for chassis uniqueness, transactions, invoices |
| ORM | Prisma | Raw SQL / TypeORM | Type safety, migrations, seeding; good DX |
| Auth | Auth.js | Custom JWT + cookies | Battle-tested, session-based, provider-agnostic |
| Payments | Abstraction layer (stub for MVP) | Direct Stripe integration | Provider not selected; interface allows swap |
| File storage | S3-compatible abstraction | Direct AWS SDK | Provider-agnostic; local MinIO for dev |
| AI | Pluggable abstraction | Hardcoded single provider | Provider TBD; chatbot must be swappable |
| Charts | Recharts | Chart.js / D3 | React-native, good dashboard component story |
| PDF | Node library (PDFKit) | Browser-side generation | Server-side generation ensures consistent invoices, security |
| Deployment | Vercel | Self-hosted Docker | Next.js-native, zero-config for MVP |

---

## 15. Implementation Boundaries

### 15.1 What Is In Scope (Architecture)

- Single Next.js application with three interface groups
- PostgreSQL as single source of truth
- Prisma as ORM
- Auth.js for authentication
- S3-compatible storage abstraction
- Server Actions + API Routes
- Recharts for dashboard analytics
- PDF generation server-side
- Vercel deployment

### 15.2 What Is Out of Scope (Architecture)

- Multi-tenant SaaS architecture (database designed with dealership scoping in mind but not active)
- Customer authentication portal
- Native mobile applications
- Real-time WebSocket features (polling acceptable for MVP)
- Elasticsearch or dedicated search engine
- Event streaming (Kafka/RabbitMQ)
- GraphQL (REST/Server Actions sufficient)

### 15.3 Conflicts with PRD/DESIGN

No conflicts identified. If future decisions conflict with PRD or DESIGN, they will be documented here as proposed changes requiring owner approval before implementation.

---

**Verification:** ARCHITECTURE.md is complete and consistent with PRD.md and DESIGN.md. No technologies beyond those justified by the product are included. No dealership information, prices, GST details, or finance partners have been invented.

**Next:** Proceed to 04_DATABASE_PROMPT.md to generate DATABASE.md.