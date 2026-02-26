import type { FormSection, SectionConfig } from '../types/contract';
import { sections } from '../types/contract';

interface Props {
  activeSection: FormSection;
  onSectionClick: (section: FormSection) => void;
  isSectionComplete: (section: FormSection) => boolean;
}

export function Sidebar({ activeSection, onSectionClick, isSectionComplete }: Props) {
  const activeIdx = sections.findIndex((s) => s.id === activeSection);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Contract Drafter</h1>
        <p className="text-xs text-gray-500 mt-1">Professional Services Contracts</p>
      </div>
      <nav className="flex-1 py-4">
        {sections.map((section, idx) => {
          const isComplete = isSectionComplete(section.id);
          const isActive = activeSection === section.id;

          // A step is clickable if:
          // - it's already complete, OR
          // - it's the currently active step, OR
          // - it's a previous step (idx < activeIdx)
          const isClickable = isComplete || isActive || idx < activeIdx;

          return (
            <SidebarItem
              key={section.id}
              section={section}
              index={idx}
              isActive={isActive}
              isComplete={isComplete}
              isClickable={isClickable}
              onClick={() => isClickable && onSectionClick(section.id)}
            />
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-400">
        Data saved locally in your browser
      </div>
    </aside>
  );
}

function SidebarItem({
  section,
  index,
  isActive,
  isComplete,
  isClickable,
  onClick,
}: {
  section: SectionConfig;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isClickable: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      title={!isClickable ? 'Complete the current step to unlock this section' : undefined}
      className={`w-full text-left px-6 py-3 flex items-start gap-3 transition-colors ${
        isActive
          ? 'bg-blue-50 border-r-2 border-blue-600'
          : isClickable
            ? 'hover:bg-gray-50 cursor-pointer'
            : 'cursor-not-allowed opacity-40'
      }`}
    >
      <span
        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
          isComplete
            ? 'bg-emerald-100 text-emerald-700'
            : isActive
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
        }`}
      >
        {isComplete ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          index + 1
        )}
      </span>
      <div>
        <div className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{section.label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{section.description}</div>
      </div>
    </button>
  );
}
