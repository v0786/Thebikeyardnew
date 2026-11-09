import { BikeCardRail } from './BikeCardRail';
import { useEffect, useState } from 'react';
import { getBackendBikewaleCatalog, isBackendConfigured, type BackendBikewaleFeed, type BackendBikewaleBike } from '../services/backendClient';

function bikeWaleListing(value?: string) {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'bikewale.com' || url.hostname.endsWith('.bikewale.com')) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function httpsPhoto(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

function ReferenceCard({ bike }: { bike: BackendBikewaleBike }) {
  const [color, setColor] = useState('');
  const [photo, setPhoto] = useState(0);
  const colors = Array.isArray(bike.colors) ? bike.colors : [];
  const activeColor = colors.find((item) => item.name === color);
  const generalPhotos = [...(bike.imageUrl ? [bike.imageUrl] : []), ...(Array.isArray(bike.photos) ? bike.photos : [])];
  const colorPhotos = Array.isArray(activeColor?.photos) ? activeColor.photos.filter(httpsPhoto) : [];
  const photos = [...new Set((colorPhotos.length ? colorPhotos : generalPhotos).filter(httpsPhoto))];
  const listing = bikeWaleListing(bike.sourceUrl);
  const retrievedAt = bike.retrievedAt ? new Date(bike.retrievedAt) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 motion-safe:transition-transform motion-safe:hover:-translate-y-1">
      {photos.length > 0 && (
        <img src={photos[Math.min(photo, photos.length - 1)]} alt={`${bike.brand} ${bike.model}${colorPhotos.length ? ` — ${color}` : ''}`}
          loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-white">{bike.brand} {bike.model}</h3>
        {bike.variant && <p className="text-sm text-slate-300">{bike.variant}</p>}
        {typeof bike.engineCc === 'number' && <p className="text-xs text-slate-400">{bike.engineCc} cc</p>}
        {colors.length > 0 && (
          <label className="block text-xs text-slate-300">Colour{' '}
            <select value={color} onChange={(event) => { setColor(event.target.value); setPhoto(0); }} className="rounded border border-slate-700 bg-slate-950 p-1">
              <option value="">All colours</option>
              {colors.map((item, index) => <option key={index} value={item.name}>{item.name}</option>)}
            </select>
          </label>
        )}
        {color && !colorPhotos.length && <p className="text-xs text-slate-400">No photo supplied for this colour.</p>}
        {photos.length > 1 && (
          <label className="block text-xs text-slate-300">Photo{' '}
            <select value={Math.min(photo, photos.length - 1)} onChange={(event) => setPhoto(Number(event.target.value))} className="rounded border border-slate-700 bg-slate-950 p-1">
              {photos.map((url, index) => <option key={url} value={index}>{index + 1} of {photos.length}</option>)}
            </select>
          </label>
        )}
        {Array.isArray(bike.specifications) && bike.specifications.length > 0 && (
          <details className="text-xs text-slate-300"><summary className="cursor-pointer text-amber-400">Specifications</summary>
            <dl className="mt-2 space-y-1">{bike.specifications.map((spec, index) => <div key={index} className="flex justify-between gap-2"><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
          </details>
        )}
        <p className="text-xs text-slate-400">{retrievedAt && Number.isFinite(retrievedAt.getTime())
          ? `Retrieved ${retrievedAt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`
          : 'Reference retrieval date unavailable'}</p>
        {listing && <a href={listing} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 underline">View BikeWale reference</a>}
      </div>
    </article>
  );
}

export function BikeWaleReferenceCatalog() {
  const endpoint = (import.meta.env.VITE_BIKEWALE_CATALOG_URL as string | undefined)?.trim();
  const configured = Boolean(endpoint || isBackendConfigured());
  const [items, setItems] = useState<BackendBikewaleBike[]>([]);
  const [stale, setStale] = useState(false);
  const [visible, setVisible] = useState(24);

  useEffect(() => {
    if (!configured) return;
    let controller: AbortController | undefined;
    const load = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        let data: BackendBikewaleFeed;
        if (endpoint) {
          const response = await fetch(endpoint, { signal: request.signal });
          if (!response.ok) throw new Error('Reference feed unavailable');
          data = await response.json() as BackendBikewaleFeed;
        } else {
          data = await getBackendBikewaleCatalog();
        }
        if (request.signal.aborted) return;
        if (!data?.configured || !Array.isArray(data.bikes) || data.bikes.length === 0) throw new Error('Reference feed empty');
        const unique = new Map(data.bikes.filter((bike) => bike && typeof bike.brand === 'string' && typeof bike.model === 'string')
          .map((bike) => [bike.sourceId || JSON.stringify([bike.brand, bike.model, bike.variant ?? '']), bike]));
        if (!unique.size) throw new Error('Reference feed empty');
        setItems([...unique.values()]);
        setStale(false);
      } catch {
        if (!request.signal.aborted) setStale(true);
      }
    };
    void load();
    const timer = window.setInterval(load, 60 * 60 * 1000);
    return () => { window.clearInterval(timer); controller?.abort(); };
  }, [endpoint, configured]);

  if (!configured || (!items.length && !stale)) return null;

  return (
    <section aria-label="BikeWale reference catalogue" className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white">Motorcycle reference catalogue</h2>
        <p className="text-sm text-slate-400">
          Approved BikeWale reference information and images. Dealership stock, prices and bookings are shown separately.
        </p>
        {stale && <p role="status" className="mt-2 text-xs text-amber-400">{items.length
          ? 'The reference refresh failed. Showing the last successful results for this visit.'
          : 'The reference feed is unavailable. You can still browse the showroom catalogue.'}</p>}
      </div>
      {items.length > 0 && (
        <BikeCardRail label="BikeWale reference bike cards">
          {items.slice(0, visible).map((bike) => <ReferenceCard key={bike.sourceId || JSON.stringify([bike.brand, bike.model, bike.variant ?? ''])} bike={bike} />)}
        </BikeCardRail>
      )}
      {visible < items.length && <button type="button" onClick={() => setVisible((count) => count + 24)}
        className="mt-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-amber-400">Load more reference bikes</button>}
    </section>
  );
}
