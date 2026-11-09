import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';
import { DEALERSHIP_INFO } from '../data/dealershipData';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Legal & Data Collection Governance</h3>
              <div className="text-xs text-slate-400">
                The Bike Yard · Rutu Business Park, Khopat, Thane (W), Maharashtra
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Privacy Policy & Data Collection
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`rounded-t-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'terms'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Terms & Conditions of Dealership
          </button>
        </div>

        {/* Policy Content */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[55vh] pr-2">
          {activeTab === 'privacy' ? (
            <>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
                <strong>Demo data notice:</strong> Use sample details on this site. Each form explains how the details are used. Accepting the Terms &amp; Conditions does not opt you into marketing.
              </div>

              <h4 className="text-sm font-bold text-white pt-2">1. Personal Information We Collect</h4>
              <p>
                We collect personal identifiers including your full name, telephone number, residential address, email address, two-wheeler driving license copies (for test rides), and statutory identification (PAN Card, Aadhaar Card, Form 20/21) required under the Motor Vehicles Act 1988 for vehicle registration with the Deputy RTO, Central Thane (MH-04).
              </p>

              <h4 className="text-sm font-bold text-white pt-2">2. Purpose of Collection & Real-Time Dashboard Reflection</h4>
              <p>
                Demo enquiries appear in the sample dealership workspace. In a live dealership workflow, staff may use the details supplied to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Place direct telephone calls to confirm motorcycle model interest and answer questions.</li>
                <li>Coordinate showroom appointments at our Rutu Business Park, Khopat dealership.</li>
                <li>Submit loan eligibility data to our 10 authorized institutional banking partners upon your request.</li>
                <li>Reserve chassis units and prepare High Security Registration Plate (HSRP) orders.</li>
              </ul>

              <h4 className="text-sm font-bold text-white pt-2">3. Zero Third-Party Commercial Sale</h4>
              <p>
                The demo does not ask for a marketing opt-in. See the full Privacy Policy for data and optional cookie preferences.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">4. Data Retention & Opt-Out</h4>
              <p>
                You may request immediate cessation of telephone calls or deletion of your CRM lead record by emailing <strong className="text-white">privacy@thebikeyard.in</strong> or informing our executive during any telephone conversation.
              </p>
            </>
          ) : (
            <>
              <p className="text-amber-300">This demo processes no real payment or booking. The commercial terms below are illustrative.</p>
              <h4 className="text-sm font-bold text-white">1. Motorcycle Booking & Allocation</h4>
              <p>
                Booking deposits (advance payments) placed on this portal or in the Khopat showroom are credited toward the final on-road purchase price. A booking reserves a tentative delivery slot subject to factory dispatch and MH-04 RTO formalities.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">2. Pricing & Maharashtra RTO Taxation</h4>
              <p>
                All on-road prices displayed reflect prevailing Ex-Showroom prices, GST rates (18% to 28% basis points), Maharashtra State Motor Vehicle tax (11% to 12%), and IRDAI 5-year insurance rates. Statutory tax adjustments mandated by the Maharashtra transport department prior to registration are applicable at actuals.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">3. Cancellation & Refund Policy</h4>
              <p>
                In the event of a customer-initiated booking cancellation prior to RTO tax challan generation or chassis registration, a standard administrative processing fee of ₹500 applies. The remaining advance is refunded via NEFT/UPI to the source account within 3–5 working days upon accountant approval.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">4. Test Ride Liability & Requirements</h4>
              <p>
                Riders must hold a valid, permanent Indian Two-Wheeler Driving License and operate test motorcycles within prescribed speed limits along designated Thane test routes. Protective helmets are mandatory.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">5. Jurisdiction</h4>
              <p>
                All transactions and agreements are governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Thane, Maharashtra.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
