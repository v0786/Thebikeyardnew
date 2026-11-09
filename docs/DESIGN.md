# DESIGN.md — The Bike Yard

**Product:** The Bike Yard — Complete Dealership Management & Digital Showroom Platform  
**Status:** Draft — Pending Dealership Owner Review  
**Version:** 1.0  
**Source of Truth:** Yes — Follows PRD.md as authoritative  
**Previous Document:** PRD.md (Prompt 01)  
**Next Document:** ARCHITECTURE.md (Prompt 03)

---

## 1. Design Direction

**Premium, modern motorcycle showroom.** Bold but restrained. High-quality bike photography. Clear price hierarchy. Simple customer journeys. Efficient dealership operations.

The visual language should feel like a high-end showroom, not a classifieds site or a traditional dealership brochure. It must be trustworthy, professional, and automotive-inspired — clean, spacious, and confident.

**Do not** imitate a specific brand or copy a competitor. **Do not** use fake product prices, fake reviews, or unverified claims.

---

## 2. Brand Mood & Visual Principles

| Principle | Description |
|-----------|-------------|
| Premium minimalism | Generous whitespace, restrained colour palette, focus on bike photography |
| Automotive confidence | Strong typography, clean lines, subtle metallic accents, dark-mode friendly |
| Trust & transparency | Clear pricing, visible showroom location, honest stock status, no hidden fees |
| Operational efficiency | Admin and staff interfaces prioritise scannability, fast data entry, and clear status |
| India context | INR currency, DD/MM/YYYY date format, UPI-friendly payment cues |

**Visual keywords:** Clean, bold, spacious, metallic, automotive, trustworthy, professional.

---

## 3. Surfaces: Public Website vs Admin/Staff

### Public Website
- Marketing-first, conversion-oriented
- Emphasis on imagery, storytelling, and ease of enquiry
- Mobile-first responsive; customers browse primarily on phones
- No authentication required for browsing
- Tone: welcoming, aspirational, informative

### Admin Dashboard
- Operations-first, data-dense
- Emphasis on scannability, tables, charts, forms, and quick actions
- Desktop-first responsive (staff work on desktops/laptops in showroom)
- Authentication required; role-based access
- Tone: efficient, authoritative, functional

### Staff Portal
- Task-first, role-scoped
- Emphasis on assigned work, daily tasks, and personal performance
- Mobile-friendly for staff on the showroom floor
- Authentication required; role-based access
- Tone: focused, actionable, personal

All three surfaces share the same design tokens, component library, and theme settings for consistency.

---

## 4. Information Hierarchy & Navigation

### Public Website Navigation
- Top bar: Logo (left), primary navigation (centre), CTAs: "Explore Bikes", "Contact Showroom" (right)
- Mobile: Hamburger menu with same links
- Footer: Showroom address (Khopat, Thane), phone, email, hours, social links, quick links to pages

### Admin Dashboard Navigation
- Left sidebar: Collapsible/expandable, grouped by module (Dashboard, Inventory, Sales, Customers, Finance, Insurance, RTO, Payments, Staff, Reports, CMS, Social, FAQ, Settings)
- Top bar: User profile, notifications, theme toggle, help
- Breadcrumb: Contextual path within nested modules

### Staff Portal Navigation
- Left sidebar (collapsed by default on mobile): My Dashboard, Customer Enquiries, Sales Leads, Bookings, Insurance Forms, Registration Forms, Finance Applications, Service Requests, Daily Tasks, My Performance
- Top bar: User profile, notifications, theme toggle

---

## 5. Design Tokens

### 5.1 Colour Palette

Tokens are defined as CSS custom properties so they can be overridden centrally via Settings.

| Token | Default Value | Usage |
|-------|---------------|-------|
| `--color-primary` | `#111827` (near-black) | Primary actions, headings, borders |
| `--color-primary-hover` | `#374151` | Hover state of primary |
| `--color-secondary` | `#6366f1` (indigo) | Secondary actions, accents |
| `--color-secondary-hover` | `#4f46e5` | Hover state of secondary |
| `--color-accent` | `#ef4444` (red) | Sale tags, urgent alerts, stock out |
| `--color-success` | `#10b981` (green) | Available stock, confirmed status |
| `--color-warning` | `#f59e0b` (amber) | Pending, reserved, low stock |
| `--color-error` | `#ef4444` (red) | Errors, sold-out, overdue |
| `--color-info` | `#3b82f6` (blue) | Info states, links |
| `--color-surface` | `#ffffff` | Cards, backgrounds |
| `--color-surface-alt` | `#f9fafb` | Section backgrounds |
| `--color-text-primary` | `#111827` | Headings, body text |
| `--color-text-secondary` | `#6b7280` | Captions, muted text |
| `--color-text-inverse` | `#ffffff` | Text on dark backgrounds |
| `--color-border` | `#e5e7eb` | Dividers, input borders |
| `--color-focus` | `#6366f1` | Focus ring |

**Approved accent colours** (configurable in Settings): Indigo, Slate, Emerald, Rose, Amber. Arbitrary CSS injection is not permitted; only these tokens may be customised.

### 5.2 Dark Theme

Strategy: Class-based dark mode (`[data-theme="dark"]`) applied to `<html>`. System preference respected via `prefers-color-scheme` when theme is set to "System".

Dark mode inverts surface and text tokens:
- `--color-surface`: `#0f172a`
- `--color-surface-alt`: `#1e293b`
- `--color-text-primary`: `#f8fafc`
- `--color-text-secondary`: `#94a3b8`
- `--color-border`: `#334155`

Primary colour remains near-black in light mode and shifts to a dark slate in dark mode for contrast.

### 5.3 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-sans` | `Inter, system-ui, sans-serif` | UI, body, dashboard |
| `--font-family-display` | `Outfit, system-ui, sans-serif` | Headings, hero, bike names |
| `--font-size-xs` | `0.75rem` | Captions, badges |
| `--font-size-sm` | `0.875rem` | Helper text, labels |
| `--font-size-base` | `1rem` | Body text |
| `--font-size-lg` | `1.125rem` | Lead text |
| `--font-size-xl` | `1.25rem` | Section headings |
| `--font-size-2xl` | `1.5rem` | Page titles |
| `--font-size-3xl` | `1.875rem` | Hero headings |
| `--font-size-4xl` | `2.25rem` | Large display headings |
| `--font-weight-normal` | `400` | Body |
| `--font-weight-medium` | `500` | Labels, buttons |
| `--font-weight-semibold` | `600` | Section headings |
| `--font-weight-bold` | `700` | Page titles, bike names |
| `--line-height-tight` | `1.25` | Headings |
| `--line-height-normal` | `1.5` | Body |

**Font Family choices (configurable in Settings):** Inter, Outfit, Roboto, Open Sans, System UI.

**Font Size choices (configurable in Settings):** Small, Medium, Large. Applied as a CSS class on root (`text-sm`, `text-base`, `text-lg` equivalent scaling).

### 5.4 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `0.25rem` | Tight grouping |
| `--space-2` | `0.5rem` | Component padding |
| `--space-3` | `0.75rem` | Card inner padding |
| `--space-4` | `1rem` | Standard section gap |
| `--space-6` | `1.5rem` | Card padding |
| `--space-8` | `2rem` | Section padding |
| `--space-12` | `3rem` | Large section gap |
| `--space-16` | `4rem` | Hero padding |

### 5.5 Borders & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.25rem` | Badges, pills, small chips |
| `--radius-md` | `0.375rem` | Inputs, buttons, tables |
| `--radius-lg` | `0.5rem` | Cards, modals, dialogs |
| `--radius-xl` | `0.75rem` | Hero sections, prominent cards |
| `--border-width` | `1px` | Standard borders |
| `--border-color` | `var(--color-border)` | Border colour |

### 5.6 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Buttons, inputs |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Dialogs, hero overlays |

### 5.7 Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Hover states, toggles |
| `--duration-normal` | `300ms` | Dialogs, drawers, tooltips |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--reduced-motion` | `prefers-reduced-motion: reduce` | Respect user preference; disable animations |

---

## 6. Responsive Behaviour

| Breakpoint | Value | Target |
|------------|-------|--------|
| Mobile | `0–639px` | Single column, stacked cards, hamburger menu, touch targets ≥ 44px |
| Tablet | `640–1023px` | Two-column grids, condensed navigation |
| Desktop | `1024px+` | Multi-column grids, full sidebar, hover states |

**Public website:** Mobile-first. Bike cards stack on mobile, two-column on tablet, three-to-four-column on desktop.

**Admin/Staff:** Desktop-first. Sidebar collapses to icons-only on tablet, hidden drawer on mobile.

---

## 7. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | All interactive elements reachable via Tab; visible focus ring (`--color-focus`) |
| Contrast | Minimum 4.5:1 for normal text, 3:1 for large text and UI components |
| Labels | All form fields have visible labels; aria-label on icon-only buttons |
| Focus order | Logical DOM order; skip-to-content link on public pages |
| Reduced motion | Respect `prefers-reduced-motion`; no autoplay carousels without pause |
| Screen readers | ARIA landmarks (header, nav, main, footer); live regions for toasts |
| Touch targets | Minimum 44×44px on mobile |
| Colour not sole means | Status conveyed via text + icon + colour (e.g., "Available" text + green chip) |

---

## 8. Component Inventory

### 8.1 Navigation
- **PublicNavbar** — Logo, primary links, CTAs, mobile hamburger
- **AdminSidebar** — Collapsible module list, role-scoped items, active states
- **StaffSidebar** — Task-focused list, collapsed by default on mobile
- **TopBar** — User profile, notifications, theme toggle, help
- **Breadcrumb** — Contextual path for nested admin modules

### 8.2 Layout
- **Hero** — Premium banner with headline, subheadline, CTAs, showroom location
- **Card** — Surface with shadow, radius, padding variants
- **Grid** — Responsive column grid (1/2/3/4 columns)
- **Section** — Padding, heading, optional divider

### 8.3 Bike Catalogue
- **BikeCard** — Photograph, manufacturer, model/variant, ex-showroom price, on-road price, colours, specs preview, View Details / Enquire Now / Book Test Ride
- **BikeGallery** — Main image + thumbnail strip, lightbox on click
- **FilterBar** — Brand, model, variant, colour, price range, availability
- **PricingBreakdown** — Ex-showroom, insurance, RTO, accessories, discount, final selling price (line items, no fabricated values)
- **SpecTable** — Two-column specification table (engine CC, mileage, etc.)
- **EMICalculator** — Loan amount, down payment, interest rate, tenure, monthly estimate (labeled as estimate)
- **ColourSwatch** — Clickable colour chips with image preview

### 8.4 Forms
- **Input** — Text, number, email, tel, with label, helper text, error state
- **Select** — Dropdown with search for long lists
- **Checkbox / Radio** — Custom styled, accessible
- **DatePicker** — Date input with calendar popup
- **FileUpload** — Drag-and-drop or click, file type validation, size limits, progress
- **RichTextEditor** — For blogs and content pages
- **FormLayout** — Single column, two-column, fieldset grouping

### 8.5 Data Display
- **DashboardCard** — Metric value, label, trend indicator, sparkline
- **DataTable** — Sortable, filterable, paginated, row actions, empty state
- **StatusChip** — Available, Reserved, Sold, Pending, Approved, Rejected (colour-coded + text)
- **Chart** — Recharts integration: line, bar, donut for analytics
- **Avatar** — User initials or photo

### 8.6 Feedback
- **Dialog** — Modal with header, body, actions, escape-to-close
- **Toast** — Success, error, warning, info; auto-dismiss; positionable
- **EmptyState** — Illustration, heading, primary action
- **LoadingState** — Skeleton or spinner
- **ErrorState** — Error message, retry action
- **PermissionDenied** — Lock icon, message, contact admin

### 8.7 Settings (Android-style)
- **SettingsList** — Grouped preference rows
- **ToggleSwitch** — On/off for theme, notifications
- **ColourPicker** — From approved accent colours only
- **SelectRow** — Font family, font size, language, date format, sidebar mode
- **FileInput** — Logo, favicon upload with preview
- **TextInput** — Business name, address, phone, GSTIN, invoice prefix

---

## 9. Screen-by-Screen Wireframe Descriptions

### Public Website

**Home / Showroom**
- Hero: "THE BIKE YARD" logotype, "Find Your Ride. Own Your Journey.", subheadline, [Explore Bikes] [Contact Showroom] buttons, Khopat, Thane location line
- Featured Motorcycles: Horizontal scroll of 4–6 featured BikeCards
- Latest Arrivals: Grid of newly added bikes
- Popular Bikes: Grid of most viewed bikes
- Special Offers: Promotional banner cards (content from CMS, no fabricated discounts)
- Easy Finance: EMI calculator snippet, finance info link
- Insurance & Registration Assistance: Info cards with links
- Customer Testimonials: Quote + name + bike (real customer content only)
- Latest Automotive News: Blog post previews
- Showroom Location & Contact: Address, phone, email, hours, map embed/link

**Explore Bikes**
- FilterBar at top (brand, model, variant, colour, price, availability)
- Grid of BikeCards below
- Count of results, sort dropdown

**Bike Details**
- BikeGallery (main image + thumbnails)
- Bike name, manufacturer, model, variant
- PricingBreakdown table
- SpecTable
- EMI Calculator
- Finance info, Insurance details
- FAQs (accordion)
- Enquiry form (name, phone, email, message)
- WhatsApp contact button

**Finance & Loan / Insurance / Registration (RTO)**
- Informational pages with process steps, required documents, contact form

**Services / Blogs & News / About Us / Contact Us / FAQ**
- Standard content pages with rich text, images, forms

**AI Chatbot**
- Floating widget, bottom-right corner
- Open/closed states, message thread, input field, quick-reply chips

### Admin Dashboard

**Overview**
- 10 metric cards in grid (2 rows of 5)
- Analytics charts row (sales trend, revenue)
- Quick actions: New Stock Inward, New Booking, New Sale

**Sales Management**
- DataTable of sales with customer, bike, date, amount, status
- Filter by date, salesperson, status
- Action: View invoice, Mark delivered

**Purchase / Bike Inward**
- Form: Supplier, invoice number, chassis number, engine number, model/variant, colour, purchase price, received date
- Table of recent inward records

**Stock Management**
- DataTable of all units with chassis number, status, colour, location
- Filter by status (Available/Reserved/Sold)
- Search by chassis/engine number

**Stock Outward**
- Form: Customer, bike (chassis), sales invoice, payment, insurance, registration, delivery date
- Validation: bike must be available

**Bike Variants / Pricing Management**
- CRUD for variants and prices
- Price snapshot history (immutable)

**Customer Management**
- Customer list, detail view with enquiry/purchase history

**Booking Management**
- Booking list, status pipeline, assign sales executive

**Finance Management**
- Application list, status, bank/NBFC, EMI, down payment
- Document upload

**Insurance Management**
- Provider, policy type, premium, expiry, documents, status

**RTO / Registration**
- Application list, customer documents, status, registration number

**Payments**
- Payment list by method, amount, date, customer
- Outstanding payments view

**Bills & Invoices**
- Invoice list, preview, download PDF, mark paid/void

**Staff Management**
- Staff list, role assignment, permissions, activation/deactivation

**Daily Tasks**
- Task list, assignee, due date, status

**Reports & Analytics**
- Chart selection, date range, export CSV/PDF

**Blogs Management**
- Post list, editor, publish/draft, schedule

**Social Media**
- Link inputs (Instagram, Facebook, YouTube), banner uploads, post scheduler

**FAQ Management**
- Question/answer list, category, order

**Requirements**
- Requirement tracking list (customer/supplier)

**Settings**
- Android-style grouped list: Theme, Primary Colour, Secondary Colour, Font Family, Font Size, Website Branding (logo/favicon), Dashboard Layout, Sidebar, Currency, Date Format, Notifications, Language, Invoice Settings, Business Details

### Staff Portal

**My Dashboard**
- Assigned leads count, pending bookings, today's tasks, personal performance chips

**Customer Enquiries**
- List of assigned enquiries with status, follow-up actions

**Sales Leads**
- Lead pipeline, activities, conversion actions

**Bookings**
- Assigned bookings, status, customer details

**Insurance / Registration / Finance Forms**
- Role-scoped forms for processing applications

**Service Requests**
- List of service requests, status updates

**Daily Tasks**
- Assigned tasks, mark complete, due dates

**My Performance**
- Personal sales count, revenue, pending follow-ups

---

## 10. Content & Image Guidelines

### Images
- **Bike photography:** High-resolution, consistent lighting, plain or showroom background
- **Ratios:** 4:3 for listing cards, 16:9 for detail gallery, 1:1 for thumbnails
- **Fallback:** Placeholder silhouette when image missing; never show broken image
- **Optimisation:** WebP with JPEG fallback, lazy loading, responsive sizes
- **Logo/favicon:** Uploaded via Settings; SVG preferred for logo, ICO/PNG for favicon

### Content
- No fake prices, no fake reviews, no unverified claims
- All pricing sourced from dealership-managed catalogue
- Testimonials only from real customers with permission
- Blog content written by dealership staff or approved writers
- Hindi/Marathi language support considered for future (English initially per PRD)

---

## 11. Admin Settings for Appearance

| Setting | Control | Options | Persistence |
|---------|---------|---------|-------------|
| Theme | Toggle | Light / Dark / System | Central settings table |
| Primary Colour | Colour picker | Approved accent colours only | Central settings table |
| Secondary Colour | Colour picker | Approved accent colours only | Central settings table |
| Font Family | Select | Inter, Outfit, Roboto, Open Sans, System UI | Central settings table |
| Font Size | Select | Small / Medium / Large | Central settings table |
| Website Branding | File input | Logo (SVG), Favicon (ICO/PNG) | Storage + settings reference |
| Dashboard Layout | Toggle/grid | Customizable widgets | Central settings table |
| Sidebar | Toggle | Expanded / Collapsed | Local storage + settings |
| Currency | Fixed | INR | Central settings table |
| Date Format | Fixed | DD/MM/YYYY | Central settings table |
| Notifications | Toggle | Email / In-app | Central settings table |
| Language | Fixed | English (initially) | Central settings table |
| Invoice Settings | Inputs | Prefix, numbering, GST | Central settings table |
| Business Details | Inputs | Address, contact, GSTIN | Central settings table |

**Rule:** Changes apply consistently throughout the application via CSS custom properties and server-rendered settings. No arbitrary CSS injection permitted.

---

## 12. Assumptions & Owner Confirmations

| # | Assumption | Status | Owner Confirmation Needed |
|---|-----------|--------|--------------------------|
| A1 | Default primary colour is near-black (#111827); secondary is indigo (#6366f1) | Assumed | Confirm or provide brand colours |
| A2 | Font family defaults to Inter (UI) and Outfit (display) | Assumed | Confirm or select alternatives |
| A3 | Logo and favicon will be provided by dealership | Pending | Provide assets or use text logotype initially |
| A4 | Dark mode is desired | Assumed | Confirm if dark mode needed |
| A5 | Mobile image ratios: 4:3 listing, 16:9 gallery, 1:1 thumbnails | Assumed | Confirm if different ratios preferred |
| A6 | Admin dashboard is desktop-first; staff portal is mobile-friendly | Assumed | Confirm device usage patterns |

---

## 13. Component Inventory (Summary)

**Navigation:** PublicNavbar, AdminSidebar, StaffSidebar, TopBar, Breadcrumb  
**Layout:** Hero, Card, Grid, Section  
**Bike Catalogue:** BikeCard, BikeGallery, FilterBar, PricingBreakdown, SpecTable, EMICalculator, ColourSwatch  
**Forms:** Input, Select, Checkbox/Radio, DatePicker, FileUpload, RichTextEditor, FormLayout  
**Data:** DashboardCard, DataTable, StatusChip, Chart, Avatar  
**Feedback:** Dialog, Toast, EmptyState, LoadingState, ErrorState, PermissionDenied  
**Settings:** SettingsList, ToggleSwitch, ColourPicker, SelectRow, FileInput (logo/favicon), TextInput  

---

## 14. Design Acceptance Checklist

- [ ] Brand mood matches "premium, modern motorcycle showroom" direction
- [ ] Public website and admin/staff experiences are distinct but consistent
- [ ] All design tokens defined (colour, typography, spacing, radius, shadows, motion)
- [ ] Light/dark theme strategy documented
- [ ] Responsive breakpoints defined for mobile, tablet, desktop
- [ ] Accessibility requirements specified (WCAG 2.1 AA, keyboard, contrast, labels, reduced motion)
- [ ] All PRD modules have screen-by-screen wireframe descriptions
- [ ] Component inventory complete with usage descriptions
- [ ] Content and image guidelines defined (ratios, fallbacks, no fake content)
- [ ] Admin settings for appearance documented (Android-style)
- [ ] No fake prices, fake reviews, or unverified claims used
- [ ] Assumptions marked for owner confirmation
- [ ] No product scope changes from PRD.md

---

**Verification:** DESIGN.md is complete and consistent with PRD.md. No product scope or business rules were changed from the PRD. No fake prices, reviews, or unverified claims are included. Assumptions are marked for owner confirmation.

**Next:** Proceed to 03_ARCHITECTURE_PROMPT.md to generate ARCHITECTURE.md.