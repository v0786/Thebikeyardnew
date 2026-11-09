import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState } from 'react';
import { Motorcycle } from '../types';
import { FINANCE_PARTNERS, FinancePartner } from '../data/dealershipData';
import { formatInr } from '../lib/currency';
import { Calculator, Landmark, ShieldCheck, Check, ArrowRight, Zap, PhoneCall } from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';
import { FinancePartners, PartnerLogoSvg } from './FinancePartners';

interface FinanceEmiSectionProps {
  selectedBike: Motorcycle;
  onApplySuccess?: (leadInfo: { name: string; phone: string; bank: string }) => void;
}

export const FinanceEmiSection: React.FC<FinanceEmiSectionProps> = ({
  selectedBike,
  onApplySuccess,
}) => {
  const onRoadPaise =
    selectedBike.exShowroomPaise +
    selectedBike.rtoTaxPaise +
    selectedBike.insurancePaise +
    selectedBike.handlingPaise;
  const onRoadRupees = Number(onRoadPaise / 100n);

  const [downPayment, setDownPayment] = useState<number>(Math.round(onRoadRupees * 0.2));
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(9.5);

  // Application Modal state
  const [selectedPartner, setSelectedPartner] = useState<FinancePartner | null>(null);
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [cibilScore, setCibilScore] = useState<string>('750+ (Excellent)');
  const [appSubmitted, setAppSubmitted] = useState<string | null>(null);

  // Math for EMI
  const loanPrincipal = Math.max(0, onRoadRupees - downPayment);
  const r = interestRate / 12 / 100;
  const emiNumerator = loanPrincipal * r * Math.pow(1 + r, tenureMonths);
  const emiDenominator = Math.pow(1 + r, tenureMonths) - 1;
  const monthlyEmi = emiDenominator > 0 ? Math.round(emiNumerator / emiDenominator) : 0;
  const totalPayable = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - loanPrincipal);

  const calculatePartnerEmi = (minRate: number) => {
    const pr = minRate / 12 / 100;
    const num = loanPrincipal * pr * Math.pow(1 + pr, tenureMonths);
    const den = Math.pow(1 + pr, tenureMonths) - 1;
    return den > 0 ? Math.round(num / den) : 0;
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    if (!applicantName.trim() || applicantPhone.trim().length < 10 || !selectedPartner) return;

    // Immediately push new customer lead to the dealership store & call queue!
    dealershipStore.getState().leads.unshift({
      id: `lead-fin-${Date.now()}`,
      customerName: applicantName,
      phone: applicantPhone,
      bikeOfInterest: `${selectedBike.brand} ${selectedBike.model}`,
      source: 'WEBSITE',
      stage: 'QUOTATION',
      assignedTo: 'Rajesh Gokhale (Finance Desk)',
      notes: `Requested two-wheeler finance via ${selectedPartner.name}. Loan: ₹${loanPrincipal.toLocaleString('en-IN')}, Tenure: ${tenureMonths}m, CIBIL: ${cibilScore}. CALL IMMEDIATELY.`,
      acceptance,
      createdAt: new Date().toISOString(),
    });

    dealershipStore.logAudit(
      'FINANCE_ENQUIRY_RECEIVED',
      'Finance Portal Desk',
      `New finance application from ${applicantName} (${applicantPhone}) for ${selectedPartner.name} routed to showroom calling desk.`
    );

    setAppSubmitted(selectedPartner.name);
    if (onApplySuccess) {
      onApplySuccess({ name: applicantName, phone: applicantPhone, bank: selectedPartner.name });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md space-y-8" id="emi-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              10 Tie-Up Finance Partners
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              In-Showroom 45-Min Disbursals
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Two-Wheeler Loan EMI Calculator & Bank Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Estimating loan for <strong className="text-white">{selectedBike.brand} {selectedBike.model}</strong> (On-Road: {formatInr(onRoadPaise)})
          </p>
        </div>
      </div>

      {/* 10 Finance Partners Logo Trust Showcase */}
      <FinancePartners
        selectedPartnerId={selectedPartner?.id}
        onSelectPartner={(partner) => {
          setSelectedPartner(partner);
          setInterestRate(partner.minInterestRate);
        }}
        onApplyLoan={(partner) => {
          setSelectedPartner(partner);
          setInterestRate(partner.minInterestRate);
          setAppSubmitted(null);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive EMI Sliders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Loan Parameters
              </span>
              <span className="text-xs text-amber-400 font-bold">
                Principal: ₹{loanPrincipal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Down Payment (Minimum 10%)</span>
                <span className="text-white font-bold text-sm">₹{downPayment.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={Math.round(onRoadRupees * 0.1)}
                max={Math.round(onRoadRupees * 0.75)}
                step={2500}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Min: ₹{Math.round(onRoadRupees * 0.1).toLocaleString('en-IN')}</span>
                <span>Max: ₹{Math.round(onRoadRupees * 0.75).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Repayment Tenure</span>
                <span className="text-white font-bold text-sm">{tenureMonths} Months ({tenureMonths / 12} Years)</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTenureMonths(m)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      tenureMonths === m
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Annual Interest Rate (APR)</span>
                <span className="text-white font-bold text-sm">{interestRate.toFixed(2)}% p.a.</span>
              </div>
              <input
                type="range"
                min={8.5}
                max={14.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Calculated Monthly EMI Hero Box */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-300">Calculated Monthly Instalment (EMI)</div>
                <div className="text-3xl font-black text-amber-400 tabular-nums">
                  ₹{monthlyEmi.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                <div>Total Interest: <strong className="text-white">₹{totalInterest.toLocaleString('en-IN')}</strong></div>
                <div>Total Loan Cost: <strong className="text-white">₹{totalPayable.toLocaleString('en-IN')}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 10 Finance Partners Comparison Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Compare 10 Showroom Partners
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Direct Khopat Tie-Up</span>
            </div>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {FINANCE_PARTNERS.map((partner) => {
                const partnerEmi = calculatePartnerEmi(partner.minInterestRate);

                return (
                  <div
                    key={partner.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 flex items-center shrink-0">
                          <PartnerLogoSvg partnerId={partner.id} className="h-6 w-auto max-w-[85px]" />
                        </div>
                        <div className="text-xs font-bold text-white line-clamp-1">{partner.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-amber-400 tabular-nums">
                          ₹{partnerEmi.toLocaleString('en-IN')}/mo
                        </div>
                        <div className="text-[9px] text-slate-400">from {partner.minInterestRate}% p.a.</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{partner.specialFeature}</span>
                      <button
                        onClick={() => {
                          setSelectedPartner(partner);
                          setAppSubmitted(null);
                        }}
                        className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      >
                        Apply Loan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Finance Application Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-8 flex items-center p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <PartnerLogoSvg partnerId={selectedPartner.id} className="h-6 w-auto max-w-[100px]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-500">Apply Two-Wheeler Loan</span>
                  <h3 className="text-sm font-bold text-white">{selectedPartner.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {appSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Details Forwarded to Desk!</h4>
                <p className="text-xs text-slate-300">
                  Our Khopat loan executive will call you at <strong className="text-amber-400">{applicantPhone}</strong> to complete instant sanction.
                </p>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Anand Kulkarni"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mobile Number (We will call you)</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. 9820123456"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CIBIL Score Band</label>
                  <select
                    value={cibilScore}
                    onChange={(e) => setCibilScore(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="750+ (Excellent)">750+ (Fast 15-min approval)</option>
                    <option value="700-750 (Good)">700 – 749 (Standard approval)</option>
                    <option value="650-700 (Fair)">650 – 699 (Co-applicant optional)</option>
                    <option value="New to Credit">No previous loan history</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>· Machine: {selectedBike.brand} {selectedBike.model}</div>
                  <div>· Loan Amount: ₹{loanPrincipal.toLocaleString('en-IN')}</div>
                  <div>· Processing: {selectedPartner.processingFee}</div>
                </div>

                <CustomerTerms purpose="respond to your finance enquiry" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors"
                >
                  Submit & Connect With Loan Desk
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
