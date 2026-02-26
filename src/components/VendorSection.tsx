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
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Vendor Information</h2>
      <p className="text-sm text-gray-500 mb-6">Enter the vendor's legal details and primary contact.</p>

      <div className="space-y-5">
        <Field label="Vendor Legal Name" required>
          <input
            type="text"
            value={data.vendorLegalName}
            onChange={(e) => onChange({ vendorLegalName: e.target.value })}
            placeholder="e.g. Acme Consulting LLC"
            className="input"
          />
        </Field>

        <Field label="Address" required>
          <textarea
            value={data.vendorAddress}
            onChange={(e) => onChange({ vendorAddress: e.target.value })}
            placeholder="Full mailing address"
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

          <Field label="Email" required>
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

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isComplete}
          title={!isComplete ? 'Please fill in all required fields to continue' : undefined}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next: Project Details
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
