import React, { useState } from 'react';
import { Lead } from '../types';
import { dealershipStore } from '../services/dealershipStore';
import {
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PendingLeadsAlertModuleProps {
  leads: Lead[];
  currentUserName?: string;
}

export const PendingLeadsAlertModule: React.FC<PendingLeadsAlertModuleProps> = ({
  leads,
  currentUserName = 'Staff Desk',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingLeads = leads.filter((l) => l.stage === 'NEW');

  const handleMarkContacted = (leadId: string, customerName: string) => {
    dealershipStore.advanceLeadStage(leadId, 'CONTACTED', currentUserName);
    setActionNotice(`Lead for ${customerName} marked as Contacted.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const getTimeElapsed = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (pendingLeads.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Backlog:</strong> All inbound web leads and customer callbacks are cleared within SLA.
          </span>
        </div>
        <span className="text-[11px] text-slate-400">15-Min Thane Desk SLA Active</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-amber-950/20 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-slate-900">
              {pendingLeads.length}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Pending Leads & Priority Callbacks
              </h3>
              <span className="rounded-md bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                ACTION REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {pendingLeads.length} new customer enquiry awaiting showroom callback · Target response: &lt;15 mins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionNotice && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              {actionNotice}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 ml-auto sm:ml-0"
          >
            <span>{isExpanded ? 'Collapse' : `View All (${pendingLeads.length})`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Leads Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          {pendingLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white truncate max-w-[150px]">
                    {lead.customerName}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeElapsed(lead.createdAt)}</span>
                  </span>
                </div>

                <div className="text-xs font-semibold text-amber-400 truncate">
                  Interested in: {lead.bikeOfInterest}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  {lead.notes || 'Inbound callback request from online showroom.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call {lead.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleMarkContacted(lead.id, lead.customerName)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 font-semibold text-slate-200 hover:text-white hover:border-slate-600 active:scale-95 transition-all"
                  title="Mark Contacted"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
