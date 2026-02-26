import { v4 as uuid } from 'uuid';
import type { ContractFormData, Deliverable, PaymentMilestone } from '../types/contract';
import { StepHeader, Field, FormFooter, ArrowRight } from './VendorSection';

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

  const hasValidDeliverable =
    data.deliverables.length > 0 && data.deliverables.every((d) => d.name.trim() !== '');
  const isComplete = hasValidDeliverable && data.acceptanceCriteria.trim() !== '';

  const missingItems: string[] = [];
  if (data.deliverables.length === 0) missingItems.push('at least one deliverable');
  else if (!hasValidDeliverable) missingItems.push('a name for each deliverable');
  if (!data.acceptanceCriteria.trim()) missingItems.push('acceptance criteria');

  return (
    <div>
      <StepHeader
        step={3}
        title="Statement of Work"
        subtitle="Define deliverables, payment milestones, and acceptance criteria."
      />

      {/* Deliverables */}
      <div className="mt-7">
        <SectionBlock
          title="Deliverables"
          required
          action={
            <button
              onClick={addDeliverable}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Deliverable
            </button>
          }
        >
          {data.deliverables.length === 0 ? (
            <EmptyState
              icon="📋"
              message="No deliverables yet"
              action='Click "Add Deliverable" to get started'
            />
          ) : (
            <div className="space-y-3">
              {data.deliverables.map((d, idx) => (
                <div key={d.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Deliverable {idx + 1}
                    </span>
                    <button
                      onClick={() => removeDeliverable(d.id)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
                      placeholder="Deliverable name *"
                      className={`input text-sm ${d.name.trim() === '' ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-50' : ''}`}
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
                    placeholder="Description of this deliverable (optional)"
                    rows={2}
                    className="input text-sm mt-3 resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </SectionBlock>
      </div>

      {/* Payment Milestones */}
      <div className="mt-6">
        <SectionBlock
          title="Payment Milestones"
          action={
            <button
              onClick={addMilestone}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Milestone
            </button>
          }
        >
          {data.paymentMilestones.length === 0 ? (
            <EmptyState
              icon="💳"
              message="No milestones yet"
              action='Click "Add Milestone" to define the payment schedule'
            />
          ) : (
            <div className="space-y-3">
              {data.paymentMilestones.map((m, idx) => (
                <div key={m.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Milestone {idx + 1}
                    </span>
                    <button
                      onClick={() => removeMilestone(m.id)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
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
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">$</span>
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
                      className="input text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionBlock>
      </div>

      {/* Acceptance Criteria */}
      <div className="mt-6">
        <Field label="Acceptance Criteria" required hint="Define how deliverables will be reviewed and approved">
          <textarea
            value={data.acceptanceCriteria}
            onChange={(e) => onChange({ acceptanceCriteria: e.target.value })}
            placeholder="e.g. All deliverables must pass QA review, receive written sign-off from the project sponsor, and meet the agreed performance benchmarks..."
            rows={4}
            className="input resize-none"
          />
        </Field>
      </div>

      {/* Validation hint */}
      {!isComplete && missingItems.length > 0 && (
        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-700 font-medium">
            Required to continue: {missingItems.join(', ')}.
          </p>
        </div>
      )}

      <FormFooter
        left={
          <button onClick={onPrev} className="btn-secondary">
            Back
          </button>
        }
      >
        <button
          onClick={onNext}
          disabled={!isComplete}
          title={!isComplete ? 'Fill in all required fields to continue' : undefined}
          className="btn-primary"
        >
          Continue to Contract Options
          <ArrowRight />
        </button>
      </FormFooter>
    </div>
  );
}

function SectionBlock({
  title,
  required,
  action,
  children,
}: {
  title: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">
          {title}
          {required && <span className="text-red-400 ml-1">*</span>}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, message, action }: { icon: string; message: string; action: string }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      <p className="text-xs text-gray-400 mt-1">{action}</p>
    </div>
  );
}
