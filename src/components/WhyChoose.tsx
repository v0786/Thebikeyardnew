import type { FC } from 'react';
import { ShieldCheck, BadgePercent, Landmark, ClipboardCheck, FileText, Wrench } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Authorised Multi-Brand Dealership',
    body: 'Honda, Suzuki, TVS plus Royal Enfield, KTM, Yamaha, Triumph, Bajaj and Hero — genuine bikes, genuine parts, factory warranty.',
  },
  {
    icon: BadgePercent,
    title: 'Transparent MH-04 On-Road Pricing',
    body: 'Ex-showroom, 11% Maharashtra RTO, 5-year IRDAI insurance and handling — every rupee itemised. Zero hidden fees, ever.',
  },
  {
    icon: Landmark,
    title: '10+ Finance Partners, ~45-Min Approvals',
    body: 'HDFC, ICICI, IDFC FIRST, Bajaj Finance, Tata Capital and more — down payments from ₹15,000, rates from 8.99% APR.',
  },
  {
    icon: ClipboardCheck,
    title: '45-Point Certified Pre-Owned',
    body: 'Every used bike passes a 45-point PDI with 6-month engine warranty and clean MH-04 transfer documentation.',
  },
  {
    icon: FileText,
    title: 'In-House RTO & HSRP Desk',
    body: 'Registration, number plates, ownership transfer and hypothecation — handled at the showroom, no RTO queues for you.',
  },
  {
    icon: Wrench,
    title: 'Service & PDI Support',
    body: 'Trained technicians, genuine oils and parts, and a dedicated PDI bay. Your bike leaves showroom-ready, every time.',
  },
] as const;

export const WhyChoose: FC = () => (
  <section aria-label="Why choose The Bike Yard" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
    <p className="eyebrow text-amber-500">The Bike Yard Advantage</p>
    <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">Why Thane Rides With Us</h2>

    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {REASONS.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Icon className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
            <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
