import { useCookiePreferences } from './CookiePreferences';
import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState } from 'react';
import { Bike, MapPin, Phone, Mail, Clock, Check, MessageCircle } from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';
import { whatsAppLink, telLink } from '../lib/whatsapp';
import { ThemePicker } from './ThemePicker';

interface FooterProps {
  onOpenTestRideModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenTermsModal: () => void;
  onNavigateToLegal?: (tab: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTestRideModal,
  onOpenPrivacyModal,
  onOpenTermsModal,
  onNavigateToLegal,
}) => {
  const { open: openCookiePreferences } = useCookiePreferences();
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [callbackRequested, setCallbackRequested] = useState(false);
  const info = dealershipStore.getState().dealershipInfo;

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    const phoneDigits = quickPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) return;

    dealershipStore.createLead({
      acceptance,
      customerName: quickName.trim() || 'Website Visitor',
      phone: quickPhone.trim(),
      bikeOfInterest: 'General Showroom Inquiry',
      source: 'WEBSITE',
      notes: 'Customer requested immediate telephone callback via website footer. CALL NOW.',
      assignedTo: 'Suraj Patil (Calling Desk)',
    });

    setCallbackRequested(true);
    setQuickPhone('');
    setQuickName('');
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-32 md:pb-28 pt-12 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">THE BIKE YARD</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Authorised multi-brand motorcycle showroom and certified delivery centre in Khopat, Thane (West). Genuine bikes, transparent on-road pricing, and MH-04 paperwork handled for you.
            </p>
            <div className="text-[11px] text-amber-400 font-mono">
              GSTIN: {info.gstin} · RTO: MH-04
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Showroom & Yard</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{info.address}, {info.city} — {info.pincode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{info.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Direct Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sales & Calling Desk</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={telLink(info.phone)} className="hover:text-white transition-colors">
                  {info.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${info.email}`} className="hover:text-white transition-colors">
                  {info.email}
                </a>
              </div>
              <div className="pt-1">
                <a
                  href={whatsAppLink(info.phone, 'Hi The Bike Yard! I would like to enquire about a motorcycle.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </div>
              <div className="pt-1">
                <button
                  onClick={onOpenTestRideModal}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Book Complimentary Test Ride
                </button>
              </div>
            </div>
          </div>

          {/* Request Immediate Callback Widget */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Request Instant Callback</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Enter your mobile number and our Thane showroom executive will call you directly to discuss price quotes or booking.
            </p>

            {callbackRequested ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-emerald-300 flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Call requested! Reflecting on Dashboard. Calling you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-2">
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <input
                    type="tel"
                    required
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
                  >
                    Call Me
                  </button>
                </div>
                <CustomerTerms purpose="respond to your callback request" />
              </form>
            )}
          </div>
        </div>

        {/* Theme preference (public) */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Showroom theme</span>
          <ThemePicker compact />
        </div>

        {/* Legal Links & Compliance Footer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div>
            © 2026 The Bike Yard Dealership Platform. All rights reserved. Khopat, Thane, Maharashtra.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (onNavigateToLegal) {
                  onNavigateToLegal('privacy');
                } else {
                  onOpenPrivacyModal();
                }
              }}
              className="text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors font-medium"
            >
              Privacy Policy & Data Protection
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onNavigateToLegal) {
                  onNavigateToLegal('terms');
                } else {
                  onOpenTermsModal();
                }
              }}
              className="text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors font-medium"
            >
              Terms & Conditions of Dealership
            </button>
              <span aria-hidden="true">·</span>
              <button type="button" className="hover:text-amber-400" onClick={openCookiePreferences}>Cookie preferences</button>
            <span>·</span>
            <span>MH-04 Central RTO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
