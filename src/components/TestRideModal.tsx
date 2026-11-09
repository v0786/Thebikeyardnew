import { CustomerTerms, readCustomerAcceptance } from './CustomerTerms';
import React, { useState, useMemo } from 'react';
import { Motorcycle, TestRide } from '../types';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { dealershipStore } from '../services/dealershipStore';
import { getColorBikeImage } from '../data/dealershipData';

interface TestRideModalProps {
  bike: Motorcycle | null;
  bikes: Motorcycle[];
  onClose: () => void;
}

interface TimeSlotConfig {
  id: string;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  pilotName: string;
  pilotRole: string;
}

const DAILY_TIME_SLOTS: TimeSlotConfig[] = [
  { id: 'slot-1', time: '10:30 AM', period: 'Morning', pilotName: 'Suraj Patil', pilotRole: 'Senior Ride Escort' },
  { id: 'slot-2', time: '11:45 AM', period: 'Morning', pilotName: 'Kiran Mane', pilotRole: 'Technical Pilot' },
  { id: 'slot-3', time: '01:30 PM', period: 'Afternoon', pilotName: 'Vikram Shinde', pilotRole: 'Performance Specialist' },
  { id: 'slot-4', time: '03:00 PM', period: 'Afternoon', pilotName: 'Suraj Patil', pilotRole: 'Senior Ride Escort' },
  { id: 'slot-5', time: '04:30 PM', period: 'Afternoon', pilotName: 'Neha Patil', pilotRole: 'Experience Lead' },
  { id: 'slot-6', time: '06:00 PM', period: 'Evening', pilotName: 'Vikram Shinde', pilotRole: 'Performance Specialist' },
  { id: 'slot-7', time: '07:15 PM', period: 'Evening', pilotName: 'Kiran Mane', pilotRole: 'Technical Pilot' },
];

export const TestRideModal: React.FC<TestRideModalProps> = ({
  bike,
  bikes,
  onClose,
}) => {
  // Current date anchor (November 2026)
  const today = useMemo(() => new Date(2026, 10, 4), []); // 4th Nov 2026
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 10, 1));
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-06');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:45 AM');
  const [selectedSlotConfig, setSelectedSlotConfig] = useState<TimeSlotConfig>(DAILY_TIME_SLOTS[1]!);

  const [selectedBikeId, setSelectedBikeId] = useState<string>(
    bike?.id || bikes[0]?.id || ''
  );
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [hasLicense, setHasLicense] = useState<boolean>(true);
  const [helmetPreference, setHelmetPreference] = useState<'SHOWROOM' | 'PERSONAL'>('SHOWROOM');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TestRide | null>(null);

  const activeBike = useMemo(
    () => bikes.find((b) => b.id === selectedBikeId) || bike || bikes[0],
    [bikes, selectedBikeId, bike]
  );

  // Synchronized bookings from dealership store
  const existingTestRides = dealershipStore.getState().testRides;

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    // Restrict going before current month
    if (year === today.getFullYear() && month <= today.getMonth()) return;
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    // Allow up to 3 months forward
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const formatDateKey = (d: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Live staff availability calculation for any given date
  const getSlotAvailabilityForDate = (dateStr: string) => {
    const bookedForDate = existingTestRides.filter((tr) => tr.preferredDate === dateStr);
    const availableSlots = DAILY_TIME_SLOTS.filter(
      (slot) => !bookedForDate.some((b) => b.preferredTimeSlot === slot.time)
    );
    return {
      total: DAILY_TIME_SLOTS.length,
      bookedCount: bookedForDate.length,
      availableCount: availableSlots.length,
      isFullyBooked: availableSlots.length === 0,
    };
  };

  // Slots availability for currently selected date
  const currentSlotsAvailability = useMemo(() => {
    const booked = existingTestRides.filter((tr) => tr.preferredDate === selectedDate);
    return DAILY_TIME_SLOTS.map((slot) => {
      const isBooked = booked.some((tr) => tr.preferredTimeSlot === slot.time);
      return {
        ...slot,
        isBooked,
      };
    });
  }, [selectedDate, existingTestRides]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptance = readCustomerAcceptance(e.currentTarget as HTMLFormElement);
    if (!acceptance) return;
    if (!customerName.trim() || customerPhone.trim().length < 10) return;

    const res = dealershipStore.scheduleTestRide({
      acceptance,
      customerName,
      customerPhone,
      bikeModel: activeBike ? `${activeBike.brand} ${activeBike.model}` : 'Royal Enfield Hunter 350',
      preferredDate: selectedDate,
      preferredTimeSlot: selectedSlot,
      assignedStaff: selectedSlotConfig.pilotName,
    });

    if (res.success) {
      setConfirmedReservation(res.testRide);
      setIsSuccess(true);
    }
  };

  const isDateInPast = (d: number) => {
    const check = new Date(year, month, d);
    return check < today;
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-7 space-y-6 animate-scaleUp">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-500">
                The Bike Yard Experience
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Staff Availability Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              Complimentary Test Ride Roster
            </h2>
            <p className="text-xs text-slate-400">
              Select your preferred day on the calendar, choose an available pilot slot, and test the machine on Thane Eastern Express curves.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess && confirmedReservation ? (
          /* Confirmation Screen */
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                Test Ride Confirmed & Pilot Assigned
              </span>
              <h3 className="text-2xl font-black text-white pt-2">
                You're Scheduled to Ride!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Thank you, <strong className="text-white">{customerName}</strong>. Your test ride reservation has been synchronized directly with our showroom pilots roster.
              </p>
            </div>

            {/* Official Appointment Card */}
            <div className="max-w-md mx-auto rounded-2xl border border-amber-500/30 bg-slate-950 p-5 space-y-3.5 text-xs text-left shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Motorcycle:</span>
                <span className="font-bold text-white text-sm">
                  {confirmedReservation.bikeModel}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="font-bold text-amber-400 text-sm">
                  {formatDisplayDate(confirmedReservation.preferredDate)} at {confirmedReservation.preferredTimeSlot}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Assigned Pilot Escort:</span>
                <div className="text-right">
                  <div className="font-bold text-white flex items-center justify-end gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{confirmedReservation.assignedStaff}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Thane Showroom Flying Squad</div>
                </div>
              </div>

              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Showroom Address:</span>
                <div className="text-right max-w-[240px] text-slate-200">
                  Shop 4 & 5, Rutu Business Park, Near Cadbury Junction, Khopat, Thane (W)
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-amber-400">Important Reminders:</div>
                <div>· Please bring your valid Indian Two-Wheeler Driving License.</div>
                <div>· Sanitized ISI-certified full-face helmets are provided at the showroom.</div>
                <div>· Helpdesk: +91 98204 55120 (Open 10:00 AM – 8:30 PM).</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                Done & Return to Showroom
              </button>
            </div>
          </div>
        ) : (
          /* Two-Column Booking Engine */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Bike Selector Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {activeBike && (
                  <img
                    src={getColorBikeImage(activeBike, activeBike.selectedColor)}
                    alt={activeBike.model}
                    className="w-14 h-11 object-cover rounded-xl border border-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Selected Test Machine:</div>
                  <div className="text-sm font-extrabold text-white">
                    {activeBike?.brand} {activeBike?.model}
                  </div>
                </div>
              </div>

              <select
                value={selectedBikeId}
                onChange={(e) => setSelectedBikeId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
              >
                {bikes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.brand} {b.model} ({b.engineCc} cc)
                  </option>
                ))}
              </select>
            </div>

            {/* Split Grid: Left = Visual Monthly Calendar | Right = Staff Time Slots & Rider Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: VISUAL MONTHLY CALENDAR (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Step 1: Choose Date
                    </h4>
                    <div className="text-sm font-extrabold text-white">
                      {monthNames[month]} {year}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={year === today.getFullYear() && month <= today.getMonth()}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {dayNames.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for leading padding */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateKey = formatDateKey(dayNum);
                    const isPast = isDateInPast(dayNum);
                    const isSelected = selectedDate === dateKey;
                    const availability = getSlotAvailabilityForDate(dateKey);

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={isPast || availability.isFullyBooked}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`relative h-9 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400 scale-105'
                            : isPast
                            ? 'text-slate-600 opacity-30 cursor-not-allowed'
                            : availability.isFullyBooked
                            ? 'bg-rose-950/20 text-slate-500 opacity-40 cursor-not-allowed'
                            : 'hover:bg-slate-900 text-slate-200 border border-slate-800/60'
                        }`}
                      >
                        <span>{dayNum}</span>

                        {/* Availability Dot Indicator */}
                        {!isPast && (
                          <span
                            className={`w-1 h-1 rounded-full -mb-0.5 ${
                              isSelected
                                ? 'bg-slate-950'
                                : availability.availableCount >= 4
                                ? 'bg-emerald-400'
                                : availability.availableCount > 0
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Open Slots</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Filling Fast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Full</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: TIME SLOTS & RIDER INFORMATION (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Step 2: Time Slots Synchronized with Staff Roster */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Step 2: Select Specific Time Slot
                      </h4>
                      <div className="text-xs font-semibold text-amber-400">
                        {formatDisplayDate(selectedDate)}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Escorted 45-min highway ride
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {currentSlotsAvailability.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => {
                            setSelectedSlot(slot.time);
                            setSelectedSlotConfig(slot);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500/30 shadow-md scale-[1.02]'
                              : slot.isBooked
                              ? 'border-slate-800/40 bg-slate-900/40 opacity-40 cursor-not-allowed text-slate-500'
                              : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{slot.time}</span>
                            {slot.isBooked ? (
                              <span className="text-[9px] text-rose-400 uppercase font-black">
                                Booked
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-400 font-semibold">
                                Ready
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{slot.pilotName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Rider Contact Details & Verification */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step 3: Rider Credentials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Samir Pawar"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9819034211"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-11 pr-3 py-2 font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Helmet Preference */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-300">Riding Helmet Gear:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setHelmetPreference('SHOWROOM')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          helmetPreference === 'SHOWROOM'
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Provide ISI Helmet
                      </button>
                      <button
                        type="button"
                        onClick={() => setHelmetPreference('PERSONAL')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          helmetPreference === 'PERSONAL'
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Bringing Own Helmet
                      </button>
                    </div>
                  </div>

                  {/* Driving License confirmation */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={hasLicense}
                      onChange={(e) => setHasLicense(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 h-4 w-4"
                    />
                    <span>I confirm I possess an active Two-Wheeler Indian Driving License.</span>
                  </label>
                </div>

                {/* Submit Action */}
                <CustomerTerms purpose="handle your test ride request" />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Confirm Test Ride for {selectedSlot} on {formatDisplayDate(selectedDate)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
