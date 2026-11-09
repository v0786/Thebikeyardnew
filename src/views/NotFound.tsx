import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Seo } from '../components/Seo';

export const NotFound: FC = () => (
  <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 sm:py-28 text-center">
    <Seo title="Page Not Found | The Bike Yard" description="The page you were looking for does not exist. Browse the showroom catalogue instead." path="/404" noIndex />
    <p className="font-mono text-amber-500 text-sm tracking-[0.3em]">404</p>
    <h1 className="display-heading mt-3 text-3xl sm:text-5xl text-white uppercase">Wrong Turn,<br />Rider.</h1>
    <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
      The page you asked for isn’t in our showroom. Head back to the catalogue — the machines are waiting.
    </p>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 hover:bg-amber-400 transition-colors">
        <Home className="w-4 h-4" /> Back to Showroom
      </Link>
      <Link to="/#catalogue-section" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Browse Catalogue
      </Link>
    </div>
  </div>
);
