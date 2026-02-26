import type { ContractFormData } from '../types/contract';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OptionsSection({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Contract Options</h2>
      <p className="text-sm text-gray-500 mb-6">Configure PSA inclusion and amendment settings.</p>

      <div className="space-y-6">
        {/* PSA Toggle */}
        <div className="border border-gray-200 rounded-lg p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.includePSA}
              onChange={(e) => onChange({ includePSA: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">Include Professional Services Agreement (PSA)</div>
              <div className="text-xs text-gray-500 mt-1">
                Generate a separate PSA document with standard terms and conditions (confidentiality, IP, warranties, etc.)
              </div>
            </div>
          </label>
        </div>

        {/* Amendment Toggle */}
        <div className="border border-gray-200 rounded-lg p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isAmendment}
              onChange={(e) => onChange({ isAmendment: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">Create an Amendment</div>
              <div className="text-xs text-gray-500 mt-1">
                Generate documents as an amendment to an existing contract rather than a new contract
              </div>
            </div>
          </label>

          {data.isAmendment && (
            <div className="mt-4 ml-7 space-y-4 border-t border-gray-100 pt-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Amendment Number</span>
                <input
                  type="text"
                  value={data.amendmentNumber}
                  onChange={(e) => onChange({ amendmentNumber: e.target.value })}
                  placeholder="e.g. 1"
                  className="input mt-1.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Original Contract Date</span>
                <input
                  type="date"
                  value={data.originalContractDate}
                  onChange={(e) => onChange({ originalContractDate: e.target.value })}
                  className="input mt-1.5"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next: Review & Generate
        </button>
      </div>
    </div>
  );
}
