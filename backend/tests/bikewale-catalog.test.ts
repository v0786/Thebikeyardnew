import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/app/api/catalog/bikewale/route';

const request = () => new Request('https://backend.example/api/catalog/bikewale');

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('approved BikeWale catalogue', () => {
  it('preserves specs and colour galleries while filtering unapproved media', async () => {
    vi.stubEnv('BIKEWALE_APPROVED_FEED_URL', 'https://feed.example/catalogue');
    vi.stubEnv('BIKEWALE_APPROVED_FEED_HOST', 'feed.example');
    vi.stubEnv('BIKEWALE_APPROVED_IMAGE_HOSTS', 'images.example');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{
      sourceId: 'demo-variant',
      brand: 'Demo',
      model: 'Roadster',
      variant: 'Standard',
      sourceUrl: 'https://www.bikewale.com/example/',
      photos: ['https://images.example/front.jpg', 'http://images.example/side.jpg'],
      colors: [{ name: 'Blue', photos: ['https://images.example/blue.jpg', 'https://unapproved.example/blue.jpg'] }],
      specifications: [{ label: 'Engine', value: '350 cc' }],
    }])));
    const response = await GET(request());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.bikes[0]).toMatchObject({
      sourceId: 'demo-variant',
      photos: ['https://images.example/front.jpg'],
      colors: [{ name: 'Blue', photos: ['https://images.example/blue.jpg'] }],
      specifications: [{ label: 'Engine', value: '350 cc' }],
    });
  });

  it('leaves the feed disabled until configured', async () => {
    vi.stubEnv('BIKEWALE_APPROVED_FEED_URL', '');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect(await (await GET(request())).json()).toMatchObject({ configured: false, bikes: [] });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
