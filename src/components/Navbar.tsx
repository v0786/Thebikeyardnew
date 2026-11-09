import React, { useState, useEffect } from 'react';
import {
  Bike,
  Sparkles,
  ShoppingBag,
  PhoneCall,
  Calendar,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cartStore } from '../services/cartStore';
import { dealershipStore } from '../services/dealershipStore';
import { telLink } from '../lib/whatsapp';
import { UserProfile, ROLE_CONFIGS } from '../lib/rbac';
import { ThemePicker } from './ThemePicker';

interface NavbarProps {
  activeView: 'showroom' | 'admin' | 'staff' | 'login' | 'legal';
  onViewChange: (view: 'showroom' | 'admin' | 'staff' | 'login' | 'legal') => void;
  onOpenTestRideModal: () => void;
  onOpenChat: () => void;
  onOpenCart: () => void;
  onOpenLeadModal?: () => void;
  onOpenCompare?: () => void;
  compareCount?: number;
  onOpenCsvUpload?: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onOpenTestRideModal,
  onOpenChat,
  onOpenCart,
  onOpenLeadModal,
  onOpenCompare,
  compareCount = 0,
  onOpenCsvUpload,
  currentUser,
  onLogout,
}) => {
  const [isNavigationOpen, setNavigationOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(cartStore.getItemCount());
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState<boolean>(false);
  const dealerPhone = dealershipStore.getState().dealershipInfo.phone;

  useEffect(() => {
    const unsub = cartStore.subscribe(() => {
      setCartCount(cartStore.getItemCount());
    });
    return () => unsub();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Dealership top utility strip */}
      <div className="hidden sm:block border-b border-slate-900 bg-slate-900/50 px-4 sm:px-6 py-1.5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 truncate">
            <span className="text-amber-400 font-bold shrink-0">The Bike Yard</span>
            <span className="text-slate-600">|</span>
            <span className="truncate">Authorised Multi-Brand Dealer · Khopat, Thane (W) — MH-04</span>
            <span className="hidden md:inline text-slate-600">|</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {onOpenCsvUpload && (
              <>
                <button
                  onClick={onOpenCsvUpload}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
                  title="Upload CSV to load new bikes into the showroom"
                >
                  <span className="hidden sm:inline">Upload CSV</span>
                </button>
                <span className="text-slate-700">|</span>
              </>
            )}

            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Grounded AI Desk</span>
            </button>
            <span className="text-slate-700">|</span>
            <ThemePicker compact />
            <span className="text-slate-700">|</span>
            <a
              href={telLink(dealerPhone)}
              className="flex items-center gap-1 font-mono text-amber-400 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{dealerPhone}</span>
            </a>

            {/* Staff Login Button / Logged-in Staff pill */}
            <span className="text-slate-700">|</span>
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
                  className="flex items-center gap-1.5 text-amber-400 font-semibold hover:text-amber-300"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black">
                    {currentUser.avatarText}
                  </span>
                  <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isStaffMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800 text-left">
                      <div className="text-xs font-bold text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-amber-400 font-semibold">
                        {ROLE_CONFIGS[currentUser.role]?.label}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onViewChange('admin');
                        setIsStaffMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800"
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onViewChange('staff');
                        setIsStaffMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800"
                    >
                      Staff Daily Operations
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsStaffMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 flex items-center justify-between"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onViewChange('login')}
                className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation row adhering strictly to the 3-zone contract */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2.5 sm:gap-x-4 sm:px-6 sm:py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden h-9 w-9 shrink-0 items-center min-[360px]:flex justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bike className="w-5 h-5" />
          </div>
          <button
            onClick={() => onViewChange('showroom')}
            className="text-left group"
          >
            <div className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
              THE BIKE YARD
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              Thane Digital Showroom
            </div>
          </button>
        </div>

        {/* Zone 2: Public exploration links */}
        <nav id="showroom-navigation" aria-label="Showroom navigation"
          onClick={(event) => {
            if ((event.target as Element).closest('button')) setNavigationOpen(false);
          }}
          className={`order-last max-h-[50dvh] w-full flex-wrap items-center gap-x-4 gap-y-1 overflow-y-auto text-sm font-medium text-slate-300 max-xl:[&_button]:min-h-11 xl:order-none xl:flex xl:max-h-none xl:w-auto xl:min-w-0 xl:flex-1 xl:justify-center xl:gap-x-3 xl:text-xs ${isNavigationOpen ? 'flex border-t border-slate-800 pt-1' : 'hidden'} xl:border-t-0 xl:pt-0`}>
          <button
            onClick={() => {
              onViewChange('showroom');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeView === 'showroom' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Explore Bikes
          </button>
          <button
            onClick={() => {
              onViewChange('showroom');
              const el = document.getElementById('catalogue-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap transition-colors text-slate-400 hover:text-white"
          >
            New Motorcycles
          </button>
          <button
            onClick={() => {
              onViewChange('showroom');
              const el = document.getElementById('used-bikes-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap transition-colors text-slate-400 hover:text-white"
          >
            Certified Pre-Owned
          </button>
          <button
            onClick={() => {
              onViewChange('showroom');
              const el = document.getElementById('emi-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap transition-colors text-slate-400 hover:text-white"
          >
            10 Finance EMI
          </button>
          <button
            onClick={() => {
              onViewChange('showroom');
              const el = document.getElementById('applications-hub');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap transition-colors text-slate-400 hover:text-white"
          >
            MH-04 RTO & Insurance
          </button>

          {onOpenLeadModal && (
            <button type="button" onClick={onOpenLeadModal} className="text-slate-300 hover:text-white sm:hidden">
              Get Quote
            </button>
          )}

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 whitespace-nowrap transition-colors text-slate-400 hover:text-white"
            >
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              onViewChange('legal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeView === 'legal' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            Privacy & Terms
          </button>

          {currentUser && (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              <button
                onClick={() => onViewChange('admin')}
                className={`whitespace-nowrap text-xs font-bold rounded-lg px-2.5 py-1 transition-colors ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-amber-400 hover:bg-slate-900 border border-amber-500/30'
                }`}
              >
                Admin Desk
              </button>
              <button
                onClick={() => onViewChange('staff')}
                className={`whitespace-nowrap text-xs font-bold rounded-lg px-2.5 py-1 transition-colors ${
                  activeView === 'staff'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                }`}
              >
                Staff Portal
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Cart Button + Callback CTA + Book Test Ride */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button type="button" aria-expanded={isNavigationOpen} aria-controls="showroom-navigation"
            aria-label={isNavigationOpen ? 'Close showroom menu' : 'Open showroom menu'}
            onClick={() => setNavigationOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 xl:hidden">
            {isNavigationOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
          {onOpenLeadModal && (
            <button
              onClick={onOpenLeadModal}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 active:scale-95 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Get Quote</span>
            </button>
          )}

          <button
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="relative flex items-center justify-center h-11 w-11 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950 shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenTestRideModal}
            aria-label="Book Test Ride"
            className="flex h-11 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Book Test Ride</span>
          </button>
        </div>
      </div>
    </header>
  );
};
