import { useEffect, useState, type FC, type FormEvent } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { DealershipInfo } from '../../types';
import { dealershipStore } from '../../services/dealershipStore';
import type { UserProfile } from '../../lib/rbac';

interface DealershipInfoFormProps {
  info: DealershipInfo;
  currentUser: UserProfile;
}

const FIELDS: { key: keyof Omit<DealershipInfo, 'bankDetails'>; label: string; type?: string }[] = [
  { key: 'name', label: 'Dealership Name' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'address', label: 'Street Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pincode', label: 'PIN Code' },
  { key: 'rtoCode', label: 'RTO Jurisdiction' },
  { key: 'phone', label: 'Sales Phone' },
  { key: 'landline', label: 'Landline' },
  { key: 'email', label: 'Public Email', type: 'email' },
  { key: 'gstin', label: 'GSTIN' },
  { key: 'openingHours', label: 'Opening Hours' },
];

/** Editable dealership contact/identity block (Owner / Super Admin via RBAC settings section). */
export const DealershipInfoForm: FC<DealershipInfoFormProps> = ({ info, currentUser }) => {
  const [draft, setDraft] = useState<Omit<DealershipInfo, 'bankDetails'>>({ ...info });
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setDraft({ ...info });
  }, [info]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = dealershipStore.updateDealershipInfo(draft, `${currentUser.name} (${currentUser.designation})`);
    setFeedback(result.success ? { ok: true, message: 'Dealership information updated.' } : { ok: false, message: result.error ?? 'Update failed.' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-slate-400 font-semibold">Public Dealership Information (shown on site)</div>
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-amber-400 transition-colors">
          <Save className="w-3.5 h-3.5" aria-hidden="true" /> Save
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, type }) => (
          <label key={key} className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            {label}
            <input
              type={type ?? 'text'}
              value={draft[key]}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs normal-case font-normal tracking-normal text-white focus:border-amber-500 focus:outline-none"
            />
          </label>
        ))}
      </div>

      {feedback && (
        <p className={`flex items-center gap-1.5 text-[11px] ${feedback.ok ? 'text-emerald-400' : 'text-rose-400'}`} role="status">
          {feedback.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {feedback.message}
        </p>
      )}
    </form>
  );
};
