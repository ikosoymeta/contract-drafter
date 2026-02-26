import { useState, useEffect, useCallback } from 'react';
import type { ContractFormData, FormSection } from '../types/contract';
import { defaultFormData, sections } from '../types/contract';

const STORAGE_KEY = 'contract-drafter-form-data';
const SECTION_KEY = 'contract-drafter-active-section';
const VISITED_KEY = 'contract-drafter-visited-sections';

function loadFromStorage(): ContractFormData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultFormData, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultFormData };
}

function loadSectionFromStorage(): FormSection {
  try {
    const raw = localStorage.getItem(SECTION_KEY);
    if (raw && sections.some((s) => s.id === raw)) {
      return raw as FormSection;
    }
  } catch {
    // ignore
  }
  return 'vendor';
}

function loadVisitedFromStorage(): Set<FormSection> {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as FormSection[];
      return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set<FormSection>();
}

export function useContractForm() {
  const [formData, setFormDataState] = useState<ContractFormData>(loadFromStorage);
  const [activeSection, setActiveSectionState] = useState<FormSection>(loadSectionFromStorage);
  // Track which steps the user has explicitly advanced *past* (by clicking Next)
  const [completedSteps, setCompletedSteps] = useState<Set<FormSection>>(loadVisitedFromStorage);

  // Persist form data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Persist active section
  useEffect(() => {
    localStorage.setItem(SECTION_KEY, activeSection);
  }, [activeSection]);

  // Persist completed steps
  useEffect(() => {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...completedSteps]));
  }, [completedSteps]);

  const setFormData = useCallback(
    (updater: Partial<ContractFormData> | ((prev: ContractFormData) => ContractFormData)) => {
      if (typeof updater === 'function') {
        setFormDataState(updater);
      } else {
        setFormDataState((prev) => ({ ...prev, ...updater }));
      }
    },
    [],
  );

  const setActiveSection = useCallback((section: FormSection) => {
    setActiveSectionState(section);
  }, []);

  /**
   * Returns true only when a step's required fields are filled AND
   * (for field-less steps like "options") the user has explicitly advanced past it.
   */
  const isSectionComplete = useCallback(
    (section: FormSection): boolean => {
      switch (section) {
        case 'vendor':
          return !!(
            formData.vendorLegalName.trim() &&
            formData.vendorAddress.trim() &&
            formData.vendorContactName.trim() &&
            formData.vendorEmail.trim()
          );
        case 'project':
          return !!(
            formData.projectName.trim() &&
            formData.projectDescription.trim() &&
            formData.startDate &&
            formData.endDate &&
            formData.totalValue > 0
          );
        case 'sow':
          return (
            formData.deliverables.length > 0 &&
            formData.deliverables.every((d) => d.name.trim() !== '') &&
            formData.acceptanceCriteria.trim().length > 0
          );
        case 'options':
          // Only show checkmark after user has clicked "Next" from this step
          return completedSteps.has('options');
        case 'review':
          return false; // Final step — never shown as "complete"
      }
    },
    [formData, completedSteps],
  );

  const goToNext = useCallback(() => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx < sections.length - 1) {
      // Mark current step as explicitly completed before advancing
      setCompletedSteps((prev) => new Set([...prev, activeSection]));
      setActiveSectionState(sections[idx + 1].id);
    }
  }, [activeSection]);

  const goToPrev = useCallback(() => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx > 0) {
      setActiveSectionState(sections[idx - 1].id);
    }
  }, [activeSection]);

  /**
   * Resets only the fields belonging to a specific step.
   */
  const resetSection = useCallback(
    (section: FormSection) => {
      switch (section) {
        case 'vendor':
          setFormDataState((prev) => ({
            ...prev,
            vendorLegalName: '',
            vendorAddress: '',
            vendorContactName: '',
            vendorEmail: '',
          }));
          break;
        case 'project':
          setFormDataState((prev) => ({
            ...prev,
            projectName: '',
            projectDescription: '',
            startDate: '',
            endDate: '',
            totalValue: 0,
          }));
          break;
        case 'sow':
          setFormDataState((prev) => ({
            ...prev,
            deliverables: [],
            paymentMilestones: [],
            acceptanceCriteria: '',
          }));
          break;
        case 'options':
          setFormDataState((prev) => ({
            ...prev,
            includePSA: true,
            isAmendment: false,
            amendmentNumber: '1',
            originalContractDate: '',
          }));
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.delete('options');
            return next;
          });
          break;
        default:
          break;
      }
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormDataState({ ...defaultFormData });
    setActiveSectionState('vendor');
    setCompletedSteps(new Set());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SECTION_KEY);
    localStorage.removeItem(VISITED_KEY);
  }, []);

  return {
    formData,
    setFormData,
    activeSection,
    setActiveSection,
    isSectionComplete,
    goToNext,
    goToPrev,
    resetForm,
    resetSection,
  };
}
