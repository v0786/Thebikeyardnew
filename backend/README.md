# The Bike Yard — Motorcycle Dealership & Digital Showroom Platform

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

```bash
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
```

Open [http://localhost:3000](http://localhost:3000) to view the digital showroom.
