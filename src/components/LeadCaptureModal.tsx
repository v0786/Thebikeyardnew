import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState } from 'react';
import { Motorcycle } from '../types';
import { dealershipStore } from '../services/dealershipStore';
import { X, PhoneCall, CheckCircle2, ShieldCheck, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { formatInr } from '../lib/currency';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBike?: Motorcycle | null;
  bikes?: Motorcycle[];
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  selectedBike,
  bikes = [],
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeOfInterest, setBikeOfInterest] = useState(
    selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : 'Royal Enfield Hunter 350'
  );
  const [preferredTime, setPreferredTime] = useState('Immediate (Next 15 mins)');
  const [interestType, setInterestType] = useState<'PRICE_QUOTE' | 'FINANCE' | 'EXCHANGE' | 'DELIVERY'>('PRICE_QUOTE');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    if (!fullName.trim() || phone.trim().length < 10) return;

    const res = dealershipStore.createLead({
      acceptance,
      customerName: fullName,
      phone: phone,
      bikeOfInterest: bikeOfInterest,
      source: 'WEBSITE',
      notes: `Interest: ${interestType} · Preferred Slot: ${preferredTime}. ${notes ? `Customer Note: ${notes}` : ''}`,
      assignedTo: 'Suraj Patil (Online Sales Desk)',
    });

    if (res.success) {
      setCreatedLeadId(res.lead.id);
      setIsSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <PhoneCall className="w-3 h-3" />
                  <span>15-Minute Showroom SLA</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Thane (MH-04)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Get On-Road Quote & Priority Callback
              </h2>
              <p className="text-xs text-slate-400">
                Official quotation sheet with line-item RTO, zero-dep insurance, and exchange valuation delivered via phone or WhatsApp.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul S. Deshmukh"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                >
                </input>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98204 55120"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-3 py-2.5 font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Preferred Bike *</label>
                  <select
                    value={bikeOfInterest}
                    onChange={(e) => setBikeOfInterest(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    {bikes.length > 0 ? (
                      bikes.map((b) => (
                        <option key={b.id} value={`${b.brand} ${b.model}`}>
                          {b.brand} {b.model}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Royal Enfield Hunter 350">Royal Enfield Hunter 350</option>
                        <option value="Triumph Speed 400">Triumph Speed 400</option>
                        <option value="KTM 390 Duke">KTM 390 Duke (Gen 3)</option>
                        <option value="Royal Enfield Himalayan 450">Royal Enfield Himalayan 450</option>
                        <option value="Yamaha Aerox 155">Yamaha Aerox 155</option>
                        <option value="Certified Pre-Owned RE Classic 350">Certified Pre-Owned RE Classic 350</option>
                        <option value="Certified Pre-Owned Bajaj Pulsar NS200">Certified Pre-Owned Pulsar NS200</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Requirement Type Chips */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">What do you need assistance with?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PRICE_QUOTE', label: 'On-Road Price' },
                    { id: 'FINANCE', label: 'Low EMI Loan' },
                    { id: 'EXCHANGE', label: 'Bike Exchange' },
                    { id: 'DELIVERY', label: 'Ready Stock Delivery' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInterestType(item.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        interestType === item.id
                          ? 'border-amber-500 bg-amber-500/15 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Callback Timing */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Preferred Call Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Immediate (Next 15 mins)', 'Afternoon (1 PM - 5 PM)', 'Evening (5 PM - 8 PM)'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredTime(slot)}
                      className={`p-2 rounded-xl border text-[11px] text-center transition-all ${
                        preferredTime === slot
                          ? 'border-amber-500 bg-amber-500/15 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slot.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Additional Notes / Specific Variant <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Looking for Rebel Blue color, have 2019 Pulsar to exchange, want 36-month EMI scheme..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <CustomerTerms purpose="respond to your enquiry" />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all"
              >
                <span>Request Priority Callback</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Spam Guarantee · Your number is strictly handled by our Khopat, Thane desk.</span>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                Lead Dispatched to Staff Operations
              </span>
              <h3 className="text-xl font-black text-white pt-2">Callback Request Confirmed!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you, <strong className="text-white">{fullName}</strong>. Your enquiry for the{' '}
                <strong className="text-amber-400">{bikeOfInterest}</strong> has been logged in our live CRM.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-slate-400">
                <span>Assigned Executive:</span>
                <span className="font-semibold text-white">Suraj Patil (Online Sales Desk)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Target Callback:</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Within 15 minutes</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Showroom Desk:</span>
                <span className="font-mono text-slate-300">+91 98204 55120</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700 active:scale-95 transition-all"
            >
              Back to Digital Showroom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
