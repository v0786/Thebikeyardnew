import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BikeCardRail({ label, children }: { label: string; children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const container = rail.current;
    const card = container?.firstElementChild;
    if (!container || !card) return;
    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    container.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  const controls = [{ direction: -1, Icon: ChevronLeft, title: 'Previous bikes' }, { direction: 1, Icon: ChevronRight, title: 'Next bikes' }];

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2">
        {controls.map(({ direction, Icon, title }) => (
          <button key={direction} type="button" aria-label={title} onClick={() => move(direction)}
            className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:border-amber-500 hover:text-amber-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div ref={rail} role="region" aria-label={label} tabIndex={0}
        className="min-w-0 flex gap-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory p-2 [&>*]:min-w-0 [&>*]:shrink-0 [&>*]:basis-[94%] [&>*]:snap-start sm:[&>*]:basis-[calc((100%_-_1.5rem)/2)] lg:[&>*]:basis-[calc((100%_-_3rem)/3)]">
        {children}
      </div>
    </div>
  );
}
