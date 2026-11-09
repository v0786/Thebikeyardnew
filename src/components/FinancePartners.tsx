import React, { useState } from 'react';
import { FinancePartner, FINANCE_PARTNERS } from '../data/dealershipData';
import { ShieldCheck, Check, ArrowRight, Sparkles, Building2, ExternalLink, Zap } from 'lucide-react';

interface FinancePartnersProps {
  selectedPartnerId?: string;
  onSelectPartner?: (partner: FinancePartner) => void;
  onApplyLoan?: (partner: FinancePartner) => void;
  className?: string;
}

// Brand SVG Logos for the 10 Indian Two-Wheeler Finance Providers
export const PartnerLogoSvg: React.FC<{ partnerId: string; className?: string }> = ({
  partnerId,
  className = 'h-7 w-auto',
}) => {
  switch (partnerId) {
    case 'bajaj-finance':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bajaj Finance">
          <rect width="36" height="36" rx="8" fill="#003366" />
          <path d="M10 24L18 10L26 24L21 24L18 17L15 24H10Z" fill="#00A3E0" />
          <circle cx="18" cy="23" r="2.5" fill="#FFFFFF" />
          <text x="44" y="19" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="-0.2px">BAJAJ</text>
          <text x="44" y="32" fill="#00A3E0" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="0.8px">FINSERV</text>
        </svg>
      );

    case 'hdfc-bank':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="HDFC Bank">
          <rect width="36" height="36" rx="8" fill="#004C8F" />
          <rect x="9" y="9" width="18" height="18" fill="#ED232A" />
          <rect x="13.5" y="6" width="9" height="24" fill="#004C8F" />
          <rect x="6" y="13.5" width="24" height="9" fill="#004C8F" />
          <rect x="15" y="15" width="6" height="6" fill="#FFFFFF" />
          <text x="44" y="21" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.2px">HDFC BANK</text>
          <text x="44" y="32" fill="#94A3B8" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="600" letterSpacing="0.5px">TWO-WHEELER LOANS</text>
        </svg>
      );

    case 'kotak-prime':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Kotak Mahindra Prime">
          <rect width="36" height="36" rx="8" fill="#ED1C24" />
          <circle cx="14" cy="18" r="5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <circle cx="22" cy="18" r="5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <path d="M17 14L22 22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="-0.3px">kotak</text>
          <text x="44" y="32" fill="#F87171" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="0.6px">PRIME FINANCE</text>
        </svg>
      );

    case 'tvs-credit':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="TVS Credit">
          <rect width="36" height="36" rx="8" fill="#002B49" />
          <path d="M9 14L18 26L27 14H21L18 19L15 14H9Z" fill="#DA291C" />
          <path d="M12 10L18 18L24 10H12Z" fill="#FFFFFF" opacity="0.9" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.2px">TVS CREDIT</text>
          <text x="44" y="32" fill="#38BDF8" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="600" letterSpacing="0.4px">INSTANT DISBURSAL</text>
        </svg>
      );

    case 'muthoot-capital':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Muthoot Capital">
          <rect width="36" height="36" rx="8" fill="#C4122F" />
          <circle cx="18" cy="18" r="11" stroke="#E5A823" strokeWidth="1.5" fill="none" />
          <path d="M12 22V14L18 19L24 14V22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12.5" fontWeight="800" letterSpacing="-0.2px">MUTHOOT</text>
          <text x="44" y="32" fill="#E5A823" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="0.6px">CAPITAL SERVICES</text>
        </svg>
      );

    case 'idfc-first':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="IDFC FIRST Bank">
          <rect width="36" height="36" rx="8" fill="#97144D" />
          <rect x="10" y="10" width="7" height="7" fill="#FFFFFF" />
          <rect x="19" y="10" width="7" height="7" fill="#FFFFFF" opacity="0.6" />
          <rect x="10" y="19" width="7" height="7" fill="#FFFFFF" opacity="0.6" />
          <rect x="19" y="19" width="7" height="7" fill="#FFFFFF" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="800" letterSpacing="-0.2px">IDFC FIRST</text>
          <text x="44" y="32" fill="#FDA4AF" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="0.8px">Bank Two-Wheeler</text>
        </svg>
      );

    case 'tata-capital':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Tata Capital">
          <rect width="36" height="36" rx="8" fill="#005A9C" />
          <path d="M10 13H26M18 13V25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 18H24" stroke="#00A3E0" strokeWidth="1.5" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.4px">TATA</text>
          <text x="44" y="32" fill="#38BDF8" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="0.6px">CAPITAL</text>
        </svg>
      );

    case 'lt-finance':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="L&T Finance">
          <rect width="36" height="36" rx="8" fill="#002B49" />
          <circle cx="18" cy="18" r="11" stroke="#0072CE" strokeWidth="2" fill="none" />
          <path d="M14 13V23H22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.2px">L&amp;T FINANCE</text>
          <text x="44" y="32" fill="#93C5FD" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="600" letterSpacing="0.4px">DOORSTEP KYC</text>
        </svg>
      );

    case 'hero-fincorp':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Hero FinCorp">
          <rect width="36" height="36" rx="8" fill="#EE1C25" />
          <path d="M11 11H16V16H20V11H25V25H20V19H16V25H11V11Z" fill="#FFFFFF" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12.5" fontWeight="800" letterSpacing="-0.2px">Hero</text>
          <text x="44" y="32" fill="#FCA5A5" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="0.6px">FinCorp</text>
        </svg>
      );

    case 'indusind-bank':
      return (
        <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="IndusInd Bank">
          <rect width="36" height="36" rx="8" fill="#851214" />
          <circle cx="18" cy="18" r="11" stroke="#D4AF37" strokeWidth="1.8" fill="none" />
          <path d="M12 19C14 14 19 14 24 18C20 18 18 20 15 23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <text x="44" y="20" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="800" letterSpacing="-0.2px">IndusInd</text>
          <text x="44" y="32" fill="#FDE047" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="0.6px">BANK</text>
        </svg>
      );

    default:
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs">
            {partnerId.slice(0, 3).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-white">{partnerId}</span>
        </div>
      );
  }
};

export const FinancePartners: React.FC<FinancePartnersProps> = ({
  selectedPartnerId,
  onSelectPartner,
  onApplyLoan,
  className = '',
}) => {
  const [activePartner, setActivePartner] = useState<FinancePartner>(
    FINANCE_PARTNERS.find((p) => p.id === selectedPartnerId) || FINANCE_PARTNERS[0]!
  );

  const handleCardClick = (partner: FinancePartner) => {
    setActivePartner(partner);
    if (onSelectPartner) {
      onSelectPartner(partner);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trust Header with Anti-Slop Zero-Pill Typography */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold uppercase tracking-wider">
            <span>Institutional Lending Network</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">10 Direct Tie-Ups</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">45-Minute In-Store Sanctions</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Authorized Two-Wheeler Finance Partners
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            The Bike Yard hosts on-premise verification desks for India’s premier banks and RBI-regulated NBFCs at Rutu Business Park, Khopat.
          </p>
        </div>

        {/* Quiet Trust Footnote */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Paperless & Zero Foreclosure Options</span>
        </div>
      </div>

      {/* 10 Finance Partners Grid with Brand Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FINANCE_PARTNERS.map((partner) => {
          const isSelected = (selectedPartnerId || activePartner.id) === partner.id;

          return (
            <div
              key={partner.id}
              onClick={() => handleCardClick(partner)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? 'border-amber-500 bg-slate-900/95 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                {/* Logo Area */}
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 flex items-center">
                    <PartnerLogoSvg partnerId={partner.id} className="h-8 max-w-[130px] w-auto" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Rates & Highlights */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">Starting Rate</div>
                  <div className="text-base font-black text-amber-400 tabular-nums">
                    {partner.minInterestRate.toFixed(2)}% <span className="text-[10px] font-normal text-slate-400">p.a.</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium line-clamp-1 pt-0.5">
                    Up to {partner.maxFundingPct}% On-Road Funding
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Tag */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 truncate max-w-[110px]">{partner.processingFee}</span>
                <span className="font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Partner Highlight Detail Strip */}
      {activePartner && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              <PartnerLogoSvg partnerId={activePartner.id} className="h-8 w-auto max-w-[140px]" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white">{activePartner.name}</h4>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-amber-400 font-semibold">{activePartner.specialFeature}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>Interest: <strong className="text-slate-200">{activePartner.minInterestRate}% onwards</strong></span>
                <span>·</span>
                <span>Tenure: <strong className="text-slate-200">Up to {activePartner.maxTenureMonths} Months</strong></span>
                <span>·</span>
                <span>Fee: <strong className="text-slate-200">{activePartner.processingFee}</strong></span>
              </div>
            </div>
          </div>

          {onApplyLoan && (
            <button
              type="button"
              onClick={() => onApplyLoan(activePartner)}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all whitespace-nowrap self-start md:self-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply with {activePartner.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Regulatory Compliance & Trust Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-400">
        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-[11px]">RBI Regulated Entities</div>
            <div className="text-[10px] text-slate-500">Scheduled commercial banks & Tier-1 NBFCs</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-[11px]">On-Premise Thane Desks</div>
            <div className="text-[10px] text-slate-500">Dedicated loan officers at Rutu Business Park</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-[11px]">Soft CIBIL Inquiry</div>
            <div className="text-[10px] text-slate-500">Zero impact on your existing credit score</div>
          </div>
        </div>
      </div>
    </div>
  );
};
