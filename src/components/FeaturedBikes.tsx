import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Motorcycle } from '../types';
import { formatInr } from '../lib/currency';
import { getColorBikeImage } from '../data/dealershipData';

interface FeaturedBikesProps {
  bikes: Motorcycle[];
}

/** Homepage "Featured Motorcycles" rail — staff-controlled via the `featured` flag. */
export const FeaturedBikes: FC<FeaturedBikesProps> = ({ bikes }) => {
  const featured = bikes.filter((b) => b.featured && !b.isUsed).slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <section aria-label="Featured motorcycles">
      <div className="flex items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="eyebrow text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Showroom Picks
          </p>
          <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">Featured Motorcycles</h2>
        </div>
        <Link to="/?sort=POPULARITY#catalogue-section" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {featured.map((bike) => (
          <Link
            key={bike.id}
            to={`/bike/${bike.id}`}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-950">
              <img
                src={getColorBikeImage(bike, bike.selectedColor)}
                alt={`${bike.brand} ${bike.model}`}
                loading="lazy"
                width={320}
                height={240}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{bike.brand}</p>
              <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 min-h-[2em]">{bike.model}</h3>
              <p className="mt-1.5 text-[11px] sm:text-xs font-extrabold text-amber-400 tabular-nums">
                {formatInr(bike.exShowroomPaise)}
                <span className="block text-[9px] font-medium text-slate-500">ex-showroom</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
