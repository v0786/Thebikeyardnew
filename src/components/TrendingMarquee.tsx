import React from 'react';
import { Motorcycle } from '../types';
import { formatInr } from '../lib/currency';
import { Flame, ArrowUpRight, Zap } from 'lucide-react';

interface TrendingMarqueeProps {
  bikes: Motorcycle[];
  onSelectBike: (bike: Motorcycle) => void;
  selectedBikeId?: string;
}

export const TrendingMarquee: React.FC<TrendingMarqueeProps> = ({
  bikes,
  onSelectBike,
  selectedBikeId,
}) => {
  // Duplicate for seamless loop
  const displayBikes = [...bikes, ...bikes];

  return (
    <div className="relative overflow-hidden py-4 border-y border-slate-800 bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Trending in Thane This Week
          </span>
          <span className="hidden sm:inline text-xs text-slate-500">
            · Auto-scrolling BikeDekho style live showcase
          </span>
        </div>
        <div className="text-[11px] text-amber-400 font-medium">
          Hover to pause · Click to inspect
        </div>
      </div>

      {/* Marquee Track with CSS animation scrolling right to left */}
      <div className="flex w-max gap-4 hover:[animation-play-state:paused] animate-marquee">
        {displayBikes.map((bike, idx) => {
          const onRoadPaise =
            bike.exShowroomPaise + bike.rtoTaxPaise + bike.insurancePaise + bike.handlingPaise;
          const isSelected = selectedBikeId === bike.id;

          return (
            <div
              key={`${bike.id}-${idx}`}
              onClick={() => onSelectBike(bike)}
              className={`w-64 sm:w-72 shrink-0 cursor-pointer rounded-2xl border p-3.5 transition-all duration-300 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900 mb-3">
                <img
                  src={bike.image}
                  alt={bike.model}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                  {bike.brand}
                </div>
                {bike.inStockCount > 0 && (
                  <div className="absolute bottom-2 right-2 rounded bg-emerald-950/90 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    {bike.inStockCount} Ready
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{bike.model}</h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Market Ex-Showroom</span>
                  <span className="font-semibold text-slate-300">{formatInr(bike.exShowroomPaise)}</span>
                </div>
                <div className="text-xs font-extrabold text-amber-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-normal">On-Road Thane</span>
                  <span className="tabular-nums">{formatInr(onRoadPaise)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
