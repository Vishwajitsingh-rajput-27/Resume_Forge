import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Preview element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth   = pageWidth;
  const imgHeight  = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  while (y < imgHeight) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
    y += pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

export async function exportToDOCX(resumeData: Record<string, unknown>, filename: string): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
  } = await import('docx');

  const p = resumeData.personalInfo as Record<string, string>;
  const experience = (resumeData.experience as Record<string, unknown>[]) || [];
  const education  = (resumeData.education  as Record<string, unknown>[]) || [];
  const skills     = (resumeData.skills     as { category: string; skills: string[] }[]) || [];
  const projects   = (resumeData.projects   as Record<string, unknown>[]) || [];

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ children: [new TextRun({ text: p.name || '', bold: true, size: 40 })] }),
    ...(p.jobTitle ? [new Paragraph({ children: [new TextRun({ text: p.jobTitle, size: 24, color: '059669' })] })] : []),
    new Paragraph({
      children: [new TextRun({
        text: [p.email, p.phone, p.address, p.linkedin, p.github].filter(Boolean).join(' | '),
        size: 18, color: '6B7280',
      })],
      spacing: { after: 200 },
    }),
  ];

  if (resumeData.summary) {
    children.push(
      new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: resumeData.summary as string, size: 20 })], spacing: { after: 160 } })
    );
  }

  if (experience.length) {
    children.push(new Paragraph({ text: 'WORK EXPERIENCE', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    for (const exp of experience) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: `${exp.role} at ${exp.company}`, bold: true, size: 22 })], spacing: { before: 120 } }),
        ...((exp.responsibilities as string[]) || []).filter(Boolean).map((r) =>
          new Paragraph({ children: [new TextRun({ text: `• ${r}`, size: 20 })], indent: { left: 240 } })
        )
      );
    }
  }

  if (education.length) {
    children.push(new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    for (const edu of education) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${edu.degree} — ${edu.institution}`, bold: true, size: 22 })]
      }));
    }
  }

  if (skills.length) {
    children.push(new Paragraph({ text: 'SKILLS', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    for (const cat of skills) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${cat.category}: `, bold: true, size: 20 }),
          new TextRun({ text: cat.skills.join(', '), size: 20 }),
        ]
      }));
    }
  }

  if (projects.length) {
    children.push(new Paragraph({ text: 'PROJECTS', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    for (const proj of projects) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: proj.name as string, bold: true, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: proj.description as string, size: 20 })], spacing: { after: 80 } })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = new Blob([await Packer.toBlob(doc)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
