import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { VendorSection } from './components/VendorSection';
import { ProjectSection } from './components/ProjectSection';
import { SOWSection } from './components/SOWSection';
import { OptionsSection } from './components/OptionsSection';
import { ReviewSection } from './components/ReviewSection';
import { useContractForm } from './hooks/useContractForm';
import { useToast } from './hooks/useToast';

export default function App() {
  const {
    formData,
    setFormData,
    activeSection,
    setActiveSection,
    isSectionComplete,
    goToNext,
    goToPrev,
    resetForm,
  } = useContractForm();

  const { toasts, addToast, removeToast } = useToast();

  function renderSection() {
    switch (activeSection) {
      case 'vendor':
        return <VendorSection data={formData} onChange={setFormData} onNext={goToNext} />;
      case 'project':
        return <ProjectSection data={formData} onChange={setFormData} onNext={goToNext} onPrev={goToPrev} />;
      case 'sow':
        return <SOWSection data={formData} onChange={setFormData} onNext={goToNext} onPrev={goToPrev} />;
      case 'options':
        return <OptionsSection data={formData} onChange={setFormData} onNext={goToNext} onPrev={goToPrev} />;
      case 'review':
        return <ReviewSection data={formData} onPrev={goToPrev} onReset={resetForm} addToast={addToast} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionClick={setActiveSection}
        isSectionComplete={isSectionComplete}
      />
      <main className="flex-1 p-8 max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">{renderSection()}</div>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
