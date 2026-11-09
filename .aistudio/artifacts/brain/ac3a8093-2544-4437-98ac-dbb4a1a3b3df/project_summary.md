# The Bike Yard — Project Summary & Architecture

## Overview
**The Bike Yard** is an authorized multi-brand premium motorcycle dealership and digital showroom located in Khopat, Thane (West), Maharashtra (MH-04 jurisdiction, GSTIN: `27AABCT9981K1ZT`).

---

## Bespoke Automotive Palette
Applied across all interfaces:
- `#0B0F0D` — Obsidian Canvas Black
- `#1F2A1F` — Dark Evergreen Surface
- `#3E5A3F` — Pine / Moss Border
- `#8CA98C` — Sage Green Accent
- `#D9C7A3` — Champagne Sand Text
- `#B08D57` — Antique Bronze Gold

---

## Key Features Implemented

### 1. CSV Bulk Upload to Load New Bikes
- **File & Drag-and-Drop Ingestion:** Users can drop or select any `.csv` file, paste raw CSV text, or load the built-in sample template.
- **Smart Header Detection:** Parses flexible headers (`Brand`, `Model`, `Variant`, `ExShowroom`/`Price`, `Category`, `EngineCC`/`Displacement`, `PowerBHP`, `TorqueNM`, `MileageKMPL`, `Weight`, `Tank`, `Stock`, `Image`).
- **Live Parsed Preview:** Real-time table showing all parsed motorcycles with live MH-04 On-Road price calculation (Ex-Showroom + 11% MH RTO + 5-Yr Comprehensive IRDAI Insurance + Handling) before committing.
- **Import Strategies:**
  - `Append to Catalogue`: Adds newly uploaded motorcycles alongside existing stock.
  - `Replace Showroom`: Replaces current new inventory with the uploaded CSV dataset.
- **Accessible Everywhere:** Accessible via the "Upload CSV" button in the Digital Showroom Catalogue header, top utility bar in `Navbar`, and Staff/Admin dashboards.

### 2. Side-by-Side Motorcycle Specification Comparison (`BikeCompareModal.tsx`)
- **Interactive Selectors:** Compare any 2 motorcycles directly with image previews, model dropdowns, and a quick swap button.
- **Specification Table Categories:**
  - Thane (MH-04) Pricing & Finance (On-Road Thane, Ex-Showroom, MH RTO 11%, Insurance, 36-mo EMI)
  - Engine & Performance (Displacement, Max Power, Peak Torque, Power-to-Weight Ratio)
  - Fuel Economy & Range (Claimed Mileage, Fuel Capacity, Estimated Full Tank Range)
  - Dimensions & Segment (Kerb Weight, Category)
  - Showroom Availability & Verification (Floor Stock Units in Khopat, Condition & Warranty)
- **Difference Highlighting:**
  - Dynamic delta metrics with advantage badges (`+19.8 bhp higher power`, `13 kg lighter`, `+4.0 km/l better economy`, `more affordable`).
  - "Differences Only" toggle filter switch.
- **Quick Actions:** Direct "Book with ₹10,000" and "Book Test Ride" CTAs for each compared motorcycle.
- **Card & Bar Integration:** Every motorcycle card features a `Scale` compare toggle. A floating dock appears when 1 or 2 bikes are selected to launch the comparison view instantly.

### 3. Legal & Regulatory Hub
- Full-page route (`activeView === 'legal'`) and modal triggers for DPDP Act 2023, telemarketing consent, 10 institutional finance partner disclosures, 100% on-road math transparency, and ₹10,000 token advance refund terms (flat ₹500 cancellation fee).

### 4. Interactive Test Ride Calendar
- Monthly calendar sync with live staff pilots (Suraj Patil, Kiran Mane, Vikram Shinde, Neha Patil) and 7 daily time slots.
