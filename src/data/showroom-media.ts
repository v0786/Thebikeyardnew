import type { Motorcycle } from '../types';

export interface TurntableMedia {
  directory: string;
  frameCount: number;
  source: string;
}

/** Manufacturer photography. Match exact colour names; never recolour or fake unseen angles. */
export const SHOWROOM_MEDIA: Record<string, Record<string, TurntableMedia>> = {
  'bike-re-hunter-350': {
    'Dapper Grey': { directory: 'hunter-grey', frameCount: 36, source: 'https://www.royalenfield.com/in/en/motorcycles/hunter-350/' },
    'Rebel Blue': { directory: 'hunter-blue', frameCount: 36, source: 'https://www.royalenfield.com/in/en/motorcycles/hunter-350/' },
  },
  'bike-re-himalayan-450': {
    'Kamet White': { directory: 'himalayan-white', frameCount: 36, source: 'https://www.royalenfield.com/in/en/motorcycles/himalayan/' },
    'Hanle Black': { directory: 'himalayan-black', frameCount: 36, source: 'https://www.royalenfield.com/in/en/motorcycles/himalayan/' },
    'Kaza Brown': { directory: 'himalayan-brown', frameCount: 36, source: 'https://www.royalenfield.com/in/en/motorcycles/himalayan/' },
  },
};

export function wrapFrame(frame: number, count: number): number {
  return ((frame % count) + count) % count;
}

export function frameUrl(media: TurntableMedia, frame: number): string {
  return `/assets/turntables/${media.directory}/${String(wrapFrame(frame, media.frameCount) + 1).padStart(2, '0')}.webp`;
}

export function showroomColor(bike: Motorcycle): string {
  const supported = SHOWROOM_MEDIA[bike.id];
  if (bike.selectedColor && supported?.[bike.selectedColor]) return bike.selectedColor;
  return bike.availableColors.find((color) => supported?.[color.name])?.name
    ?? bike.selectedColor ?? bike.availableColors[0]?.name ?? '';
}
