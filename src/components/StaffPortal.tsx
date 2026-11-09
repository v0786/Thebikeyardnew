import React, { useState } from 'react';
import { DealershipState, dealershipStore } from '../services/dealershipStore';
import {
  CheckSquare,
  Square,
  Users,
  Calendar,
  PhoneCall,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Share2,
  Database,
  LogOut,
} from 'lucide-react';
import { Motorcycle, Lead } from '../types';
import { UserProfile } from '../lib/rbac';
import { PendingLeadsAlertModule } from './PendingLeadsAlertModule';

interface StaffPortalProps {
  state: DealershipState;
  onOpenCsvUpload?: () => void;
  onOpenOlxModal?: (bike?: Motorcycle) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  state,
  onOpenCsvUpload,
  onOpenOlxModal,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'leads' | 'test_rides' | 'performance'>('tasks');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('ALL');

  const handleToggleTask = (taskId: string) => {
    dealershipStore.toggleTask(taskId);
  };

  const handleAdvanceLeadStage = (leadId: string, currentStage: string) => {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return;

    const stages = ['NEW', 'CONTACTED', 'TEST_RIDE', 'QUOTATION', 'BOOKED'];
    const idx = stages.indexOf(currentStage);
    if (idx !== -1 && idx < stages.length - 1) {
      lead.stage = stages[idx + 1] as any;
      dealershipStore.logAudit(
        'LEAD_UPDATED',
        currentUser?.name || 'Staff Portal Desk',
        `Lead for ${lead.customerName} advanced to ${lead.stage}.`
      );
    }
  };

  const completedTasks = state.tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Staff Operations Portal
              </h2>
              {currentUser && (
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                  {currentUser.name}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Daily delivery pipeline, PDI check-off, and customer CRM for Thane showroom staff
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenOlxModal && (
              <button
                onClick={() => onOpenOlxModal()}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Post Bike to OLX</span>
              </button>
            )}

            {onOpenCsvUpload && (
              <button
                onClick={onOpenCsvUpload}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-sm"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Upload CSV Prices</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>
                {completedTasks}/{state.tasks.length} Daily Tasks Cleared
              </span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex overflow-x-auto gap-2 border-t border-slate-800/80 pt-4 mt-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tasks & PDI Checklist ({state.tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Lead CRM Pipeline ({state.leads.length})
          </button>
          <button
            onClick={() => setActiveTab('test_rides')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'test_rides'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Test Ride Roster ({state.testRides.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'performance'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* TAB: TASKS */}
      {activeTab === 'tasks' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Daily Operational Action Board</h3>
          <div className="space-y-2">
            {state.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  task.isCompleted
                    ? 'border-emerald-500/20 bg-emerald-950/10 text-slate-400'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="pt-0.5 text-amber-400">
                  {task.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div
                    className={`text-xs sm:text-sm font-semibold ${
                      task.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Assigned to: {task.assignedTo}</span>
                    <span>·</span>
                    <span>Due: {task.dueTime}</span>
                    <span>·</span>
                    <span
                      className={`font-bold ${
                        task.priority === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LEADS CRM */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Interested In</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Advance Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {state.leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-white">{lead.customerName}</td>
                    <td className="p-3.5 font-mono text-slate-300">{lead.phone}</td>
                    <td className="p-3.5 text-amber-400">{lead.bikeOfInterest}</td>
                    <td className="p-3.5 text-slate-400">{lead.source}</td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{lead.notes}</td>
                    <td className="p-3.5 text-right">
                      {lead.stage !== 'BOOKED' ? (
                        <button
                          onClick={() => handleAdvanceLeadStage(lead.id, lead.stage)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                        >
                          Next Step →
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold">Converted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TEST RIDES */}
      {activeTab === 'test_rides' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Model</th>
                  <th className="p-3.5">Date & Slot</th>
                  <th className="p-3.5">Driving License</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {state.testRides.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-white">{tr.customerName}</td>
                    <td className="p-3.5 font-mono text-slate-300">{tr.customerPhone}</td>
                    <td className="p-3.5 text-amber-400">{tr.bikeModel}</td>
                    <td className="p-3.5">
                      {tr.preferredDate} at {tr.preferredTimeSlot}
                    </td>
                    <td className="p-3.5 text-emerald-400">Verified Active</td>
                    <td className="p-3.5 text-slate-300">{tr.assignedStaff}</td>
                    <td className="p-3.5">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5 space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase">Top Performer (Month)</span>
              <Award className="w-5 h-5" />
            </div>
            <div className="text-lg font-bold text-white">Suraj Patil</div>
            <div className="text-xs text-slate-400">12 Bookings · ₹32.4L On-Road Disbursed</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Customer Lead Runner</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">Neha Shinde</div>
            <div className="text-xs text-slate-400">9 Bookings · 94% Test Ride Conversion</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">PDI Accuracy</span>
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">Kiran Mane</div>
            <div className="text-xs text-slate-400">100% PDI Sign-off · Zero Delivery Grievances</div>
          </div>
        </div>
      )}
    </div>
  );
};
