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
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review & Generate</h2>
        <p className="text-sm text-gray-500 mb-6">Review your contract data and generate documents.</p>

        {/* Summary Cards */}
        <div className="space-y-4 mb-8">
          {/* Vendor */}
          <SummaryCard title="Vendor Information">
            <SummaryRow label="Legal Name" value={data.vendorLegalName} />
            <SummaryRow label="Address" value={data.vendorAddress} />
            <SummaryRow label="Contact" value={data.vendorContactName} />
            <SummaryRow label="Email" value={data.vendorEmail} />
          </SummaryCard>

          {/* Project */}
          <SummaryCard title="Project Details">
            <SummaryRow label="Project Name" value={data.projectName} />
            <SummaryRow label="Description" value={data.projectDescription} />
            <SummaryRow label="Period" value={`${formatDate(data.startDate)} — ${formatDate(data.endDate)}`} />
            <SummaryRow label="Total Value" value={formatCurrency(data.totalValue)} />
          </SummaryCard>

          {/* SOW */}
          <SummaryCard title="Statement of Work">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">{data.deliverables.length}</span> deliverable(s),{' '}
              <span className="font-medium">{data.paymentMilestones.length}</span> payment milestone(s)
            </div>
            {data.deliverables.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Deliverables</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {data.deliverables.map((d) => (
                    <li key={d.id} className="flex justify-between">
                      <span>{d.name || '(unnamed)'}</span>
                      <span className="text-gray-400">{formatDate(d.dueDate)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.paymentMilestones.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Milestones</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {data.paymentMilestones.map((m) => (
                    <li key={m.id} className="flex justify-between">
                      <span>{m.name || '(unnamed)'}</span>
                      <span className="text-gray-400">{formatCurrency(m.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.acceptanceCriteria && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Acceptance Criteria</div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.acceptanceCriteria}</p>
              </div>
            )}
          </SummaryCard>

          {/* Options */}
          <SummaryCard title="Contract Options">
            <SummaryRow label="Include PSA" value={data.includePSA ? 'Yes' : 'No'} />
            <SummaryRow label="Amendment" value={data.isAmendment ? `Yes (Amendment ${data.amendmentNumber})` : 'No'} />
            {data.isAmendment && data.originalContractDate && (
              <SummaryRow label="Original Contract Date" value={formatDate(data.originalContractDate)} />
            )}
          </SummaryCard>
        </div>

        {/* Document Generation */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Generate Documents</h3>

          {generating && (
            <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </div>
          )}

          <div className="space-y-3">
            {docTypes.map((type) => (
              <div key={type} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                <div>
                  <div className="text-sm font-medium text-gray-800">{docLabels[type]}</div>
                  <div className="text-xs text-gray-400">.docx format</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(type)}
                    disabled={!!generating}
                    className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                  >
                    <DownloadIcon /> Download
                  </button>
                  <button
                    onClick={() => handleOpenInDocs(type)}
                    disabled={!!generating}
                    className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                  >
                    <GoogleDocsIcon /> View & Save to Drive
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={handleDownloadAll}
              disabled={!!generating}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {generating === 'all' ? 'Generating...' : 'Download All Documents'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center border-t border-gray-200 pt-6">
          <button onClick={onPrev} className="btn-secondary">
            Back
          </button>
          <button onClick={onReset} className="text-sm text-red-500 hover:text-red-700">
            Reset Form
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[60%] break-words">{value || '--'}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function GoogleDocsIcon() {
  return (
    <svg className="w-3.5 h-3.5 mr-1 inline-block" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z" />
    </svg>
  );
}
