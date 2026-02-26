import type { ContractFormData } from '../types/contract';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ProjectSection({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Project Details</h2>
      <p className="text-sm text-gray-500 mb-6">Define the project scope, timeline, and total value.</p>

      <div className="space-y-5">
        <Field label="Project Name" required>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="e.g. Website Redesign Phase 2"
            className="input"
          />
        </Field>

        <Field label="Project Description" required>
          <textarea
            value={data.projectDescription}
            onChange={(e) => onChange({ projectDescription: e.target.value })}
            placeholder="Describe the project scope, objectives, and expected outcomes..."
            rows={4}
            className="input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date" required>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              value={data.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Total Contract Value (USD)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={data.totalValue || ''}
              onChange={(e) => onChange({ totalValue: Number(e.target.value) })}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="input pl-7"
            />
          </div>
        </Field>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next: Statement of Work
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
