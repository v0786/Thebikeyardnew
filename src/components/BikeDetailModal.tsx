import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useEffect, useRef, useState } from 'react';
import { Motorcycle } from '../types';
import { formatInr, splitGst, toPaise } from '../lib/currency';
import { X, Check, ShieldCheck, Calculator, Sparkles, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';
import { computeEmi, SHOWROOM_EMI_DEFAULTS } from '../lib/emi';
import { getColorBikeImage } from '../data/dealershipData';

interface BikeDetailModalProps {
  bike: Motorcycle;
  initialBookingForm?: boolean;
  onClose: () => void;
  onOpenTestRide: (bike: Motorcycle) => void;
}

export const BikeDetailModal: React.FC<BikeDetailModalProps> = ({
  bike,
  initialBookingForm = false,
  onClose,
  onOpenTestRide,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(
    bike.selectedColor || bike.availableColors[0]?.name || 'Standard'
  );
  const activeBikeImage = getColorBikeImage(bike, selectedColor);
  const [showBookingForm, setShowBookingForm] = useState(initialBookingForm);
  const bookingNameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (showBookingForm) bookingNameInput.current?.focus();
  }, [showBookingForm]);
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(10000);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // EMI Calculator states
  const totalOnRoadPaise =
    bike.exShowroomPaise + bike.rtoTaxPaise + bike.insurancePaise + bike.handlingPaise;
  const totalRupees = Number(totalOnRoadPaise) / 100;

  const [customDownPayment, setCustomDownPayment] = useState<number | null>(null);
  const [tenureMonths, setTenureMonths] = useState(SHOWROOM_EMI_DEFAULTS.months);
  const [interestRate, setInterestRate] = useState(SHOWROOM_EMI_DEFAULTS.annualRatePercent);
  const maxDownPayment = Math.round(totalRupees * 0.8);
  const minDownPayment = Math.min(15000, maxDownPayment);
  const downPaymentPaise = customDownPayment === null
    ? (totalOnRoadPaise * BigInt(SHOWROOM_EMI_DEFAULTS.downPaymentPercent)) / 100n
    : toPaise(Math.min(customDownPayment, maxDownPayment));
  const { emiPaise } = computeEmi(totalOnRoadPaise, downPaymentPaise, interestRate, tenureMonths);

  // Maharashtra GST split calculation (Intra-State 18%)
  const gstDetails = splitGst(bike.exShowroomPaise, 1800, false);

  const handleInstantBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    if (!bookingName.trim() || bookingPhone.trim().length < 10) return;

    const res = dealershipStore.createBooking({
      acceptance,
      customerName: bookingName,
      customerPhone: bookingPhone,
      bikeId: bike.id,
      color: selectedColor,
      advanceAmountPaise: BigInt(advanceAmount * 100),
      tentativeDeliveryDate: '2026-11-12',
      salesExecutiveName: 'Suraj Patil (Online Desk)',
    });

    if (res.success && res.booking) {
      setBookingSuccess(res.booking.bookingNumber);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-500">
                {bike.brand}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{bike.category}</span>
              {bike.isUsed && (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  Pre-Owned
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {bike.model}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">{bike.variant}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Visuals & Specifications */}
          <div className="md:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                key={selectedColor}
                src={activeBikeImage}
                alt={`${bike.brand} ${bike.model} (${selectedColor})`}
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 rounded-lg bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{
                    backgroundColor:
                      bike.availableColors.find((c) => c.name === selectedColor)?.hex || '#ffffff',
                  }}
                />
                <span>{selectedColor}</span>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                {bike.inStockCount > 0 ? `${bike.inStockCount} Units Ready in Khopat` : 'Booking Open (10 Days)'}
              </div>
            </div>

            {/* Variant choice */}
            {bike.variants && bike.variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Factory Variant:</span>
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
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isCur
                            ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{v.name}</div>
                        <div className="text-[10px] text-amber-400 font-semibold tabular-nums mt-0.5">
                          {formatInr(v.exShowroomPaise)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selection */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Select Colour Variant:</span>
                <span className="text-amber-400 font-bold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {bike.availableColors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c.name);
                        dealershipStore.selectBikeColor(bike.id, c.name);
                      }}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500/30 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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

            {/* Technical Spec Matrix */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Technical Specifications
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Displacement:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.engineCc} cc</span>
                </div>
                <div>
                  <span className="text-slate-500">Max Power:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.powerBhp} bhp</span>
                </div>
                <div>
                  <span className="text-slate-500">Max Torque:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.torqueNm} Nm</span>
                </div>
                <div>
                  <span className="text-slate-500">Fuel Economy:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.mileageKmpl} km/l</span>
                </div>
                <div>
                  <span className="text-slate-500">Kerb Weight:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.kerbWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-500">Fuel Tank:</span>{' '}
                  <span className="font-semibold text-slate-200">{bike.fuelCapacityL} L</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{bike.description}</p>
          </div>

          {/* Right Column: Complete On-Road Breakdown & EMI Calculator */}
          <div className="md:col-span-6 space-y-6">
            {/* Price Breakdown Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  On-Road Thane (MH-04) Breakdown
                </div>
                <div className="text-xs text-slate-400">Paise-Safe Integer Math</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Ex-Showroom Price</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatInr(bike.exShowroomPaise)}
                  </span>
                </div>

                {/* Maharashtra GST split info */}
                <div className="pl-3 border-l border-slate-800 text-[11px] text-slate-400 space-y-1 py-1">
                  <div className="flex justify-between">
                    <span>CGST (9.00% Intra-State)</span>
                    <span className="tabular-nums">{formatInr(gstDetails.cgstPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9.00% Maharashtra)</span>
                    <span className="tabular-nums">{formatInr(gstDetails.sgstPaise)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Maharashtra RTO Tax (MH-04 Central)</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatInr(bike.rtoTaxPaise)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Comprehensive Insurance (1-Yr OD + 5-Yr TP)</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatInr(bike.insurancePaise)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Handling, PDI & HSRP Number Plate</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatInr(bike.handlingPaise)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs text-slate-400">Total On-Road Delivery Price</div>
                    <div className="text-[10px] text-emerald-400">All-Inclusive. Zero Hidden Charges.</div>
                  </div>
                  <div className="text-2xl font-black text-amber-400 tabular-nums">
                    {formatInr(totalOnRoadPaise)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive EMI Calculator Module */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>On-Road Finance & EMI Calculator</span>
                </div>
                <div className="text-xs font-bold text-amber-400">
                  ~ {formatInr(emiPaise)}/month
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Down Payment</span>
                    <span className="text-white font-semibold">{formatInr(downPaymentPaise)}</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Down payment in rupees"
                    min={Math.min(minDownPayment, Number(downPaymentPaise) / 100)}
                    max={maxDownPayment}
                    step={0.01}
                    value={Number(downPaymentPaise) / 100}
                    onChange={(e) => setCustomDownPayment(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Loan Tenure</span>
                    <span className="text-white font-semibold">{tenureMonths} Months ({tenureMonths / 12} Yrs)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 48].map((m) => (
                      <button
                        key={m}
                        onClick={() => setTenureMonths(m)}
                        className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                          tenureMonths === m
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {m} Mos
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Bank Interest Rate (APR)</span>
                    <span className="text-white font-semibold">{interestRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min={8.5}
                    max={13.5}
                    step={0.01}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {!showBookingForm ? (
              <div className="space-y-3">
                {bookingSuccess && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="font-bold">Demo Booking Confirmed: {bookingSuccess}</div>
                      <div>A sample chassis has been reserved in this demo.</div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    <span>Demo Booking Advance</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTestRide(bike);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    Schedule Test Ride
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleInstantBooking}
                className="rounded-2xl border border-amber-500/30 bg-slate-950 p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-bold text-amber-400">Demo Booking with Advance</div>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-slate-400">Use sample details. This form simulates a reservation and collects no payment.</p>
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="demo-booking-name" className="text-slate-400 block mb-1">Your Full Name</label>
                    <input
                      id="demo-booking-name"
                      ref={bookingNameInput}
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="e.g. Rahul Deshmukh"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Mobile Number (10 Digits)</label>
                    <input
                      type="tel"
                      required
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="e.g. 9820123456"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Advance Deposit Amount</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[5000, 10000, 15000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdvanceAmount(amt)}
                          className={`rounded-lg py-1.5 text-xs font-semibold ${
                            advanceAmount === amt
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <CustomerTerms purpose="simulate your booking" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors"
                >
                  Simulate ₹{advanceAmount.toLocaleString('en-IN')} Advance & Reserve Sample Chassis
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
