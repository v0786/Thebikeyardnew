import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadStore(overrides?: object) {
  vi.resetModules();
  vi.stubGlobal('window', {
    localStorage: { getItem: () => overrides ? JSON.stringify(overrides) : null, setItem: vi.fn() },
  });
  return (await import('../../services/dealershipStore')).dealershipStore;
}

const bikeId = 'bike-re-hunter-350';
const defaultPrice = { exShowroomPaise: 14990000n, insurancePaise: 1120000n, rtoTaxPaise: 1648900n };

afterEach(() => vi.unstubAllGlobals());

describe('curated showroom pricing', () => {
  it('keeps the original price when the customer selects Base or reloads with legacy defaults', async () => {
    const fresh = await loadStore();
    expect(fresh.getState().bikes.find((bike) => bike.id === bikeId)).toMatchObject(defaultPrice);
    expect(fresh.selectBikeVariant(bikeId, 'var-top')).toBe(true);
    expect(fresh.selectBikeVariant(bikeId, 'var-base')).toBe(true);
    expect(fresh.getState().bikes.find((bike) => bike.id === bikeId)).toMatchObject(defaultPrice);

    const reloaded = await loadStore({ v: 1, bikes: { [bikeId]: { v: { 'var-base': '14990000' } } } });
    expect(reloaded.getState().bikes.find((bike) => bike.id === bikeId)).toMatchObject(defaultPrice);
  });

  it('still applies saved staff price overrides and recalculates RTO', async () => {
    const store = await loadStore({ v: 1, bikes: { [bikeId]: { v: { 'var-base': '15000000' } } } });
    expect(store.getState().bikes.find((bike) => bike.id === bikeId)).toMatchObject({
      ...defaultPrice,
      exShowroomPaise: 15000000n,
      rtoTaxPaise: 1650000n,
    });
  });
});
