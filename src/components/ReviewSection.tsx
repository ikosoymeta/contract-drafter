import { useState } from 'react';
import { saveAs } from 'file-saver';
import type { ContractFormData } from '../types/contract';
import {
  generatePSA,
  generateSOW,
  generateFormSummary,
  documentToBlob,
} from '../utils/generateDocuments';
import { convertDocxToHtml } from '../utils/googleDocs';
import { DocumentViewer } from './DocumentViewer';
import { StepHeader, FormFooter } from './VendorSection';

interface Props {
  data: ContractFormData;
  onPrev: () => void;
  onReset: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type DocType = 'psa' | 'sow' | 'summary';

const docLabels: Record<DocType, string> = {
  psa: 'Professional Services Agreement',
  sow: 'Statement of Work',
  summary: 'Form Summary',
};

const docIcons: Record<DocType, string> = {
  psa: '⚖️',
  sow: '📋',
  summary: '📄',
};

function formatDate(d: string) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function ReviewSection({ data, onPrev, onReset, addToast }: Props) {
  const [generating, setGenerating] = useState<DocType | 'all' | null>(null);
  const [viewer, setViewer] = useState<{ html: string; filename: string; blob: Blob } | null>(null);

  async function getBlob(type: DocType): Promise<{ blob: Blob; filename: string }> {
    const prefix = data.projectName.replace(/[^a-zA-Z0-9]/g, '_') || 'contract';
    let doc;
    let filename: string;
    switch (type) {
      case 'psa':
        doc = generatePSA(data);
        filename = `${prefix}_PSA.docx`;
        break;
      case 'sow':
        doc = generateSOW(data);
        filename = `${prefix}_SOW.docx`;
        break;
      case 'summary':
        doc = generateFormSummary(data);
        filename = `${prefix}_Summary.docx`;
        break;
    }
    const blob = await documentToBlob(doc);
    return { blob, filename };
  }

  async function handleDownload(type: DocType) {
    setGenerating(type);
    try {
      const { blob, filename } = await getBlob(type);
      saveAs(blob, filename);
      addToast(`${docLabels[type]} downloaded`, 'success');
    } catch (e) {
      addToast(`Failed to generate ${docLabels[type]}`, 'error');
      console.error(e);
    } finally {
      setGenerating(null);
    }
  }

  async function handleDownloadAll() {
    setGenerating('all');
    try {
      const types: DocType[] = data.includePSA ? ['psa', 'sow', 'summary'] : ['sow', 'summary'];
      for (const type of types) {
        const { blob, filename } = await getBlob(type);
        saveAs(blob, filename);
      }
      addToast('All documents downloaded', 'success');
    } catch (e) {
      addToast('Failed to generate documents', 'error');
      console.error(e);
    } finally {
      setGenerating(null);
    }
  }

  async function handleOpenInDocs(type: DocType) {
    setGenerating(type);
    addToast('Preparing document...', 'info');
    try {
      const { blob, filename } = await getBlob(type);
      const html = await convertDocxToHtml(blob);
      setViewer({ html, filename, blob });
      addToast(`${docLabels[type]} ready to view`, 'success');
    } catch (e) {
      addToast('Failed to generate document', 'error');
      console.error(e);
    } finally {
      setGenerating(null);
    }
  }

  const docTypes: DocType[] = data.includePSA ? ['psa', 'sow', 'summary'] : ['sow', 'summary'];

  return (
    <>
      {viewer && (
        <DocumentViewer
          html={viewer.html}
          filename={viewer.filename}
          blob={viewer.blob}
          onClose={() => setViewer(null)}
        />
      )}

      <div>
        <StepHeader
          step={5}
          title="Review & Generate"
          subtitle="Confirm your contract details and generate the documents."
        />

        {/* Summary Grid */}
        <div className="mt-7 space-y-3">
          <SummaryCard title="Vendor" icon="🏢">
            <SummaryRow label="Legal Name" value={data.vendorLegalName} />
            <SummaryRow label="Address" value={data.vendorAddress} />
            <SummaryRow label="Contact" value={`${data.vendorContactName} · ${data.vendorEmail}`} />
          </SummaryCard>

          <SummaryCard title="Project" icon="🗂️">
            <SummaryRow label="Name" value={data.projectName} />
            <SummaryRow label="Period" value={`${formatDate(data.startDate)} — ${formatDate(data.endDate)}`} />
            <SummaryRow label="Total Value" value={formatCurrency(data.totalValue)} />
          </SummaryCard>

          <SummaryCard title="Statement of Work" icon="📋">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500">
                <span className="font-semibold text-gray-800">{data.deliverables.length}</span> deliverable{data.deliverables.length !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                <span className="font-semibold text-gray-800">{data.paymentMilestones.length}</span> milestone{data.paymentMilestones.length !== 1 ? 's' : ''}
              </span>
            </div>
            {data.deliverables.length > 0 && (
              <div className="mt-3 space-y-1">
                {data.deliverables.map((d) => (
                  <div key={d.id} className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium">{d.name}</span>
                    <span className="text-gray-400">{formatDate(d.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </SummaryCard>

          <SummaryCard title="Options" icon="⚙️">
            <div className="flex flex-wrap gap-2">
              <Badge active={data.includePSA} label="PSA Included" />
              <Badge active={data.isAmendment} label={`Amendment ${data.isAmendment ? `#${data.amendmentNumber}` : ''}`} />
            </div>
          </SummaryCard>
        </div>

        {/* Document Generation */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Generate Documents</h3>
            {generating && (
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating…
              </div>
            )}
          </div>

          <div className="space-y-2">
            {docTypes.map((type) => (
              <div
                key={type}
                className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{docIcons[type]}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{docLabels[type]}</div>
                    <div className="text-xs text-gray-400">.docx format</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(type)}
                    disabled={!!generating}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => handleOpenInDocs(type)}
                    disabled={!!generating}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <svg className="w-3.5 h-3.5 mr-1 inline-block" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z" />
                    </svg>
                    View & Save to Drive
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownloadAll}
            disabled={!!generating}
            className="btn-secondary w-full mt-3"
          >
            {generating === 'all' ? 'Generating…' : 'Download All Documents'}
          </button>
        </div>

        <FormFooter
          left={
            <button onClick={onPrev} className="btn-secondary">
              Back
            </button>
          }
        >
          <button
            onClick={onReset}
            className="text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset Form
          </button>
        </FormFooter>
      </div>
    </>
  );
}

function SummaryCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[60%] break-words">{value || '--'}</span>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 text-gray-400 line-through'
      }`}
    >
      {active && (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </span>
  );
}
