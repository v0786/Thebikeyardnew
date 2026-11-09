import React, { useState, useEffect } from 'react';
import { Bike, Sparkles, Calendar, Lock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { cartStore } from '../services/cartStore';
import { UserProfile } from '../lib/rbac';

interface MobileBottomNavProps {
  activeView: 'showroom' | 'admin' | 'staff' | 'login' | 'legal';
  onViewChange: (view: 'showroom' | 'admin' | 'staff' | 'login' | 'legal') => void;
  onOpenTestRideModal: () => void;
  onOpenChat: () => void;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onViewChange,
  onOpenTestRideModal,
  onOpenChat,
  onOpenCart,
  currentUser,
}) => {
  const [cartCount, setCartCount] = useState<number>(cartStore.getItemCount());

  useEffect(() => {
    const unsub = cartStore.subscribe(() => {
      setCartCount(cartStore.getItemCount());
    });
    return () => unsub();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg px-2 py-1.5 safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        <button
          onClick={() => onViewChange('showroom')}
          className={`flex flex-col items-center justify-center py-1 min-h-[44px] transition-colors ${
            activeView === 'showroom' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bike className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] whitespace-nowrap">Explore</span>
        </button>

        <button
          onClick={onOpenTestRideModal}
          className="flex flex-col items-center justify-center py-1 min-h-[44px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] whitespace-nowrap">Test Ride</span>
        </button>

        <button
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center py-1 min-h-[44px] text-amber-400 transition-colors"
        >
          <div className="flex h-8 w-8 -mt-2 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-amber-400 mt-0.5">AI Desk</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              onViewChange('admin');
            } else {
              onViewChange('login');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 min-h-[44px] transition-colors ${
            activeView === 'admin' || activeView === 'staff' || activeView === 'login'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentUser ? (
            <>
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] whitespace-nowrap">Staff Desk</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mb-0.5 text-slate-400" />
              <span className="text-[10px] whitespace-nowrap">Staff Login</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 min-h-[44px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-slate-950">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] whitespace-nowrap">Cart</span>
        </button>
      </div>
    </div>
  );
};
