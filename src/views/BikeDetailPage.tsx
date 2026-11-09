import { useEffect, useMemo, useState, type FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Phone, MessageCircle, CalendarCheck, BadgePercent,
  ShieldCheck, FileText, Wrench, Check, ChevronRight, Fuel, Gauge,
} from 'lucide-react';
import { Motorcycle, DealershipInfo } from '../types';
import { formatInr, toRupees } from '../lib/currency';
import { computeEmi, SHOWROOM_EMI_DEFAULTS } from '../lib/emi';
import { whatsAppLink, telLink } from '../lib/whatsapp';
import { getColorBikeImage } from '../data/dealershipData';
import { dealershipStore } from '../services/dealershipStore';
import { Seo } from '../components/Seo';

interface BikeDetailPageProps {
  bikes: Motorcycle[];
  dealershipInfo: DealershipInfo;
  onEnquire: (bike: Motorcycle) => void;
  onBookTestRide: (bike: Motorcycle) => void;
  onBookNow: (bike: Motorcycle) => void;
}

const TENURES = [12, 24, 36, 48, 60] as const;

export const BikeDetailPage: FC<BikeDetailPageProps> = ({
  bikes,
  dealershipInfo,
  onEnquire,
  onBookTestRide,
  onBookNow,
}) => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const bike = useMemo(() => bikes.find((b) => b.id === bikeId), [bikes, bikeId]);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [downPaymentPct, setDownPaymentPct] = useState(SHOWROOM_EMI_DEFAULTS.downPaymentPercent);
  const [tenure, setTenure] = useState(SHOWROOM_EMI_DEFAULTS.months);
  const [roi, setRoi] = useState(SHOWROOM_EMI_DEFAULTS.annualRatePercent);

  // Reset gallery when navigating between bikes
  useEffect(() => {
    setGalleryIndex(0);
  }, [bikeId]);

  const onRoadPaise = bike
    ? bike.exShowroomPaise + bike.rtoTaxPaise + bike.insurancePaise + bike.handlingPaise
    : 0n;

  const emi = useMemo(() => {
    if (!bike) return null;
    const down = (onRoadPaise * BigInt(Math.round(downPaymentPct * 100))) / 10000n;
    return computeEmi(onRoadPaise, down, roi, tenure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bike, onRoadPaise, downPaymentPct, roi, tenure]);

  const similar = useMemo(() => {
    if (!bike) return [];
    const sameCategory = bikes.filter((b) => b.id !== bike.id && !b.isUsed && b.category === bike.category);
    const sameBrand = bikes.filter((b) => b.id !== bike.id && !b.isUsed && b.brand === bike.brand && b.category !== bike.category);
    return [...sameCategory, ...sameBrand].slice(0, 4);
  }, [bike, bikes]);

  if (!bike) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center space-y-4">
        <Seo title="Motorcycle Not Found | The Bike Yard" description="The requested motorcycle could not be found in our showroom catalogue." path="/bike/not-found" noIndex />
        <h1 className="display-heading text-2xl text-white">Motorcycle not found</h1>
        <p className="text-sm text-slate-400">This model may have been sold out or removed from the showroom floor.</p>
        <Link to="/#catalogue-section" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400">
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const gallery = Array.from(new Set([bike.image, ...Object.values(bike.images ?? {})]));
  const activeImage = gallery[Math.min(galleryIndex, gallery.length - 1)] ?? bike.image;
  const isElectric = bike.engineCc === 0;
  const estRangeKm = !isElectric && bike.fuelCapacityL > 0 ? Math.round(bike.mileageKmpl * bike.fuelCapacityL) : null;
  const onRoadRupees = toRupees(onRoadPaise);
  const exRupees = toRupees(bike.exShowroomPaise);

  const canonicalPath = `/bike/${bike.id}`;
  const seoTitle = `${bike.brand} ${bike.model} On-Road Price in Thane (MH-04) | The Bike Yard`;
  const seoDescription = `${bike.brand} ${bike.model} at The Bike Yard, Khopat (Thane). Ex-showroom ${formatInr(bike.exShowroomPaise)} · On-road MH-04 ${formatInr(onRoadPaise)} · ${isElectric ? 'Electric' : `${bike.engineCc}cc`} · Claimed ${bike.mileageKmpl} ${isElectric ? 'km/charge' : 'km/l'} · Test ride & ~45-min finance.`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${bike.brand} ${bike.model}`,
    sku: bike.id,
    brand: { '@type': 'Brand', name: bike.brand },
    description: bike.description,
    image: [`https://the-bike-yard.vercel.app${activeImage}`],
    category: bike.category,
    offers: {
      '@type': 'Offer',
      url: `https://the-bike-yard.vercel.app${canonicalPath}`,
      priceCurrency: 'INR',
      price: exRupees,
      availability: bike.inStockCount > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      itemCondition: bike.isUsed ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      seller: { '@type': 'AutoDealer', name: 'The Bike Yard' },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://the-bike-yard.vercel.app/' },
      { '@type': 'ListItem', position: 2, name: 'Catalogue', item: 'https://the-bike-yard.vercel.app/#catalogue-section' },
      { '@type': 'ListItem', position: 3, name: `${bike.brand} ${bike.model}`, item: `https://the-bike-yard.vercel.app${canonicalPath}` },
    ],
  };

  const enquiryMessage = `Hi The Bike Yard! I'm interested in the ${bike.brand} ${bike.model} (${bike.variant}). Ex-showroom ${formatInr(bike.exShowroomPaise)} · On-road Thane ${formatInr(onRoadPaise)}. Please share a quote / callback.`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <Seo title={seoTitle} description={seoDescription} path={canonicalPath} type="product" image={`https://the-bike-yard.vercel.app${activeImage}`} jsonLd={[productJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-6 flex-wrap">
        <Link to="/" className="hover:text-slate-200">Home</Link>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <Link to={`/?brand=${encodeURIComponent(bike.brand)}#catalogue-section`} className="hover:text-slate-200">{bike.brand}</Link>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <span className="text-slate-300 font-medium" aria-current="page">{bike.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* ---------- Gallery ---------- */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <img
              key={activeImage}
              src={activeImage}
              alt={`${bike.brand} ${bike.model} — ${bike.selectedColor ?? 'default finish'}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 left-3">
              {bike.inStockCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/85 backdrop-blur border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {bike.inStockCount} ready at Khopat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-950/85 backdrop-blur border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                  Booking open · ~10 day delivery
                </span>
              )}
            </div>
            {bike.isUsed && (
              <div className="absolute top-3 right-3 rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                Certified Pre-Owned · {bike.year}
              </div>
            )}
          </div>

          {/* Thumbnails (gallery = factory finishes from the central dataset) */}
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Colour gallery">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  role="tab"
                  aria-selected={i === galleryIndex}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setGalleryIndex(i)}
                  className={`h-16 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    i === galleryIndex ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Colour swatches */}
          {bike.availableColors.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Factory Finishes</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {bike.availableColors.map((c) => {
                  const isActive = (bike.selectedColor ?? bike.availableColors[0]?.name) === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => dealershipStore.selectBikeColor(bike.id, c.name)}
                      title={c.name}
                      aria-pressed={isActive}
                      className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 py-1 pl-1 pr-3 hover:border-slate-600 transition-colors"
                    >
                      <span className={`h-5 w-5 rounded-full border ${isActive ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-white/20'}`} style={{ backgroundColor: c.hex }} />
                      <span className={`text-[11px] font-medium ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ---------- Purchase panel ---------- */}
        <div>
          <p className="eyebrow text-amber-500">{bike.brand}</p>
          <h1 className="display-heading mt-1 text-3xl sm:text-5xl text-white">{bike.model}</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">{bike.variant} · {bike.category}{bike.isUsed ? ` · ${bike.year} · ${bike.odometerKm?.toLocaleString('en-IN')} km` : ''}</p>

          {/* Variant selector */}
          {bike.variants && bike.variants.length > 1 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Choose Variant</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {bike.variants.map((v) => {
                  const isCur = bike.selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => dealershipStore.selectBikeVariant(bike.id, v.id)}
                      aria-pressed={isCur}
                      className={`rounded-lg border px-2 py-1.5 text-center transition-all ${
                        isCur
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="block text-[11px] font-extrabold truncate">{v.name}</span>
                      <span className={`block text-[9px] tabular-nums ${isCur ? 'text-slate-800' : 'text-slate-500'}`}>
                        {formatInr(v.exShowroomPaise)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price breakup */}
          <dl className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800 text-xs sm:text-sm">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <dt className="text-slate-400">Ex-showroom (Thane)</dt>
              <dd className="font-semibold text-white tabular-nums">{formatInr(bike.exShowroomPaise)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <dt className="text-slate-400">RTO — MH-04 (11.00%)</dt>
              <dd className="tabular-nums text-slate-200">{formatInr(bike.rtoTaxPaise)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <dt className="text-slate-400">Insurance (5-yr TP + 1-yr OD)</dt>
              <dd className="tabular-nums text-slate-200">{formatInr(bike.insurancePaise)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <dt className="text-slate-400">Handling &amp; documentation</dt>
              <dd className="tabular-nums text-slate-200">{formatInr(bike.handlingPaise)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-950/60 rounded-b-2xl">
              <dt className="font-extrabold uppercase tracking-wider text-[11px] sm:text-xs text-amber-400">On-Road Thane</dt>
              <dd className="text-lg sm:text-2xl font-extrabold text-amber-400 tabular-nums">{formatInr(onRoadPaise)}</dd>
            </div>
          </dl>
          <p className="mt-1.5 text-[10px] text-slate-600">Bike Yard demo estimate, computed from the showroom dataset’s tax and insurance values. See the BikeWale reference catalogue for separately sourced listings when available; accessories, extended warranty and fast-tag are extra as applicable. Final invoice at the showroom.</p>
          <p className="mt-0.5 text-[10px] text-slate-600 font-mono">On-road: ₹{onRoadRupees.toLocaleString('en-IN')} (demo estimate)</p>

          {/* CTAs */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => onEnquire(bike)}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-slate-950 hover:bg-amber-400 active:scale-[0.99] transition-all"
            >
              Get Best Price &amp; Callback
            </button>
            <a
              href={whatsAppLink(dealershipInfo.phone, enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
            </a>
            <a
              href={telLink(dealershipInfo.phone)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-100 hover:border-slate-500 transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> Call Sales Desk
            </a>
            <button
              onClick={() => onBookTestRide(bike)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" aria-hidden="true" /> Free Test Ride
            </button>
            <button
              onClick={() => onBookNow(bike)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
            >
              Demo booking · ₹10,000
            </button>
          </div>

          {/* Trust badges */}
          <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ShieldCheck, label: 'Factory warranty' },
              { icon: FileText, label: 'MH-04 transfer desk' },
              { icon: Wrench, label: 'Free PDI & fitting' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 px-2 py-2.5 flex flex-col items-center gap-1">
                <Icon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-300 leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------- Specifications ---------- */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section aria-label="Specifications" className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7">
          <h2 className="display-heading text-lg sm:text-xl text-white">Technical Specifications</h2>
          <p className="mt-1 text-[10px] text-slate-500">Factory figures from the central manufacturer dataset (BS6 Ph-2). “Claimed” mileage is the ARAI/manufacturer figure.</p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Gauge, label: 'Engine', value: isElectric ? 'Electric' : `${bike.engineCc} cc` },
              { icon: BadgePercent, label: 'Max Power', value: `${bike.powerBhp} bhp` },
              { icon: Gauge, label: 'Peak Torque', value: `${bike.torqueNm} Nm` },
              { icon: Fuel, label: 'Claimed Mileage', value: `${bike.mileageKmpl} ${isElectric ? 'km/charge' : 'km/l'}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-center">
                <Icon className="w-4 h-4 mx-auto text-amber-400" aria-hidden="true" />
                <p className="mt-1.5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 divide-y sm:divide-y-0">
            {[
              ['Category', bike.category],
              ['Kerb Weight', `${bike.kerbWeightKg} kg`],
              ['Fuel Tank', isElectric ? '—' : `${bike.fuelCapacityL} L`],
              ['Est. Range', estRangeKm ? `~${estRangeKm} km` : '—'],
              ['Colours', bike.availableColors.map((c) => c.name).join(', ') || '—'],
              ['Stock Status', bike.inStockCount > 0 ? `${bike.inStockCount} unit(s) at Khopat` : 'Booking open'],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-baseline justify-between gap-4 border-b border-slate-800/70 py-2.5 text-xs sm:text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[10px] text-slate-600">Detailed dimensions (L×W×H, wheelbase, seat height, ground clearance) are manufacturer datasheet items — ask our sales desk or request them on WhatsApp with your enquiry.</p>

          <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-l-2 border-amber-500/50 pl-4">{bike.description}</p>
        </section>

        {/* ---------- EMI Calculator ---------- */}
        <section aria-label="EMI calculator" className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 flex flex-col">
          <h2 className="display-heading text-lg sm:text-xl text-white">On-Road EMI Calculator</h2>
          <p className="mt-1 text-[10px] text-slate-500">Indicative only — actual sanction depends on lender, CIBIL and documents.</p>

          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="down-payment">Down payment</label>
                <span className="text-amber-400 tabular-nums">{downPaymentPct}% · {formatInr((onRoadPaise * BigInt(downPaymentPct * 100)) / 10000n)}</span>
              </div>
              <input
                id="down-payment"
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="mt-2 w-full accent-amber-500"
              />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300">Tenure</span>
              <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label="Loan tenure in months">
                {TENURES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenure(t)}
                    aria-pressed={tenure === t}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-bold tabular-nums transition-all ${
                      tenure === t ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="roi" className="text-xs font-semibold text-slate-300">Interest rate (APR %)</label>
              <input
                id="roi"
                type="number"
                min={6}
                max={24}
                step={0.05}
                value={roi}
                onChange={(e) => setRoi(Math.min(24, Math.max(0, Number(e.target.value) || 0)))}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white tabular-nums focus:border-amber-500 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-slate-600">Starting 8.99% APR via Bajaj Finance / HDFC (subject to eligibility).</p>
            </div>
          </div>

          {emi && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Estimated Monthly EMI</p>
              <p className="mt-1 text-4xl font-extrabold text-amber-400 tabular-nums">{formatInr(emi.emiPaise)}<span className="text-sm text-slate-400 font-semibold">/mo</span></p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-left text-[11px]">
                <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                  <dt className="text-slate-500">Loan amount</dt>
                  <dd className="font-bold text-white tabular-nums">{formatInr(emi.principalPaise)}</dd>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                  <dt className="text-slate-500">Total interest</dt>
                  <dd className="font-bold text-white tabular-nums">{formatInr(emi.totalInterestPaise)}</dd>
                </div>
              </dl>
              <button
                onClick={() => onEnquire(bike)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Get Exact Quote <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ---------- Similar motorcycles ---------- */}
      {similar.length > 0 && (
        <section aria-label="Similar motorcycles" className="mt-10">
          <div className="flex items-end justify-between border-b border-slate-800 pb-3">
            <h2 className="display-heading text-lg sm:text-xl text-white">Similar Motorcycles</h2>
            <Link to={`/?category=${encodeURIComponent(bike.category)}#catalogue-section`} className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
              More {bike.category}s <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {similar.map((b) => (
              <Link
                key={b.id}
                to={`/bike/${b.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-amber-500/50 transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-950">
                  <img src={getColorBikeImage(b, b.selectedColor)} alt={`${b.brand} ${b.model}`} loading="lazy" width={400} height={300} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{b.brand}</p>
                  <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-white line-clamp-1">{b.model}</h3>
                  <p className="mt-1 text-[11px] sm:text-xs font-extrabold text-amber-400 tabular-nums">{formatInr(b.exShowroomPaise)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Availability note with check list */}
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] sm:text-[11px] text-slate-500">
        {['Genuine manufacturer warranty', 'MH-04 registration assistance', 'Exchange bonus available', 'Free first service'].map((t) => (
          <li key={t} className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />{t}</li>
        ))}
      </ul>
    </div>
  );
};
