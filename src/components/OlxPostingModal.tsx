import React, { useState, useEffect } from 'react';
import { Motorcycle, OlxListing } from '../types';
import { dealershipStore } from '../services/dealershipStore';
import { formatInr } from '../lib/currency';
import {
  X,
  Share2,
  CheckCircle2,
  ExternalLink,
  Upload,
  Camera,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  AlertCircle,
  Copy,
  Trash2,
} from 'lucide-react';

interface OlxPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: Motorcycle | null;
  availableBikes?: Motorcycle[];
  staffName?: string;
}

export const OlxPostingModal: React.FC<OlxPostingModalProps> = ({
  isOpen,
  onClose,
  bike,
  availableBikes = [],
  staffName = 'Suraj Patil (Sales Exec)',
}) => {
  // Pre-owned bikes only
  const preOwnedBikes = availableBikes.filter((b) => b.isUsed);
  const defaultBike = bike?.isUsed ? bike : preOwnedBikes[0] || bike;

  const [selectedBikeId, setSelectedBikeId] = useState<string>(defaultBike?.id || '');
  const activeBike = availableBikes.find((b) => b.id === selectedBikeId) || defaultBike;

  // Ad Form Fields (Pre-filled for 1-click posting)
  const [adTitle, setAdTitle] = useState<string>('');
  const [adPrice, setAdPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Khopat, Thane West, Maharashtra (Near Rutu Business Park)');
  const [negotiable, setNegotiable] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'create' | 'preview' | 'success'>('create');
  const [createdListing, setCreatedListing] = useState<OlxListing | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync state whenever active bike changes
  useEffect(() => {
    if (activeBike) {
      setSelectedBikeId(activeBike.id);
      const year = activeBike.year || 2022;
      const km = activeBike.odometerKm || 18400;
      const defaultPrice = Number(activeBike.exShowroomPaise / 100n);

      setAdTitle(`[Certified 1-Owner] ${year} ${activeBike.brand} ${activeBike.model} - Thane (MH-04)`);
      setAdPrice(defaultPrice);
      setDescription(
        `The Bike Yard Thane Certified Pre-Owned Vehicle.\n` +
        `• Model: ${activeBike.brand} ${activeBike.model} (${year})\n` +
        `• Odometer: ${km.toLocaleString('en-IN')} KM Genuine & Verified\n` +
        `• Ownership: 1st Owner / Non-accidental record\n` +
        `• Mechanical Check: 45-Point Dealership PDI Passed\n` +
        `• Warranty: 6-Month Engine & Transmission Dealer Warranty\n` +
        `• Documents: Clean MH-04 Thane RTO Transfer, 1-Year Valid Insurance\n` +
        `• Inspection Location: The Bike Yard Showroom, Rutu Business Park, Khopat, Thane (W).\n` +
        `Call/WhatsApp showroom directly: +91 98204 55120.`
      );
      setCurrentStep('create');
      setCreatedListing(null);
    }
  }, [activeBike?.id, isOpen]);

  if (!isOpen || !activeBike) return null;

  const handlePublishToOlx = () => {
    const res = dealershipStore.postBikeToOlx({
      bikeId: activeBike.id,
      customTitle: adTitle,
      customPriceInr: adPrice,
      customDescription: description,
      staffName,
    });

    if (res.success && res.listing) {
      setCreatedListing(res.listing);
      setCurrentStep('success');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* OLX India Integration Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {/* OLX Iconic Brand Badge */}
            <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-emerald-500 font-black text-slate-950 text-base tracking-tighter shadow-md shadow-emerald-500/20">
              olx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">OLX India 1-Click Ad Publisher</h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OLX Pro Dealer Logged In
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected: <span className="text-slate-300 font-mono">dealers@thebikeyard.in</span> · Verified Khopat Showroom
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Create & Quick Pre-fills */}
        {currentStep === 'create' && (
          <div className="space-y-5">
            {/* Pre-Owned Vehicle Selector */}
            {preOwnedBikes.length > 1 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Select Certified Pre-Owned Unit to Post:
                </label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                >
                  {preOwnedBikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.year || '2023'} {b.brand} {b.model} — {b.odometerKm?.toLocaleString('en-IN') || '15,000'} KM (₹{Number(b.exShowroomPaise / 100n).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick 1-Click Summary Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="relative aspect-video w-full sm:w-36 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <img
                  src={activeBike.image}
                  alt={activeBike.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 rounded bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                  Studio HD
                </span>
              </div>
              <div className="space-y-1 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {activeBike.brand} {activeBike.model}
                  </span>
                  <span className="rounded bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 text-[10px]">
                    {activeBike.year || 2022}
                  </span>
                </div>
                <div className="text-slate-400">
                  {activeBike.odometerKm?.toLocaleString('en-IN') || '18,400'} KM Verified · 45-Point Inspection Passed
                </div>
                <div className="text-emerald-400 font-bold pt-1">
                  1-Click Ready: Title, verified inspection badge, and dealer contact details pre-filled.
                </div>
              </div>
            </div>

            {/* Ad Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                OLX Listing Title (Optimized for Thane Searches)
              </label>
              <input
                type="text"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-medium"
              />
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Listing Price (INR)</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                    />
                    <span>Negotiable Tag</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={adPrice}
                    onChange={(e) => setAdPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-7 pr-4 py-2 text-xs text-white font-bold tabular-nums focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">OLX Location Zone</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none truncate"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Dealer Description & Trust Guarantee
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auto-tagged with verified dealer seal on OLX</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep('preview')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview OLX Ad Card</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishToOlx}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>1-Click Post Live to OLX</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Realistic OLX Mobile Ad Card Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>OLX India App Preview</span>
                <span className="text-xs text-slate-400 font-normal">(How Thane buyers will see your ad)</span>
              </h4>
              <button
                onClick={() => setCurrentStep('create')}
                className="text-xs text-amber-400 hover:underline"
              >
                ← Back to Edit
              </button>
            </div>

            {/* OLX Phone UI Mockup */}
            <div className="mx-auto max-w-sm rounded-2xl border-2 border-slate-700 bg-white text-slate-900 shadow-2xl overflow-hidden">
              {/* OLX Top Bar */}
              <div className="bg-[#002f34] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black text-[11px]">
                    olx
                  </span>
                  <span>Motorcycles in Thane</span>
                </div>
                <span className="text-[10px] text-emerald-400">Featured Dealer</span>
              </div>

              {/* Ad Image */}
              <div className="relative aspect-[4/3] bg-slate-100">
                <img
                  src={activeBike.image}
                  alt={activeBike.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                  Verified Dealer
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-black/70 text-white px-2 py-0.5 text-[10px]">
                  1/4 Photos
                </span>
              </div>

              {/* Ad Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-extrabold text-[#002f34] tabular-nums">
                      ₹ {adPrice.toLocaleString('en-IN')}
                    </div>
                    {negotiable && (
                      <span className="text-[10px] text-slate-500 font-semibold">Negotiable</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">Today</span>
                </div>

                <div className="text-xs font-bold text-slate-800 line-clamp-2">{adTitle}</div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600 border-y border-slate-200 py-1.5">
                  <span>{activeBike.year || 2022}</span>
                  <span>·</span>
                  <span>{activeBike.odometerKm?.toLocaleString('en-IN') || '18,400'} km</span>
                  <span>·</span>
                  <span>1st Owner</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Khopat, Thane West, Maharashtra</span>
                </div>

                {/* Seller Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">The Bike Yard (Dealership)</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Verified Dealer · Member since 2021 · 4.9 ★ (84 Reviews)
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Pro
                  </span>
                </div>
              </div>

              {/* Bottom Chat / Call Bar */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-100 border-t border-slate-200">
                <button
                  type="button"
                  className="rounded-lg border border-[#002f34] text-[#002f34] py-2 text-xs font-bold text-center"
                >
                  Chat with Dealer
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#002f34] text-white py-2 text-xs font-bold text-center"
                >
                  Call +91 98204...
                </button>
              </div>
            </div>

            {/* Confirm & Publish */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep('create')}
                className="rounded-xl px-4 py-2.5 text-xs text-slate-400 hover:text-white"
              >
                Make Changes
              </button>
              <button
                type="button"
                onClick={handlePublishToOlx}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Post Live to OLX India</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen with Live Link */}
        {currentStep === 'success' && createdListing && (
          <div className="text-center py-6 space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ad Posted Live to OLX India!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Your pre-owned motorcycle is now broadcast to thousands of active two-wheeler buyers across Thane, Mulund, and Mumbai.
              </p>
            </div>

            {/* Ad Reference Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">OLX Reference ID:</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {createdListing.olxAdId}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">Vehicle:</span>
                <span className="text-xs font-bold text-white">
                  {createdListing.brand} {createdListing.model} ({createdListing.year})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">Listed Price:</span>
                <span className="text-sm font-black text-emerald-400">
                  ₹ {createdListing.priceInr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">OLX Listing URL:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(createdListing.url)}
                    className="flex items-center gap-1 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={createdListing.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Posted by {createdListing.postedBy} · Logged in dealership internal audit ledger.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close & Return
              </button>
              <button
                onClick={() => {
                  setCurrentStep('create');
                }}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
              >
                Post Another Pre-Owned Bike
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
