import { NextResponse } from 'next/server';
import { z } from 'zod';
import { corsPreflight, withCors } from '@/lib/cors';

// This endpoint accepts only a separately configured, approved BikeWale data feed.
// API Anything may be used by an operator to discover and validate that feed;
// it is not safe to assume a particular undocumented BikeWale endpoint exists.
const mediaUrl = z.string().url().max(2048);
const bikeSchema = z.object({
  sourceId: z.string().min(1).max(150).optional(),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(150),
  variant: z.string().max(150).optional(),
  engineCc: z.number().nonnegative().optional(),
  imageUrl: mediaUrl.optional(),
  photos: z.array(mediaUrl).max(40).optional(),
  colors: z.array(z.object({ name: z.string().min(1).max(100), photos: z.array(mediaUrl).max(40).optional() })).max(40).optional(),
  specifications: z.array(z.object({ label: z.string().min(1).max(120), value: z.string().max(400) })).max(100).optional(),
  sourceUrl: z.string().url().optional(),
  retrievedAt: z.string().datetime({ offset: true }).optional().catch(undefined),
});
const feedSchema = z.array(bikeSchema).max(2000);

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function GET(request: Request) {
  const feedUrl = process.env.BIKEWALE_APPROVED_FEED_URL;
  if (!feedUrl) {
    return withCors(
      request,
      NextResponse.json(
        { bikes: [], configured: false, source: 'BikeWale', message: 'Approved BikeWale feed is not configured.' },
        { status: 200 }
      )
    );
  }

  try {
    const parsedUrl = new URL(feedUrl);
    if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
      throw new Error('Approved feed must be an HTTPS URL without embedded credentials.');
    }
    const allowedHost = process.env.BIKEWALE_APPROVED_FEED_HOST;
    if (!allowedHost || parsedUrl.hostname !== allowedHost) {
      throw new Error('Feed hostname does not match the configured allowlist.');
    }

    const response = await fetch(parsedUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error('Approved feed unavailable.');
    const payload: unknown = await response.json();
    const parsed = feedSchema.safeParse(payload);
    if (!parsed.success) throw new Error('Approved feed returned an unexpected schema.');

    const approvedImageHosts = (process.env.BIKEWALE_APPROVED_IMAGE_HOSTS ?? '').split(',').map((host) => host.trim().toLowerCase());
    const isBikeWale = (host: string) => host === 'bikewale.com' || host.endsWith('.bikewale.com');
    const approvedUrl = (value: string | undefined, isImage = false) => {
      if (!value) return undefined;
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password &&
        (isBikeWale(url.hostname) || (isImage && approvedImageHosts.includes(url.hostname))) ? url.href : undefined;
    };
    const cleanPhotos = (photos?: string[]) => photos?.flatMap((photo) => {
      const approved = approvedUrl(photo, true);
      return approved ? [approved] : [];
    });
    const bikes = parsed.data.map((bike) => ({
      ...bike,
      imageUrl: approvedUrl(bike.imageUrl, true),
      photos: cleanPhotos(bike.photos),
      colors: bike.colors?.map((color) => ({ ...color, photos: cleanPhotos(color.photos) })),
      sourceUrl: approvedUrl(bike.sourceUrl),
    }));
    return withCors(request, NextResponse.json({ bikes, configured: true, source: 'BikeWale' }));
  } catch {
    return withCors(
      request,
      NextResponse.json(
        { bikes: [], configured: true, source: 'BikeWale', message: 'BikeWale feed temporarily unavailable.' },
        { status: 503 }
      )
    );
  }
}
