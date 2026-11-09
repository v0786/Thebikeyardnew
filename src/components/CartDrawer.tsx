import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState, useEffect } from 'react';
import { cartStore, CartItem } from '../services/cartStore';
import { formatInr } from '../lib/currency';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<CartItem[]>(cartStore.getItems());
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cartStore.subscribe(() => {
      setItems([...cartStore.getItems()]);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const totalPaise = cartStore.getTotalPaise();

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    if (!customerName.trim() || customerPhone.trim().length < 10) return;

    // Process all bike bookings in cart
    const bikeItem = items.find((i) => i.type === 'BIKE_ADVANCE' && i.bikeRef);
    let bookingNum = `TBY-ORD-${Date.now().toString().slice(-4)}`;

    if (bikeItem && bikeItem.bikeRef) {
      const res = dealershipStore.createBooking({
        acceptance,
        customerName,
        customerPhone,
        bikeId: bikeItem.bikeRef.id,
        color: 'Selected Choice',
        advanceAmountPaise: bikeItem.pricePaise,
        tentativeDeliveryDate: '2026-11-14',
      });
      if (res.booking) {
        bookingNum = res.booking.bookingNumber;
      }
    }

    setCheckoutSuccess(bookingNum);
    cartStore.clearCart();
    setIsCheckingOut(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-full sm:w-auto sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Your Dealership Cart</h3>
                <div className="text-[11px] text-slate-400">
                  {cartStore.getItemCount()} items selected · Khopat Showroom
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {checkoutSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Order Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Order / Booking <strong className="text-amber-400">{checkoutSuccess}</strong> received. Our Khopat delivery officer will contact you within 30 minutes.
                </p>
                <button
                  onClick={() => {
                    setCheckoutSuccess(null);
                    onClose();
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Return to Showroom
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add motorcycle booking advance deposits or genuine OEM touring accessories to reserve your machine.
                </p>
              </div>
            ) : isCheckingOut ? (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400">Customer Details for Delivery</span>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Back to Cart
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Iyer"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mobile Number (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9820144912"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-slate-300">
                  <div className="flex justify-between font-bold text-white">
                    <span>Payable Total:</span>
                    <span className="text-amber-400 tabular-nums">{formatInr(totalPaise)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mode: Showroom Escrow Gateway / UPI Direct
                  </div>
                </div>

                <CustomerTerms purpose="simulate your checkout" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400"
                >
                  Pay {formatInr(totalPaise)} & Confirm Booking
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-start gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-lg bg-slate-900 border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-bold text-white truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                      <div className="text-xs font-extrabold text-amber-400 tabular-nums">
                        {formatInr(item.pricePaise)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => cartStore.removeItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {item.type === 'ACCESSORY' && (
                        <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900 rounded-md px-1 py-0.5">
                          <button
                            onClick={() => cartStore.updateQuantity(item.id, -1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white font-bold text-[11px] px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => cartStore.updateQuantity(item.id, 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Subtotal */}
          {items.length > 0 && !isCheckingOut && !checkoutSuccess && (
            <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Total Payable Amount:</span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  {formatInr(totalPaise)}
                </span>
              </div>
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
