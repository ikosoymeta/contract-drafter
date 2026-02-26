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
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%)' }}>
      <Sidebar
        activeSection={activeSection}
        onSectionClick={setActiveSection}
        isSectionComplete={isSectionComplete}
      />
      <main className="flex-1 flex items-start justify-center p-8 pt-10">
        <div className="w-full max-w-2xl">
          <div
            key={activeSection}
            className="animate-fade-up bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8"
          >
            {renderSection()}
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
