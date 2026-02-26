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
    <aside
      className="w-72 min-h-screen flex flex-col border-r border-gray-100"
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)' }}
    >
      {/* Logo / Header */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Contract Drafter</h1>
            <p className="text-xs text-indigo-300 mt-0.5">Professional Services</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {sections.map((section, idx) => {
          const isComplete = isSectionComplete(section.id);
          const isActive = activeSection === section.id;
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-indigo-400 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Saved locally in your browser
        </p>
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
      className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-150 ${
        isActive
          ? 'bg-white/15 shadow-sm'
          : isClickable
            ? 'hover:bg-white/8 cursor-pointer'
            : 'cursor-not-allowed opacity-35'
      }`}
    >
      {/* Step indicator */}
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200 ${
          isComplete
            ? 'bg-emerald-400 text-white shadow-sm shadow-emerald-500/30'
            : isActive
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'bg-white/15 text-indigo-200'
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

      {/* Label */}
      <div className="min-w-0">
        <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : isClickable ? 'text-indigo-200' : 'text-indigo-400'}`}>
          {section.label}
        </div>
        <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-indigo-400/70'}`}>
          {section.description}
        </div>
      </div>

      {/* Active indicator dot */}
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
      )}
    </button>
  );
}
