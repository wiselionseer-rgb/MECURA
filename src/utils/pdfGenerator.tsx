import React from 'react';
import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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

export const generatePrescriptionPDF = async (
  userName: string, 
  messages: Message[],
  patientData?: PatientPrescriptionData & { returnBlob?: boolean }
): Promise<Blob | void> => {
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
          description: m.productData.description,
          activeIngredients: m.productData.activeIngredients,
          pharmaceuticalForm: m.productData.pharmaceuticalForm,
          quantity: m.productData.quantity,
          administrationRoute: m.productData.administrationRoute
        });
      }
    });
  }

  const customNotesText = patientData?.customNotes !== undefined
    ? patientData.customNotes
    : messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n');

  const nationalItems = itemsToRender.filter(isNationalProduct);
  const importedItems = itemsToRender.filter(item => !isNationalProduct(item));

  const hasNational = nationalItems.length > 0;
  const hasImported = importedItems.length > 0;

  const guidesToRender: { title: string; subtitle: string; items: PrescriptionItemData[]; badge: string }[] = [];

  if (hasNational && hasImported) {
    guidesToRender.push({
      title: "RECEITA MÉDICA",
      subtitle: "GUIA 1: PRODUTOS NACIONAIS (ASSOCIAÇÃO BRASILEIRA)",
      items: nationalItems,
      badge: "Guia 1 - Nacional"
    });
    guidesToRender.push({
      title: "RECEITA MÉDICA",
      subtitle: "GUIA 2: PRODUTOS IMPORTADOS (ANVISA RDC 660)",
      items: importedItems,
      badge: "Guia 2 - Importado"
    });
  } else if (hasNational) {
    guidesToRender.push({
      title: "RECEITA MÉDICA",
      subtitle: "PRODUTOS NACIONAIS / ASSOCIAÇÃO BRASILEIRA",
      items: nationalItems,
      badge: "Guia Única - Nacional"
    });
  } else if (hasImported) {
    guidesToRender.push({
      title: "RECEITA MÉDICA",
      subtitle: "PRODUTOS IMPORTADOS / ANVISA (RDC 660)",
      items: importedItems,
      badge: "Guia Única - Importado"
    });
  } else {
    guidesToRender.push({
      title: "RECEITA MÉDICA",
      subtitle: "RECEITUÁRIO MÉDICO ESPECIALIZADO",
      items: itemsToRender,
      badge: "Guia de Prescrição"
    });
  }

  interface PrescriptionPageData {
    guideTitle: string;
    guideSubtitle: string;
    badge: string;
    pageNumber: number;
    totalPages: number;
    items: PrescriptionItemData[];
    itemStartIndex: number;
    notesText?: string;
  }

  const allPagesToRender: PrescriptionPageData[] = [];

  guidesToRender.forEach(guide => {
    const items = guide.items;
    const hasNotes = Boolean(customNotesText && customNotesText.trim());

    if (items.length <= 1) {
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 1,
        totalPages: 1,
        items: items,
        itemStartIndex: 0,
        notesText: hasNotes ? customNotesText : undefined
      });
    } else if (items.length === 2 && (!hasNotes || customNotesText.length < 250)) {
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 1,
        totalPages: 1,
        items: items,
        itemStartIndex: 0,
        notesText: hasNotes ? customNotesText : undefined
      });
    } else if (items.length === 2) {
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 1,
        totalPages: 2,
        items: items,
        itemStartIndex: 0,
        notesText: undefined
      });
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 2,
        totalPages: 2,
        items: [],
        itemStartIndex: 2,
        notesText: customNotesText
      });
    } else if (items.length === 3) {
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 1,
        totalPages: 2,
        items: items.slice(0, 2),
        itemStartIndex: 0,
        notesText: undefined
      });
      allPagesToRender.push({
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
        badge: guide.badge,
        pageNumber: 2,
        totalPages: 2,
        items: items.slice(2),
        itemStartIndex: 2,
        notesText: hasNotes ? customNotesText : undefined
      });
    } else {
      const chunks: PrescriptionItemData[][] = [];
      for (let i = 0; i < items.length; i += 2) {
        chunks.push(items.slice(i, i + 2));
      }
      const totalP = hasNotes ? chunks.length + 1 : chunks.length;
      let curP = 1;
      let startIdx = 0;
      chunks.forEach((chunk) => {
        allPagesToRender.push({
          guideTitle: guide.title,
          guideSubtitle: guide.subtitle,
          badge: guide.badge,
          pageNumber: curP,
          totalPages: totalP,
          items: chunk,
          itemStartIndex: startIdx,
          notesText: undefined
        });
        startIdx += chunk.length;
        curP++;
      });
      if (hasNotes) {
        allPagesToRender.push({
          guideTitle: guide.title,
          guideSubtitle: guide.subtitle,
          badge: guide.badge,
          pageNumber: curP,
          totalPages: totalP,
          items: [],
          itemStartIndex: startIdx,
          notesText: customNotesText
        });
      }
    }
  });

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        {allPagesToRender.map((page, pIdx) => (
          <div 
            key={pIdx} 
            className="prescription-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between" 
            style={{ 
              width: "794px", 
              height: "1123px", 
              minHeight: "1123px", 
              maxHeight: "1123px", 
              padding: "36px 44px", 
              backgroundColor: "#FFFFFF", 
              color: "#111827",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
          >
            {/* Guide Badge and Page Indicator */}
            <div className="absolute top-5 right-11 flex items-center gap-2">
              <span className="text-[10px] text-[#64748B] font-bold">
                Página {page.pageNumber} de {page.totalPages}
              </span>
              <span className="bg-[#F3E8FF] text-[#581C87] border border-[#D8B4FE] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {page.badge}
              </span>
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-3 mb-4 pt-1">
                <div>
                  <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                  <p className="text-[10px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                    CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                  <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                  <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center my-3">
                <h1 className="text-lg font-bold text-[#1E1B4B] uppercase tracking-widest m-0 leading-tight">
                  {page.guideTitle}
                </h1>
                <p className="text-xs font-semibold text-[#059669] tracking-wider uppercase mt-1 m-0">
                  {page.guideSubtitle}
                </p>
                <div className="w-16 h-0.5 bg-[#059669] mx-auto mt-1.5" />
              </div>

              {/* Patient Info Box */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-[#64748B] block text-[9px] uppercase font-bold mb-0.5">Paciente</span>
                  <span className="font-bold text-[#0F172A] text-sm">{sanitizedUserName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[9px] uppercase font-bold mb-0.5">CPF / Nasc.</span>
                  <span className="font-semibold text-[#334155] text-xs">{cpfText} • {birthDateText}</span>
                </div>
              </div>

              {/* Items List for this page */}
              {page.items.length > 0 && (
                <div className="space-y-4 my-3">
                  {page.items.map((item, idx) => {
                    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                    const activeIng = item.activeIngredients || enriched.activeIngredients;
                    const pharmForm = item.pharmaceuticalForm || enriched.pharmaceuticalForm;
                    const quantity = item.quantity || enriched.quantity;
                    const admRoute = item.administrationRoute || enriched.administrationRoute;
                    const displayIndex = page.itemStartIndex + idx + 1;

                    return (
                      <div key={idx} className="border-b border-[#F1F5F9] pb-3">
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-bold text-[#0F172A] m-0">
                            {displayIndex}. {item.name}
                          </span>
                          <span className="text-[10px] bg-[#F1F5F9] text-[#334155] font-bold px-2 py-0.5 rounded border border-[#E2E8F0] m-0">
                            {item.brand || enriched.brand} ({item.origin || enriched.origin})
                          </span>
                        </div>

                        {/* Active Ingredient & Presentation */}
                        <div className="pl-4 mb-2 space-y-0.5 text-xs text-[#475569]">
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Princípio Ativo:</span> {activeIng}</p>
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
                        </div>

                        {/* Dosage */}
                        <div className="pl-4 space-y-0.5 text-xs text-[#334155]">
                          <span className="font-semibold text-[#1E293B] block text-[11px] mb-0.5">Posologia e Modo de Uso:</span>
                          {item.dosage.map((d, dIdx) => (
                            <p key={dIdx} className="m-0 leading-relaxed text-[11px]">• {d}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes block if present on this page */}
              {page.notesText && (
                <div className="bg-[#F8FAFC] border-l-2 border-[#1E1B4B] p-3.5 text-xs text-[#334155] mt-3 rounded-r">
                  <span className="font-bold block text-[11px] uppercase text-[#475569] mb-1">Orientações Farmacológicas e Clínicas</span>
                  <div className="flex flex-col gap-1">
                    {page.notesText.split('\n').map((p, i) => p.trim() ? (
                      <p key={i} className="text-[10.5px] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: p }} />
                    ) : null)}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Signature & Emission Footer present on EVERY SINGLE PAGE */}
            <div className="pt-4 border-t border-[#E2E8F0] mt-auto flex justify-between items-end">
              <div className="text-[10px] text-[#64748B] space-y-0.5">
                <p className="m-0 font-medium">Data de Emissão: {emissionDateStr}</p>
                <p className="m-0">Validade: 30 dias a partir da data de emissão</p>
                <p className="text-[9px] text-[#94A3B8] mt-0.5 m-0">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022</p>
              </div>

              <div className="text-center w-56">
                <div className="border-b border-[#94A3B8] pb-1 mb-1.5" />
                <p className="text-xs font-bold text-[#0F172A] m-0">{docName}</p>
                <p className="text-[10px] text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[9px] text-[#64748B] m-0">Assinatura Digital / Prescritor</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  try {
    // Wait for React to render and Tailwind to apply styles
    await new Promise(resolve => setTimeout(resolve, 800));

    const pageElements = container.querySelectorAll<HTMLElement>('.prescription-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Receita_Medica_${sanitizedUserName}.pdf`;
    let resultBlob: Blob | undefined;
    if (patientData?.returnBlob) {
      resultBlob = pdf.output('blob');
    } else {
      pdf.save(filename);
    }
    return resultBlob;
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};



export const generateMedicalReportPDF = async (userName: string, messages?: any, patientData?: any) => {
  const sanitize = (text: string) => {
    return (text || '').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const rawUserName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);
  
  const birthDateText = sanitize(patientData?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  const diag = patientData?.customDiagnosis || '';
  const rat = patientData?.customRationale || '';
  const plan = patientData?.customTreatmentPlan || '';
  const mon = patientData?.customMonitoring || '';

  const totalLength = diag.length + rat.length + plan.length + mon.length;
  const needsTwoPages = totalLength > 800 || (Boolean(diag && rat) && Boolean(plan && mon));

  interface ReportPageData {
    pageNumber: number;
    totalPages: number;
    title: string;
    sections: { title: string; content: string }[];
  }

  const reportPages: ReportPageData[] = [];

  if (!needsTwoPages) {
    const sections: { title: string; content: string }[] = [];
    if (diag) sections.push({ title: 'Diagnóstico e Resumo Clínico', content: diag });
    if (rat) sections.push({ title: 'Raciocínio Terapêutico', content: rat });
    if (plan) sections.push({ title: 'Plano de Tratamento Canabinoide', content: plan });
    if (mon) sections.push({ title: 'Acompanhamento e Monitoramento', content: mon });

    reportPages.push({
      pageNumber: 1,
      totalPages: 1,
      title: 'LAUDO MÉDICO',
      sections
    });
  } else {
    const page1Sections: { title: string; content: string }[] = [];
    if (diag) page1Sections.push({ title: 'Diagnóstico e Resumo Clínico', content: diag });
    if (rat) page1Sections.push({ title: 'Raciocínio Terapêutico', content: rat });

    const page2Sections: { title: string; content: string }[] = [];
    if (plan) page2Sections.push({ title: 'Plano de Tratamento Canabinoide', content: plan });
    if (mon) page2Sections.push({ title: 'Acompanhamento e Monitoramento', content: mon });

    reportPages.push({
      pageNumber: 1,
      totalPages: 2,
      title: 'LAUDO MÉDICO',
      sections: page1Sections
    });
    reportPages.push({
      pageNumber: 2,
      totalPages: 2,
      title: 'LAUDO MÉDICO (CONTINUAÇÃO)',
      sections: page2Sections
    });
  }

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        {reportPages.map((page, pIdx) => (
          <div 
            key={pIdx}
            className="medical-report-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between" 
            style={{ 
              width: "794px", 
              height: "1123px", 
              minHeight: "1123px", 
              maxHeight: "1123px", 
              padding: "36px 44px", 
              backgroundColor: "#FFFFFF", 
              color: "#111827",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
          >
            {/* Page number */}
            <div className="absolute top-5 right-11 text-[10px] text-[#64748B] font-bold">
              Página {page.pageNumber} de {page.totalPages}
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-3 mb-4 pt-1">
                <div>
                  <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                  <p className="text-[10px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                    CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                  <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                  <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-5">
                <h1 className="text-lg font-black text-[#1E1B4B] tracking-widest uppercase mb-2">{page.title}</h1>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-2 text-sm text-[#475569]">
                    <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                    <span className="font-semibold">{sanitizedUserName}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                    {birthDateText !== 'Não informada' && (
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDateText}
                      </span>
                    )}
                    {cpfText !== 'Não informado' && (
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#475569]">CPF:</span> {cpfText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sections for this page */}
              <div className="space-y-5">
                {page.sections.map((sec, sIdx) => (
                  <div key={sIdx}>
                    <h4 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">
                      {sec.title}
                    </h4>
                    <div className="text-xs text-[#334155] leading-relaxed flex flex-col gap-1.5 text-justify">
                      {sec.content.split('\n').map((p, i) => p.trim() ? (
                        <p key={i} className="m-0">{p}</p>
                      ) : <div key={i} className="h-1" />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Signature & Emission Footer present on EVERY SINGLE PAGE */}
            <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
              <div className="flex flex-col items-center">
                <div className="w-56 h-0 border-b border-[#CBD5E1] mb-1.5"></div>
                <p className="text-xs font-bold text-[#1E1B4B] m-0">{docName}</p>
                <p className="text-[10px] text-[#64748B] m-0 mb-2">{docCrm} • Assinatura Digital / Prescritor</p>
                <div className="flex justify-between w-full text-[9px] text-[#94A3B8] font-semibold">
                  <span>Data de Emissão: {emissionDateStr}</span>
                  <span>Válido em todo o território nacional</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    const pageElements = container.querySelectorAll<HTMLElement>('.medical-report-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Laudo_Medico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;
    let resultBlob: Blob | undefined;
    if (patientData?.returnBlob) {
      resultBlob = pdf.output('blob');
    } else {
      pdf.save(filename);
    }
    return resultBlob;
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};



export const generatePsychomotorReportPDF = async (userName: string, patientData?: any) => {
  const sanitize = (text: string) => {
    return (text || '').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const rawUserName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);
  
  const birthDateText = sanitize(patientData?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  const defaultParagraphs = [
    `Declaro, para os devidos fins de direito, que o(a) paciente <strong>${sanitizedUserName}</strong>, inscrito(a) no CPF <strong>${cpfText}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide.`,
    `O(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme prescrição médica, sob supervisão e com acompanhamento clínico contínuo.`,
    `Atesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, <strong>NÃO RESULTA</strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou comprometimento dos reflexos e estado de alerta do paciente.`,
    `O tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).`,
    `Ressalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de causar dependência ou prejuízo sensório-motor nas doses tituladas.`
  ];

  const customText = patientData?.customPsychomotorText;
  const paragraphs = customText ? customText.split('\n').filter((p: string) => p.trim()) : defaultParagraphs;

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        <div 
          className="psychomotor-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between" 
          style={{ 
            width: "794px", 
            height: "1123px", 
            minHeight: "1123px", 
            maxHeight: "1123px", 
            padding: "36px 44px", 
            backgroundColor: "#FFFFFF", 
            color: "#111827",
            boxSizing: "border-box",
            overflow: "hidden"
          }}
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-3 mb-4 pt-1">
              <div>
                <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                <p className="text-[10px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                  CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-black text-[#1E1B4B] tracking-widest uppercase mb-1">LAUDO PSICOMOTOR</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#059669] mb-3">AVALIAÇÃO DA LEI DO DROGÔMETRO / APTIDÃO</p>
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2 text-sm text-[#475569]">
                  <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                  <span className="font-semibold">{sanitizedUserName}</span>
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                  {birthDateText !== 'Não informada' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDateText}
                    </span>
                  )}
                  {cpfText !== 'Não informado' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">CPF:</span> {cpfText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Statement Paragraphs */}
            <div className="space-y-3.5 text-xs text-[#334155] leading-relaxed text-justify">
              {paragraphs.map((p: string, i: number) => (
                <p key={i} className="m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>

          {/* Doctor Signature & Emission Footer */}
          <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
            <div className="flex flex-col items-center">
              <div className="w-56 h-0 border-b border-[#CBD5E1] mb-1.5"></div>
              <p className="text-xs font-bold text-[#1E1B4B] m-0">{docName}</p>
              <p className="text-[10px] text-[#64748B] m-0 mb-2">{docCrm} • Assinatura Digital / Prescritor</p>
              <div className="flex justify-between w-full text-[9px] text-[#94A3B8] font-semibold">
                <span>Data de Emissão: {emissionDateStr}</span>
                <span>Válido em todo o território nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    const pageElements = container.querySelectorAll<HTMLElement>('.psychomotor-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Laudo_Psicomotor_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;
    let resultBlob: Blob | undefined;
    if (patientData?.returnBlob) {
      resultBlob = pdf.output('blob');
    } else {
      pdf.save(filename);
    }
    return resultBlob;
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

export interface AgronomicReportData {
  customPatientName?: string;
  cpf?: string;
  birthDate?: string;
  emissionDate?: string;
  agronomistName?: string;
  agronomistCrea?: string;
  diagnosis?: string;
  prescribedProducts?: string;
  dailyDoseMg?: number;
  targetPlants?: number;
  plantsPerCycle?: number;
  seedsNeeded?: number;
  dryFlowerKg?: string;
  dryFlowerMarginKg?: string;
  wetFlowerKg?: string;
  htmlContent?: string;
  customText?: string;
  returnBlob?: boolean;
}

export const generateAgronomicReportPDF = async (userName: string, agronomicData?: AgronomicReportData) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const sanitizedUserName = (agronomicData?.customPatientName || userName || 'LUCAS DANIEL NERES').toUpperCase();
  const patientCpf = agronomicData?.cpf || '057.436.591-50';
  const emissionDate = agronomicData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  const agronomistName = agronomicData?.agronomistName || 'Wilian Dalenogare Pereira';
  const agronomistCrea = agronomicData?.agronomistCrea || 'CREA-PR 172.458/D';
  const diagnosis = agronomicData?.diagnosis || 'Transtorno de Distúrbios no Sono (CID 10 G47) e Lombalgia (CID 10 R54.5 / M54.5)';
  const dailyMg = agronomicData?.dailyDoseMg || 5900;

  // Technical calculations based on agronomic standards
  const monthlyMg = Math.round(dailyMg * 31);
  const annualMg = Math.round(dailyMg * 365);
  const monthlyGrams = (monthlyMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const annualGrams = (annualMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const annualGramsNum = (annualMg / 1000);

  // Fitoquímica: teor médio de 10% nas inflorescências secas; extração caseira recupera ~80%
  const dryFlowerKgBase = Number(((annualGramsNum / 0.10) / 1000).toFixed(3)); // ex: 18.250 kg
  const dryFlowerKgStr = dryFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Margem de segurança agronômica de 30% contra pragas, doenças e perdas de cultivo
  const dryFlowerMarginKgBase = Number((dryFlowerKgBase * 1.3038).toFixed(3)); // ex: 23.795 kg
  const dryFlowerMarginKgStr = dryFlowerMarginKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Perda de umidade na secagem: as inflorescências perdem entre 70% a 80% do peso em água
  // Flores frescas molhadas necessárias:
  const wetFlowerKgBase = Number((dryFlowerMarginKgBase / 0.30).toFixed(3)); // ex: 79.319 kg
  const wetFlowerKgStr = wetFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Rendimento médio por planta no cultivo indoor (paciente): 100g a 150g de flores secas por ciclo de 120 dias
  const calculatedPlants = Math.round((dryFlowerMarginKgBase * 1000) / 150); // ex: 158 plantas
  const targetPlants = agronomicData?.targetPlants || calculatedPlants || 158;

  // Divisão em 3 momentos de colheita ao longo do ano: 38 a 40 plantas por ciclo de floração
  const plantsPerCycle = agronomicData?.plantsPerCycle || Math.round(targetPlants / 4) || 40;

  // Importação estimada de sementes feminizadas com taxa de segurança de 30%:
  const seedsNeeded = agronomicData?.seedsNeeded || Math.round(targetPlants * 1.3038) || 206;

  const PdfComponent = () => {
    if (agronomicData?.htmlContent) {
      return (
        <div style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#000000', padding: '40px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          <div dangerouslySetInnerHTML={{ __html: agronomicData.htmlContent }} />
        </div>
      );
    }

    return (
      <div style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#1E293B', fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
        
        {/* ========================================================================= */}
        {/* PÁGINA 1: IDENTIFICAÇÃO, RESUMO REGULATÓRIO & JUSTIFICATIVA DO AUTOCULTIVO */}
        {/* ========================================================================= */}
        <div 
          className="agronomic-pdf-page"
          style={{ 
            width: '794px', 
            height: '1120px', 
            maxHeight: '1120px', 
            overflow: 'hidden', 
            padding: '36px 44px', 
            boxSizing: 'border-box', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div>
            {/* Header Oficial Mecura */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #065F46', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: '#065F46', letterSpacing: '-0.5px' }}>MECURA</span>
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', border: '1px solid #A7F3D0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    LAUDO TÉCNICO PERICIAL
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#475569', fontWeight: '600' }}>
                  Centro Integrado de Medicina Canabinoide & Assessoria Pericial em Fitotecnia
                </p>
                <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#059669', fontWeight: '600' }}>
                  Boas Práticas de Agricultura e Coleta (GACP / OMS) • Salvo-Conduto para Autocultivo
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: '800', color: '#065F46', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  HABEAS CORPUS PREVENTIVO
                </span>
                <p style={{ margin: '3px 0 0 0', fontSize: '10px', fontWeight: '700', color: '#0F172A' }}>AUTOCULTIVO MEDICINAL</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', color: '#64748B' }}>Data de Emissão: <strong>{emissionDate}</strong></p>
              </div>
            </div>

            {/* Título Principal */}
            <div style={{ textAlign: 'center', marginBottom: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px' }}>
              <h1 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Auto cultivo para finalidade medicinal — Parecer Técnico
              </h1>
              <p style={{ margin: '3px 0 0 0', fontSize: '10.5px', fontWeight: '600', color: '#334155' }}>
                Indicações técnicas para cultivo pessoal de <em>Cannabis sativa L.</em> com finalidade medicinal
              </p>
            </div>

            {/* Box de Qualificação das Partes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '12px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identificação do Paciente Requerente</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Paciente: {sanitizedUserName}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#334155' }}>CPF PACIENTE: <strong>{patientCpf}</strong></p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#475569' }}>
                  Indicação Clínica: <strong>{diagnosis}</strong>
                </p>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Responsável Técnico Pericial</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Consultor e Eng. Agr: {agronomistName}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#334155' }}>Registro Profissional: <strong>{agronomistCrea}</strong></p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#059669', fontWeight: '600' }}>
                  Perito em Fitotecnia & Fitoquímica Canabinoide
                </p>
              </div>
            </div>

            {/* 1. Resumo Regulatório */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  1. Resumo & Enquadramento Regulatório (ANVISA)
                </h2>
              </div>
              <div style={{ fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#334155' }}>
                <p style={{ margin: '0 0 8px 0', textIndent: '18px' }}>
                  A ANVISA definiu, por meio da <strong>Resolução da Diretoria Colegiada (RDC) nº 335/2020</strong>, alterada pela <strong>RDC nº 570/2021</strong>, os critérios e os procedimentos para a importação de Produto derivado de <em>Cannabis</em>, por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, para tratamento de saúde. Dessa forma, ainda que o produto não tenha registro para comercialização no Brasil, a importação poderá ser autorizada se os critérios e procedimentos definidos na mencionada RDC forem cumpridos. E, dessa forma, a ANVISA publicou a <strong>Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA</strong> com a lista de produtos derivados de <em>Cannabis</em> de que trata o §3º do Art. 5º da referida norma sanitária.
                </p>
                <p style={{ margin: 0, textIndent: '18px' }}>
                  A fim de proporcionar uma orientação adequada para um cultivo em pequena escala, conhecido comumente como <strong>"cultivo caseiro"</strong>, para paciente que necessita utilizar as moléculas produzidas pela espécie vegetal — nomeadamente o <strong>Δ9–Tetrahidrocanabinol (THC)</strong>, o <strong>Cannabidiol (CBD)</strong> e o <strong>Canabigerol (CBG)</strong>, reconhecidas por suas propriedades terapêuticas —, foi elaborado este parecer com indicações técnicas para o cultivo sob as boas práticas comercialmente conhecidas por <strong>GACP (Good Agriculture and Collection Practices)</strong>, aplicadas para garantir o sucesso em termos de produtividade, pureza biológica e sanidade adequada dos cultivos.
                </p>
              </div>
            </div>

            {/* 2. Dimensionamento do Cultivo e Custo Farmacêutico */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  2. Dimensionamento do Cultivo e Soberania Terapêutica
                </h2>
              </div>
              <div style={{ fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#334155' }}>
                <p style={{ margin: '0 0 8px 0', textIndent: '18px' }}>
                  O cultivo caseiro é a maneira indicada de garantir o acesso continuado aos medicamentos para pacientes que não têm condições de arcar com os elevados custos dos fármacos atualmente disponíveis no mercado, que normalmente <strong>ultrapassam a barreira dos R$ 2.000,00 a R$ 5.000,00 mensais</strong> para produtos comercializados nacionalmente, podendo atingir valores substancialmente mais elevados em casos de importação regular (em especial nos momentos de alta das moedas estrangeiras).
                </p>
                <p style={{ margin: 0, textIndent: '18px' }}>
                  Porém, não somente pacientes que não detêm capacidade financeira de suportar tais valores buscam o cultivo: a segurança da autossuficiência na produção e na manipulação artesanal do próprio fitofármaco garante que o paciente não sofra com desabastecimentos, quebras de importação ou descontinuidade posológica do seu tratamento.
                </p>
              </div>
            </div>

            {/* 3. Prescrição Médica e Necessidade Posológica */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  3. Prescrição Médica e Demanda Terapêutica Individual
                </h2>
              </div>
              <div style={{ fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#334155' }}>
                <p style={{ margin: 0, textIndent: '18px' }}>
                  Estes medicamentos contêm, em média, entre 5-6g de CBD em sua composição por frasco de 30 ml (200 mg de CBD/ml), e teores modulados de THC e CBG. No caso do paciente {sanitizedUserName}, conforme recomendações médicas oficiais que balizam este parecer técnico, o quadro clínico de <strong>{diagnosis}</strong> visa ser tratado com o uso concomitante de extratos integrais (Full Spectrum) com predominância de CBD/THC, CBD, THC e CBG (frascos de 3.000mg/30ml), além de flores secas padronizadas para vaporização em momentos de crise álgica ou insônia aguda. No total, a necessidade médica anual do paciente totaliza o equivalente a <strong>48 frascos anuais dos produtos</strong>, instruindo a memória de cálculo de biomassa e plantas a seguir demonstrada.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Página 1 */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#64748B' }}>
            <span>Mecura • Assessoria Pericial em Fitotecnia & Autocultivo Medicinal</span>
            <span style={{ fontWeight: '700', color: '#0F172A' }}>Parecer Técnico — Página 1 de 3</span>
            <span>Documento para Instrução de Habeas Corpus Preventivo</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PÁGINA 2: MEMÓRIA DE CÁLCULO FITOQUÍMICO, BIOMASSA & TABELA TÉCNICA       */}
        {/* ========================================================================= */}
        <div 
          className="agronomic-pdf-page"
          style={{ 
            width: '794px', 
            height: '1120px', 
            maxHeight: '1120px', 
            overflow: 'hidden', 
            padding: '36px 44px', 
            boxSizing: 'border-box', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div>
            {/* Header Reduzido Página 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #065F46', paddingBottom: '8px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#065F46' }}>MECURA</span>
                <span style={{ fontSize: '9.5px', color: '#64748B', marginLeft: '8px' }}>PARECER AGRONÔMICO PERICIAL — MEMÓRIA DE CÁLCULO & BIOMASSA</span>
              </div>
              <div style={{ fontSize: '9.5px', color: '#334155' }}>
                Paciente: <strong>{sanitizedUserName}</strong> • CPF: <strong>{patientCpf}</strong>
              </div>
            </div>

            {/* 4. Extrapolação de Canabinoides e Consumo */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  4. Dosimetria Farmacológica e Consumo Anual Estimado
                </h2>
              </div>
              <p style={{ margin: '0 0 6px 0', fontSize: '10.5px', color: '#334155', textAlign: 'justify', textIndent: '18px' }}>
                Extrapolando o consumo dos extratos artesanais integrais prescritos para intervalos diários, mensais e anuais de uso terapêutico ininterrupto, temos a seguinte dosimetria de substância ativa (CBD/THC/CBG):
              </p>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', fontSize: '10.5px' }}>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Diário:</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#065F46', fontSize: '12px' }}>{dailyMg} mg / dia</p>
                  <span style={{ fontSize: '9px', color: '#64748B' }}>Óleo integral + extrato bruto</span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Mensal (31 dias):</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#0F172A', fontSize: '12px' }}>{monthlyGrams} g / mês</p>
                  <span style={{ fontSize: '9px', color: '#64748B' }}>{monthlyMg.toLocaleString('pt-BR')} mg ativos</span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Anual (365 dias):</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#0F172A', fontSize: '12px' }}>{annualGrams} g / ano</p>
                  <span style={{ fontSize: '9px', color: '#64748B' }}>{annualMg.toLocaleString('pt-BR')} mg fitocanabinoides</span>
                </div>
              </div>
            </div>

            {/* 5. Aritmética de Extração Caseira e Fator de Perda */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  5. Fitoquímica, Eficiência de Extração & Relação Flor Seca / Molhada
                </h2>
              </div>
              <div style={{ fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#334155' }}>
                <p style={{ margin: '0 0 6px 0', textIndent: '18px' }}>
                  Considerando que o conteúdo médio de canabinoides nas variedades terapêuticas de <em>Cannabis</em> existentes hoje é, em média, de <strong>10% em peso seco de flores</strong> (podendo variar conforme a genética escolhida de 1% até 30%), e que o teor final depende da condução agronômica e experiência do cultivador, é seguro e tecnicamente correto assumir a média colhida de 10%.
                </p>
                <p style={{ margin: '0 0 6px 0', textIndent: '18px' }}>
                  O processo de extração da substância, realizado de maneira artesanal na residência do paciente, sem equipamentos industriais laboratoriais (como colunas de cromatografia ou CO2 supercrítico), atinge uma <strong>eficiência média de recuperação de 80%</strong> das moléculas presentes na biomassa vegetal. Temos, portanto, a seguinte aritmética fitoquímica: a cada 100g de flores secas com teor de 10% obtêm-se 10g de extrato bruto concentrado.
                </p>
                <p style={{ margin: '0 0 6px 0', textIndent: '18px' }}>
                  Para obter os {annualGrams}g anuais prescritos, o cultivo exigiria, no mínimo, a produção de <strong>{dryFlowerKgStr} kg de flores secas anuais</strong>. Entretanto, é obrigatório sob o ponto de vista agronômico considerar perdas potenciais causadas por ataques de pragas, fungos, oscilações térmicas e erros na condução. Aplicando-se a <strong>taxa de segurança agronômica de 30% de perdas</strong>, o cultivo deve ser dimensionado para garantir a colheita de <strong>{dryFlowerMarginKgStr} kg de flores secas por ano</strong>.
                </p>
                <p style={{ margin: 0, textIndent: '18px' }}>
                  Ademais, no cultivo indoor residencial por cultivador não comercial, estima-se um rendimento médio esperado entre <strong>100 a 150g de flores secas por planta</strong> ao final do ciclo de 120 dias. Cumpre ressaltar que as flores perdem entre <strong>70% a 80% do seu peso em umidade durante o processo de secagem</strong>; assim, para produzir 150g de flores secas curadas, cada espécime deve produzir entre 700g a 750g de flores molhadas (frescas). Logo, para atingir a meta anual de {dryFlowerMarginKgStr} kg secas, o paciente deverá colher <strong>{wetFlowerKgStr} kg de flores molhadas</strong>.
                </p>
              </div>
            </div>

            {/* Quadro Técnico 1 — Tabela de Dimensionamento */}
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '10.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Quadro 1 — Memória de Cálculo & Dimensionamento Agronômico Oficial
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1.5px solid #CBD5E1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
                    <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'left', fontWeight: '800' }}>Parâmetro Agronômico / Terapêutico</th>
                    <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center', fontWeight: '800' }}>Base de Cálculo e Referência Técnica</th>
                    <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right', fontWeight: '800' }}>Quantitativo Técnico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Demanda Diária de Princípio Ativo</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Posologia Médica Prescrita</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>{dailyMg} mg / dia</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Consumo Anual de Extrato / Ativos</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>365 dias de tratamento ininterrupto</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>{annualGrams} g / ano</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Teor Médio Fitoquímico das Inflorescências</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Genética medicinal adaptada</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right' }}>10% peso seco</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Eficiência Média da Extração Caseira</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Extração artesanal em óleo vegetal</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right' }}>~80% de recuperação</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Biomassa Seca Requerida (com 30% de margem)</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Segurança contra pragas, fungos e clima</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold', color: '#065F46' }}>{dryFlowerMarginKgStr} kg secas / ano</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Biomassa Fresca (Flores Molhadas)</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>70% a 80% de perda hídrica na secagem</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>{wetFlowerKgStr} kg molhadas / ano</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ECFDF5', fontWeight: 'bold' }}>
                    <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', color: '#065F46' }}>Total de Plantas Recomendadas para Salvo-Conduto</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center', color: '#065F46' }}>120 dias/ciclo (100-150g secas/planta)</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right', color: '#065F46', fontSize: '11px' }}>{targetPlants} plantas anuais</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Plantas em Floração por Ciclo Rotativo</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Divisão em 3 momentos de colheita/ano</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>{plantsPerCycle} plantas / ciclo</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px' }}>Sementes / Propágulos Anuais Estimados</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center' }}>Margem de segurança germinativa (30%)</td>
                    <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold', color: '#065F46' }}>{seedsNeeded} sementes feminizadas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Destaque Visual dos 4 Números-Chave */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '8.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Flor Seca Anual</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '900', color: '#065F46' }}>{dryFlowerMarginKgStr} kg</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '8.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Flor Molhada Anual</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '900', color: '#0F172A' }}>{wetFlowerKgStr} kg</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '8.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Plantas Totais / Ano</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '900', color: '#065F46' }}>{targetPlants} espécimes</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '8.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Sementes Importadas</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '900', color: '#0F172A' }}>{seedsNeeded} un.</p>
              </div>
            </div>
          </div>

          {/* Footer Página 2 */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#64748B' }}>
            <span>Mecura • Assessoria Pericial em Fitotecnia & Autocultivo Medicinal</span>
            <span style={{ fontWeight: '700', color: '#0F172A' }}>Parecer Técnico — Página 2 de 3</span>
            <span>Documento para Instrução de Habeas Corpus Preventivo</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PÁGINA 3: DESIGNER DE CULTIVO, MANEJO GACP & CONCLUSÃO PERICIAL           */}
        {/* ========================================================================= */}
        <div 
          className="agronomic-pdf-page"
          style={{ 
            width: '794px', 
            height: '1120px', 
            maxHeight: '1120px', 
            overflow: 'hidden', 
            padding: '36px 44px', 
            boxSizing: 'border-box', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div>
            {/* Header Reduzido Página 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #065F46', paddingBottom: '8px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#065F46' }}>MECURA</span>
                <span style={{ fontSize: '9.5px', color: '#64748B', marginLeft: '8px' }}>PARECER AGRONÔMICO PERICIAL — DESIGNER DE CULTIVO & CONCLUSÃO</span>
              </div>
              <div style={{ fontSize: '9.5px', color: '#334155' }}>
                Paciente: <strong>{sanitizedUserName}</strong> • CPF: <strong>{patientCpf}</strong>
              </div>
            </div>

            {/* 6. Designer de Cultivo */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  6. Designer de Cultivo e Planejamento Operacional
                </h2>
              </div>
              <div style={{ fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#334155' }}>
                <p style={{ margin: '0 0 6px 0', textIndent: '18px' }}>
                  A fim de garantir que essa quantidade de plantas atenda ao consumo anual do paciente de forma contínua e sem sobressaltos, estabelece-se um plano de cultivo dividido em <strong>3 momentos de colheita ao longo do ano</strong>, fato facilitado pelo ciclo médio da espécie ser de 120 dias (4 meses). Para tanto, o paciente deverá conduzir o cultivo de aproximadamente <strong>{plantsPerCycle} plantas durante cada ciclo rotativo</strong>.
                </p>
                <p style={{ margin: 0, textIndent: '18px' }}>
                  Considerando que somente plantas em estágio de floração produzem as substâncias de interesse farmacológico, o paciente poderá optar por manter plantas-mãe em estado vegetativo contínuo (sob fotoperíodo superior a 18 horas diárias de luz) para retirada periódica de estacas (clones), ou realizar o cultivo por 3 ciclos independentes ao ano a partir de sementes feminizadas com taxa de segurança de 30% contra falhas germinativas ({seedsNeeded} sementes no total anual).
                </p>
              </div>
            </div>

            {/* 7. Boas Práticas GACP e Parâmetros de Manejo Indoor */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  7. Boas Práticas Agrícolas e de Coleta (GACP) & Parâmetros Indoor
                </h2>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 14px', fontSize: '10px', lineHeight: '1.5', color: '#334155' }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Ambiente Fechado (Indoor / Estufa):</strong> Opção preferencial do paciente por motivos de biossegurança, discrição e controle fitossanitário absoluto contra insetos e esporos fúngicos externos.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Iluminação & Fotoperíodo:</strong> Painéis LED Full Spectrum (Quantum Board com chips Samsung/Osram). Regime vegetativo de 18h luz / 6h escuro; regime de floração induzida estritamente mantido em 12h luz / 12h escuro contínuo.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Controle de Odores & Climatização:</strong> Sistema contínuo de exaustão mecânica dotado de <strong>filtro de carvão ativado</strong> de alta eficiência (retenção total de terpenos voláteis e odores), temperatura ambiente mantida entre 20°C e 26°C e umidade relativa (UR) controlada entre 45% a 65%.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Substrato & Nutrição:</strong> Meio de cultivo inerte (turfa/perlita/fibra de coco) ou solo orgânico vivo, com rigoroso controle de pH (5.8 a 6.5) e Eletrocondutividade (EC 1.2 a 2.0 mS/cm). <strong>Vedação absoluta de defensivos químicos ou pesticidas sintéticos</strong> nocivos à saúde humana.
                </p>
                <p style={{ margin: 0 }}>
                  • <strong>Pós-Colheita (Secagem & Cura):</strong> Secagem das inflorescências em ambiente escuro, ventilado e desumidificado (18-20°C e 55% UR) por 10 a 14 dias, seguida de cura hermética em potes de vidro com reguladores bidirecionais de umidade (Boveda 62%) por período não inferior a 30 dias para estabilização de terpenos e canabinoides.
                </p>
              </div>
            </div>

            {/* 8. Conclusão Pericial Agronômica */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '3px', height: '14px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
                <h2 style={{ margin: 0, fontSize: '11.5px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  8. Conclusão Pericial Agronômica
                </h2>
              </div>
              <div style={{ backgroundColor: '#F0FDF4', borderLeft: '3.5px solid #059669', borderRight: '1px solid #BBF7D0', borderTop: '1px solid #BBF7D0', borderBottom: '1px solid #BBF7D0', padding: '10px 14px', fontSize: '10.5px', lineHeight: '1.55', textAlign: 'justify', color: '#064E3B' }}>
                <p style={{ margin: 0 }}>
                  <strong>Conclusão Técnica:</strong> Com base na análise das prescrições médicas que amparam este parecer, nos cálculos dosimétricos de fitomassa e na biologia reprodutiva da espécie, conclui-se que o dimensionamento anual de <strong>{targetPlants} espécimes de <em>Cannabis sativa L.</em></strong> (conduzidas em 3 ciclos anuais de aproximadamente <strong>{plantsPerCycle} plantas em floração por colheita</strong>), juntamente com a importação de <strong>{seedsNeeded} sementes feminizadas</strong>, é <strong>agronomicamente justificado, estritamente proporcional e indispensável</strong> para assegurar a autossuficiência e a continuidade do tratamento médico do(a) paciente {sanitizedUserName} por 12 meses. O cultivo destina-se unicamente ao alívio e controle de sua patologia clínica, sem excedentes para qualquer finalidade diversa ou comercial.
                </p>
              </div>
            </div>

            {/* Assinaturas & Autenticação */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginTop: '10px' }}>
              <div style={{ textAlign: 'center', borderTop: '1.5px solid #94A3B8', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11.5px', fontWeight: '900', color: '#0F172A' }}>{agronomistName}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '700', color: '#065F46' }}>Engenheiro Agrônomo — {agronomistCrea}</p>
                <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#475569' }}>Perito em Fitotecnia, Fitoquímica Canabinoide & GACP</p>
                <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', color: '#64748B' }}>ART de Perícia Agronômica vinculada ao CREA-PR</p>
              </div>
              <div style={{ textAlign: 'center', borderTop: '1.5px solid #94A3B8', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>MECURA SAÚDE & BEM-ESTAR</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', color: '#475569' }}>Núcleo de Apoio Jurídico & Pericial à Ação de Habeas Corpus</p>
                <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', color: '#059669', fontWeight: '700' }}>Certificação Digital ICP-Brasil / Hash Autenticidade</p>
                <p style={{ margin: '1px 0 0 0', fontSize: '8px', color: '#94A3B8', fontFamily: 'monospace' }}>MEC-AGRO-HC-{new Date().getFullYear()}-{patientCpf.replace(/\D/g, '').slice(0, 6)}</p>
              </div>
            </div>
          </div>

          {/* Footer Página 3 */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#64748B' }}>
            <span>Mecura • Assessoria Pericial em Fitotecnia & Autocultivo Medicinal</span>
            <span style={{ fontWeight: '700', color: '#0F172A' }}>Parecer Técnico — Página 3 de 3</span>
            <span>Documento para Instrução de Habeas Corpus Preventivo</span>
          </div>
        </div>

      </div>
    );
  };

  const root = createRoot(container);
  root.render(<PdfComponent />);

  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });

    const pageElements = container.querySelectorAll<HTMLElement>('.agronomic-pdf-page');

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    } else {
      const contentEl = (container.firstElementChild || container) as HTMLElement;
      const canvas = await html2canvas(contentEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= 299) {
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= 297;
        while (heightLeft > 5) {
          position = heightLeft - imgHeight;
          pdf.addPage('a4', 'portrait');
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= 297;
        }
      }
    }

    const filename = `Parecer_Agronomico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;

    let resultBlob: Blob | undefined;
    if (agronomicData?.returnBlob) {
      resultBlob = pdf.output('blob');
    } else {
      pdf.save(filename);
    }

    return resultBlob;
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};
