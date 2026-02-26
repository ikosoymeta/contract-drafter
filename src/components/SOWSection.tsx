import { v4 as uuid } from 'uuid';
import type { ContractFormData, Deliverable, PaymentMilestone } from '../types/contract';

interface Props {
  data: ContractFormData;
  onChange: (updates: Partial<ContractFormData> | ((prev: ContractFormData) => ContractFormData)) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function SOWSection({ data, onChange, onNext, onPrev }: Props) {
  const addDeliverable = () => {
    const d: Deliverable = { id: uuid(), name: '', description: '', dueDate: '' };
    onChange((prev) => ({ ...prev, deliverables: [...prev.deliverables, d] }));
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: string) => {
    onChange((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  };

  const removeDeliverable = (id: string) => {
    onChange((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((d) => d.id !== id),
      paymentMilestones: prev.paymentMilestones.filter((m) => m.deliverableId !== id),
    }));
  };

  const addMilestone = () => {
    const m: PaymentMilestone = { id: uuid(), name: '', amount: 0, dueDate: '', deliverableId: '' };
    onChange((prev) => ({ ...prev, paymentMilestones: [...prev.paymentMilestones, m] }));
  };

  const updateMilestone = (id: string, field: keyof PaymentMilestone, value: string | number) => {
    onChange((prev) => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const removeMilestone = (id: string) => {
    onChange((prev) => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.filter((m) => m.id !== id),
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Statement of Work</h2>
      <p className="text-sm text-gray-500 mb-6">Define deliverables, payment milestones, and acceptance criteria.</p>

      {/* Deliverables */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Deliverables</h3>
          <button onClick={addDeliverable} className="btn-secondary text-xs py-1.5 px-3">
            + Add Deliverable
          </button>
        </div>

        {data.deliverables.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400">
            No deliverables yet. Click "Add Deliverable" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {data.deliverables.map((d, idx) => (
              <div key={d.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">Deliverable {idx + 1}</span>
                  <button
                    onClick={() => removeDeliverable(d.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
                    placeholder="Deliverable name"
                    className="input text-sm"
                  />
                  <input
                    type="date"
                    value={d.dueDate}
                    onChange={(e) => updateDeliverable(d.id, 'dueDate', e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <textarea
                  value={d.description}
                  onChange={(e) => updateDeliverable(d.id, 'description', e.target.value)}
                  placeholder="Description of this deliverable..."
                  rows={2}
                  className="input text-sm mt-3 resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Milestones */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Payment Milestones</h3>
          <button onClick={addMilestone} className="btn-secondary text-xs py-1.5 px-3">
            + Add Milestone
          </button>
        </div>

        {data.paymentMilestones.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400">
            No milestones yet. Click "Add Milestone" to define payment schedule.
          </div>
        ) : (
          <div className="space-y-3">
            {data.paymentMilestones.map((m, idx) => (
              <div key={m.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">Milestone {idx + 1}</span>
                  <button
                    onClick={() => removeMilestone(m.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMilestone(m.id, 'name', e.target.value)}
                    placeholder="Milestone name"
                    className="input text-sm"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      value={m.amount || ''}
                      onChange={(e) => updateMilestone(m.id, 'amount', Number(e.target.value))}
                      placeholder="0.00"
                      min={0}
                      step={0.01}
                      className="input text-sm pl-7"
                    />
                  </div>
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => updateMilestone(m.id, 'dueDate', e.target.value)}
                    placeholder="Due date"
                    className="input text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceptance Criteria */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Acceptance Criteria</h3>
        <textarea
          value={data.acceptanceCriteria}
          onChange={(e) => onChange({ acceptanceCriteria: e.target.value })}
          placeholder="Define the criteria for accepting deliverables (e.g., testing requirements, sign-off process, quality standards)..."
          rows={5}
          className="input resize-none"
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next: Contract Options
        </button>
      </div>
    </div>
  );
}
