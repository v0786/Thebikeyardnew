# Change Log & Architecture Record — The Bike Yard

All notable changes, architectural updates, and feature implementations for **The Bike Yard** (Authorized Multi-Brand Dealership, Khopat, Thane (W), Maharashtra — MH-04 jurisdiction).

---

## [Version 2.4.0] — CSV Motorcycle Bulk Upload & Inventory Ingestion

### Added
- **Showroom CSV File Ingestion (`src/components/CsvUploadModal.tsx`):**
  - Added drag-and-drop zone and file picker supporting `.csv` files from local storage.
  - Added direct raw CSV text paste and inline editor.
  - Added live preview table rendering parsed motorcycle records before committing to the showroom catalogue.
  - Added import mode strategy selector:
    - `Append to Catalogue`: Merges new models alongside existing showroom inventory.
    - `Replace Showroom`: Replaces current new inventory with the imported spreadsheet dataset.
  - Added one-click **"Download Sample Template"** (`.csv`) and **"Load Sample CSV"** for instant verification.
- **Showroom Catalogue Upload Triggers:**
  - Added prominent **"Upload CSV"** action button in the Digital Showroom Catalogue toolbar (`BikeListing.tsx`).
  - Added **"Upload CSV"** shortcut in the top navigation utility bar (`Navbar.tsx`).
- **Flexible CSV Parser (`src/services/marketBikesDatabase.ts`):**
  - Upgraded `parseBikesCsv` with regex-tolerant column matching for diverse headers:
    - Brand / Make
    - Model / Name
    - Variant / Trim
    - ExShowroom / Price / Cost / INR
    - Category / Type / Segment
    - CC / Displacement / Engine
    - Power / BHP / HP
    - Torque / NM
    - Mileage / KMPL / Economy
    - Weight / Kerb
    - Fuel / Tank / Capacity
    - Stock / Count / Units
    - Image / Photo / URL
  - Auto-calculates Maharashtra (MH-04) 11% RTO tax, 5-Year IRDAI Comprehensive Insurance, and multi-tier variants (Base, Base Premium, Mid, Top) for every imported bike.
- **Store Support (`src/services/dealershipStore.ts`):**
  - Updated `importBikesFromCsv` to support `{ mode: 'APPEND' | 'REPLACE', staffName: string }`.

---

## [Version 2.3.0] — Side-by-Side Motorcycle Specification Comparison

### Added
- **Dedicated Comparison Modal (`src/components/BikeCompareModal.tsx`):**
  - Side-by-side comparison modal with live model selectors, studio photos, and instant swap button (`ArrowRightLeft`).
  - Structured comparison across 5 technical and financial categories:
    1. **Thane (MH-04) Pricing & Finance:** On-Road Thane price, Ex-Showroom, 11% MH RTO tax, 5-yr insurance, and 36-month estimated EMI.
    2. **Engine & Performance:** Displacement (`cc`), Peak Power (`bhp`), Peak Torque (`Nm`), and Power-to-Weight Ratio (`bhp/tonne`).
    3. **Fuel Economy & Range:** Claimed Mileage (`km/l`), Fuel Tank Capacity (`L`), and Full Tank Range (`km`).
    4. **Dimensions & Ergonomics:** Kerb Weight (`kg`) and Body Category.
    5. **Showroom Availability & Verification:** Floor stock count in Khopat and warranty status.
- **Difference Highlighting Engine:**
  - Dynamic delta calculations highlighting advantageous metrics (e.g. `+19.8 bhp higher power`, `13 kg lighter`, `+4.0 km/l better economy`, `more affordable`).
  - **"Differences Only"** filter switch to display only fields where specifications differ.
  - Visual accent highlighting with sage green (`#8CA98C`) and bronze gold (`#B08D57`) badges.
- **Comparison Selection Affordances (`src/components/BikeListing.tsx` & `App.tsx`):**
  - Added a `Scale` comparison button to every motorcycle card in the digital showroom.
  - Added an active "Comparing" badge on card thumbnails.
  - Added a floating quick comparison dock anchored at the bottom when 1 or 2 bikes are selected.
  - Added quick **"Compare"** link in `Navbar.tsx` displaying the active comparison count badge.
  - Direct **"Book ₹10,000"** and **"Test Ride"** action buttons for both bikes directly inside the modal.

---

## [Version 2.2.0] — Interactive Monthly Calendar in Test Ride Scheduler

### Added
- **Monthly Visual Calendar Grid (`src/components/TestRideModal.tsx`):**
  - Replaced native date pickers with a custom interactive monthly calendar grid.
  - Real-time month navigation with past date disabling and day selection highlights.
- **Pilot Roster & Time Slot Synchronization:**
  - 7 daily pilot slots (10:00 AM, 11:30 AM, 1:00 PM, 2:30 PM, 4:00 PM, 5:15 PM, 6:30 PM).
  - Slot availability mapped to designated Thane showroom pilots: Suraj Patil, Kiran Mane, Vikram Shinde, and Neha Patil.
  - Integrated duplicate booking guards and slot capacity status.

---

## [Version 2.1.0] — Bespoke Luxury Automotive Color Palette

### Changed
- **Tailwind CSS v4 Color System Overhaul (`src/index.css`):**
  - Integrated the exact 6-color luxury automotive palette from reference:
    - `--color-obsidian: #0B0F0D` (Obsidian Canvas Black)
    - `--color-evergreen: #1F2A1F` (Dark Evergreen Surface)
    - `--color-moss: #3E5A3F` (Pine / Moss Hairline Border)
    - `--color-sage: #8CA98C` (Sage Green Accent & Badges)
    - `--color-sand: #D9C7A3` (Champagne Sand Primary Typography)
    - `--color-bronze: #B08D57` (Antique Bronze Gold Action Accent)
  - Synced slate shades (`slate-950` to `slate-100`) and amber shades (`amber-500` to `amber-300`) to this palette.
  - Updated scrollbar thumb, marquee, modals, tables, and borders to eliminate generic styling.

---

## [Version 2.0.0] — Legal & Regulatory Compliance Hub

### Added
- **Full Legal Portal & Modal Views (`src/components/LegalPagesView.tsx`, `LegalPagesModal.tsx`):**
  - Dedicated route view (`activeView === 'legal'`) and modal dialogs with smooth tab switching.
  - **Privacy Policy:** Compliant with India's Digital Personal Data Protection (DPDP) Act 2023, telemarketing/DND consent, and WhatsApp transactional updates.
  - **Terms & Conditions:**
    - Disclosure of 10 institutional finance partners (HDFC Bank, ICICI Bank, IDFC FIRST, Bajaj Finance, Tata Capital, Kotak, Axis, IndusInd, L&T, Hero FinCorp).
    - 100% on-road math breakdown (Ex-showroom, GST, 11% MH RTO tax, IRDAI comprehensive insurance, HSRP plates, zero hidden fees).
    - ₹10,000 token advance booking policy with flat ₹500 cancellation fee under Thane jurisdiction.
    - Test ride indemnity agreements.
  - Navigation triggers integrated into `Navbar.tsx`, `Footer.tsx`, and `App.tsx`.

---

## [Version 1.3.0] — Color-Responsive Motorcycle Image Switching

### Added
- **Multi-Color Photo Data Model (`src/types/index.ts`, `dealershipData.ts`):**
  - Added `images: Record<string, string>` per color to the `Motorcycle` interface.
  - Connected `getColorBikeImage` helper across all showroom views.
  - Color swatches in `BikeListing.tsx`, `BikeDetailModal.tsx`, and `BikeZoomSpecsModal.tsx` immediately switch the displayed motorcycle image to the selected factory finish (Black, Blue, Red, White, Chrome).

---

## [Version 1.2.0] — Collapsible Mobile On-Road Bar

### Added
- **Tactile Floating Mobile Bar (`src/components/PersistentOnRoadBar.tsx`):**
  - Optimized bottom sticky bar for mobile viewports ($\le 15\%$ screen height cap).
  - Tap-to-collapse floating pill with micro-spring transition.
  - Added haptic visual feedback and `navigator.vibrate([15, 30])` response on mobile devices.

---

## [Version 1.1.0] — Lead Intake & Pending Leads Alert Module

### Added
- **Customer Lead Ingestion (`src/components/LeadCaptureModal.tsx`):**
  - Modal form for customer quotation requests, callback time preference, and finance interest.
- **Staff Alert Desk (`src/components/PendingLeadsAlertModule.tsx`):**
  - Real-time lead tracking dashboard in `AdminDashboard.tsx` and `StaffPortal.tsx`.
  - Callback queue management with stages (`NEW`, `CONTACTED`, `TEST_RIDE`, `BOOKED`, `LOST`).
  - Direct `tel:` phone links for instant sales outreach.

---

## [Version 1.0.0] — Core Dealership Showroom Platform

### Added
- Multi-brand motorcycle showroom for Royal Enfield, KTM, Yamaha, Triumph, TVS, Bajaj, Honda, and Hero.
- Certified Pre-Owned motorcycle section with 45-point inspection markers.
- BigInt integer paise financial calculation engine (`formatInr`) for zero-rounding error accounting.
- 10 Institutional Finance Partner live EMI calculator.
- Role-Based Access Control (RBAC) with 7 defined dealership staff roles.
- Grounded AI Showroom Desk with zero-hallucination domain knowledge.
- OLX India 1-click used bike ad posting integration for sales staff.
- Cart Drawer and booking advance checkout flow.


---

## [Version 3.0.0] — Premium Redesign, Public Bike Pages & Staff Pricing Desk
### Changed
- **Charcoal/obsidian + champagne-gold design system** (`src/index.css`) replacing the legacy green-tinted palette; neutral `slate` scale, gold `amber` accent, display typography utilities, reduced-motion support.
- **React Router 7 SPA routing** with real URLs: `/` (showroom), `/bike/:id` (SEO bike pages), `/legal?tab=privacy|terms`, `/login`, `/admin`, `/staff` (RBAC-guarded), branded 404 (`*`). Per-route SEO via `Seo.tsx` (title, description, canonical, OG/Twitter, JSON-LD).
- **Showroom hero rebuilt** — full-bleed photograph, high-contrast display type, WhatsApp/call/CTA hierarchy, trust strip. Honda/Suzuki/TVS authorised brand rails + "also on floor" marque links (`?brand=` deep-links into the catalogue).
- **Catalogue engine extracted** (`src/lib/catalogue.ts`) — search, brand/category/budget/engine-cc filters, price & popularity sort (popularity derived from lead/booking signals), 9-per-page pagination, `?brand=/?category=/?sort=` URL state. Responsive grid retained.
- **Base market catalogue merged at startup** — 37 unique Indian-market models × 4 variants from the central dataset (deduplicated against hand-curated showroom units), so Honda, Suzuki and TVS sections are fully browsable with real specs.
- **Bike detail pages** — colour gallery + swatches, variant selector, MH-04 on-road breakup (11% RTO auto-computed), EMI calculator (`src/lib/emi.ts`, unit-tested), WhatsApp/call/test-ride/₹10,000 CTAs, similar motorcycles, Product + Breadcrumb JSON-LD.
- **Homepage sections added** — Featured Motorcycles (staff star toggle), Latest Arrivals (recently inwarded), Current Dealership Offers (staff CRUD, WhatsApp claim), Why Thane Rides With Us, visit/location block with map embed.
- **Admin: Pricing & Featured desk** — ex-showroom editing per variant with RTO auto-recompute, featured merchandising toggle; **specs read-only** enforced in UI and store. **Offers desk** (create/toggle/delete). **Dealership info form** (contact/address/hours/GSTIN) + danger-zone override reset. Staff overrides persist in localStorage; all mutations audit-logged.
- **RBAC extended** — new `pricing` and `offers` sections for Super Admin / Owner / Manager only.
- **Performance** — route-level code splitting (React.lazy), lazy images, `fetchPriority=high` hero; main bundle 698 kB → 465 kB.
- **SEO** — unique metadata per route, `sitemap.xml` (40 URLs), `robots.txt` (staff areas disallowed), `favicon.svg`, canonical links, noindex on staff/login.
- **Tests** — Vitest configured (`npm test`); 30 unit tests (emi, catalogue, currency, whatsapp). Backend typecheck + tests verified; root `tsc` now excludes the separate Next.js backend app.
