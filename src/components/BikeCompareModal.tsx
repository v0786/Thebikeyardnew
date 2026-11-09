import React, { useState, useMemo } from 'react';
import { Motorcycle } from '../types';
import { formatInr } from '../lib/currency';
import { getColorBikeImage } from '../data/dealershipData';
import {
  X,
  Scale,
  ArrowRightLeft,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  Gauge,
  Fuel,
  Weight,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface BikeCompareModalProps {
  onClose: () => void;
  bikes: Motorcycle[];
  initialBikeA?: Motorcycle | null;
  initialBikeB?: Motorcycle | null;
  onBookBike: (bike: Motorcycle) => void;
  onTestRideBike: (bike: Motorcycle) => void;
}

export const BikeCompareModal: React.FC<BikeCompareModalProps> = ({
  onClose,
  bikes,
  initialBikeA,
  initialBikeB,
  onBookBike,
  onTestRideBike,
}) => {
  // Select first two bikes as default if none provided
  const [bikeAId, setBikeAId] = useState<string>(
    initialBikeA?.id || bikes[0]?.id || ''
  );
  const [bikeBId, setBikeBId] = useState<string>(
    initialBikeB?.id || bikes[1]?.id || bikes[0]?.id || ''
  );
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);

  const bikeA = bikes.find((bike) => bike.id === bikeAId) ?? bikes[0]!;
  const bikeB = bikes.find((bike) => bike.id === bikeBId) ?? bikes[1] ?? bikes[0]!;

  const handleSwap = () => {
    const temp = bikeAId;
    setBikeAId(bikeBId);
    setBikeBId(temp);
  };

  // Calculations for on-road prices
  const onRoadPaiseA = bikeA.exShowroomPaise + bikeA.rtoTaxPaise + bikeA.insurancePaise + bikeA.handlingPaise;
  const onRoadPaiseB = bikeB.exShowroomPaise + bikeB.rtoTaxPaise + bikeB.insurancePaise + bikeB.handlingPaise;

  const emiA = Math.round(((Number(onRoadPaiseA / 100n) * 0.75) / 36) * 1.09);
  const emiB = Math.round(((Number(onRoadPaiseB / 100n) * 0.75) / 36) * 1.09);

  const powerToWeightA = ((bikeA.powerBhp / bikeA.kerbWeightKg) * 1000).toFixed(1);
  const powerToWeightB = ((bikeB.powerBhp / bikeB.kerbWeightKg) * 1000).toFixed(1);

  const rangeA = Math.round(bikeA.mileageKmpl * bikeA.fuelCapacityL);
  const rangeB = Math.round(bikeB.mileageKmpl * bikeB.fuelCapacityL);

  interface SpecRow {
    category: string;
    label: string;
    valA: string | number;
    valB: string | number;
    unit?: string;
    advantage?: 'A' | 'B' | 'EQUAL';
    advantageNote?: string;
    isDifferent: boolean;
  }

  const specRows: SpecRow[] = useMemo(() => {
    const rows: SpecRow[] = [];

    // 1. Pricing Specs
    const priceDiffPaise = onRoadPaiseA - onRoadPaiseB;
    rows.push({
      category: 'Thane (MH-04) Pricing & Finance',
      label: 'On-Road Thane Price',
      valA: formatInr(onRoadPaiseA),
      valB: formatInr(onRoadPaiseB),
      isDifferent: onRoadPaiseA !== onRoadPaiseB,
      advantage: priceDiffPaise < 0n ? 'A' : priceDiffPaise > 0n ? 'B' : 'EQUAL',
      advantageNote:
        priceDiffPaise !== 0n
          ? `₹${Math.abs(Number(priceDiffPaise / 100n)).toLocaleString('en-IN')} more affordable`
          : undefined,
    });

    const exDiff = bikeA.exShowroomPaise - bikeB.exShowroomPaise;
    rows.push({
      category: 'Thane (MH-04) Pricing & Finance',
      label: 'Market Ex-Showroom',
      valA: formatInr(bikeA.exShowroomPaise),
      valB: formatInr(bikeB.exShowroomPaise),
      isDifferent: bikeA.exShowroomPaise !== bikeB.exShowroomPaise,
      advantage: exDiff < 0n ? 'A' : exDiff > 0n ? 'B' : 'EQUAL',
    });

    rows.push({
      category: 'Thane (MH-04) Pricing & Finance',
      label: 'MH RTO Tax (11%)',
      valA: formatInr(bikeA.rtoTaxPaise),
      valB: formatInr(bikeB.rtoTaxPaise),
      isDifferent: bikeA.rtoTaxPaise !== bikeB.rtoTaxPaise,
    });

    rows.push({
      category: 'Thane (MH-04) Pricing & Finance',
      label: 'Comprehensive Insurance',
      valA: formatInr(bikeA.insurancePaise),
      valB: formatInr(bikeB.insurancePaise),
      isDifferent: bikeA.insurancePaise !== bikeB.insurancePaise,
    });

    const emiDiff = emiA - emiB;
    rows.push({
      category: 'Thane (MH-04) Pricing & Finance',
      label: 'Estimated EMI (36 Months)',
      valA: `~ ₹${emiA.toLocaleString('en-IN')}/mo`,
      valB: `~ ₹${emiB.toLocaleString('en-IN')}/mo`,
      isDifferent: emiA !== emiB,
      advantage: emiDiff < 0 ? 'A' : emiDiff > 0 ? 'B' : 'EQUAL',
    });

    // 2. Engine & Performance
    const ccDiff = bikeA.engineCc - bikeB.engineCc;
    rows.push({
      category: 'Engine & Performance',
      label: 'Engine Displacement',
      valA: bikeA.engineCc,
      valB: bikeB.engineCc,
      unit: 'cc',
      isDifferent: bikeA.engineCc !== bikeB.engineCc,
      advantage: ccDiff > 0 ? 'A' : ccDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: ccDiff !== 0 ? `+${Math.abs(ccDiff)} cc displacement` : undefined,
    });

    const powerDiff = Number((bikeA.powerBhp - bikeB.powerBhp).toFixed(1));
    rows.push({
      category: 'Engine & Performance',
      label: 'Maximum Power',
      valA: bikeA.powerBhp,
      valB: bikeB.powerBhp,
      unit: 'bhp',
      isDifferent: bikeA.powerBhp !== bikeB.powerBhp,
      advantage: powerDiff > 0 ? 'A' : powerDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: powerDiff !== 0 ? `+${Math.abs(powerDiff)} bhp higher power` : undefined,
    });

    const torqueDiff = Number((bikeA.torqueNm - bikeB.torqueNm).toFixed(1));
    rows.push({
      category: 'Engine & Performance',
      label: 'Peak Torque',
      valA: bikeA.torqueNm,
      valB: bikeB.torqueNm,
      unit: 'Nm',
      isDifferent: bikeA.torqueNm !== bikeB.torqueNm,
      advantage: torqueDiff > 0 ? 'A' : torqueDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: torqueDiff !== 0 ? `+${Math.abs(torqueDiff)} Nm punch` : undefined,
    });

    const ptwDiff = Number((parseFloat(powerToWeightA) - parseFloat(powerToWeightB)).toFixed(1));
    rows.push({
      category: 'Engine & Performance',
      label: 'Power-to-Weight Ratio',
      valA: powerToWeightA,
      valB: powerToWeightB,
      unit: 'bhp/tonne',
      isDifferent: powerToWeightA !== powerToWeightB,
      advantage: ptwDiff > 0 ? 'A' : ptwDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: ptwDiff !== 0 ? `+${Math.abs(ptwDiff)} bhp/tonne agility` : undefined,
    });

    // 3. Fuel & Economy
    const mileageDiff = Number((bikeA.mileageKmpl - bikeB.mileageKmpl).toFixed(1));
    rows.push({
      category: 'Fuel Economy & Range',
      label: 'Claimed Mileage',
      valA: bikeA.mileageKmpl,
      valB: bikeB.mileageKmpl,
      unit: 'km/l',
      isDifferent: bikeA.mileageKmpl !== bikeB.mileageKmpl,
      advantage: mileageDiff > 0 ? 'A' : mileageDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: mileageDiff !== 0 ? `+${Math.abs(mileageDiff)} km/l better economy` : undefined,
    });

    const tankDiff = Number((bikeA.fuelCapacityL - bikeB.fuelCapacityL).toFixed(1));
    rows.push({
      category: 'Fuel Economy & Range',
      label: 'Fuel Tank Capacity',
      valA: bikeA.fuelCapacityL,
      valB: bikeB.fuelCapacityL,
      unit: 'Liters',
      isDifferent: bikeA.fuelCapacityL !== bikeB.fuelCapacityL,
      advantage: tankDiff > 0 ? 'A' : tankDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: tankDiff !== 0 ? `+${Math.abs(tankDiff)} L larger tank` : undefined,
    });

    const rangeDiff = rangeA - rangeB;
    rows.push({
      category: 'Fuel Economy & Range',
      label: 'Est. Full Tank Range',
      valA: `~ ${rangeA}`,
      valB: `~ ${rangeB}`,
      unit: 'km',
      isDifferent: rangeA !== rangeB,
      advantage: rangeDiff > 0 ? 'A' : rangeDiff < 0 ? 'B' : 'EQUAL',
      advantageNote: rangeDiff !== 0 ? `+${Math.abs(rangeDiff)} km touring range` : undefined,
    });

    // 4. Dimensions & Segment
    const weightDiff = bikeA.kerbWeightKg - bikeB.kerbWeightKg;
    rows.push({
      category: 'Dimensions & Ergonomics',
      label: 'Kerb Weight',
      valA: bikeA.kerbWeightKg,
      valB: bikeB.kerbWeightKg,
      unit: 'kg',
      isDifferent: bikeA.kerbWeightKg !== bikeB.kerbWeightKg,
      advantage: weightDiff < 0 ? 'A' : weightDiff > 0 ? 'B' : 'EQUAL',
      advantageNote: weightDiff !== 0 ? `${Math.abs(weightDiff)} kg lighter` : undefined,
    });

    rows.push({
      category: 'Dimensions & Ergonomics',
      label: 'Category Segment',
      valA: bikeA.category,
      valB: bikeB.category,
      isDifferent: bikeA.category !== bikeB.category,
    });

    // 5. Dealership Floor & Stock
    rows.push({
      category: 'Showroom Availability & Verification',
      label: 'Ready Units in Khopat',
      valA: bikeA.inStockCount > 0 ? `${bikeA.inStockCount} Units Ready` : '10-Day Booking',
      valB: bikeB.inStockCount > 0 ? `${bikeB.inStockCount} Units Ready` : '10-Day Booking',
      isDifferent: bikeA.inStockCount !== bikeB.inStockCount,
      advantage: bikeA.inStockCount > bikeB.inStockCount ? 'A' : bikeA.inStockCount < bikeB.inStockCount ? 'B' : 'EQUAL',
    });

    rows.push({
      category: 'Showroom Availability & Verification',
      label: 'Condition & Warranty',
      valA: bikeA.isUsed ? `Pre-Owned (${bikeA.year}) · 6M Warranty` : 'Factory Fresh · 5-Yr Warranty',
      valB: bikeB.isUsed ? `Pre-Owned (${bikeB.year}) · 6M Warranty` : 'Factory Fresh · 5-Yr Warranty',
      isDifferent: bikeA.isUsed !== bikeB.isUsed || bikeA.year !== bikeB.year,
    });

    return rows;
  }, [bikeA, bikeB, onRoadPaiseA, onRoadPaiseB, emiA, emiB, powerToWeightA, powerToWeightB, rangeA, rangeB]);

  const filteredRows = onlyDifferences ? specRows.filter((r) => r.isDifferent) : specRows;

  // Group by category
  const categories = useMemo(() => {
    const list: string[] = [];
    filteredRows.forEach((r) => {
      if (!list.includes(r.category)) list.push(r.category);
    });
    return list;
  }, [filteredRows]);

  const differencesCount = specRows.filter((r) => r.isDifferent).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-[#0B0F0D] shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 p-3 sm:p-6 border-b border-slate-800 bg-[#141C15]/80 backdrop-blur-md shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs uppercase font-extrabold text-amber-500 tracking-wider">
                <Scale className="w-4 h-4 text-amber-400" />
                Side-by-Side Motorcycle Comparison
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                Thane MH-04 Precision RTO & Specs
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Compare Motorcycles
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Differences Toggle */}
            <button
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                onlyDifferences
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Differences Only ({differencesCount})</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close Comparison"
              className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable comparison area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
          {/* Top Sticky-like Comparison Cards Grid */}
          <div className="p-4 sm:p-6 bg-[#141C15]/40 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
            {/* Center Swap Action Button on Desktop */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                onClick={handleSwap}
                title="Swap bike positions"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Bike A Selector Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#1F2A1F]/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Motorcycle 1
                </span>
                <div className="relative min-w-0 flex-1 max-w-[240px]">
                  <select
                    value={bikeAId}
                    onChange={(e) => setBikeAId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none truncate"
                  >
                    {bikes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} ({b.variant})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Photo & Identity */}
              <div className="flex items-start gap-4">
                <div className="relative w-28 sm:w-36 aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={getColorBikeImage(bikeA, bikeA.selectedColor)}
                    alt={`${bikeA.brand} ${bikeA.model}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1">
                    {bikeA.inStockCount > 0 ? (
                      <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {bikeA.inStockCount} Ready
                      </span>
                    ) : (
                      <span className="bg-rose-950/90 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Open Booking
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-amber-500">
                    {bikeA.brand}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {bikeA.model}
                  </h3>
                  <div className="text-xs text-slate-400 truncate">{bikeA.variant}</div>

                  <div className="pt-1.5">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      On-Road Thane (MH-04)
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-amber-400 tabular-nums">
                      {formatInr(onRoadPaiseA)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Bike A */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onBookBike(bikeA)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Book ₹10,000</span>
                </button>
                <button
                  onClick={() => onTestRideBike(bikeA)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Test Ride</span>
                </button>
              </div>
            </div>

            {/* Bike B Selector Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#1F2A1F]/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Motorcycle 2
                </span>
                <div className="relative min-w-0 flex-1 max-w-[240px]">
                  <select
                    value={bikeBId}
                    onChange={(e) => setBikeBId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none truncate"
                  >
                    {bikes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} ({b.variant})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Photo & Identity */}
              <div className="flex items-start gap-4">
                <div className="relative w-28 sm:w-36 aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={getColorBikeImage(bikeB, bikeB.selectedColor)}
                    alt={`${bikeB.brand} ${bikeB.model}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1">
                    {bikeB.inStockCount > 0 ? (
                      <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {bikeB.inStockCount} Ready
                      </span>
                    ) : (
                      <span className="bg-rose-950/90 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Open Booking
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-amber-500">
                    {bikeB.brand}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {bikeB.model}
                  </h3>
                  <div className="text-xs text-slate-400 truncate">{bikeB.variant}</div>

                  <div className="pt-1.5">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      On-Road Thane (MH-04)
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-amber-400 tabular-nums">
                      {formatInr(onRoadPaiseB)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Bike B */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onBookBike(bikeB)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Book ₹10,000</span>
                </button>
                <button
                  onClick={() => onTestRideBike(bikeB)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Test Ride</span>
                </button>
              </div>
            </div>
          </div>

          {/* Specifications Table by Category */}
          <div className="p-4 sm:p-6 space-y-6">
            {categories.map((cat) => {
              const rowsInCat = filteredRows.filter((r) => r.category === cat);
              if (rowsInCat.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {cat}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[#141C15]/50">
                    <div className="divide-y divide-slate-800/60">
                      {rowsInCat.map((row, idx) => {
                        const isAdvA = row.advantage === 'A';
                        const isAdvB = row.advantage === 'B';

                        return (
                          <div
                            key={idx}
                            className={`grid grid-cols-12 p-2 [overflow-wrap:anywhere] sm:p-3 text-xs sm:text-sm items-center transition-colors ${
                              row.isDifferent
                                ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.07]'
                                : 'hover:bg-slate-900/40'
                            }`}
                          >
                            {/* Spec Label */}
                            <div className="col-span-4 sm:col-span-4 pr-2">
                              <span className="font-medium text-slate-300">
                                {row.label}
                              </span>
                              {row.isDifferent && (
                                <span className="hidden sm:inline-block ml-1.5 text-[10px] text-amber-400/80 font-mono">
                                  diff
                                </span>
                              )}
                            </div>

                            {/* Bike A Spec Value */}
                            <div className="col-span-4 sm:col-span-4 px-2 text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span
                                  className={`tabular-nums font-bold ${
                                    isAdvA ? 'text-amber-400' : 'text-white'
                                  }`}
                                >
                                  {row.valA} {row.unit ? row.unit : ''}
                                </span>
                                {isAdvA && row.advantageNote && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    {row.advantageNote}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bike B Spec Value */}
                            <div className="col-span-4 sm:col-span-4 pl-2 text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span
                                  className={`tabular-nums font-bold ${
                                    isAdvB ? 'text-amber-400' : 'text-white'
                                  }`}
                                >
                                  {row.valB} {row.unit ? row.unit : ''}
                                </span>
                                {isAdvB && row.advantageNote && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    {row.advantageNote}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#141C15] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-amber-400 font-semibold">The Bike Yard Promise:</span> 100% transparent MH-04 on-road pricing with no hidden charges, zero paperwork stress, and immediate Khopat inventory allocation.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Showroom
          </button>
        </div>
      </div>
    </div>
  );
};
