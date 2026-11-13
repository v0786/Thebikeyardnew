import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INITIAL_BIKES } from '../dealershipData';
import { SHOWROOM_MEDIA, frameUrl, showroomColor, wrapFrame } from '../showroom-media';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ShowroomHero } from '../../components/ShowroomHero';

describe('interactive showroom assets', () => {
  it('has a complete local turntable for each advertised model and exact catalogue colour', () => {
    for (const [bikeId, colors] of Object.entries(SHOWROOM_MEDIA)) {
      const bike = INITIAL_BIKES.find((item) => item.id === bikeId);
      expect(bike).toBeDefined();
      for (const [color, media] of Object.entries(colors)) {
        expect(bike!.availableColors.some((item) => item.name === color)).toBe(true);
        for (let i = 0; i < media.frameCount; i++) {
          const path = resolve('public', '.' + frameUrl(media, i));
          expect(existsSync(path), path).toBe(true);
          const bytes = readFileSync(path);
          expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
          expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
        }
      }
    }
  });

  it('wraps smoothly across both ends of a full rotation', () => {
    expect(wrapFrame(-1, 36)).toBe(35);
    expect(wrapFrame(36, 36)).toBe(0);
    expect(wrapFrame(-73, 36)).toBe(35);
    expect(wrapFrame(73, 36)).toBe(1);
  });

  it('selects supported colours without claiming photo-only colours have a turntable', () => {
    const hunter = INITIAL_BIKES.find((bike) => bike.id === 'bike-re-hunter-350')!;
    expect(showroomColor(hunter)).toBe('Dapper Grey');
    expect(showroomColor({ ...hunter, selectedColor: 'Rebel Blue' })).toBe('Rebel Blue');
    expect(SHOWROOM_MEDIA[hunter.id]['Rebel Red']).toBeUndefined();
  });

  it('uses current catalogue prices and preserves detail links for externally selected bikes', () => {
    const bikes = INITIAL_BIKES.filter((bike) => !bike.isUsed);
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ShowroomHero, {
      bikes, selectedBikeId: 'bike-re-himalayan-450', inStockTotal: 10, phone: '',
      onSelectBike: () => {}, onExploreClick: () => {}, onTestRideClick: () => {}, onEmiClick: () => {},
    })));
    expect(html).toContain('href="/bike/bike-re-himalayan-450"');
    expect(html).toContain('himalayan-white/01.webp');
    expect(html).toContain('₹2,85,000');
  });

  it('handles an empty catalogue without enabling broken vehicle actions', () => {
    const html = renderToStaticMarkup(createElement(ShowroomHero, {
      bikes: [], inStockTotal: 0, phone: '', onSelectBike: () => {}, onExploreClick: () => {}, onTestRideClick: () => {}, onEmiClick: () => {},
    }));
    expect(html).toContain('collection is being updated');
    expect(html).not.toContain('/bike/undefined');
  });
});
