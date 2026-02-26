import type { FormSection } from '../types/contract';

const STEPS: { id: FormSection; label: string }[] = [
  { id: 'vendor',  label: 'Vendor'  },
  { id: 'project', label: 'Project' },
  { id: 'sow',     label: 'SOW'     },
  { id: 'options', label: 'Options' },
  { id: 'review',  label: 'Review'  },
];

interface Props {
  activeSection: FormSection;
  isSectionComplete: (s: FormSection) => boolean;
}

export function ProgressBar({ activeSection, isSectionComplete }: Props) {
  const activeIdx = STEPS.findIndex((s) => s.id === activeSection);
  // percent fills to the center of the active step dot
  const pct = STEPS.length === 1 ? 0 : (activeIdx / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mb-5 px-1">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {STEPS.map((step, idx) => {
          const isActive    = step.id === activeSection;
          const isCompleted = isSectionComplete(step.id);
          const isPast      = idx < activeIdx;
          return (
            <span
              key={step.id}
              className={`text-xs font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : isCompleted || isPast
                  ? 'text-indigo-400'
                  : 'text-gray-300'
              }`}
              style={{ width: '20%', textAlign: idx === 0 ? 'left' : idx === STEPS.length - 1 ? 'right' : 'center' }}
            >
              {step.label}
            </span>
          );
        })}
      </div>

      {/* Track + fill */}
      <div className="relative h-2 rounded-full bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />

        {/* Step dots */}
        <div className="absolute inset-0 flex items-center justify-between px-0">
          {STEPS.map((step, idx) => {
            const isActive    = step.id === activeSection;
            const isCompleted = isSectionComplete(step.id);
            const isPast      = idx < activeIdx;
            return (
              <div
                key={step.id}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-500 border-indigo-500 scale-110'
                    : isActive
                    ? 'bg-white border-indigo-500 scale-125 shadow-md shadow-indigo-200'
                    : isPast
                    ? 'bg-indigo-300 border-indigo-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                {isCompleted && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isActive && !isCompleted && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step counter */}
      <div className="mt-2 text-right">
        <span className="text-xs text-gray-400 font-medium">
          Step {activeIdx + 1} of {STEPS.length}
        </span>
      </div>
    </div>
  );
}
