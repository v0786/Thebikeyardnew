import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Lock, Star, Save, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DealershipState } from '../../services/dealershipStore';
import { dealershipStore } from '../../services/dealershipStore';
import type { UserProfile } from '../../lib/rbac';
import { formatInrExact, formatInr } from '../../lib/currency';

interface PricingPanelProps {
  state: DealershipState;
  currentUser: UserProfile;
}

/**
 * Staff pricing & merchandising desk.
 * BUSINESS RULE (enforced in the store): staff may edit ex-showroom prices
 * (RTO MH-04 recomputes at 11%) and the homepage "featured" flag.
 * Factory specifications and descriptions are NEVER editable here.
 */
export const PricingPanel: FC<PricingPanelProps> = ({ state, currentUser }) => {
  const [review, setReview] = useState<{ bikeId: string; variantId: string; price: bigint; previous: bigint; onRoad: bigint; name: string } | null>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (review) reviewHeading.current?.focus(); }, [review]);
  const [query, setQuery] = useState('');
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; message: string } | null>(null);

  const staffName = `${currentUser.name} (${currentUser.designation})`;

  const bikes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...state.bikes].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || a.brand.localeCompare(b.brand));
    if (!q) return sorted;
    return sorted.filter((b) => `${b.brand} ${b.model} ${b.variant}`.toLowerCase().includes(q));
  }, [state.bikes, query]);

  const onRoadFor = (variantId: string | undefined, bike: (typeof bikes)[number]) => {
    const variant = bike.variants?.find((v) => v.id === (variantId ?? bike.selectedVariantId)) ?? bike.variants?.[0];
    if (variant) {
      return variant.exShowroomPaise + variant.rtoTaxPaise + variant.insurancePaise + variant.handlingPaise;
    }
    return bike.exShowroomPaise + bike.rtoTaxPaise + bike.insurancePaise + bike.handlingPaise;
  };

  const handleSave = (bikeId: string) => {
    const bike = state.bikes.find((b) => b.id === bikeId);
    if (!bike) return;
    const variantId = variantChoice[bikeId] ?? bike.selectedVariantId ?? bike.variants?.[0]?.id;
    const draft = priceDraft[bikeId];
    if (!variantId || draft === undefined || draft.trim() === '') {
      setFeedback({ id: bikeId, ok: false, message: 'Enter a price in ₹ (e.g. 149900).' });
      return;
    }
    const value = draft.trim().replace(/,/g, '');
    if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) {
      setFeedback({ id: bikeId, ok: false, message: 'Enter a valid rupee amount with up to two decimal places.' });
      return;
    }
    const [whole, fraction = ''] = value.split('.');
    const price = BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, '0'));
    const variant = bike.variants?.find((item) => item.id === variantId);
    if (price <= 0n || !variant) {
      setFeedback({ id: bikeId, ok: false, message: 'Select a variant and enter a positive price.' });
      return;
    }
    setReview({
      bikeId, variantId, price, previous: variant.exShowroomPaise,
      onRoad: price + (price * 1100n) / 10000n + variant.insurancePaise + variant.handlingPaise,
      name: `${bike.brand} ${bike.model} · ${variant.name}`,
    });
  };

  const confirmPrice = () => {
    if (!review) return;
    const { bikeId, variantId, price, previous } = review;
    const current = dealershipStore.getState().bikes.find((bike) => bike.id === bikeId)
      ?.variants?.find((variant) => variant.id === variantId);
    setReview(null);
    if (current?.exShowroomPaise !== previous) {
      setFeedback({ id: bikeId, ok: false, message: 'The current price changed. Review the new quote before confirming.' });
      return;
    }
    const result = dealershipStore.updateVariantPrice({ bikeId, variantId, newExShowroomPaise: price, staffName });
    if (result.success) {
      setFeedback({ id: bikeId, ok: true, message: 'Demo price updated in this browser. RTO recomputed at 11% (MH-04).' });
      setPriceDraft((p) => ({ ...p, [bikeId]: '' }));
    } else {
      setFeedback({ id: bikeId, ok: false, message: result.error ?? 'Update failed.' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-xs text-amber-100/90 leading-relaxed">
          <p className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">Central Dataset Protection</p>
          Factory specifications (engine, dimensions, mileage, features, descriptions and images) come from the
          central manufacturer dataset and are <strong>read-only</strong> for staff. You may update the
          <strong> ex-showroom price</strong> (the MH-04 on-road price recomputes automatically: 11% RTO + dataset insurance &amp; handling)
          and the <strong>homepage Featured</strong> merchandising flag. Every change is written to the audit log.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">Catalogue Pricing &amp; Featured Merchandising</h3>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search motorcycles</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand / model…"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </label>
      </div>

      {review && (
        <section aria-label="Review price change" className="space-y-3 rounded-2xl border border-amber-500/30 bg-slate-900 p-4 text-xs text-slate-200">
          <h4 ref={reviewHeading} tabIndex={-1} className="text-sm font-bold text-white">Review &amp; confirm price</h4>
          <p>{review.name}</p>
          <dl className="grid grid-cols-2 gap-2">
            <dt>Current ex-showroom</dt><dd>{formatInrExact(review.previous)}</dd>
            <dt>Proposed ex-showroom</dt><dd>{formatInrExact(review.price)}</dd>
            <dt>Proposed on-road estimate</dt><dd>{formatInrExact(review.onRoad)}</dd>
          </dl>
          <p>This demo saves confirmed prices in this browser.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setReview(null)} className="rounded-lg border border-slate-700 px-3 py-2">Back to editing</button>
            <button type="button" onClick={confirmPrice} className="rounded-lg bg-amber-500 px-3 py-2 font-bold text-slate-950">Confirm demo price</button>
          </div>
        </section>
      )}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Motorcycle</th>
              <th className="p-3">Variant to Price</th>
              <th className="p-3">Current Ex-Showroom</th>
              <th className="p-3">New Ex-Showroom (₹)</th>
              <th className="p-3">Live On-Road (MH-04)</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/60">
            {bikes.map((bike) => {
              const variantId = variantChoice[bike.id] ?? bike.selectedVariantId ?? bike.variants?.[0]?.id;
              const variant = bike.variants?.find((v) => v.id === variantId);
              const feedbackForRow = feedback?.id === bike.id ? feedback : null;
              return (
                <tr key={bike.id} className="align-middle">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={bike.image} alt="" loading="lazy" className="h-10 w-14 object-cover rounded-md border border-slate-800" />
                      <div>
                        <p className="font-bold text-white leading-tight">{bike.brand} {bike.model}</p>
                        <p className="text-[10px] text-slate-500">{bike.engineCc === 0 ? 'Electric' : `${bike.engineCc}cc`} · {bike.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={variantId}
                      onChange={(e) => setVariantChoice((p) => ({ ...p, [bike.id]: e.target.value }))}
                      aria-label={`Variant for ${bike.model}`}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      {bike.variants?.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      )) ?? <option value={bike.id}>{bike.variant}</option>}
                    </select>
                  </td>
                  <td className="p-3 tabular-nums text-slate-200">{formatInr(variant?.exShowroomPaise ?? bike.exShowroomPaise)}</td>
                  <td className="p-3">
                    <input
                      inputMode="numeric"
                      value={priceDraft[bike.id] ?? ''}
                      onChange={(e) => setPriceDraft((p) => ({ ...p, [bike.id]: e.target.value }))}
                      placeholder={String(Number((variant?.exShowroomPaise ?? bike.exShowroomPaise) / 100n))}
                      aria-label={`New ex-showroom price for ${bike.model}`}
                      className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-[11px] text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none tabular-nums"
                    />
                  </td>
                  <td className="p-3 tabular-nums text-amber-400 font-semibold">{formatInr(onRoadFor(variantId, bike))}</td>
                  <td className="p-3">
                    <button
                      onClick={() => dealershipStore.toggleBikeFeatured(bike.id, staffName)}
                      aria-pressed={bike.featured ?? false}
                      title={bike.featured ? 'Remove from homepage featured' : 'Feature on homepage'}
                      className={`rounded-lg border p-2 transition-all ${
                        bike.featured
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-amber-400'
                      }`}
                    >
                      <Star className="w-4 h-4" fill={bike.featured ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleSave(bike.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-100 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" aria-hidden="true" /> Review
                    </button>
                    {feedbackForRow && (
                      <p className={`mt-1 flex items-center gap-1 text-[10px] ${feedbackForRow.ok ? 'text-emerald-400' : 'text-rose-400'}`} role="status">
                        {feedbackForRow.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {feedbackForRow.message}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
