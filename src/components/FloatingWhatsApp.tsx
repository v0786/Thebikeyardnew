import type { FC } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsAppLink } from '../lib/whatsapp';

interface FloatingWhatsAppProps {
  phone: string;
}

/** Persistent one-tap WhatsApp enquiry button (all pages). */
export const FloatingWhatsApp: FC<FloatingWhatsAppProps> = ({ phone }) => (
  <a
    href={whatsAppLink(phone, 'Hi The Bike Yard! I would like to enquire about a motorcycle.')}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with The Bike Yard on WhatsApp"
    className="fixed z-40 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] md:bottom-24 right-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors"
  >
    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
  </a>
);
