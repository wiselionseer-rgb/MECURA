import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Message, useStore } from '../store/useStore';
import { enrichMedicationDetails } from '../data/cbdGuide';

export interface PrescriptionItemData {
  name: string;
  brand?: string;
  origin?: string;
  type?: string;
  activeIngredients?: string;
  concentration?: string;
  pharmaceuticalForm?: string;
  quantity?: string;
  administrationRoute?: string;
  dosage: string[];
  description?: string;
}

export interface PatientPrescriptionData {
  birthDate?: string;
  cpf?: string;
  phone?: string;
  emissionDate?: string;
  customPatientName?: string;
  customDoctorName?: string;
  customDoctorCrm?: string;
  customDoctorSpecialty?: string;
  customItems?: PrescriptionItemData[];
  customNotes?: string;
}

export const isNationalProduct = (item: PrescriptionItemData): boolean => {
  const originLower = (item.origin || '').toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  const nameLower = (item.name || '').toLowerCase();

  return (
    originLower.includes('nacional') ||
    originLower.includes('associação') ||
    originLower.includes('associacao') ||
    brandLower.includes('associação') ||
    brandLower.includes('associacao') ||
    brandLower.includes('nacional') ||
    /associação|nacional|óleo integral|pomada|flor|flores/i.test(nameLower)
  );
};

export const generatePrescriptionPDF = (
  userName: string, 
  messages: Message[],
  patientData?: PatientPrescriptionData
) => {
  const doc = new jsPDF();

  const sanitize = (text: string) => {
    return (text || '')
      .replace(/[–—]/g, '-')
      .replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const rawUserName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);

  const storeState = useStore.getState();
  const birthDateText = sanitize(patientData?.birthDate || storeState.userBirthDate || storeState.answers?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || storeState.userCpf || storeState.answers?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');

  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  // Gather items
  let itemsToRender: PrescriptionItemData[] = [];
  if (patientData?.customItems && patientData.customItems.length > 0) {
    itemsToRender = patientData.customItems;
  } else {
    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        itemsToRender.push({
          name: m.productData.name,
          brand: m.productData.brand,
          origin: m.productData.origin || 'Importado',
          dosage: m.productData.dosage || [],
          description: m.productData.description
        });
      }
    });
  }

  const customNotesText = patientData?.customNotes !== undefined
    ? patientData.customNotes
    : messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n');

  // Separate into National vs. Imported
  const nationalItems = itemsToRender.filter(isNationalProduct);
  const importedItems = itemsToRender.filter(item => !isNationalProduct(item));

  const hasNational = nationalItems.length > 0;
  const hasImported = importedItems.length > 0;

  const renderSingleGuide = (
    guideTitle: string,
    guideSubtitle: string,
    guideItems: PrescriptionItemData[],
    notesText: string,
    isFirstPage: boolean
  ) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    // Header Dark Banner
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 45, 'F');

    // Clinic Logo
    doc.setTextColor(212, 175, 55); // Dourado (Mecura gold)
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("mecura", 20, 28);

    // Document Title & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(guideTitle, 190, 22, { align: "right" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(212, 175, 55);
    doc.text(guideSubtitle, 190, 31, { align: "right" });

    // Golden decorative line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(0, 45, 210, 45);

    // Patient Info Section
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DO PACIENTE", 20, 58);

    doc.setLineWidth(0.5);
    doc.setDrawColor(212, 175, 55);
    doc.line(20, 61, 190, 61);

    // Line 1: Name and Emission Date
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Nome:", 20, 69);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sanitizedUserName}`, 33, 69);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Emissão:", 140, 69);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${emissionDateStr}`, 158, 69);

    // Line 2: Birth Date and CPF
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Data de Nasc.:", 20, 77);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${birthDateText}`, 47, 77);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("CPF:", 140, 77);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${cpfText}`, 152, 77);

    // Prescription Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("PRESCRIÇÃO TERAPÊUTICA", 20, 91);

    doc.setDrawColor(212, 175, 55);
    doc.line(20, 94, 190, 94);

    let yPos = 104;

    if (guideItems.length === 0 && !notesText) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Nenhum produto ou orientação prescrita nesta guia.", 20, yPos);
      yPos += 15;
    } else {
      let itemIdx = 1;
      guideItems.forEach((product) => {
        const enriched = enrichMedicationDetails(product.name, product.brand, product.origin, product.type);
        const activeIng = sanitize(product.activeIngredients || enriched.activeIngredients);
        const pharmForm = sanitize(product.pharmaceuticalForm || enriched.pharmaceuticalForm);
        const quantity = sanitize(product.quantity || enriched.quantity);
        const admRoute = sanitize(product.administrationRoute || enriched.administrationRoute);

        if (yPos > 215) {
          doc.addPage();
          yPos = 30;
        }

        // Product Numbering & Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(212, 175, 55); // Gold
        doc.text(`${itemIdx}.`, 20, yPos);

        doc.setTextColor(20, 20, 20);
        const sanitizedProductName = sanitize(product.name || 'Medicamento Fitocanabinoide');
        const splitProductName = doc.splitTextToSize(sanitizedProductName, 160);
        doc.text(splitProductName, 28, yPos);

        // Brand & Origin
        yPos += (splitProductName.length * 5) + 1;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const sanitizedBrand = sanitize(product.brand || enriched.brand);
        const sanitizedOrigin = sanitize(product.origin || enriched.origin);
        doc.text(`Fabricante: ${sanitizedBrand} | Origem: ${sanitizedOrigin}`, 28, yPos);

        // Active Ingredient & Concentration
        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text("Princípio Ativo & Concentração:", 28, yPos);

        yPos += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        const splitActiveIng = doc.splitTextToSize(activeIng, 160);
        for (let i = 0; i < splitActiveIng.length; i++) {
          if (yPos > 245) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(splitActiveIng[i], 28, yPos);
          yPos += 4.5;
        }

        // Presentation & Route
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text("Apresentação & Via:", 28, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`${pharmForm} | Qtd: ${quantity} | ${admRoute}`, 65, yPos);
        yPos += 5.5;

        // Posology
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text("Posologia e Modo de Uso:", 28, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        yPos += 5;
        const dosageArr = Array.isArray(product.dosage) ? product.dosage : [String(product.dosage || '')];
        const dosageText = sanitize(dosageArr.join('\n'));
        const splitDosage = doc.splitTextToSize(dosageText, 160);

        for (let i = 0; i < splitDosage.length; i++) {
          if (yPos > 245) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(splitDosage[i], 28, yPos);
          yPos += 4.5;
        }
        yPos += 6;
        itemIdx++;
      });

      if (notesText && notesText.trim()) {
        if (yPos > 215) {
          doc.addPage();
          yPos = 30;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(212, 175, 55);
        doc.text(`${itemIdx}.`, 20, yPos);

        doc.setTextColor(20, 20, 20);
        doc.text(`Orientações Farmacológicas e Clínicas:`, 28, yPos);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        yPos += 6;
        const sanitizedNotes = sanitize(notesText);
        const splitNotes = doc.splitTextToSize(sanitizedNotes, 160);

        for (let i = 0; i < splitNotes.length; i++) {
          if (yPos > 245) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(splitNotes[i], 28, yPos);
          yPos += 4.5;
        }
        yPos += 6;
      }
    }

    // Signature Block at the bottom of THIS guide (independent prescription)
    const pageHeight = doc.internal.pageSize.height;
    if (yPos > pageHeight - 65) {
      doc.addPage();
    }

    // Signature Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([], 0);
    doc.line(60, pageHeight - 48, 150, pageHeight - 48);

    // Doctor Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(docName, 105, pageHeight - 40, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text(docCrm, 105, pageHeight - 34, { align: "center" });
    doc.text(docSpec, 105, pageHeight - 29, { align: "center" });

    // Digital Signature / Stamp Box
    doc.setDrawColor(180, 180, 180);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(60, pageHeight - 82, 90, 30);
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Espaço para Assinatura e Carimbo Digital", 105, pageHeight - 66, { align: "center" });
    doc.setLineDashPattern([], 0);
  };

  // Decide how to render guides
  if (hasNational && hasImported) {
    // Guia 1: Nacionais
    renderSingleGuide(
      "RECEITA MÉDICA",
      "GUIA 1: PRODUTOS NACIONAIS (ASSOCIAÇÃO BRASILEIRA)",
      nationalItems,
      customNotesText,
      true
    );

    // Guia 2: Importados
    renderSingleGuide(
      "RECEITA MÉDICA",
      "GUIA 2: PRODUTOS IMPORTADOS (ANVISA RDC 660)",
      importedItems,
      customNotesText,
      false
    );
  } else if (hasNational) {
    // Apenas Nacionais
    renderSingleGuide(
      "RECEITA MÉDICA",
      "PRODUTOS NACIONAIS / ASSOCIAÇÃO BRASILEIRA",
      nationalItems,
      customNotesText,
      true
    );
  } else if (hasImported) {
    // Apenas Importados
    renderSingleGuide(
      "RECEITA MÉDICA",
      "PRODUTOS IMPORTADOS / ANVISA (RDC 660)",
      importedItems,
      customNotesText,
      true
    );
  } else {
    // Fallback: todos juntos
    renderSingleGuide(
      "RECEITA MÉDICA",
      "RECEITUÁRIO MÉDICO ESPECIALIZADO",
      itemsToRender,
      customNotesText,
      true
    );
  }
  
  const fileName = `Receita_${sanitizedUserName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(fileName);
};

export interface MedicalReportData {
  birthDate?: string;
  cpf?: string;
  phone?: string;
  emissionDate?: string;
  answers?: any;
  analysisText?: string | null;
  customPatientName?: string;
  customDoctorName?: string;
  customDoctorCrm?: string;
  customDoctorSpecialty?: string;
  customDiagnosis?: string;
  customRationale?: string;
  customItems?: PrescriptionItemData[];
  customTreatmentPlan?: string;
  customMonitoring?: string;
}

export const generateMedicalReportPDF = (
  userName: string,
  messages: Message[],
  patientData?: MedicalReportData
) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for adding sanitized text
  const sanitize = (text: string) => {
    return (text || '')
      .replace(/[–—]/g, '-')
      .replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const storeState = useStore.getState();
  const patientAnswers = patientData?.answers || storeState.answers;
  const rawPatientName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawPatientName);
  const birthDateText = sanitize(patientData?.birthDate || storeState.userBirthDate || patientAnswers?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || storeState.userCpf || patientAnswers?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');

  const doctorName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const doctorCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const doctorSpecialty = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  // Cabeçalho
  const renderHeader = (pageNumber: number) => {
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(212, 175, 55); // Dourado
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("mecura", margin, 26);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAUDO MÉDICO CLÍNICO", 125, 26);

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(0, 42, 210, 42);
  };

  const renderFooter = (pageNumber: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text("Mecura Medicina Integrativa | Documento emitido para fins de acompanhamento e suporte terapêutico", margin, pageHeight - 10);
    doc.text(`Pág. ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  };

  let currentPage = 1;
  renderHeader(currentPage);

  let yPos = 54;

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - 35) {
      renderFooter(currentPage);
      doc.addPage();
      currentPage++;
      renderHeader(currentPage);
      yPos = 52;
    }
  };

  // 1. Dados do Paciente
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. IDENTIFICAÇÃO DO PACIENTE", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Nome do Paciente:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(sanitizedUserName, margin + 35, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Data de Emissão:", 135, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(emissionDateStr, 167, yPos);

  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Data de Nasc.:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(birthDateText, margin + 27, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("CPF:", 135, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(cpfText, 147, yPos);

  // 2. Diagnóstico e Quadro Clínico
  yPos += 12;
  checkPageBreak(30);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. DIAGNÓSTICO E QUADRO CLÍNICO", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade e dor crônica';
  const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
  const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
  const description = patientAnswers?.description || 'Paciente relata persistência dos sintomas refratários aos tratamentos convencionais de primeira linha, com impacto expressivo na qualidade de vida, repouso noturno e funcionalidade global.';

  const defaultClinicalSummary = `O(A) paciente supramencionado(a) compareceu a atendimento médico e foi submetido(a) a minuciosa avaliação clínica. Apresenta sintomatologia compatível com ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}. 

História da Moléstia: ${description}

Tratamento prévio com fármacos convencionais: ${patientAnswers?.remedios ? 'Sim' : 'Não'} | Diagnóstico de Comorbidade Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}.`;

  const clinicalSummary = patientData?.customDiagnosis || defaultClinicalSummary;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  const splitClinical = doc.splitTextToSize(sanitize(clinicalSummary), contentWidth);
  for (const line of splitClinical) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 5;
  }

  // 3. Fisiopatologia e Racional Terapêutico Canabinoide
  yPos += 6;
  checkPageBreak(35);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. JUSTIFICATIVA E RACIONAL DO TRATAMENTO", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const defaultTherapeuticRationale = `A terapêutica com Fitocanabinoides (Cannabis Medicinal) fundamenta-se na modulação do Sistema Endocanabinoide (SEC), uma complexa rede de sinalização neuromoduladora e imunológica composta por receptores CB1 e CB2.

- Modulação Neuroquímica e Anti-inflamatória: O Canabidiol (CBD) atua como modulador alostérico negativo de CB1 e inibidor da degradação de anandamida (via FAAH), promovendo ação ansiolítica, neuroprotetora e redução de citocinas pró-inflamatórias.
- Efeito Comitiva (Entourage Effect): A administração de extratos integrais (Full Spectrum) contendo canabinoides menores (CBG, CBN e microdosagens de THC) e terpenos sinérgicos proporciona potencialização da resposta terapêutica com menor necessidade de escalonamento de doses.
- Adequação Clínica: Diante da refratariedade e da necessidade de estabilização sintomática sem os efeitos colaterais deletérios de medicações sedativas ou anti-inflamatórios convencionais a longo prazo, justifica-se a instituição do tratamento fitocanabinoide.`;

  const therapeuticRationale = patientData?.customRationale || defaultTherapeuticRationale;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  const splitRationale = doc.splitTextToSize(sanitize(therapeuticRationale), contentWidth);
  for (const line of splitRationale) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 5;
  }

  // 4. Plano de Tratamento e Medicamentos Prescritos
  yPos += 6;
  checkPageBreak(35);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. CONDUTA E MEDICAMENTOS PROPOSTOS", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  let itemsToRender: PrescriptionItemData[] = [];
  if (patientData?.customItems && patientData.customItems.length > 0) {
    itemsToRender = patientData.customItems;
  } else {
    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        itemsToRender.push({
          name: m.productData.name,
          brand: m.productData.brand,
          origin: m.productData.origin || 'Importado',
          dosage: m.productData.dosage || [],
          description: m.productData.description
        });
      }
    });
  }

  const customNotesText = patientData?.customTreatmentPlan !== undefined
    ? patientData.customTreatmentPlan
    : messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n');

  if (itemsToRender.length > 0 || (customNotesText && customNotesText.trim())) {
    let itemIdx = 1;
    itemsToRender.forEach((p) => {
      const enriched = enrichMedicationDetails(p.name, p.brand, p.origin, p.type);
      const activeIng = (p.activeIngredients || enriched.activeIngredients).replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
      const pharmForm = (p.pharmaceuticalForm || enriched.pharmaceuticalForm).replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
      const quantity = (p.quantity || enriched.quantity).replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
      const admRoute = (p.administrationRoute || enriched.administrationRoute).replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');

      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55);
      doc.text(`Item ${itemIdx}: ${sanitize(p.name)}`, margin, yPos);
      
      yPos += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`Origem: ${sanitize(p.origin || enriched.origin)} | Fabricante: ${sanitize(p.brand || enriched.brand)}`, margin + 3, yPos);

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text("Princípio Ativo:", margin + 3, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      const splitActive = doc.splitTextToSize(sanitize(activeIng), contentWidth - 35);
      doc.text(splitActive[0], margin + 30, yPos);
      for (let i = 1; i < splitActive.length; i++) {
        yPos += 4.5;
        doc.text(splitActive[i], margin + 3, yPos);
      }

      yPos += 4.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Apresentação & Via:", margin + 3, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(`${pharmForm} | Qtd: ${quantity} | ${admRoute}`, margin + 38, yPos);

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("Posologia e Modo de Uso:", margin + 3, yPos);

      yPos += 4;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      const dosageArr = Array.isArray(p.dosage) ? p.dosage : [String(p.dosage || '')];
      const dosageLines = doc.splitTextToSize(sanitize(dosageArr.join(' ')), contentWidth - 6);
      for (const dl of dosageLines) {
        checkPageBreak(5);
        doc.text(dl, margin + 3, yPos);
        yPos += 4.5;
      }
      yPos += 3;
      itemIdx++;
    });

    if (customNotesText && customNotesText.trim()) {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55);
      doc.text(`Item ${itemIdx}: Orientações e Prescrição Médica`, margin, yPos);
      
      yPos += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const noteLines = doc.splitTextToSize(sanitize(customNotesText), contentWidth - 6);
      for (const nl of noteLines) {
        checkPageBreak(5);
        doc.text(nl, margin + 3, yPos);
        yPos += 4.5;
      }
      yPos += 3;
    }
  } else {
    // Default therapeutic guideline if no items in chat
    const defaultMedicationPlan = `1. Formulação Predominante em CBD Full Spectrum (ou Óleo Integral Associação Nacional):
   - Posologia: Iniciar com 5 gotas sublinguais a cada 12 horas, com titulação gradual a cada 3 a 5 dias.
2. Manejo Noturno / Resgate Álgico (conforme necessidade clínica):
   - Posologia: 5 a 10 gotas à noite ou formulação complementar sob monitoramento.`;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    const splitDefaultPlan = doc.splitTextToSize(sanitize(defaultMedicationPlan), contentWidth);
    for (const line of splitDefaultPlan) {
      checkPageBreak(5);
      doc.text(line, margin, yPos);
      yPos += 4.5;
    }
  }

  // 5. Orientações de Titulação e Retorno
  yPos += 6;
  checkPageBreak(30);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5. MONITORAMENTO E RECOMENDAÇÕES", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 7;
  const defaultMonitoringText = `- Titulação Lenta e Progressiva ("Start Low, Go Slow"): Ajustar a dosagem gradualmente até atingir a janela terapêutica ideal com controle pleno de sintomas e ausência de efeitos adversos.
- Monitoramento de Segurança: Acompanhar potenciais interações no citocromo hepático CYP3A4 / CYP2C19 caso haja uso concomitante de outros fármacos.
- Retorno Médico: Reavaliação clínica agendada em 30 (trinta) dias para ajuste posológico e consolidação do desfecho clínico.`;

  const monitoringText = patientData?.customMonitoring || defaultMonitoringText;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const splitMonitoring = doc.splitTextToSize(sanitize(monitoringText), contentWidth);
  for (const line of splitMonitoring) {
    checkPageBreak(5);
    doc.text(line, margin, yPos);
    yPos += 4.5;
  }

  // Bloco de Assinatura Médica
  checkPageBreak(45);
  yPos = Math.max(yPos + 8, pageHeight - 48);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(60, yPos, 150, yPos);

  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 10, 10);
  doc.text(doctorName, 105, yPos, { align: "center" });

  yPos += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${doctorCrm} | ${doctorSpecialty}`, 105, yPos, { align: "center" });
  
  yPos += 4;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Documento com Assinatura Digital e Registro Médico ICP-Brasil", 105, yPos, { align: "center" });

  renderFooter(currentPage);

  const fileName = `Laudo_Medico_${sanitizedUserName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(fileName);
};
