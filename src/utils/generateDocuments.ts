import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
} from 'docx';
import type { ContractFormData } from '../types/contract';

function formatDate(dateStr: string): string {
  if (!dateStr) return '___________';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  return new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, bold: true })] });
}

function bodyText(text: string, options: { bold?: boolean; spacing?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: options.spacing ?? 120 },
    children: [new TextRun({ text, bold: options.bold, size: 22, font: 'IBM Plex Sans' })],
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: 'IBM Plex Sans' }),
      new TextRun({ text: value, size: 22, font: 'IBM Plex Sans' }),
    ],
  });
}

const tableBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
} as const;

function headerCell(text: string): TableCell {
  return new TableCell({
    borders: tableBorder,
    shading: { type: ShadingType.SOLID, color: 'E8EDF2', fill: 'E8EDF2' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: 'IBM Plex Sans' })] })],
  });
}

function dataCell(text: string): TableCell {
  return new TableCell({
    borders: tableBorder,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: 'IBM Plex Sans' })] })],
  });
}

// ──────────────────── PSA ────────────────────

export function generatePSA(data: ContractFormData): Document {
  const title = data.isAmendment
    ? `AMENDMENT ${data.amendmentNumber} TO PROFESSIONAL SERVICES AGREEMENT`
    : 'PROFESSIONAL SERVICES AGREEMENT';

  const sections = [
    heading(title),
    bodyText(
      `This Professional Services Agreement ("Agreement") is entered into as of ${formatDate(data.startDate)} by and between:`,
    ),
    bodyText(`${data.vendorLegalName}, with offices at ${data.vendorAddress} ("Vendor"),`, { spacing: 60 }),
    bodyText('and'),
    bodyText('the Client ("Client").', { spacing: 200 }),

    heading('1. ENGAGEMENT', HeadingLevel.HEADING_2),
    bodyText(
      `Client engages Vendor to provide professional services as described in the Statement of Work attached hereto or as separately executed ("SOW"). The SOW is incorporated into this Agreement by reference.`,
    ),

    heading('2. TERM', HeadingLevel.HEADING_2),
    bodyText(
      `This Agreement is effective from ${formatDate(data.startDate)} through ${formatDate(data.endDate)}, unless earlier terminated in accordance with the terms herein.`,
    ),

    heading('3. COMPENSATION', HeadingLevel.HEADING_2),
    bodyText(
      `Client shall pay Vendor a total amount not to exceed ${formatCurrency(data.totalValue)} for services rendered under this Agreement, payable according to the payment schedule outlined in the SOW.`,
    ),

    heading('4. INDEPENDENT CONTRACTOR', HeadingLevel.HEADING_2),
    bodyText(
      'Vendor is an independent contractor and is not an employee, agent, or partner of Client. Vendor shall be solely responsible for all taxes, withholdings, and obligations arising from compensation paid hereunder.',
    ),

    heading('5. CONFIDENTIALITY', HeadingLevel.HEADING_2),
    bodyText(
      'Each party agrees to hold in confidence all non-public information received from the other party during the term of this Agreement. This obligation survives termination of this Agreement for a period of three (3) years.',
    ),

    heading('6. INTELLECTUAL PROPERTY', HeadingLevel.HEADING_2),
    bodyText(
      'All work product created by Vendor in performance of this Agreement shall be considered "work made for hire" and shall be the exclusive property of Client. To the extent any work product does not qualify as work made for hire, Vendor hereby assigns all rights, title, and interest therein to Client.',
    ),

    heading('7. WARRANTIES', HeadingLevel.HEADING_2),
    bodyText(
      'Vendor warrants that (a) it has the authority to enter into this Agreement; (b) the services will be performed in a professional and workmanlike manner; and (c) the deliverables will conform to the specifications set forth in the SOW.',
    ),

    heading('8. LIMITATION OF LIABILITY', HeadingLevel.HEADING_2),
    bodyText(
      `Neither party shall be liable for any indirect, incidental, special, or consequential damages arising from this Agreement. Each party's total aggregate liability shall not exceed the total amount paid or payable under this Agreement.`,
    ),

    heading('9. TERMINATION', HeadingLevel.HEADING_2),
    bodyText(
      'Either party may terminate this Agreement upon thirty (30) days\' written notice. In the event of a material breach, the non-breaching party may terminate immediately upon written notice if such breach remains uncured for fifteen (15) days after receipt of notice.',
    ),

    heading('10. GENERAL PROVISIONS', HeadingLevel.HEADING_2),
    bodyText(
      'This Agreement, together with all SOWs, constitutes the entire agreement between the parties. It may not be modified except in writing signed by both parties. This Agreement shall be governed by the laws of the State of Delaware.',
    ),

    new Paragraph({ spacing: { before: 400 } }),
    bodyText('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.'),
    new Paragraph({ spacing: { before: 300 } }),
    bodyText('CLIENT:', { bold: true }),
    bodyText('Signature: _____________________________'),
    bodyText('Name: _____________________________'),
    bodyText('Title: _____________________________'),
    bodyText('Date: _____________________________', { spacing: 200 }),
    bodyText('VENDOR:', { bold: true }),
    bodyText(`Company: ${data.vendorLegalName}`),
    bodyText('Signature: _____________________________'),
    bodyText(`Name: ${data.vendorContactName}`),
    bodyText('Title: _____________________________'),
    bodyText('Date: _____________________________'),
  ];

  return new Document({
    styles: { default: { document: { run: { font: 'IBM Plex Sans', size: 22 } } } },
    sections: [{ children: sections }],
  });
}

// ──────────────────── SOW ────────────────────

export function generateSOW(data: ContractFormData): Document {
  const title = data.isAmendment
    ? `AMENDMENT ${data.amendmentNumber} — STATEMENT OF WORK`
    : 'STATEMENT OF WORK';

  const deliverableRows = data.deliverables.map(
    (d) =>
      new TableRow({
        children: [dataCell(d.name), dataCell(d.description), dataCell(formatDate(d.dueDate))],
      }),
  );

  const milestoneRows = data.paymentMilestones.map(
    (m) =>
      new TableRow({
        children: [dataCell(m.name), dataCell(formatCurrency(m.amount)), dataCell(formatDate(m.dueDate))],
      }),
  );

  const children = [
    heading(title),

    ...(data.isAmendment
      ? [
          bodyText(
            `This Amendment ${data.amendmentNumber} ("Amendment") to the Statement of Work dated ${formatDate(data.originalContractDate)} is entered into as of ${formatDate(data.startDate)}.`,
          ),
        ]
      : []),

    heading('1. PROJECT OVERVIEW', HeadingLevel.HEADING_2),
    labelValue('Project Name', data.projectName),
    labelValue('Vendor', data.vendorLegalName),
    labelValue('Period of Performance', `${formatDate(data.startDate)} — ${formatDate(data.endDate)}`),
    labelValue('Total Value', formatCurrency(data.totalValue)),
    new Paragraph({ spacing: { before: 120 } }),
    bodyText(data.projectDescription),

    heading('2. DELIVERABLES', HeadingLevel.HEADING_2),
    ...(data.deliverables.length > 0
      ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell('Deliverable'), headerCell('Description'), headerCell('Due Date')] }),
              ...deliverableRows,
            ],
          }),
        ]
      : [bodyText('No deliverables specified.')]),

    heading('3. PAYMENT MILESTONES', HeadingLevel.HEADING_2),
    ...(data.paymentMilestones.length > 0
      ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell('Milestone'), headerCell('Amount'), headerCell('Due Date')] }),
              ...milestoneRows,
            ],
          }),
        ]
      : [bodyText('No payment milestones specified.')]),

    heading('4. ACCEPTANCE CRITERIA', HeadingLevel.HEADING_2),
    bodyText(data.acceptanceCriteria || 'No acceptance criteria specified.'),

    heading('5. ASSUMPTIONS AND CONSTRAINTS', HeadingLevel.HEADING_2),
    bodyText('The following assumptions apply to this engagement:'),
    bodyText('• Client will provide timely access to required systems, data, and stakeholders.'),
    bodyText('• Vendor will assign qualified personnel to perform the services.'),
    bodyText('• Any changes to scope will be documented in a written change order.'),

    new Paragraph({ spacing: { before: 400 } }),
    bodyText('ACCEPTED AND AGREED:', { bold: true }),
    new Paragraph({ spacing: { before: 200 } }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: tableBorder,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CLIENT', bold: true, size: 22 })] }),
                bodyText(''),
                bodyText('Signature: ____________________'),
                bodyText('Name: ____________________'),
                bodyText('Date: ____________________'),
              ],
            }),
            new TableCell({
              borders: tableBorder,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VENDOR', bold: true, size: 22 })] }),
                bodyText(''),
                bodyText('Signature: ____________________'),
                bodyText(`Name: ${data.vendorContactName}`),
                bodyText('Date: ____________________'),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  return new Document({
    styles: { default: { document: { run: { font: 'IBM Plex Sans', size: 22 } } } },
    sections: [{ children }],
  });
}

// ──────────────────── FORM SUMMARY ────────────────────

export function generateFormSummary(data: ContractFormData): Document {
  const deliverableRows = data.deliverables.map(
    (d) =>
      new TableRow({
        children: [dataCell(d.name), dataCell(d.description), dataCell(formatDate(d.dueDate))],
      }),
  );

  const milestoneRows = data.paymentMilestones.map(
    (m) =>
      new TableRow({
        children: [dataCell(m.name), dataCell(formatCurrency(m.amount)), dataCell(formatDate(m.dueDate))],
      }),
  );

  const children = [
    heading('CONTRACT FORM SUMMARY'),
    bodyText(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`),
    bodyText(`Document Type: ${data.isAmendment ? `Amendment ${data.amendmentNumber}` : 'New Contract'}`),

    heading('VENDOR INFORMATION', HeadingLevel.HEADING_2),
    labelValue('Legal Name', data.vendorLegalName),
    labelValue('Address', data.vendorAddress),
    labelValue('Contact', data.vendorContactName),
    labelValue('Email', data.vendorEmail),

    heading('PROJECT DETAILS', HeadingLevel.HEADING_2),
    labelValue('Project Name', data.projectName),
    labelValue('Start Date', formatDate(data.startDate)),
    labelValue('End Date', formatDate(data.endDate)),
    labelValue('Total Value', formatCurrency(data.totalValue)),
    bodyText(data.projectDescription),

    heading('DELIVERABLES', HeadingLevel.HEADING_2),
    ...(data.deliverables.length > 0
      ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell('Deliverable'), headerCell('Description'), headerCell('Due Date')] }),
              ...deliverableRows,
            ],
          }),
        ]
      : [bodyText('None specified.')]),

    heading('PAYMENT MILESTONES', HeadingLevel.HEADING_2),
    ...(data.paymentMilestones.length > 0
      ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell('Milestone'), headerCell('Amount'), headerCell('Due Date')] }),
              ...milestoneRows,
            ],
          }),
        ]
      : [bodyText('None specified.')]),

    heading('ACCEPTANCE CRITERIA', HeadingLevel.HEADING_2),
    bodyText(data.acceptanceCriteria || 'None specified.'),

    heading('CONTRACT OPTIONS', HeadingLevel.HEADING_2),
    labelValue('Include PSA', data.includePSA ? 'Yes' : 'No'),
    labelValue('Amendment Mode', data.isAmendment ? 'Yes' : 'No'),
    ...(data.isAmendment
      ? [
          labelValue('Amendment Number', data.amendmentNumber),
          labelValue('Original Contract Date', formatDate(data.originalContractDate)),
        ]
      : []),
  ];

  return new Document({
    styles: { default: { document: { run: { font: 'IBM Plex Sans', size: 22 } } } },
    sections: [{ children }],
  });
}

// ──────────────────── Helpers ────────────────────

export async function documentToBlob(doc: Document): Promise<Blob> {
  const buffer = await Packer.toBlob(doc);
  return buffer;
}
