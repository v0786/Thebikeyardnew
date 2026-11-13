import { useState, type FC } from 'react';
import { ChevronDown, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import type { Motorcycle } from '../types';
import { dealershipStore, type DealershipState } from '../services/dealershipStore';
import type { UserProfile } from '../lib/rbac';
import { FAQS } from '../data/dealershipData';
import { Seo } from '../components/Seo';
import { BikeWaleReferenceCatalog } from '../components/BikeWaleReferenceCatalog';
import { ShowroomHero } from '../components/ShowroomHero';
import { BrandShowcase } from '../components/BrandShowcase';
import { TrendingMarquee } from '../components/TrendingMarquee';
import { FeaturedBikes } from '../components/FeaturedBikes';
import { BikeListing } from '../components/BikeListing';
import { LatestArrivals } from '../components/LatestArrivals';
import { OffersSection } from '../components/OffersSection';
import { WhyChoose } from '../components/WhyChoose';
import { ShowroomLocation } from '../components/ShowroomLocation';
import { FinanceEmiSection } from '../components/FinanceEmiSection';
import { ApplicationsHub } from '../components/ApplicationsHub';
import { PersistentOnRoadBar } from '../components/PersistentOnRoadBar';

interface ShowroomHomeProps {
  state: DealershipState;
  totalInStock: number;
  newBikes: Motorcycle[];
  usedBikes: Motorcycle[];
  currentUser: UserProfile | null;
  currentActiveBike: Motorcycle | null;
  selectedBikeId?: string;
  compareBikeIds: string[];
  onSelectBike: (bike: Motorcycle) => void;
  onBookTestRide: (bike: Motorcycle) => void;
  onZoomBike: (bike: Motorcycle) => void;
  onBookNow: (bike: Motorcycle) => void;
  onOpenCsvUpload?: () => void;
  onOpenOlxModal: (bike: Motorcycle | null) => void;
  onOpenCompare: () => void;
  onToggleCompareBike: (bike: Motorcycle) => void;
  onClearCompare: () => void;
}

export const ShowroomHome: FC<ShowroomHomeProps> = ({
  state,
  totalInStock,
  newBikes,
  usedBikes,
  currentUser,
  currentActiveBike,
  selectedBikeId,
  compareBikeIds,
  onSelectBike,
  onBookTestRide,
  onZoomBike,
  onBookNow,
  onOpenCsvUpload,
  onOpenOlxModal,
  onOpenCompare,
  onToggleCompareBike,
  onClearCompare,
}) => {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const info = state.dealershipInfo;

  const dealerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: info.name,
    description: 'Authorised multi-brand motorcycle showroom — Honda, Suzuki, TVS, Royal Enfield, KTM, Yamaha, Triumph, Bajaj and Hero. New and certified pre-owned motorcycles with on-road MH-04 pricing assistance.',
    url: 'https://the-bike-yard.vercel.app/',
    telephone: info.phone,
    email: info.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: info.address,
      addressLocality: info.city,
      addressRegion: info.state,
      postalCode: info.pincode,
      addressCountry: 'IN',
    },
    openingHours: info.openingHours,
    brand: ['Honda', 'Suzuki', 'TVS', 'Royal Enfield', 'KTM', 'Yamaha', 'Triumph', 'Bajaj', 'Hero'].map((name) => ({
      '@type': 'Brand',
      name,
    })),
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="space-y-12 sm:space-y-16 pb-24 md:pb-28">
      <Seo
        title="The Bike Yard | Premium Motorcycle Dealership in Khopat, Thane — Honda, Suzuki, TVS"
        description="Authorised Honda, Suzuki, TVS, Royal Enfield, KTM, Yamaha & Triumph showroom at Khopat, Thane (W). Itemised MH-04 on-road pricing, free test rides, ~45-minute finance approvals, certified pre-owned bikes and festive exchange offers."
        path="/"
        jsonLd={dealerJsonLd}
      />

      {/* Showroom Hero */}
      <ShowroomHero
        bikes={newBikes}
        selectedBikeId={selectedBikeId}
        onSelectBike={(bike) => {
          if (bike.selectedColor) dealershipStore.selectBikeColor(bike.id, bike.selectedColor);
          onSelectBike(bike);
        }}
        inStockTotal={totalInStock}
        phone={info.phone}
        onExploreClick={() => scrollTo('catalogue-section')}
        onTestRideClick={(bike) => {
          const target = bike ?? currentActiveBike;
          if (target) onBookTestRide(target);
        }}
        onEmiClick={() => scrollTo('emi-section')}
      />

      {/* Authorised brands */}
      <BrandShowcase bikes={state.bikes} />

      {/* Optional licensed reference catalogue (renders only when configured) */}
      <BikeWaleReferenceCatalog />

      {/* Trending marquee */}
      <TrendingMarquee
        bikes={state.bikes}
        onSelectBike={onSelectBike}
        selectedBikeId={selectedBikeId}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-14 sm:space-y-16">
        {/* Featured motorcycles (staff-curated) */}
        <FeaturedBikes bikes={state.bikes} />

        {/* New motorcycle catalogue */}
        <BikeListing
          bikes={newBikes}
          comparisonBikes={state.bikes}
          onSelectBike={onSelectBike}
          onBookTestRide={onBookTestRide}
          onZoomBike={onZoomBike}
          onOpenCsvUpload={currentUser ? onOpenCsvUpload : undefined}
          onOpenCompare={onOpenCompare}
          compareBikeIds={compareBikeIds}
          onToggleCompareBike={onToggleCompareBike}
          onClearCompare={onClearCompare}
          selectedBikeId={selectedBikeId}
        />

        {/* Latest arrivals */}
        <LatestArrivals bikes={state.bikes} />

        {/* Current offers */}
        <OffersSection offers={state.offers} phone={info.phone} />

        {/* Certified Pre-Owned Section */}
        <div className="space-y-6" id="used-bikes-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-amber-500">Thane RTO Certified</span>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> 45-Point Inspection Passed
                </span>
              </div>
              <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">
                Certified Pre-Owned Motorcycles
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {currentUser && (
                <button
                  onClick={() => onOpenOlxModal(usedBikes[0] ?? null)}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-sm"
                >
                  Staff: 1-Click Post to OLX
                </button>
              )}
              <span className="text-xs text-slate-400">6-Month Warranty · Clean MH-04 Transfer</span>
            </div>
          </div>

          <BikeListing
            bikes={usedBikes}
            scope="used"
            onSelectBike={onSelectBike}
            onBookTestRide={onBookTestRide}
            onZoomBike={onZoomBike}
            onOpenOlxModal={(b) => onOpenOlxModal(b)}
            onOpenCsvUpload={currentUser ? onOpenCsvUpload : undefined}
            onOpenCompare={onOpenCompare}
            compareBikeIds={compareBikeIds}
            onToggleCompareBike={onToggleCompareBike}
            onClearCompare={onClearCompare}
            selectedBikeId={selectedBikeId}
          />
        </div>

        {/* Why choose */}
        <WhyChoose />

        {/* 10 Institutional Finance Partners & Live EMI Calculator */}
        {currentActiveBike && (
          <FinanceEmiSection
            selectedBike={currentActiveBike}
            onApplySuccess={() => {
              /* Lead is captured inside the section and lands in the staff call queue */
            }}
          />
        )}

        {/* Finance, Insurance & RTO Hub */}
        <div id="applications-hub">
          <ApplicationsHub />
        </div>

        {/* Frequently Asked Questions */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div>
            <p className="eyebrow text-amber-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Straight Answers
            </p>
            <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Booking advance, Maharashtra RTO taxes, insurance and Khopat delivery — in plain words.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                  aria-expanded={expandedFaqIndex === idx}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      expandedFaqIndex === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {expandedFaqIndex === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Showroom location, hours & one-tap contact */}
        <ShowroomLocation info={info} />

        {/* Reassurance strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-600 font-bold pb-2">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" /> Authorised Dealer</span>
          <span className="inline-flex items-center gap-1.5"><Flame className="w-4 h-4 text-amber-500" /> MH-04 RTO Desk</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" /> 6-Mo Pre-Owned Warranty</span>
        </div>
      </div>

      {/* Persistent On-Road Price Bar Docked at Bottom */}
      {currentActiveBike && (
        <PersistentOnRoadBar
          selectedBike={currentActiveBike}
          bikes={state.bikes}
          onSelectBike={onSelectBike}
          onOpenBooking={onBookNow}
          onOpenTestRide={onBookTestRide}
          onOpenSpecs={onZoomBike}
        />
      )}
    </div>
  );
};
