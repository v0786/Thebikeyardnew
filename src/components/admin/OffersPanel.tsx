import { useState, type FC, type FormEvent } from 'react';
import { BadgePercent, Plus, Trash2, Power, CalendarClock } from 'lucide-react';
import type { DealershipState } from '../../services/dealershipStore';
import { dealershipStore } from '../../services/dealershipStore';
import type { OfferType } from '../../types';
import type { UserProfile } from '../../lib/rbac';

interface OffersPanelProps {
  state: DealershipState;
  currentUser: UserProfile;
}

const OFFER_TYPES: { id: OfferType; label: string }[] = [
  { id: 'EXCHANGE', label: 'Exchange Bonus' },
  { id: 'FINANCE', label: 'Finance / Loan' },
  { id: 'ACCESSORY', label: 'Accessories' },
  { id: 'WARRANTY', label: 'Service / Warranty' },
  { id: 'FESTIVE', label: 'Festive' },
  { id: 'GENERAL', label: 'General' },
];

const VALID_TILL_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Staff offers desk — create / toggle / delete homepage & WhatsApp offers. */
export const OffersPanel: FC<OffersPanelProps> = ({ state, currentUser }) => {
  const staffName = `${currentUser.name} (${currentUser.designation})`;
  const [type, setType] = useState<OfferType>('EXCHANGE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [validTill, setValidTill] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 6) return setError('Title must be at least 6 characters.');
    if (description.trim().length < 12) return setError('Description must be at least 12 characters.');
    if (validTill && Number.isNaN(Date.parse(validTill))) return setError('Valid-till date is invalid.');

    dealershipStore.addOffer(
      {
        type,
        title: title.trim(),
        description: description.trim(),
        badge: badge.trim() || undefined,
        validTill: validTill || undefined,
        active: true,
      },
      staffName
    );
    setTitle('');
    setDescription('');
    setBadge('');
    setValidTill('');
    setType('EXCHANGE');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Create offer */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 h-fit">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" aria-hidden="true" /> New Dealership Offer
        </h3>
        <p className="text-[11px] text-slate-500">Offers appear on the homepage and can be claimed on WhatsApp. They never alter manufacturer data.</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="offer-type" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Type</label>
            <select id="offer-type" value={type} onChange={(e) => setType(e.target.value as OfferType)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none">
              {OFFER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="offer-badge" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Badge (optional)</label>
            <input id="offer-badge" value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={18} placeholder="Festive" className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label htmlFor="offer-title" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Title</label>
          <input id="offer-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Festive Exchange Bonus up to ₹10,000" className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none" />
        </div>

        <div>
          <label htmlFor="offer-desc" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Description</label>
          <textarea id="offer-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={220} rows={3} placeholder="What the customer gets, eligibility and showroom notes…" className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none" />
        </div>

        <div>
          <label htmlFor="offer-valid" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Valid till (optional)</label>
          <input id="offer-valid" type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none [color-scheme:dark]" />
        </div>

        {error && <p className="text-[11px] text-rose-400" role="alert">{error}</p>}

        <button type="submit" className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 hover:bg-amber-400 transition-colors">
          Publish Offer
        </button>
      </form>

      {/* Existing offers */}
      <div className="lg:col-span-3 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BadgePercent className="w-4 h-4 text-amber-400" aria-hidden="true" /> Live Offers ({state.offers.filter((o) => o.active).length} active / {state.offers.length} total)
        </h3>

        {state.offers.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">No offers yet. Create the first one on the left.</p>
        )}

        {state.offers.map((offer) => (
          <article key={offer.id} className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${offer.active ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800/60 bg-slate-950 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {offer.badge && <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-400">{offer.badge}</span>}
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300">{OFFER_TYPES.find((t) => t.id === offer.type)?.label ?? offer.type}</span>
                {offer.validTill && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <CalendarClock className="w-3 h-3" aria-hidden="true" /> till {VALID_TILL_FORMAT.format(new Date(offer.validTill))}
                  </span>
                )}
              </div>
              <h4 className="mt-1.5 text-sm font-bold text-white leading-snug">{offer.title}</h4>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{offer.description}</p>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => dealershipStore.toggleOfferActive(offer.id, staffName)}
                title={offer.active ? 'Deactivate offer' : 'Activate offer'}
                aria-pressed={offer.active}
                className={`rounded-lg border p-2 transition-colors ${offer.active ? 'border-emerald-600/50 text-emerald-400 hover:bg-emerald-950' : 'border-slate-800 text-slate-500 hover:text-emerald-400'}`}
              >
                <Power className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete offer "${offer.title}"? This cannot be undone.`)) {
                    dealershipStore.deleteOffer(offer.id, staffName);
                  }
                }}
                title="Delete offer"
                className="rounded-lg border border-slate-800 p-2 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
