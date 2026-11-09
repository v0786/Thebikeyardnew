import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  computePopularity,
  filterBikes,
  paginate,
  sortBikes,
} from '../catalogue';
import type { Motorcycle } from '../../types';

const makeBike = (overrides: Partial<Motorcycle>): Motorcycle => ({
  id: 'b-1',
  brand: 'Honda',
  model: 'Activa 6G',
  variant: 'Base',
  category: 'Scooter',
  exShowroomPaise: 76_684_00n,
  rtoTaxPaise: 8_435_24n,
  insurancePaise: 11_00_000n,
  handlingPaise: 1_50_000n,
  engineCc: 109,
  powerBhp: 7.7,
  torqueNm: 8.9,
  mileageKmpl: 50,
  kerbWeightKg: 106,
  fuelCapacityL: 5.3,
  availableColors: [],
  inStockCount: 3,
  image: '/x.jpg',
  description: 'test',
  ...overrides,
});

const bikes: Motorcycle[] = [
  makeBike({ id: 'cheap-honda', brand: 'Honda', model: 'Activa 6G', exShowroomPaise: 76_684_00n, engineCc: 109, inStockCount: 2 }),
  makeBike({ id: 'mid-tvs', brand: 'TVS', model: 'Apache RTR 160 4V', exShowroomPaise: 124_870_00n, engineCc: 159, category: 'Sport', inStockCount: 5 }),
  makeBike({ id: 'big-re', brand: 'Royal Enfield', model: 'Himalayan 450', exShowroomPaise: 285_000_00n, engineCc: 452, category: 'Adventure', inStockCount: 1 }),
  makeBike({ id: 'zero-stock-ktm', brand: 'KTM', model: '390 Duke', exShowroomPaise: 310_520_00n, engineCc: 399, category: 'Sport', inStockCount: 0 }),
];

describe('filterBikes', () => {
  it('filters by brand', () => {
    const out = filterBikes(bikes, { ...DEFAULT_FILTERS, brand: 'TVS' });
    expect(out.map((b) => b.id)).toEqual(['mid-tvs']);
  });

  it('filters by engine band', () => {
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, engineCc: 'UPTO_125' }).map((b) => b.id)).toEqual(['cheap-honda']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, engineCc: 'CC_126_250' }).map((b) => b.id)).toEqual(['mid-tvs']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, engineCc: 'CC_251_400' }).map((b) => b.id)).toEqual(['zero-stock-ktm']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, engineCc: 'CC_400_PLUS' }).map((b) => b.id)).toEqual(['big-re']);
  });

  it('filters by budget band', () => {
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, budget: 'UNDER_1L' }).map((b) => b.id)).toEqual(['cheap-honda']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, budget: '1L_2L' }).map((b) => b.id)).toEqual(['mid-tvs']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, budget: 'ABOVE_3L' }).map((b) => b.id)).toEqual(['zero-stock-ktm']);
  });

  it('filters by category and stock availability', () => {
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, category: 'Sport' }).map((b) => b.id)).toEqual(['mid-tvs', 'zero-stock-ktm']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, onlyInStock: true }).map((b) => b.id)).toEqual(['cheap-honda', 'mid-tvs', 'big-re']);
  });

  it('searches across brand and model, case-insensitive', () => {
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, search: 'apache' }).map((b) => b.id)).toEqual(['mid-tvs']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, search: 'HIMALAYAN' }).map((b) => b.id)).toEqual(['big-re']);
    expect(filterBikes(bikes, { ...DEFAULT_FILTERS, search: 'zzz-no-match' })).toEqual([]);
  });
});

describe('sortBikes', () => {
  it('sorts by price ascending and descending', () => {
    expect(sortBikes(bikes, 'PRICE_ASC').map((b) => b.id)).toEqual(['cheap-honda', 'mid-tvs', 'big-re', 'zero-stock-ktm']);
    expect(sortBikes(bikes, 'PRICE_DESC').map((b) => b.id)).toEqual(['zero-stock-ktm', 'big-re', 'mid-tvs', 'cheap-honda']);
  });

  it('sorts by computed popularity score, breaking ties by stock', () => {
    const popularity = computePopularity(bikes, ['apache rtr enquiry', 'apache rtr test ride', 'activa booking']);
    const sorted = sortBikes(bikes, 'POPULARITY', popularity);
    expect(sorted[0]!.id).toBe('mid-tvs');
    expect(sorted[1]!.id).toBe('cheap-honda');
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('slices pages correctly', () => {
    expect(paginate(items, 1, 9).items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(paginate(items, 3, 9).items).toEqual([19, 20, 21, 22, 23, 24, 25]);
    expect(paginate(items, 3, 9).totalPages).toBe(3);
  });

  it('clamps out-of-range pages', () => {
    expect(paginate(items, 99, 9).page).toBe(3);
    expect(paginate(items, 0, 9).page).toBe(1);
  });

  it('handles empty input', () => {
    const slice = paginate([], 1, 9);
    expect(slice.items).toEqual([]);
    expect(slice.totalPages).toBe(1);
    expect(slice.totalItems).toBe(0);
  });
});
