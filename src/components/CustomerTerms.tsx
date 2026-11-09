export const POLICY_VERSION = '1.0';

export function readCustomerAcceptance(form: HTMLFormElement) {
  if (new FormData(form).get('customerTerms') !== 'accepted') return null;
  return { version: POLICY_VERSION, acceptedAt: new Date().toISOString() };
}

export function CustomerTerms({ purpose }: { purpose: string }) {
  return (
    <div className="space-y-1 text-xs text-slate-400">
      <label className="flex items-start gap-2">
        <input type="checkbox" name="customerTerms" value="accepted" required className="mt-0.5 accent-amber-500" />
        <span>I agree to the Terms &amp; Conditions.</span>
      </label>
      <p>Use sample details in this demo. The form uses your details to {purpose}. Read the{' '}
        <a className="text-amber-400 underline" href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
        {' '}and <a className="text-amber-400 underline" href="/terms-and-conditions" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>.
      </p>
    </div>
  );
}
