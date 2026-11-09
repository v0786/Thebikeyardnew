import { Motorcycle } from '../types';

export type CatalogueSort = 'POPULARITY' | 'PRICE_ASC' | 'PRICE_DESC';
export type EngineCcBand = 'ALL' | 'UPTO_125' | 'CC_126_250' | 'CC_251_400' | 'CC_400_PLUS';
export type BudgetBand = 'ALL' | 'UNDER_1L' | '1L_2L' | '2L_3L' | 'ABOVE_3L';

export interface CatalogueFilters {
  brand: string;
  category: string;
  budget: BudgetBand;
  engineCc: EngineCcBand;
  search: string;
  onlyInStock: boolean;
}

export const DEFAULT_FILTERS: CatalogueFilters = {
  brand: 'ALL',
  category: 'ALL',
  budget: 'ALL',
  engineCc: 'ALL',
  search: '',
  onlyInStock: false,
};

export function filterBikes(bikes: Motorcycle[], f: CatalogueFilters): Motorcycle[] {
  return bikes.filter((bike) => {
    if (f.brand !== 'ALL' && bike.brand !== f.brand) return false;
    if (f.category !== 'ALL' && bike.category !== f.category) return false;
    if (f.onlyInStock && bike.inStockCount <= 0) return false;

    const rawRupees = Number(bike.exShowroomPaise / 100n);
    if (f.budget === 'UNDER_1L' && rawRupees >= 100000) return false;
    if (f.budget === '1L_2L' && (rawRupees < 100000 || rawRupees > 200000)) return false;
    if (f.budget === '2L_3L' && (rawRupees < 200000 || rawRupees > 300000)) return false;
    if (f.budget === 'ABOVE_3L' && rawRupees <= 300000) return false;

    if (f.engineCc === 'UPTO_125' && bike.engineCc > 125) return false;
    if (f.engineCc === 'CC_126_250' && (bike.engineCc <= 125 || bike.engineCc > 250)) return false;
    if (f.engineCc === 'CC_251_400' && (bike.engineCc <= 250 || bike.engineCc > 400)) return false;
    if (f.engineCc === 'CC_400_PLUS' && bike.engineCc <= 400) return false;

    const q = f.search.trim().toLowerCase();
    if (q) {
      const haystack = `${bike.brand} ${bike.model} ${bike.variant} ${bike.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Popularity is derived from real dealership signals stored in the app:
 * customer leads and bookings whose "bike of interest" mentions the model.
 * Falls back to 0 for bikes with no signals; ties broken by stock count.
 */
export function computePopularity(
  bikes: Motorcycle[],
  signals: Array<string>
): Map<string, number> {
  const scores = new Map<string, number>();
  const haystack = signals.map((s) => s.toLowerCase());
  for (const bike of bikes) {
    const needle = bike.model.toLowerCase();
    const brand = bike.brand.toLowerCase();
    let score = 0;
    for (const s of haystack) {
      if (s.includes(needle) || (s.includes(brand) && s.includes(needle.split(' ')[0] ?? ''))) {
        score += 1;
      }
    }
    scores.set(bike.id, score);
  }
  return scores;
}

export function sortBikes(
  bikes: Motorcycle[],
  sort: CatalogueSort,
  popularity?: Map<string, number>
): Motorcycle[] {
  const arr = [...bikes];
  switch (sort) {
    case 'PRICE_ASC':
      arr.sort((a, b) => Number(a.exShowroomPaise - b.exShowroomPaise));
      break;
    case 'PRICE_DESC':
      arr.sort((a, b) => Number(b.exShowroomPaise - a.exShowroomPaise));
      break;
    case 'POPULARITY':
    default:
      arr.sort((a, b) => {
        const pa = popularity?.get(a.id) ?? 0;
        const pb = popularity?.get(b.id) ?? 0;
        if (pb !== pa) return pb - pa;
        return b.inStockCount - a.inStockCount;
      });
  }
  return arr;
}

export interface PageSlice<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageSlice<T> {
  const safeSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    page: safePage,
    totalPages,
    totalItems,
  };
}
