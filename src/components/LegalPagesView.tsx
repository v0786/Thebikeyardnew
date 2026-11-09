import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Printer,
  ArrowLeft,
  PhoneCall,
  CheckCircle2,
  Building2,
  Scale,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DEALERSHIP_INFO } from '../data/dealershipData';

interface LegalPagesViewProps {
  initialTab?: 'privacy' | 'terms';
  onBackToShowroom: () => void;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({
  initialTab = 'privacy',
  onBackToShowroom,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <button
            onClick={onBackToShowroom}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Digital Showroom</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Document</span>
            </button>
          </div>
        </div>

        {/* Official Dealership Letterhead Banner */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500">
                  Statutory Dealership Governance
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Maharashtra RTO Division</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                THE BIKE YARD — LEGAL POLICIES & TERMS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Official terms of service, customer telephone consent, data protection, and motorcycle purchase governance.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono space-y-1 text-slate-400 shrink-0">
              <div><strong className="text-white">Entity:</strong> The Bike Yard Dealership</div>
              <div><strong className="text-white">GSTIN:</strong> 27AABCT9981K1ZT (MH)</div>
              <div><strong className="text-white">RTO:</strong> MH-04 (Thane Central)</div>
              <div><strong className="text-white">Location:</strong> Khopat, Thane (W) — 400601</div>
            </div>
          </div>

          {/* Interactive Document Tabs */}
          <div className="flex border-b border-slate-800 gap-2 pt-4 print:hidden">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 rounded-t-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Privacy Policy & Data Protection (DPDP 2023)</span>
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 rounded-t-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Terms & Conditions of Dealership</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg">
            {/* Priority Direct Calling Consent Notice */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>Explicit Consent for Direct Telephone Calling & Showroom Callbacks</span>
              </div>
              <p className="text-amber-200/90 text-xs leading-relaxed">
                The forms explain why they ask for your details. For a client preview, use sample information. A demo submission simulates the request and does not opt you into marketing messages.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">1.</span>
                <span>Statutory Compliance & Scope</span>
              </h2>
              <p>
                Policy version 1.0. This notice describes the showroom demo. The dealership will confirm its production data handling, retention and privacy contact before accepting real customer submissions.
              </p>
              <p>
                This policy governs how <strong>The Bike Yard</strong> collects, records, utilizes, stores, and safeguards personal identifiable information (PII) obtained from retail two-wheeler buyers, test-ride applicants, and showroom visitors across Maharashtra.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Cookies and site preferences</h2>
              <p>Essential browser storage supports the cart, staff session and site preferences. The optional Google Maps embed can set third-party cookies and loads only after you allow it. You can change your selection through Cookie preferences in the footer.</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">2.</span>
                <span>Categories of Personal Information Collected</span>
              </h2>
              <p>For an actual dealership transaction, staff may need the following details separately. Use sample information only on this demo. Never enter government ID, bank statements or other sensitive records here.</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-white">Customer Identifiers:</strong> Full legal name, permanent address, local residential address in Thane/Mumbai, personal mobile telephone number, and email address.</li>
                <li><strong className="text-white">Statutory Registration Documents (MH-04 RTO):</strong> Copy of Permanent Account Number (PAN Card), Aadhaar Card (for Form 20/21 e-KYC), and address verification for registration at Teen Hath Naka RTO Division.</li>
                <li><strong className="text-white">Driving Verification:</strong> Digital or physical copy of valid Indian Two-Wheeler Driving License before handing over keys for public road test rides.</li>
                <li><strong className="text-white">Financial & Loan Information:</strong> CIBIL score surrogate data, bank statement summaries, or employer details provided willingly for two-wheeler loan approval through our institutional finance partners.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">3.</span>
                <span>Real-Time Internal CRM Synchronization</span>
              </h2>
              <p>
                Customer details submitted on this web application are immediately synchronized with our in-house Staff Operations Portal and Admin Dashboard via real-time encrypted channels. This enables our dedicated sales desk (operating Monday through Sunday, 10:00 AM – 8:30 PM) to achieve our guaranteed 15-minute response SLA.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">4.</span>
                <span>Authorized Financial Institution Disclosures</span>
              </h2>
              <p>
                We do not sell, rent, or trade your personal telephone number to third-party telemarketers. When you explicitly request two-wheeler loan assistance, we share your application strictly with our 10 authorized, RBI-regulated institutional banking partners:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1">
                {[
                  'Bajaj Finance Ltd',
                  'HDFC Bank Ltd',
                  'Kotak Mahindra Prime',
                  'TVS Credit Services',
                  'Muthoot Capital',
                  'IDFC FIRST Bank',
                  'Tata Capital',
                  'L&T Finance',
                  'Hero FinCorp',
                  'IndusInd Bank',
                ].map((partner) => (
                  <div key={partner} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-medium text-slate-300 text-center">
                    {partner}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">5.</span>
                <span>Data Retention & Right to Erasure</span>
              </h2>
              <p>
                Lead contact numbers that do not convert to a sale are retained for a maximum of 180 days for follow-up notifications regarding upcoming model launches and festive booking offers. You may request immediate deletion of your CRM lead record at any time by emailing <strong className="text-amber-400">privacy@thebikeyard.in</strong> or informing our telephone representative.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">6.</span>
                <span>Grievance Redressal Officer</span>
              </h2>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1 text-xs">
                <div><strong className="text-white">Officer Name:</strong> Suraj Patil (Customer Compliance Lead)</div>
                <div><strong className="text-white">Office Address:</strong> Shop 4 & 5, Rutu Business Park, Near Cadbury Junction, Khopat, Thane (W) — 400601</div>
                <div><strong className="text-white">Direct Telephone:</strong> +91 98204 55120</div>
                <div><strong className="text-white">Email:</strong> privacy@thebikeyard.in</div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: TERMS AND CONDITIONS */}
        {activeTab === 'terms' && (
          <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg">
            <p className="text-amber-300">Terms version 1.0. This demo processes no real payment or booking. The commercial terms below are illustrative and subject to dealership approval.</p>
            {/* Booking & Token Terms */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">1.</span>
                <span>Motorcycle Booking & Allocation Policy</span>
              </h2>
              <p>
                Receipt of an advance booking deposit (minimum ₹10,000 for standard variants or ₹25,000 for premium 400cc+ motorcycles) constitutes an offer to purchase and reserves a tentative delivery slot from available physical stock or the manufacturer's incoming allocation pipeline.
              </p>
              <p>
                Chassis numbers (VIN) are allotted on a strict first-cum-first-served basis upon receipt of the booking advance and submission of mandatory MH-04 RTO registration documents.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">2.</span>
                <span>Mathematical On-Road Pricing Breakdown & State Taxes</span>
              </h2>
              <p>
                All on-road quotations generated by The Bike Yard are governed by strict mathematical transparency:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-white">Ex-Showroom Price:</strong> Determined by original equipment manufacturer (OEM) inclusive of Central GST (CGST) and State GST (SGST) under the Maharashtra Goods and Services Tax Act.</li>
                <li><strong className="text-white">Maharashtra RTO Tax (MH-04):</strong> Levied in accordance with the Maharashtra Motor Vehicles Taxation Act (currently 11% for individual two-wheeler registrations up to ₹3,00,000 and 12% above ₹3,00,000).</li>
                <li><strong className="text-white">IRDAI Comprehensive Insurance:</strong> Mandatory 1-Year Own Damage (OD) + 5-Year Third Party (TP) coverage with Zero Depreciation and Return-to-Invoice protection issued through accredited general insurance providers.</li>
                <li><strong className="text-white">Logistics & Handling:</strong> Covers statutory High Security Registration Plate (HSRP) laser-embossing, pre-delivery inspection (PDI), and smart card registration documentation.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">3.</span>
                <span>Cancellation & Refund Workflow</span>
              </h2>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <p>
                  Customers may cancel a vehicle booking at any time prior to the generation of the MH-04 RTO Tax Challan or chassis registration in the Vahan 4.0 database.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900">
                    <div className="text-amber-400 font-bold">Standard Administrative Fee</div>
                    <div className="text-slate-300">A flat processing charge of ₹500 is deducted to cover banking gateway fees and dossier creation.</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900">
                    <div className="text-emerald-400 font-bold">Refund Turnaround Time</div>
                    <div className="text-slate-300">The net balance is refunded via NEFT/UPI directly to the source account within 3–5 working banking days upon Accountant approval.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">4.</span>
                <span>Certified Pre-Owned (Second Hand) Terms & Warranty</span>
              </h2>
              <p>
                All certified pre-owned motorcycles sold by The Bike Yard undergo a rigorous 45-point technical inspection covering chassis alignment, engine compression, electrical harnesses, and brake pad wear.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Pre-owned units are backed by our 6-Month / 6,000 KM Engine & Gearbox Limited Warranty.</li>
                <li>Vehicles are verified free of police challans, hypothecation encumbrances, and total-loss insurance claims.</li>
                <li>Clean ownership transfer (Form 29 and 30) for Maharashtra RTOs (MH-04 Thane, MH-02 Mumbai West, MH-03 Mumbai East) is managed by our in-house RTO documentation desk.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">5.</span>
                <span>Test Ride Safety & Indemnity Waiver</span>
              </h2>
              <p>
                All customers undertaking a test ride agree to inspect the motorcycle before departure, obey Maharashtra traffic regulations and Thane city speed restrictions, and wear an ISI/DOT certified full-face helmet. Riders are solely liable for traffic penalties or reckless driving infractions incurred during the test ride period.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-amber-500 font-mono">6.</span>
                <span>Jurisdiction & Dispute Resolution</span>
              </h2>
              <p>
                Any dispute, claim, or controversy arising out of or relating to vehicle bookings, sales contracts, or website usage shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in <strong>Thane, Maharashtra</strong>.
              </p>
            </section>
          </div>
        )}

        {/* Footer Acknowledgement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs text-slate-300">
              Authorized and certified by The Bike Yard Dealership Management. Questions? Contact our legal desk at{' '}
              <a href="mailto:sales@thebikeyard.in" className="text-amber-400 underline font-semibold">
                sales@thebikeyard.in
              </a>.
            </div>
          </div>

          <button
            onClick={onBackToShowroom}
            className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shrink-0"
          >
            Back to Showroom
          </button>
        </div>
      </div>
    </div>
  );
};
