import type { ContractFormData } from '../types/contract';
import { StepHeader, Field, FormFooter, ArrowRight, ResetButton } from './VendorSection';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export function ProjectSection({ data, onChange, onNext, onPrev, onReset }: Props) {
  const isComplete =
    data.projectName.trim() !== '' &&
    data.projectDescription.trim() !== '' &&
    data.startDate !== '' &&
    data.endDate !== '' &&
    data.totalValue > 0;

  return (
    <div>
      <StepHeader
        step={2}
        title="Project Details"
        subtitle="Define the project scope, timeline, and total contract value."
      />

      <div className="space-y-5 mt-7">
        <Field label="Project Name" required>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="e.g. Website Redesign Phase 2"
            className="input"
          />
        </Field>

        <Field label="Project Description" required hint="Describe the scope, objectives, and expected outcomes">
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input
              type="number"
              value={data.totalValue || ''}
              onChange={(e) => onChange({ totalValue: Number(e.target.value) })}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="input pl-8"
            />
          </div>
        </Field>
      </div>

      <FormFooter
        left={
          <div className="flex items-center gap-2">
            <button onClick={onPrev} className="btn-secondary">Back</button>
            <ResetButton onClick={onReset} />
          </div>
        }
      >
        <button
          onClick={onNext}
          disabled={!isComplete}
          title={!isComplete ? 'Fill in all required fields to continue' : undefined}
          className="btn-primary"
        >
          Continue to Statement of Work
          <ArrowRight />
        </button>
      </FormFooter>
    </div>
  );
}
