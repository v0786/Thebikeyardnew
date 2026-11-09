import type { FC } from 'react';
import { BadgePercent, ArrowRight } from 'lucide-react';
import { Offer } from '../types';
import { whatsAppLink } from '../lib/whatsapp';
import { DEALERSHIP_INFO } from '../data/dealershipData';

interface OffersSectionProps {
  offers: Offer[];
  phone?: string;
}

const VALID_TILL_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Current dealership offers, managed by staff in the admin dashboard. */
export const OffersSection: FC<OffersSectionProps> = ({ offers, phone }) => {
  const active = offers.filter((o) => o.active);
  if (active.length === 0) return null;
  const dealerPhone = phone ?? DEALERSHIP_INFO.phone;

  return (
    <section aria-label="Current offers">
      <div className="flex items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="eyebrow text-amber-500 flex items-center gap-1.5">
            <BadgePercent className="w-3.5 h-3.5" aria-hidden="true" /> This Month at The Bike Yard
          </p>
          <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">Current Dealership Offers</h2>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {active.map((offer) => {
          const claimLink = whatsAppLink(
            dealerPhone,
            `Hi The Bike Yard! I'd like to claim the offer: "${offer.title}". Please share the details.`
          );
          return (
            <div
              key={offer.id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                {offer.badge && (
                  <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    {offer.badge}
                  </span>
                )}
                {offer.validTill && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Valid till {VALID_TILL_FORMAT.format(new Date(offer.validTill))}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base sm:text-lg font-bold text-white leading-snug">{offer.title}</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed flex-1">{offer.description}</p>
              <a
                href={claimLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 w-fit"
              >
                Claim via WhatsApp <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-slate-600">
        Offers are dealership promotions for the Khopat showroom and may be revised without notice. Finance approvals remain subject to lender eligibility.
      </p>
    </section>
  );
};
