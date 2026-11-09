import React, { useState, useEffect } from 'react';
import { Motorcycle } from '../types';
import { formatInr, splitGst } from '../lib/currency';
import {
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Check,
  ArrowRight,
  Eye,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { cartStore } from '../services/cartStore';
import { getColorBikeImage } from '../data/dealershipData';

interface PersistentOnRoadBarProps {
  selectedBike: Motorcycle;
  onSelectBike: (bike: Motorcycle) => void;
  bikes: Motorcycle[];
  onOpenBooking: (bike: Motorcycle) => void;
  onOpenTestRide: (bike: Motorcycle) => void;
  onOpenSpecs: (bike: Motorcycle) => void;
}

export const PersistentOnRoadBar: React.FC<PersistentOnRoadBarProps> = ({
  selectedBike,
  onSelectBike,
  bikes,
  onOpenBooking,
  onOpenTestRide,
  onOpenSpecs,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);
  const [addedToCartToast, setAddedToCartToast] = useState<boolean>(false);
  const [isHapticActive, setIsHapticActive] = useState<boolean>(false);

  // Trigger hardware vibration and tactile visual spring feedback
  const triggerHaptic = (intensity: 'light' | 'medium' = 'light') => {
    setIsHapticActive(true);
    setTimeout(() => setIsHapticActive(false), 200);

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (intensity === 'medium') {
          navigator.vibrate([20, 40]);
        } else {
          navigator.vibrate(15);
        }
      } catch (e) {
        // Safe ignore
      }
    }
  };

  const onRoadPaise =
    selectedBike.exShowroomPaise +
    selectedBike.rtoTaxPaise +
    selectedBike.insurancePaise +
    selectedBike.handlingPaise;

  const gstSplit = splitGst(selectedBike.exShowroomPaise, 1800, false);
  const displayImage = getColorBikeImage(selectedBike, selectedBike.selectedColor);

  const handleAddToCart = () => {
    triggerHaptic('medium');
    cartStore.addBikeBooking(
      selectedBike,
      1000000n,
      selectedBike.selectedColor || selectedBike.availableColors[0]?.name || 'Standard'
    );
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2500);
  };

  const handleBookAdvance = () => {
    triggerHaptic('medium');
    onOpenBooking(selectedBike);
  };

  return (
    <aside
      aria-label="Selected vehicle pricing breakdown"
      className={`fixed z-30 transition-all duration-300 safe-area-pb ${
        isMobileCollapsed
          ? 'bottom-[calc(4rem+env(safe-area-inset-bottom))] left-3 right-3 md:bottom-0 md:left-0 md:right-0'
          : 'bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 md:bottom-0'
      }`}
    >
      {/* Mobile Collapsed Floating Pill State (Non-obstructive) */}
      {isMobileCollapsed && (
        <div
          className={`md:hidden flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl transition-transform duration-150 ${
            isHapticActive ? 'scale-95 ring-2 ring-amber-400' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileCollapsed(false);
            }}
            className="flex items-center gap-2.5 min-w-0 text-left active:scale-95 transition-transform"
          >
            <div className="relative h-9 w-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
              <img
                src={displayImage}
                alt={selectedBike.model}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate max-w-[130px]">
                {selectedBike.brand} {selectedBike.model}
              </div>
              <div className="text-xs font-black text-amber-400 tabular-nums">
                {formatInr(onRoadPaise)}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsMobileCollapsed(false);
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:text-white active:scale-95 transition-all"
            >
              <Maximize2 className="w-3 h-3 text-amber-400" />
              <span>Details</span>
            </button>

            <button
              type="button"
              onClick={handleBookAdvance}
              className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              <span>Book ₹10k</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      {/* Full expanded pricing bar */}
        <div
          className={`${isMobileCollapsed ? 'hidden md:block' : 'block'} border-t border-slate-700 bg-slate-950/95 backdrop-blur-xl shadow-2xl transition-all duration-150 ${
            isHapticActive ? 'ring-1 ring-amber-500/40' : ''
          }`}
        >
          {/* Expanded Transparency Calculation Details */}
          {isExpanded && (
            <div className="border-b border-slate-800 bg-slate-900/95 p-4 sm:p-6 max-h-[45dvh] overflow-y-auto animate-fadeIn">
              <div className="mx-auto max-w-7xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      100% On-Road Pricing Transparency (Thane MH-04 Jurisdiction)
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsExpanded(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white active:scale-95 transition-transform"
                  >
                    Close Breakdown
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  At The Bike Yard, every Rupee and Paise is mathematically audited. No hidden
                  documentation cess, no inflated logistic markups, and no mandatory accessory
                  bundling.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="text-slate-400 font-medium">1. Ex-Showroom (Factory + GST)</div>
                    <div className="text-base font-bold text-white tabular-nums">
                      {formatInr(selectedBike.exShowroomPaise)}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>· CGST (9.00%): {formatInr(gstSplit.cgstPaise)}</div>
                      <div>· SGST (9.00%): {formatInr(gstSplit.sgstPaise)}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="text-slate-400 font-medium">2. Maharashtra RTO Tax</div>
                    <div className="text-base font-bold text-white tabular-nums">
                      {formatInr(selectedBike.rtoTaxPaise)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Calculated at 11% non-transport individual two-wheeler rate under Maharashtra
                      Motor Vehicles Taxation Act.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="text-slate-400 font-medium">3. IRDAI Comprehensive Insurance</div>
                    <div className="text-base font-bold text-white tabular-nums">
                      {formatInr(selectedBike.insurancePaise)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mandatory 1-Year Own Damage + 5-Year Third Party cover with Zero Depreciation
                      waiver.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="text-slate-400 font-medium">4. HSRP & Handling Logistics</div>
                    <div className="text-base font-bold text-white tabular-nums">
                      {formatInr(selectedBike.handlingPaise)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Includes laser-embossed High Security Registration Plate (HSRP) and 45-point
                      PDI.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Persistent Bar Strip */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Selected Bike Pill */}
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-14 sm:h-12 sm:w-16 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={displayImage}
                  alt={selectedBike.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    Selected Machine
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenSpecs(selectedBike);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2 flex items-center gap-0.5 active:scale-95 transition-transform"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Specs & 360° Zoom</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                  {selectedBike.brand} {selectedBike.model}
                </div>
                <div className="text-[10px] text-slate-400">
                  Market Ex-Showroom: {formatInr(selectedBike.exShowroomPaise)}
                </div>
              </div>
            </div>

            {/* Pricing & Transparency Trigger */}
            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-end gap-1">
                  <span>On-Road Thane (MH-04)</span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold ml-1 flex items-center gap-0.5 active:scale-95 transition-transform"
                  >
                    <span>{isExpanded ? 'Hide Math' : 'Verify Math'}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-base sm:text-2xl font-black text-amber-400 tabular-nums">
                  {formatInr(onRoadPaise)}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                >
                  {addedToCartToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Added to Cart!</span>
                    </>
                  ) : (
                    <span>Add to Cart</span>
                  )}
                </button>

                <button
                  onClick={handleBookAdvance}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 sm:py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all whitespace-nowrap"
                >
                  <span>Book with ₹10k Advance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Mobile Minimize Pill Button */}
                <button
                  type="button"
                  title="Minimize bar on mobile"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsMobileCollapsed(true);
                  }}
                  className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-90 transition-all"
                >
                  <Minimize2 className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </aside>
  );
};
