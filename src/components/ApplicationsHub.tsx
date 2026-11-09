import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState } from 'react';
import { Landmark, Shield, FileCheck, CheckCircle2, Clock, Phone, MapPin, Zap } from 'lucide-react';
import { DEALERSHIP_INFO, FINANCE_PARTNERS } from '../data/dealershipData';
import { dealershipStore } from '../services/dealershipStore';
import { FinancePartners, PartnerLogoSvg } from './FinancePartners';

export const ApplicationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'insurance' | 'rto'>('finance');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeInterest, setBikeInterest] = useState('Royal Enfield Hunter 350');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('bajaj-finance');
  const [loanAmount, setLoanAmount] = useState('120000');
  const [cibilScore, setCibilScore] = useState('750+');

  const selectedPartner = FINANCE_PARTNERS.find((p) => p.id === selectedPartnerId) || FINANCE_PARTNERS[0]!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;

    if (activeTab === 'finance') {
      dealershipStore.getState().leads.unshift({
        id: `lead-app-${Date.now()}`,
        customerName: fullName,
        phone,
        bikeOfInterest: bikeInterest,
        source: 'WEBSITE',
        stage: 'QUOTATION',
        assignedTo: 'Rajesh Gokhale (Finance Desk)',
        notes: `Loan Application via ${selectedPartner.name}. Requested Amount: ₹${Number(loanAmount).toLocaleString('en-IN')}, CIBIL: ${cibilScore}. CALL IMMEDIATELY.`,
        acceptance,
        createdAt: new Date().toISOString(),
      });

      dealershipStore.logAudit(
        'FINANCE_APPLICATION_SUBMITTED',
        'Applications Hub',
        `Finance application from ${fullName} for ${bikeInterest} via ${selectedPartner.name} routed to Thane calling desk.`
      );
    }

    setSubmittedMessage(
      `Your ${activeTab.toUpperCase()} application has been routed to our Thane desk. Reference #TBY-APP-${Date.now().toString().slice(-4)}`
    );
  };

  return (
    <section className="space-y-8" id="finance-section">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Finance, Insurance & Thane RTO Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            End-to-end paperwork handled directly at our Khopat showroom with zero customer queues.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              setActiveTab('finance');
              setSubmittedMessage(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'finance'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Two-Wheeler Loan Finance</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('insurance');
              setSubmittedMessage(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'insurance'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Comprehensive IRDAI Insurance</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('rto');
              setSubmittedMessage(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'rto'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>MH-04 Thane RTO Desk</span>
          </button>
        </div>

        {/* Tab Content */}
        {submittedMessage ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-6 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Application Received!</h3>
            <p className="text-xs text-slate-300">{submittedMessage}</p>
            <button
              onClick={() => setSubmittedMessage(null)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 10 Finance Partners Logo Showcase when Finance Tab is Active */}
            {activeTab === 'finance' && (
              <FinancePartners
                selectedPartnerId={selectedPartnerId}
                onSelectPartner={(p) => setSelectedPartnerId(p.id)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Info panel */}
              <div className="md:col-span-5 space-y-4">
                {activeTab === 'finance' && (
                  <>
                    <h3 className="text-base font-bold text-white">45-Minute In-Store Approvals</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      We maintain on-premise desks for leading institutional partners offering up to 95% on-road funding, zero foreclosure penalties, and flexible 12 to 48 month repayment tenures.
                    </p>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                      <div className="text-slate-400">Selected Finance Provider:</div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 flex items-center p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          <PartnerLogoSvg partnerId={selectedPartner.id} className="h-6 w-auto max-w-[100px]" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{selectedPartner.name}</div>
                          <div className="text-[10px] text-amber-400 font-semibold">{selectedPartner.specialFeature}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-slate-800/80">
                        <div>Rate: <strong className="text-amber-400">{selectedPartner.minInterestRate}% p.a.</strong></div>
                        <div>Fee: <strong className="text-white">{selectedPartner.processingFee}</strong></div>
                      </div>
                    </div>
                  </>
                )}

              {activeTab === 'insurance' && (
                <>
                  <h3 className="text-base font-bold text-white">Zero Depreciation Comprehensive Cover</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    All new motorcycles dispatched from The Bike Yard include mandatory 5-Year IRDAI coverage (1-Year Own Damage + 5-Year Third Party) with cashless claim settlements across Maharashtra authorized workshops.
                  </p>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5 text-xs text-slate-300">
                    <div className="font-semibold text-amber-400">Included Protection:</div>
                    <div>· 100% Nil-Depreciation on plastic and fiber parts</div>
                    <div>· 24x7 Roadside Assistance within 50 km of Thane</div>
                    <div>· Engine & Gearbox hydro-lock protection</div>
                  </div>
                </>
              )}

              {activeTab === 'rto' && (
                <>
                  <h3 className="text-base font-bold text-white">MH-04 Central Thane RTO Registration</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our dedicated RTO liaison officer executes Form 20 and Form 21 uploads, tax challan payments, and high-security registration plate (HSRP) laser embossing directly at the showroom.
                  </p>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5 text-xs text-slate-300">
                    <div className="font-semibold text-amber-400">RTO Jurisdiction:</div>
                    <div>· Office: Deputy RTO Central Thane, Teen Hath Naka</div>
                    <div>· Series: MH-04 Series with HSRP color sticker</div>
                    <div>· Delivery Timeline: 3–4 working days</div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Intake Form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Quick {activeTab.toUpperCase()} Application Intake
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Applicant Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pooja Deshmukh"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9833418290"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Motorcycle Model</label>
                  <select
                    value={bikeInterest}
                    onChange={(e) => setBikeInterest(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Royal Enfield Hunter 350">Royal Enfield Hunter 350</option>
                    <option value="KTM 390 Duke">KTM 390 Duke</option>
                    <option value="Yamaha Aerox 155">Yamaha Aerox 155</option>
                    <option value="Triumph Speed 400">Triumph Speed 400</option>
                    <option value="Pre-Owned Vehicle">Certified Pre-Owned Unit</option>
                  </select>
                </div>

                {activeTab === 'finance' && (
                  <div>
                    <label className="text-slate-400 block mb-1">Approx CIBIL Score</label>
                    <select
                      value={cibilScore}
                      onChange={(e) => setCibilScore(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="750+">Excellent (750+)</option>
                      <option value="700-750">Good (700 – 749)</option>
                      <option value="650-700">Fair (650 – 699)</option>
                      <option value="New to Credit">First Time Borrower</option>
                    </select>
                  </div>
                )}
              </div>

              {activeTab === 'finance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Preferred Lending Partner</label>
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {FINANCE_PARTNERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.minInterestRate}% p.a.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Requested Loan Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        min="20000"
                        max="500000"
                        step="5000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-7 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <CustomerTerms purpose="process your service enquiry" />
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
              >
                Submit {activeTab.toUpperCase()} Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </section>
);
};
