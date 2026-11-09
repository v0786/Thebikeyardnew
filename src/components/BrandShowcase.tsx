import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Motorcycle } from '../types';

const AUTHORISED_BRANDS = ['Honda', 'Suzuki', 'TVS'] as const;
const MORE_BRANDS = ['Royal Enfield', 'KTM', 'Yamaha', 'Triumph', 'Bajaj', 'Hero'] as const;

interface BrandShowcaseProps {
  bikes: Motorcycle[];
}

/**
 * Authorised brand showcase. Honda / Suzuki / TVS are highlighted as the
 * headline authorised marques; other brands sold at the showroom follow.
 */
export const BrandShowcase: FC<BrandShowcaseProps> = ({ bikes }) => {
  const countFor = (brand: string) =>
    bikes.filter((b) => b.brand === brand && !b.isUsed).length;

  return (
    <section aria-label="Authorised brands" className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="eyebrow text-amber-500">Authorised Showroom</p>
            <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">
              Honda · Suzuki · TVS — Straight From the Manufacturer
            </h2>
          </div>
          <Link
            to="/?brand=Honda#catalogue-section"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap"
          >
            View Honda range <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {AUTHORISED_BRANDS.map((brand) => {
            const count = countFor(brand);
            return (
              <Link
                key={brand}
                to={`/?brand=${encodeURIComponent(brand)}#catalogue-section`}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 hover:border-amber-500/50 transition-colors"
              >
                <div className="absolute -right-6 -bottom-7 select-none text-[96px] sm:text-[120px] leading-none font-black tracking-tighter text-slate-800/60 group-hover:text-amber-500/10 transition-colors" aria-hidden="true">
                  {brand.slice(0, 1)}
                </div>
                <ShieldCheck className="w-5 h-5 text-amber-500 mb-6" aria-hidden="true" />
                <div className="relative">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{brand}</div>
                  <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                    Authorised sales & service · {count} model{count === 1 ? '' : 's'} on display
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 group-hover:gap-2.5 transition-all">
                    Browse {brand} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mr-1">Also on floor</span>
          {MORE_BRANDS.map((brand) => (
            <Link
              key={brand}
              to={`/?brand=${encodeURIComponent(brand)}#catalogue-section`}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
