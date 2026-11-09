import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackagePlus } from 'lucide-react';
import { Motorcycle } from '../types';
import { formatInr } from '../lib/currency';
import { getColorBikeImage } from '../data/dealershipData';

interface LatestArrivalsProps {
  bikes: Motorcycle[];
}

const ARRIVAL_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Homepage "Latest Arrivals" — most recently inwarded machines first. */
export const LatestArrivals: FC<LatestArrivalsProps> = ({ bikes }) => {
  const latest = [...bikes]
    .filter((b) => b.arrivedAt && !b.isUsed)
    .sort((a, b) => (b.arrivedAt ?? '').localeCompare(a.arrivedAt ?? ''))
    .slice(0, 8);

  if (latest.length === 0) return null;

  return (
    <section aria-label="Latest arrivals">
      <div className="flex items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="eyebrow text-amber-500 flex items-center gap-1.5">
            <PackagePlus className="w-3.5 h-3.5" aria-hidden="true" /> Just Inwarded
          </p>
          <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">Latest Arrivals</h2>
        </div>
        <Link to="/#catalogue-section" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap">
          Full catalogue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-5 -mx-4 sm:mx-0 px-4 sm:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:thin]">
        {latest.map((bike) => (
          <Link
            key={bike.id}
            to={`/bike/${bike.id}`}
            className="snap-start shrink-0 w-56 sm:w-64 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-amber-500/50 transition-colors"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
              <img
                src={getColorBikeImage(bike, bike.selectedColor)}
                alt={`${bike.brand} ${bike.model}`}
                loading="lazy"
                width={400}
                height={250}
                className="h-full w-full object-cover"
              />
              {bike.arrivedAt && (
                <span className="absolute bottom-2 left-2 rounded-md bg-slate-950/85 backdrop-blur px-2 py-1 text-[10px] font-semibold text-slate-200 border border-slate-800">
                  Inwarded {ARRIVAL_FORMAT.format(new Date(bike.arrivedAt))}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{bike.brand}</p>
              <h3 className="mt-0.5 text-sm font-bold text-white leading-snug line-clamp-1">{bike.model}</h3>
              <p className="mt-1.5 text-xs font-extrabold text-amber-400 tabular-nums">{formatInr(bike.exShowroomPaise)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
