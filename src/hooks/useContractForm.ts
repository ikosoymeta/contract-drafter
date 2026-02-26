import { useState, useEffect, useCallback } from 'react';
import type { ContractFormData, FormSection } from '../types/contract';
import { defaultFormData, sections } from '../types/contract';

const STORAGE_KEY = 'contract-drafter-form-data';
const SECTION_KEY = 'contract-drafter-active-section';

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

export function useContractForm() {
  const [formData, setFormDataState] = useState<ContractFormData>(loadFromStorage);
  const [activeSection, setActiveSectionState] = useState<FormSection>(loadSectionFromStorage);

  // Persist form data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Persist active section
  useEffect(() => {
    localStorage.setItem(SECTION_KEY, activeSection);
  }, [activeSection]);

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
          return formData.deliverables.length > 0 && formData.acceptanceCriteria.trim().length > 0;
        case 'options':
          return true; // Options always considered complete (defaults are fine)
        case 'review':
          return false; // Review is never "complete" — it's the final step
      }
    },
    [formData],
  );

  const goToNext = useCallback(() => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx < sections.length - 1) {
      setActiveSectionState(sections[idx + 1].id);
    }
  }, [activeSection]);

  const goToPrev = useCallback(() => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx > 0) {
      setActiveSectionState(sections[idx - 1].id);
    }
  }, [activeSection]);

  const resetForm = useCallback(() => {
    setFormDataState({ ...defaultFormData });
    setActiveSectionState('vendor');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SECTION_KEY);
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
  };
}
