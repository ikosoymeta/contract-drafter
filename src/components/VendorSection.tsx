import type { ContractFormData } from '../types/contract';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData>) => void;
  onNext: () => void;
}

export function VendorSection({ data, onChange, onNext }: Props) {
  const isComplete =
    data.vendorLegalName.trim() !== '' &&
    data.vendorAddress.trim() !== '' &&
    data.vendorContactName.trim() !== '' &&
    data.vendorEmail.trim() !== '';

  return (
    <div>
      <StepHeader
        step={1}
        title="Vendor Information"
        subtitle="Enter the vendor's legal details and primary point of contact."
      />

      <div className="space-y-5 mt-7">
        <Field label="Vendor Legal Name" required hint="Use the full legal entity name as it appears in official documents">
          <input
            type="text"
            value={data.vendorLegalName}
            onChange={(e) => onChange({ vendorLegalName: e.target.value })}
            placeholder="e.g. Acme Consulting LLC"
            className="input"
          />
        </Field>

        <Field label="Registered Address" required>
          <textarea
            value={data.vendorAddress}
            onChange={(e) => onChange({ vendorAddress: e.target.value })}
            placeholder="Full mailing address including city, state, and ZIP"
            rows={3}
            className="input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Name" required>
            <input
              type="text"
              value={data.vendorContactName}
              onChange={(e) => onChange({ vendorContactName: e.target.value })}
              placeholder="Primary contact"
              className="input"
            />
          </Field>

          <Field label="Contact Email" required>
            <input
              type="email"
              value={data.vendorEmail}
              onChange={(e) => onChange({ vendorEmail: e.target.value })}
              placeholder="contact@vendor.com"
              className="input"
            />
          </Field>
        </div>
      </div>

      <FormFooter>
        <button
          onClick={onNext}
          disabled={!isComplete}
          title={!isComplete ? 'Fill in all required fields to continue' : undefined}
          className="btn-primary"
        >
          Continue to Project Details
          <ArrowRight />
        </button>
      </FormFooter>
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────────── */

export function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-sm font-bold text-indigo-600">{step}</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export function FormFooter({ children, left }: { children: React.ReactNode; left?: React.ReactNode }) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
      <div>{left}</div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function ArrowRight() {
  return (
    <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
