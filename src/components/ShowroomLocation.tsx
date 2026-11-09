import { useCookiePreferences } from './CookiePreferences';
import type { FC } from 'react';
import { MapPin, Phone, Clock, Navigation, Mail, MessageCircle } from 'lucide-react';
import type { DealershipInfo } from '../types';
import { whatsAppLink, telLink } from '../lib/whatsapp';

interface ShowroomLocationProps {
  info: DealershipInfo;
}

/** Dealership location, hours and one-tap contact actions. */
export const ShowroomLocation: FC<ShowroomLocationProps> = ({ info }) => {
  const { maps, open } = useCookiePreferences();
  const mapQuery = encodeURIComponent(`${info.address}, ${info.city}, ${info.state} ${info.pincode}`);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const embedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <section aria-label="Visit the showroom" className="grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col gap-5">
        <div>
          <p className="eyebrow text-amber-500">Visit Us</p>
          <h2 className="display-heading mt-1 text-lg sm:text-2xl text-white">The Bike Yard — Khopat, Thane</h2>
        </div>

        <ul className="space-y-4 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{info.address}, {info.city}, {info.state} — {info.pincode}<br /><span className="text-xs text-slate-500">{info.rtoCode} jurisdiction</span></span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{info.openingHours}</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>
              <a href={telLink(info.phone)} className="text-white font-semibold hover:text-amber-400 transition-colors">{info.phone}</a>
              {info.landline && <><br /><span className="text-slate-500 text-xs">Landline: {info.landline}</span></>}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" aria-hidden="true" />
            <a href={`mailto:${info.email}`} className="hover:text-white transition-colors">{info.email}</a>
          </li>
        </ul>

        <div className="flex flex-wrap gap-2">
          <a
            href={whatsAppLink(info.phone, 'Hi The Bike Yard! I would like to visit the showroom / know more about a motorcycle.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp Us
          </a>
          <a
            href={telLink(info.phone)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden="true" /> Call Sales Desk
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" /> Get Directions
          </a>
        </div>
      </div>

      <div className="lg:col-span-3 min-h-[260px] sm:min-h-[340px]">
        {maps ? <iframe
          title="The Bike Yard showroom map — Khopat, Thane"
          src={embedUrl}
          className="h-full w-full min-h-[260px] sm:min-h-[340px] border-0 grayscale-[35%] invert-[0.92] hue-rotate-180 contrast-90"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        /> : <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 p-4 text-center text-sm text-slate-400">
          <p>Allow optional cookies to display the showroom map here.</p>
          <button type="button" onClick={open} className="text-amber-400 underline">Cookie preferences</button>
        </div>}
      </div>
    </section>
  );
};
