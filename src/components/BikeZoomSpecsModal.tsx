import React, { useState } from 'react';
import { Motorcycle } from '../types';
import { formatInr } from '../lib/currency';
import { X, ZoomIn, ShieldCheck, Gauge, Wrench, BatteryCharging, ArrowRight, Check } from 'lucide-react';
import { cartStore } from '../services/cartStore';
import { dealershipStore } from '../services/dealershipStore';
import { getColorBikeImage } from '../data/dealershipData';

interface BikeZoomSpecsModalProps {
  bike: Motorcycle | null;
  onClose: () => void;
  onBookTestRide: (bike: Motorcycle) => void;
  onInstantBooking: (bike: Motorcycle) => void;
}

export const BikeZoomSpecsModal: React.FC<BikeZoomSpecsModalProps> = ({
  bike,
  onClose,
  onBookTestRide,
  onInstantBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'pricing'>('specs');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    bike?.selectedColor || bike?.availableColors[0]?.name || 'Standard'
  );

  if (!bike) return null;

  const activeBikeImage = getColorBikeImage(bike, selectedColor);

  const onRoadPaise =
    bike.exShowroomPaise + bike.rtoTaxPaise + bike.insurancePaise + bike.handlingPaise;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-500">
                {bike.brand}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{bike.category} Series</span>
              {bike.isUsed && (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  Certified Pre-Owned
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {bike.model}
            </h2>
            <div className="text-xs sm:text-sm text-slate-400">
              {bike.variant} · Colour: <span className="text-amber-400 font-bold">{selectedColor}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Product Visual with Zoom-out / Lightbox toggle */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 group">
          <img
            key={selectedColor}
            src={activeBikeImage}
            alt={`${bike.brand} ${bike.model} (${selectedColor})`}
            className={`w-full h-full object-contain cursor-zoom-in transition-all duration-500 ${
              isZoomed ? 'scale-125' : 'group-hover:scale-105'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-amber-400 border border-slate-700">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/30"
                style={{
                  backgroundColor:
                    bike.availableColors.find((c) => c.name === selectedColor)?.hex || '#ffffff',
                }}
              />
              <span>{selectedColor}</span>
            </span>
          </div>

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{isZoomed ? 'Reset View' : 'Zoom Machine View'}</span>
          </button>

          <div className="absolute top-3 left-3 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs text-slate-300 border border-slate-800">
            Market Ex-Showroom: <strong className="text-white">{formatInr(bike.exShowroomPaise)}</strong>
          </div>
        </div>

        {/* Dynamic Color Selector Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Available Factory Colours (Click to change photo):</span>
            <span className="text-amber-400 font-bold">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bike.availableColors.map((c) => {
              const isSelected = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setSelectedColor(c.name);
                    dealershipStore.selectBikeColor(bike.id, c.name);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500/30 shadow-md scale-105'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Variant Choice Strip (Base, Base Premium, Mid, Top) */}
        {bike.variants && bike.variants.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Choose Factory Variant:</span>
              <span className="text-amber-400 font-bold">{bike.variant}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bike.variants.map((v) => {
                const isCur = bike.selectedVariantId === v.id || bike.variant === v.name;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => dealershipStore.selectBikeVariant(bike.id, v.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCur
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{v.name}</div>
                    <div className="text-[11px] font-semibold text-amber-400 mt-0.5 tabular-nums">
                      {formatInr(v.exShowroomPaise)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabbed specification navigation */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('specs')}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'specs'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'features'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Key Features & Tech
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'pricing'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            On-Road Thane Price Table
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Engine & Transmission */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>Engine & Performance</span>
              </div>
              <div className="divide-y divide-slate-800/80 space-y-2 text-slate-300">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Engine Capacity</span>
                  <span className="font-semibold text-white">{bike.engineCc} cc</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Max Engine Power</span>
                  <span className="font-semibold text-white">{bike.powerBhp} bhp</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Peak Torque</span>
                  <span className="font-semibold text-white">{bike.torqueNm} Nm</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">ARAI / City Mileage</span>
                  <span className="font-semibold text-white">{bike.mileageKmpl} km/litre</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Emission Standard</span>
                  <span className="font-semibold text-white">BS6 Phase 2 (OBD-2 Compliant)</span>
                </div>
              </div>
            </div>

            {/* Brakes, Suspension & Dimensions */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>Chassis, Suspension & Wheels</span>
              </div>
              <div className="divide-y divide-slate-800/80 space-y-2 text-slate-300">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Kerb Weight</span>
                  <span className="font-semibold text-white">{bike.kerbWeightKg} kg</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Fuel Tank Capacity</span>
                  <span className="font-semibold text-white">{bike.fuelCapacityL} Litres</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Braking System</span>
                  <span className="font-semibold text-white">Dual-Channel ABS with Disc Brakes</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Tyre Type</span>
                  <span className="font-semibold text-white">Tubeless Radial Tyres</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Ground Clearance</span>
                  <span className="font-semibold text-white">160 – 180 mm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white">Key Technology & Ride Equipment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 p-3 space-y-1">
                <div className="font-bold text-white">LED Illumination System</div>
                <div className="text-slate-400 text-[11px]">Class-D high-intensity LED headlamp with DRL signature.</div>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 space-y-1">
                <div className="font-bold text-white">Digital Multi-Function Console</div>
                <div className="text-slate-400 text-[11px]">TFT/LCD cockpit with gear position indicator, trip meters & clock.</div>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 space-y-1">
                <div className="font-bold text-white">Assist & Slipper Clutch</div>
                <div className="text-slate-400 text-[11px]">Effortless clutch pull and prevents rear-wheel hopping on downshifts.</div>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 space-y-1">
                <div className="font-bold text-white">USB Smart Mobile Charging</div>
                <div className="text-slate-400 text-[11px]">Integrated weatherproof fast-charging port for GPS navigation.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white">Official Maharashtra On-Road Price (Thane MH-04)</h4>
            <div className="space-y-2 divide-y divide-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Market Ex-Showroom</span>
                <span className="font-semibold text-white tabular-nums">{formatInr(bike.exShowroomPaise)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Maharashtra RTO Tax (MH-04)</span>
                <span className="font-semibold text-white tabular-nums">{formatInr(bike.rtoTaxPaise)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">IRDAI 1+5 Year Comprehensive Insurance</span>
                <span className="font-semibold text-white tabular-nums">{formatInr(bike.insurancePaise)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">HSRP Number Plate & Delivery Handling</span>
                <span className="font-semibold text-white tabular-nums">{formatInr(bike.handlingPaise)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-black text-amber-400">
                <span>Total On-Road Thane Price:</span>
                <span className="tabular-nums">{formatInr(onRoadPaise)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">On-Road Delivery (Thane)</div>
            <div className="text-2xl font-black text-amber-400 tabular-nums">{formatInr(onRoadPaise)}</div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onBookTestRide(bike);
              }}
              className="flex-1 sm:flex-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Book Test Ride
            </button>
            <button
              onClick={() => {
                onClose();
                onInstantBooking(bike);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md"
            >
              <span>Instant Reserve Chassis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
