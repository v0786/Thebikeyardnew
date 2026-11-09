import React from 'react';
import { DEMO_USERS, UserProfile, ROLE_CONFIGS } from '../lib/rbac';
import { Bike, ArrowRight, ChevronRight, ShieldAlert } from 'lucide-react';

interface StaffLoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBackToShowroom: () => void;
}

/**
 * Preview-only role simulator. This is NOT authentication.
 * Real staff access must use the backend's server-verified session and RBAC.
 */
export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({
  onLoginSuccess,
  onBackToShowroom,
}) => (
  <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Bike className="h-9 w-9 text-amber-400" />
          <div>
            <h2 className="text-xl font-black text-white">The Bike Yard — Staff Preview</h2>
            <p className="text-xs text-slate-400">Role-based dashboard demonstration</p>
          </div>
        </div>
        <button type="button" onClick={onBackToShowroom} className="flex items-center gap-1 text-xs text-amber-400">
          Return to showroom <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div role="alert" className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-sm text-amber-100">
          <strong>Client demo only.</strong> The profiles below simulate staff roles in your browser.
          They do not sign in, authenticate an employee, or grant server access.
          Do not enter real customer or financial data. Production staff access requires
          verified backend authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DEMO_USERS.map((user) => (
          <button
            type="button"
            key={user.id}
            onClick={() => onLoginSuccess(user)}
            className="group rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-left hover:border-amber-500"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-400">
                {user.avatarText}
              </span>
              <span className="text-xs text-slate-400">{ROLE_CONFIGS[user.role].label}</span>
            </div>
            <h3 className="mt-3 font-bold text-white">{user.name}</h3>
            <p className="mt-1 text-xs text-slate-400">{user.designation}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
              Preview dashboard <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">
        Illustrative accounts and transactions only. No live payments or regulatory filings.
      </p>
    </div>
  </div>
);
