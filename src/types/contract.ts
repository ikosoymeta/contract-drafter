export interface Deliverable {
  id: string;
  name: string;
  description: string;
  dueDate: string;
}

export interface PaymentMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  deliverableId: string;
}

export interface ContractFormData {
  // Vendor Information
  vendorLegalName: string;
  vendorAddress: string;
  vendorContactName: string;
  vendorEmail: string;

  // Project Details
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  totalValue: number;

  // SOW
  deliverables: Deliverable[];
  paymentMilestones: PaymentMilestone[];
  acceptanceCriteria: string;

  // Options
  includePSA: boolean;
  isAmendment: boolean;
  amendmentNumber: string;
  originalContractDate: string;
}

export const defaultFormData: ContractFormData = {
  vendorLegalName: '',
  vendorAddress: '',
  vendorContactName: '',
  vendorEmail: '',
  projectName: '',
  projectDescription: '',
  startDate: '',
  endDate: '',
  totalValue: 0,
  deliverables: [],
  paymentMilestones: [],
  acceptanceCriteria: '',
  includePSA: true,
  isAmendment: false,
  amendmentNumber: '1',
  originalContractDate: '',
};

export type FormSection = 'vendor' | 'project' | 'sow' | 'options' | 'review';

export interface SectionConfig {
  id: FormSection;
  label: string;
  description: string;
}

export const sections: SectionConfig[] = [
  { id: 'vendor', label: 'Vendor Information', description: 'Legal name, address, and contact details' },
  { id: 'project', label: 'Project Details', description: 'Project scope, timeline, and value' },
  { id: 'sow', label: 'Statement of Work', description: 'Deliverables, milestones, and acceptance criteria' },
  { id: 'options', label: 'Contract Options', description: 'PSA inclusion and amendment settings' },
  { id: 'review', label: 'Review & Generate', description: 'Review all data and generate documents' },
];
