import React, { useState } from 'react';
import {
  dealershipStore,
  DealershipState,
} from '../services/dealershipStore';
import { formatInr, splitGst } from '../lib/currency';
import {
  DEMO_USERS,
  UserProfile,
  canUserAccessSection,
  canApproveRefund,
  ROLE_CONFIGS,
} from '../lib/rbac';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileText,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Receipt,
  Users,
  Settings,
  Sparkles,
  PhoneCall,
  PhoneForwarded,
  MessageSquare,
  Upload,
  Database,
  ExternalLink,
  Share2,
  Trash2,
  LogOut,
} from 'lucide-react';
import { StockUnitStatus, Motorcycle } from '../types';
import { PendingLeadsAlertModule } from './PendingLeadsAlertModule';
import { PricingPanel } from './admin/PricingPanel';
import { OffersPanel } from './admin/OffersPanel';
import { DealershipInfoForm } from './admin/DealershipInfoForm';
import { BackendStatusPanel } from './admin/BackendStatusPanel';
import { ThemePicker } from './ThemePicker';

interface AdminDashboardProps {
  state: DealershipState;
  onOpenCsvUpload?: () => void;
  onOpenOlxModal?: (bike?: Motorcycle) => void;
  currentUser?: UserProfile;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  onOpenCsvUpload,
  onOpenOlxModal,
  currentUser: propUser,
  onLogout,
}) => {
  // Current active user for RBAC
  const [currentUser, setCurrentUser] = useState<UserProfile>(propUser || DEMO_USERS[0]!); // Default: Super Admin
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Local form states
  const [inwardChassis, setInwardChassis] = useState('');
  const [inwardEngine, setInwardEngine] = useState('');
  const [inwardBikeId, setInwardBikeId] = useState(state.bikes[0]?.id || '');
  const [inwardColor, setInwardColor] = useState('Dapper Ash');
  const [inwardPrice, setInwardPrice] = useState('135000');
  const [inwardSuccess, setInwardSuccess] = useState<string | null>(null);
  const [inwardError, setInwardError] = useState<string | null>(null);

  // Sales execution form state
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [saleStockUnitId, setSaleStockUnitId] = useState<string>('');
  const [saleCustomerId, setSaleCustomerId] = useState<string>(state.customers[0]?.id || '');
  const [salePaymentMode, setSalePaymentMode] = useState<'NEFT' | 'UPI' | 'CARD' | 'CHEQUE' | 'CASH'>('UPI');
  const [saleSuccess, setSaleSuccess] = useState<string | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);

  // Refund approval state
  const [refundActionMessage, setRefundActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invoice viewer modal
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);

  // Check RBAC access for current tab
  const isAllowed = canUserAccessSection(currentUser.role, activeTab);

  // Aggregate metrics
  const totalInStockUnits = state.stockUnits.filter((u) => u.status === 'IN_STOCK').length;
  const activeBookingsCount = state.bookings.filter((b) => b.status === 'ACTIVE').length;
  const totalSalesRevenuePaise = state.sales.reduce((acc, s) => acc + s.totalOnRoadPaise, 0n);
  const totalGstCollectedPaise = state.sales.reduce((acc, s) => acc + s.gstAmountPaise, 0n);

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInwardError(null);
    setInwardSuccess(null);

    const res = dealershipStore.inwardStockUnit({
      bikeId: inwardBikeId,
      chassisNumber: inwardChassis,
      engineNumber: inwardEngine,
      variant: 'Standard',
      color: inwardColor,
      purchasePricePaise: BigInt(parseInt(inwardPrice, 10) * 100),
      location: 'Yard Bay 1 (Main Showroom)',
      performedBy: `${currentUser.name} (${currentUser.designation})`,
    });

    if (res.success && res.unit) {
      setInwardSuccess(`VIN ${res.unit.chassisNumber} successfully inwarded! Live stock updated.`);
      setInwardChassis('');
      setInwardEngine('');
    } else {
      setInwardError(res.error || 'Failed to inward stock.');
    }
  };

  const handleCompleteSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);
    setSaleSuccess(null);

    const res = dealershipStore.completeSale({
      bookingId: selectedBookingId || undefined,
      customerId: saleCustomerId,
      stockUnitId: saleStockUnitId,
      paymentMode: salePaymentMode,
      salesExecutive: currentUser.name,
    });

    if (res.success && res.sale) {
      setSaleSuccess(`Invoice ${res.sale.invoiceNumber} created! Unit marked SOLD and registered to MH-04.`);
      setSelectedBookingId('');
      setSaleStockUnitId('');
    } else {
      setSaleError(res.error || 'Failed to complete sale transaction.');
    }
  };

  const handleApproveRefund = (refundId: string, requester: string) => {
    setRefundActionMessage(null);
    const authCheck = canApproveRefund(currentUser.role, requester, currentUser.name);

    if (!authCheck.allowed) {
      setRefundActionMessage({ type: 'error', text: authCheck.reason || 'Approval denied by RBAC policy.' });
      return;
    }

    const res = dealershipStore.approveRefund(refundId, currentUser.name, currentUser.role);
    if (res.success) {
      setRefundActionMessage({ type: 'success', text: `Refund authorized successfully by ${currentUser.name}.` });
    } else {
      setRefundActionMessage({ type: 'error', text: res.error || 'Failed to approve refund.' });
    }
  };

  const handleStatusChange = (unitId: string, newStatus: StockUnitStatus) => {
    dealershipStore.updateStockUnitStatus({
      unitId,
      newStatus,
      performedBy: `${currentUser.name} (${currentUser.designation})`,
    });
  };

  const pendingCallsCount = state.leads.filter((l) => l.stage !== 'BOOKED').length;

  const tabs = [
    { id: 'overview', label: 'Overview & KPIs' },
    { id: 'calls', label: `Inbound Call Queue (${pendingCallsCount})` },
    { id: 'inventory', label: 'Live Stock Units' },
    { id: 'pricing', label: 'Pricing & Featured' },
    { id: 'offers', label: `Offers (${state.offers.filter((o) => o.active).length})` },
    { id: 'olx', label: `OLX India Ads (${state.olxListings?.length || 0})` },
    { id: 'stock_inward', label: 'Inward New Stock' },
    { id: 'sales', label: 'Execute Sale' },
    { id: 'invoices', label: 'GST Invoices' },
    { id: 'refunds', label: 'Refunds & Audit' },
    { id: 'settings', label: 'Dealership Settings' },
  ];

  return (
    <div className="space-y-6">
      {/* RBAC User Switcher Banner & Quick Action Buttons */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{currentUser.name}</span>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[11px] font-extrabold text-amber-400">
                {ROLE_CONFIGS[currentUser.role]?.label}
              </span>
            </div>
            <div className="text-xs text-slate-400">{currentUser.designation} · {currentUser.email}</div>
          </div>
        </div>

        {/* Quick Dealership Action Buttons (OLX + CSV Upload + Logout) */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenOlxModal && (
            <button
              onClick={() => onOpenOlxModal()}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>1-Click Post to OLX</span>
            </button>
          )}

          {onOpenCsvUpload && (
            <button
              onClick={onOpenCsvUpload}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Upload CSV / 1,000+ Sync</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}

          {/* Role switcher buttons */}
          <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-slate-800">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setCurrentUser(user);
                  setRefundActionMessage(null);
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                  currentUser.id === user.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {user.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* RBAC Permission Guard */}
      {!isAllowed ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">403 Forbidden: Access Restricted</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Your current role <strong className="text-amber-400">{ROLE_CONFIGS[currentUser.role]?.label}</strong> is not authorized to access <strong className="text-white">{activeTab.replace('_', ' ').toUpperCase()}</strong>.
          </p>
          <div className="text-xs text-slate-400">
            For example, Sales Executives cannot access master financial settings or audit logs. Switch to Super Admin or Accountant above to view this section.
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Real-Time Pending Leads Alert Module */}
              <PendingLeadsAlertModule leads={state.leads} currentUserName={currentUser.name} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Physical In-Stock</span>
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white tabular-nums">
                    {totalInStockUnits} <span className="text-xs font-normal text-slate-400">Units in Khopat</span>
                  </div>
                  <div className="text-[11px] text-emerald-400">Real-time synchronized</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Active Bookings</span>
                    <Receipt className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white tabular-nums">
                    {activeBookingsCount}
                  </div>
                  <div className="text-[11px] text-slate-400">Advances held in escrow</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Sales Invoiced</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">
                    {formatInr(totalSalesRevenuePaise)}
                  </div>
                  <div className="text-[11px] text-slate-400">{state.sales.length} deliveries registered</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>GST Collected</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400 tabular-nums">
                    {formatInr(totalGstCollectedPaise)}
                  </div>
                  <div className="text-[11px] text-slate-400">Intra-State CGST/SGST 9%+9%</div>
                </div>
              </div>

              {/* Live Inbound Call Alert Strip */}
              {pendingCallsCount > 0 && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
                      <PhoneCall className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {pendingCallsCount} Inbound Customer Call Leads Pending
                      </h4>
                      <p className="text-xs text-amber-200/80">
                        Customers entered their phone number on the showroom portal. Click below to view and call immediately.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('calls')}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shrink-0 shadow-md"
                  >
                    <span>Open Calling Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Recent Audit Activity */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Live Dealership Audit Feed</h3>
                  <span className="text-xs text-slate-400">Immutable Ledger</span>
                </div>
                <div className="space-y-2">
                  {state.auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-amber-400">{log.action}</span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-slate-300">{log.details}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0">
                        {log.performedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INBOUND CALL QUEUE */}
          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-amber-500">Live Customer Connect</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Real-time Inbound
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">Inbound Customer Call Queue</h3>
                  <p className="text-xs text-slate-400">
                    Whenever a customer enters their phone number on the website (test ride, finance intake, online booking, or inquiry), it reflects here instantly.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Motorcycle / Inquiry</th>
                      <th className="p-3.5">Source</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-right">Call & Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {state.leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-white">{lead.customerName}</td>
                        <td className="p-3.5">
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono text-amber-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                          </a>
                        </td>
                        <td className="p-3.5 text-slate-200 font-semibold">{lead.bikeOfInterest}</td>
                        <td className="p-3.5">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {lead.source}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              lead.stage === 'NEW'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                : lead.stage === 'CONTACTED'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {lead.stage}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">{lead.notes}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center gap-1 shadow-sm"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Call Now</span>
                            </a>
                            <button
                              onClick={() => {
                                lead.stage = 'CONTACTED';
                                dealershipStore.logAudit(
                                  'CUSTOMER_CALLED',
                                  currentUser.name,
                                  `Called customer ${lead.customerName} at ${lead.phone}. Marked contacted.`
                                );
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:text-white"
                            >
                              Mark Called
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY / STOCK UNITS */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Stock Units (VIN & Engine Tracking)</h3>
                  <p className="text-xs text-slate-400">
                    Changing status here instantly updates public website availability via real-time sync.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('stock_inward')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inward New Unit</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Chassis Number (VIN)</th>
                      <th className="p-3.5">Engine Number</th>
                      <th className="p-3.5">Model & Color</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5 text-right">Quick Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {state.stockUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono font-medium text-amber-400">
                          {unit.chassisNumber}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{unit.engineNumber}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{unit.bikeModel}</div>
                          <div className="text-[11px] text-slate-400">{unit.color}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              unit.status === 'IN_STOCK'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : unit.status === 'RESERVED'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {unit.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">{unit.location}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {unit.status !== 'IN_STOCK' && (
                              <button
                                onClick={() => handleStatusChange(unit.id, 'IN_STOCK')}
                                className="rounded px-2 py-1 text-[10px] font-medium bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                              >
                                Mark Ready
                              </button>
                            )}
                            {unit.status !== 'RESERVED' && (
                              <button
                                onClick={() => handleStatusChange(unit.id, 'RESERVED')}
                                className="rounded px-2 py-1 text-[10px] font-medium bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900"
                              >
                                Reserve
                              </button>
                            )}
                            {unit.status !== 'SOLD' && (
                              <button
                                onClick={() => handleStatusChange(unit.id, 'SOLD')}
                                className="rounded px-2 py-1 text-[10px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                              >
                                Mark Sold
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: OLX INDIA 1-CLICK ADS MANAGEMENT */}
          {activeTab === 'pricing' && (
            <PricingPanel state={state} currentUser={currentUser} />
          )}

          {activeTab === 'offers' && (
            <OffersPanel state={state} currentUser={currentUser} />
          )}

          {activeTab === 'olx' && (
            <div className="space-y-6">
              {/* Pro Dealer Status Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-emerald-500 font-black text-slate-950 text-xl tracking-tighter shadow-md shadow-emerald-500/20">
                    olx
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">OLX India Dealer Studio (Always Logged In)</h3>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Account Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Connected Dealer: <span className="font-mono text-slate-300">dealers@thebikeyard.in</span> · Location: Khopat, Thane (W) — MH-04
                    </p>
                  </div>
                </div>

                {onOpenOlxModal && (
                  <button
                    onClick={() => onOpenOlxModal()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start md:self-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Create & Post Pre-Owned Ad to OLX</span>
                  </button>
                )}
              </div>

              {/* Active OLX Listings Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Live OLX Ads Marketplace</h4>
                    <p className="text-xs text-slate-400">
                      Active public listings on OLX India with automatic dealership trust seal and direct telephone callbacks.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {state.olxListings?.length || 0} Ads Active in Thane Zone
                  </span>
                </div>

                {!state.olxListings || state.olxListings.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center space-y-2">
                    <p className="text-xs text-slate-400">No active OLX ads currently published.</p>
                    {onOpenOlxModal && (
                      <button
                        onClick={() => onOpenOlxModal()}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                      >
                        Publish First Second-Hand Bike Ad
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Listing Preview</th>
                          <th className="p-3.5">Price & Location</th>
                          <th className="p-3.5">OLX Ad ID</th>
                          <th className="p-3.5">Posted By</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {state.olxListings.map((ad) => (
                          <tr key={ad.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {ad.photos[0] && (
                                  <img
                                    src={ad.photos[0]}
                                    alt={ad.model}
                                    className="h-10 w-14 rounded-lg object-cover border border-slate-800"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div>
                                  <div className="font-bold text-white line-clamp-1">{ad.adTitle}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {ad.year} · {ad.odometerKm?.toLocaleString('en-IN')} KM Verified
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-extrabold text-emerald-400 text-sm tabular-nums">
                                ₹ {ad.priceInr.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {ad.location}
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-300">{ad.olxAdId}</td>
                            <td className="p-3.5 text-slate-400">
                              <div>{ad.postedBy}</div>
                              <div className="text-[10px] text-slate-500">
                                {new Date(ad.postedAt).toLocaleDateString('en-IN')}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                                {ad.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={ad.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                                >
                                  <span>View OLX</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() =>
                                    dealershipStore.removeOlxListing(ad.id, currentUser.name)
                                  }
                                  className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                                  title="Remove from OLX"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ready Showroom Pre-Owned Bikes for 1-Click Publishing */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">Pre-Owned Showroom Units Ready for OLX Broadcast</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.bikes
                    .filter((b) => b.isUsed)
                    .map((bike) => {
                      const isAlreadyPosted = state.olxListings?.some((l) => l.bikeId === bike.id);
                      return (
                        <div
                          key={bike.id}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={bike.image}
                              alt={bike.model}
                              className="w-12 h-10 object-cover rounded-lg border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">
                                {bike.year} {bike.brand} {bike.model}
                              </div>
                              <div className="text-[11px] text-amber-400 font-bold tabular-nums">
                                ₹ {Number(bike.exShowroomPaise / 100n).toLocaleString('en-IN')} · {bike.odometerKm?.toLocaleString('en-IN')} KM
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onOpenOlxModal && onOpenOlxModal(bike)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors shrink-0"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>{isAlreadyPosted ? 'Update Ad' : '1-Click Post'}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INWARD NEW STOCK */}
          {activeTab === 'stock_inward' && (
            <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Stock Inward Recording</h3>
                <p className="text-xs text-slate-400">
                  Enforces unique VIN chassis number, engine number, and 45-point PDI certification.
                </p>
              </div>

              {inwardSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{inwardSuccess}</span>
                </div>
              )}

              {inwardError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{inwardError}</span>
                </div>
              )}

              <form onSubmit={handleInwardSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Select Motorcycle Model</label>
                  <select
                    value={inwardBikeId}
                    onChange={(e) => setInwardBikeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {state.bikes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} ({b.engineCc} cc)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Chassis Number (VIN)</label>
                    <input
                      type="text"
                      required
                      value={inwardChassis}
                      onChange={(e) => setInwardChassis(e.target.value.toUpperCase())}
                      placeholder="e.g. ME3J350HUN20269999"
                      className="w-full font-mono rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Engine Number</label>
                    <input
                      type="text"
                      required
                      value={inwardEngine}
                      onChange={(e) => setInwardEngine(e.target.value.toUpperCase())}
                      placeholder="e.g. J350E1999231"
                      className="w-full font-mono rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Colour</label>
                    <input
                      type="text"
                      required
                      value={inwardColor}
                      onChange={(e) => setInwardColor(e.target.value)}
                      placeholder="e.g. Dapper Ash"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Dealer Purchase Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={inwardPrice}
                      onChange={(e) => setInwardPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-400">
                  <div className="font-semibold text-slate-200 mb-1">PDI & Compliance Checklist:</div>
                  <div>· 45-Point Pre-Delivery Inspection verified and signed off.</div>
                  <div>· Battery terminal torque check and fluid levels verified.</div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md"
                >
                  Confirm Inward & Synchronize Real-time Stock
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: COMPLETE SALE TRANSACTION */}
          {activeTab === 'sales' && (
            <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Sale Execution & Delivery (Atomic Transaction)</h3>
                <p className="text-xs text-slate-400">
                  Carries forward booking advance, auto-computes Maharashtra GST (CGST 9% + SGST 9%), locks the chassis unit, and dispatches the GST invoice.
                </p>
              </div>

              {saleSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saleSuccess}</span>
                </div>
              )}

              {saleError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{saleError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteSaleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Select Customer</label>
                  <select
                    value={saleCustomerId}
                    onChange={(e) => setSaleCustomerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {state.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.phone}) — {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Select Stock Unit to Lock & Dispatch</label>
                  <select
                    value={saleStockUnitId}
                    onChange={(e) => setSaleStockUnitId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-mono"
                  >
                    <option value="">-- Choose Stock Unit --</option>
                    {state.stockUnits
                      .filter((u) => u.status !== 'SOLD')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.bikeModel} · VIN: {u.chassisNumber} ({u.color}) [{u.status}]
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Carry Forward Existing Booking Advance? (Optional)</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Direct Sale (No Previous Booking) --</option>
                    {state.bookings
                      .filter((b) => b.status === 'ACTIVE')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingNumber} — {b.customerName} ({b.bikeModel}) · Advance ₹{(Number(b.advanceAmountPaise) / 100).toLocaleString('en-IN')}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Payment Mode for Remaining Balance</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['UPI', 'NEFT', 'CARD', 'CASH'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSalePaymentMode(mode)}
                        className={`rounded-lg py-2 text-xs font-semibold ${
                          salePaymentMode === mode
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!saleStockUnitId}
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50"
                >
                  Execute Sale, Lock Unit & Generate GST Invoice
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: GST INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">GST Invoices (Maharashtra MH-04 Series)</h3>
                <p className="text-xs text-slate-400">
                  Compliant with Section 31 of CGST Act. Exact CGST (9%) and SGST (9%) split.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Vehicle & Chassis</th>
                      <th className="p-3.5">Taxable Ex-Showroom</th>
                      <th className="p-3.5">CGST (9%)</th>
                      <th className="p-3.5">SGST (9%)</th>
                      <th className="p-3.5">Total On-Road</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {state.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {sale.invoiceNumber}
                        </td>
                        <td className="p-3.5 font-medium text-white">{sale.customerName}</td>
                        <td className="p-3.5">
                          <div>{sale.bikeModel}</div>
                          <div className="font-mono text-[10px] text-slate-500">{sale.chassisNumber}</div>
                        </td>
                        <td className="p-3.5 tabular-nums">{formatInr(sale.exShowroomPaise)}</td>
                        <td className="p-3.5 tabular-nums text-emerald-400">{formatInr(sale.cgstPaise)}</td>
                        <td className="p-3.5 tabular-nums text-emerald-400">{formatInr(sale.sgstPaise)}</td>
                        <td className="p-3.5 tabular-nums font-bold text-white">
                          {formatInr(sale.totalOnRoadPaise)}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setViewingInvoice(sale)}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: REFUNDS & AUDIT CHECKS */}
          {activeTab === 'refunds' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Refund Approvals & Internal Control</h3>
                <p className="text-xs text-slate-400">
                  Separation of duties enforced: Requester cannot self-approve. Only Accountants or Managers can authorize.
                </p>
              </div>

              {refundActionMessage && (
                <div
                  className={`rounded-xl border p-4 text-xs flex items-center gap-2 ${
                    refundActionMessage.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  {refundActionMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{refundActionMessage.text}</span>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Refund #</th>
                      <th className="p-3.5">Booking / Customer</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Reason</th>
                      <th className="p-3.5">Requested By</th>
                      <th className="p-3.5">Approved By</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {state.refunds.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono font-medium text-amber-400">
                          {ref.refundNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{ref.customerName}</div>
                          <div className="text-[10px] text-slate-500">{ref.bookingNumber}</div>
                        </td>
                        <td className="p-3.5 font-bold text-white tabular-nums">
                          {formatInr(ref.amountPaise)}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">{ref.reason}</td>
                        <td className="p-3.5 text-slate-400">{ref.requestedBy}</td>
                        <td className="p-3.5 text-slate-400">{ref.approvedBy || '—'}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              ref.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {ref.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {ref.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApproveRefund(ref.id, ref.requestedBy)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-sm"
                            >
                              Authorize Refund
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-white">Dealership Master Settings</h3>
                <p className="text-slate-400">
                  Taxation identification, banking coordinates, and compliance parameters for The Bike Yard.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                <ThemePicker />
              </div>

              <DealershipInfoForm info={state.dealershipInfo} currentUser={currentUser} />

              <BackendStatusPanel />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-slate-400">Maharashtra GSTIN</div>
                  <div className="font-mono font-bold text-white text-sm">{state.dealershipInfo.gstin}</div>
                  <div className="text-[10px] text-emerald-400">Active · State Code 27</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-slate-400">RTO Jurisdiction</div>
                  <div className="font-bold text-white text-sm">{state.dealershipInfo.rtoCode}</div>
                  <div className="text-[10px] text-slate-400">Thane RTO Division</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="text-slate-400 font-semibold">Dealership Physical Address</div>
                <div className="text-slate-200">
                  {state.dealershipInfo.address}, {state.dealershipInfo.city} ({state.dealershipInfo.state}) — {state.dealershipInfo.pincode}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="text-slate-400 font-semibold">Official Escrow Bank Account <span className="text-[10px] text-slate-600">(locked — Super Admin only)</span></div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Bank: {state.dealershipInfo.bankDetails.bankName}</div>
                  <div>Account: {state.dealershipInfo.bankDetails.accountNumber}</div>
                  <div>IFSC: {state.dealershipInfo.bankDetails.ifsc}</div>
                  <div>Branch: {state.dealershipInfo.bankDetails.branch}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 space-y-2">
                <div className="text-rose-400 font-semibold text-[11px] uppercase tracking-wider">Danger Zone</div>
                <p className="text-[10px] text-slate-500">Clears all locally persisted staff overrides (pricing, featured flags, offers, dealership info) saved in this browser. The central dataset and seed offers are restored on reload.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all staff overrides saved in this browser?')) {
                      dealershipStore.resetAdminOverrides(`${currentUser.name} (${currentUser.designation})`);
                      window.location.reload();
                    }
                  }}
                  className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-950/60 transition-colors"
                >
                  Reset Local Overrides
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs uppercase font-bold text-amber-500">Tax Invoice Receipt</div>
                <h3 className="text-lg font-bold text-white">{viewingInvoice.invoiceNumber}</h3>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{viewingInvoice.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Vehicle Model:</span>
                <span className="font-semibold text-white">{viewingInvoice.bikeModel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Chassis (VIN):</span>
                <span className="font-mono text-amber-400">{viewingInvoice.chassisNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">CGST (9.00%):</span>
                <span className="tabular-nums text-emerald-400">{formatInr(viewingInvoice.cgstPaise)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">SGST (9.00%):</span>
                <span className="tabular-nums text-emerald-400">{formatInr(viewingInvoice.sgstPaise)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-white">Total Paid On-Road:</span>
                <span className="text-amber-400 tabular-nums">{formatInr(viewingInvoice.totalOnRoadPaise)}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingInvoice(null)}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
