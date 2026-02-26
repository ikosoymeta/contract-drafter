import type { ContractFormData } from '../types/contract';
import { StepHeader, Field, FormFooter, ArrowRight, ResetButton } from './VendorSection';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export function OptionsSection({ data, onChange, onNext, onPrev, onReset }: Props) {
  return (
    <div>
      <StepHeader
        step={4}
        title="Contract Options"
        subtitle="Configure PSA inclusion and amendment settings for this contract."
      />

      <div className="space-y-4 mt-7">
        {/* PSA Toggle */}
        <ToggleCard
          title="Include Professional Services Agreement"
          description="Attach a standard PSA covering IP ownership, confidentiality, liability, and governing law."
          checked={data.includePSA}
          onChange={(val) => onChange({ includePSA: val })}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        {/* Amendment Toggle */}
        <ToggleCard
          title="This is an Amendment"
          description="Mark this document as an amendment to an existing contract rather than a new agreement."
          checked={data.isAmendment}
          onChange={(val) => onChange({ isAmendment: val })}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />

        {/* Amendment details */}
        {data.isAmendment && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-4 animate-fade-up">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Amendment Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amendment Number" required>
                <input
                  type="text"
                  value={data.amendmentNumber}
                  onChange={(e) => onChange({ amendmentNumber: e.target.value })}
                  placeholder="e.g. 1"
                  className="input bg-white"
                />
              </Field>
              <Field label="Original Contract Date">
                <input
                  type="date"
                  value={data.originalContractDate}
                  onChange={(e) => onChange({ originalContractDate: e.target.value })}
                  className="input bg-white"
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      <FormFooter
        left={
          <div className="flex items-center gap-2">
            <button onClick={onPrev} className="btn-secondary">Back</button>
            <ResetButton onClick={onReset} />
          </div>
        }
      >
        <button onClick={onNext} className="btn-primary">
          Review &amp; Generate
          <ArrowRight />
        </button>
      </FormFooter>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full text-left rounded-xl border-2 p-4 flex items-start gap-4 transition-all duration-150 ${
        checked
          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? 'bg-indigo-100' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${checked ? 'text-indigo-900' : 'text-gray-800'}`}>{title}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</div>
      </div>
      <div
        className={`w-11 h-6 rounded-full flex-shrink-0 mt-0.5 relative transition-colors duration-200 ${
          checked ? 'bg-indigo-500' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
