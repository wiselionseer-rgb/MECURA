import React from 'react';
import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
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

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        {guidesToRender.map((guide, gIdx) => (
          <div key={gIdx} className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827", pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}>
            {/* Guide Badge */}
            <div className="absolute top-6 right-6 bg-[#F3E8FF] text-[#581C87] border border-[#D8B4FE] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {guide.badge}
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
                <div>
                  <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                  <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
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
              <div className="text-center my-6">
                <h1 className="text-lg font-bold text-[#1E1B4B] uppercase tracking-widest m-0">
                  {guide.title}
                </h1>
                <p className="text-xs font-semibold text-[#059669] tracking-wider uppercase mt-1 m-0">
                  {guide.subtitle}
                </p>
                <div className="w-16 h-0.5 bg-[#059669] mx-auto mt-2" />
              </div>

              {/* Patient Info Box */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-8 flex justify-between items-center">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold mb-1">Paciente</span>
                  <span className="font-bold text-[#0F172A] text-sm">{sanitizedUserName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold mb-1">CPF / Nasc.</span>
                  <span className="font-semibold text-[#334155] text-xs">{cpfText} • {birthDateText}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-6 my-6">
                {guide.items.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic m-0">Nenhum produto cadastrado para esta guia.</p>
                ) : (
                  guide.items.map((item, idx) => {
                    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                    const activeIng = item.activeIngredients || enriched.activeIngredients;
                    const pharmForm = item.pharmaceuticalForm || enriched.pharmaceuticalForm;
                    const quantity = item.quantity || enriched.quantity;
                    const admRoute = item.administrationRoute || enriched.administrationRoute;

                    return (
                      <div key={idx} className="border-b border-[#F1F5F9] pb-5" style={{ pageBreakInside: "avoid" }}>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-sm font-bold text-[#0F172A] m-0">
                            {idx + 1}. {item.name}
                          </span>
                          <span className="text-[10px] bg-[#F1F5F9] text-[#334155] font-bold px-2 py-0.5 rounded border border-[#E2E8F0] m-0">
                            {item.brand || enriched.brand} ({item.origin || enriched.origin})
                          </span>
                        </div>

                        {/* Active Ingredient & Presentation */}
                        <div className="pl-5 mb-3 space-y-1 text-xs text-[#475569]">
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Princípio Ativo:</span> {activeIng}</p>
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
                        </div>

                        {/* Dosage */}
                        <div className="pl-5 space-y-1 text-xs text-[#334155]">
                          <span className="font-semibold text-[#1E293B] block text-[11px] mb-1">Posologia e Modo de Uso:</span>
                          {item.dosage.map((d, dIdx) => (
                            <p key={dIdx} className="m-0 leading-relaxed">• {d}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notes */}
              {customNotesText && (
                <div className="bg-[#F8FAFC] border-l-2 border-[#1E1B4B] p-4 text-xs text-[#334155] mt-6 rounded-r">
                  <span className="font-bold block text-[11px] uppercase text-[#475569] mb-1">Orientações Farmacológicas e Clínicas</span>
                  <div className="flex flex-col gap-1.5">
                    {customNotesText.split('\n').map((p, i) => p.trim() ? <p key={i} className="text-[11px] leading-relaxed m-0" style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : null)}
                  </div>
                </div>
              )}
            </div>

            {/* Independent Signature Block for this guide */}
            <div className="pt-8 border-t border-[#E2E8F0] mt-auto flex justify-between items-end">
              <div className="text-[10px] text-[#64748B] space-y-1">
                <p className="m-0">Data de Emissão: {emissionDateStr}</p>
                <p className="m-0">Validade: 30 dias a partir da data de emissão</p>
                <p className="text-[9px] text-[#94A3B8] mt-1 m-0">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022</p>
              </div>

              <div className="text-center w-52">
                <div className="border-b border-[#94A3B8] pb-1 mb-2" />
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
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  // Wait for React to render and Tailwind to apply styles
  await new Promise(resolve => setTimeout(resolve, 800));

  const wrapperDiv = container.firstElementChild as HTMLElement;
  if (wrapperDiv) {
    const guideDivs = Array.from(wrapperDiv.children);
    for (const el of guideDivs) {
      const guideDiv = el as HTMLElement;
      if (guideDiv.style.minHeight === '1123px') {
        const currentHeight = guideDiv.getBoundingClientRect().height;
        const a4Height = 1123;
        if (currentHeight > a4Height) {
          const pages = Math.ceil(currentHeight / a4Height);
          guideDiv.style.height = `${pages * a4Height}px`;
        }
      }
    }
  }

  const opt = {
    margin: 0,
    filename: `Receita_Medica_${sanitizedUserName}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).save();

  root.unmount();
  document.body.removeChild(container);
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

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        <div className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827" }}>
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
              <div>
                <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                  CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO MÉDICO</h1>
              <div className="flex flex-col items-center gap-1">
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

            <div className="space-y-6">
              {patientData?.customDiagnosis && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Diagnóstico e Resumo Clínico</h4>
                  <div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customDiagnosis.split('\n').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>
                </div>
              )}
              {patientData?.customRationale && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Raciocínio Terapêutico</h4>
                  <div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customRationale.split('\n').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>
                </div>
              )}
              {patientData?.customTreatmentPlan && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Plano de Tratamento Canabinoide</h4>
                  <div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customTreatmentPlan.split('\n').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>
                </div>
              )}
              {patientData?.customMonitoring && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Acompanhamento e Monitoramento</h4>
                  <div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customMonitoring.split('\n').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-[#E2E8F0]" style={{ pageBreakInside: "avoid" }}>
            <div className="flex flex-col items-center">
              <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
              <p className="text-sm font-bold text-[#1E1B4B]">{docName}</p>
              <p className="text-xs text-[#64748B] mb-4">{docCrm}</p>
              <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                <span>{emissionDateStr}</span>
                <span>Válido em todo o território nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  await new Promise(resolve => setTimeout(resolve, 800));

  const reportDiv = container.firstElementChild?.firstElementChild as HTMLElement;
  if (reportDiv && reportDiv.style.minHeight === '1123px') {
    const currentHeight = reportDiv.getBoundingClientRect().height;
    const a4Height = 1123;
    if (currentHeight > a4Height) {
      const pages = Math.ceil(currentHeight / a4Height);
      reportDiv.style.height = `${pages * a4Height}px`;
    }
  }

  const opt = {
    margin: 0,
    filename: `Laudo_Medico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`,
    image: { type: "jpeg" as any, quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).save();

  root.unmount();
  document.body.removeChild(container);
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
  
  const docName = "Dr. Guilherme Taveira Dias";
  const docCrm = "CRM/MT 17259";
  const docSpec = "Especialista em Medicina Canabinoide";

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        <div className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827" }}>
          <div>
            <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
              <div>
                <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                  CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO PSICOMOTOR</h1>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] mb-4">AVALIAÇÃO DA LEI DO DROGÔMETRO / APTIDÃO</p>
              <div className="flex flex-col items-center gap-1">
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

            <div className="space-y-6 text-sm text-[#334155] leading-relaxed text-justify">
              <div className="flex flex-col gap-4">
                {patientData?.customPsychomotorText 
                  ? patientData.customPsychomotorText.split('\n').map((p, i) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : null)
                  : <>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Declaro, para os devidos fins de direito, que o(a) paciente <strong>{sanitizedUserName}</strong>, 
                        inscrito(a) no CPF <strong>{cpfText}</strong>, encontra-se em acompanhamento médico regular neste 
                        Centro Integrado de Medicina Canabinoide.
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        O(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme 
                        prescrição médica, sob supervisão e com acompanhamento clínico contínuo. 
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Atesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados 
                        durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, 
                        <strong> NÃO RESULTA </strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou 
                        comprometimento dos reflexos e estado de alerta do paciente.
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        O tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir 
                        veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando 
                        infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Ressalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, 
                        sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, 
                        e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de 
                        causar dependência ou prejuízo sensório-motor nas doses tituladas.
                      </p>
                    </>
                }
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-[#E2E8F0]" style={{ pageBreakInside: "avoid" }}>
            <div className="flex flex-col items-center">
              <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
              <p className="text-sm font-bold text-[#1E1B4B]">{docName}</p>
              <p className="text-xs text-[#64748B] mb-4">{docCrm}</p>
              <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                <span>{emissionDateStr}</span>
                <span>Válido em todo o território nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  await new Promise(resolve => setTimeout(resolve, 800));

  const reportDiv = container.firstElementChild?.firstElementChild as HTMLElement;
  if (reportDiv && reportDiv.style.minHeight === '1123px') {
    const currentHeight = reportDiv.getBoundingClientRect().height;
    const a4Height = 1123;
    if (currentHeight > a4Height) {
      const pages = Math.ceil(currentHeight / a4Height);
      reportDiv.style.height = `${pages * a4Height}px`;
    }
  }

  const opt = {
    margin: 0,
    filename: `Laudo_Psicomotor_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`,
    image: { type: "jpeg" as any, quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).save();

  root.unmount();
  document.body.removeChild(container);
};

export interface AgronomicReportData {
  customPatientName?: string;
  cpf?: string;
  birthDate?: string;
  emissionDate?: string;
  agronomistName?: string;
  agronomistCrea?: string;
  diagnosis?: string;
  dailyDoseMg?: number;
  targetPlants?: number;
  htmlContent?: string;
  returnBlob?: boolean;
}

export const generateAgronomicReportPDF = async (userName: string, agronomicData?: AgronomicReportData) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);

  const sanitizedUserName = agronomicData?.customPatientName || userName || 'Paciente';
  const patientCpf = agronomicData?.cpf || 'Não informado';
  const emissionDate = agronomicData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  const agronomistName = agronomicData?.agronomistName || 'Wilian Dalenogare Pereira';
  const agronomistCrea = agronomicData?.agronomistCrea || 'CREA-PR 172.458/D';
  const diagnosis = agronomicData?.diagnosis || 'Tratamento de Dor Crônica e Modulação do Sono (CID 10 G47 / R52)';
  const dailyMg = agronomicData?.dailyDoseMg || 100;
  const targetPlants = agronomicData?.targetPlants || 12;

  // Technical calculations
  const annualMg = dailyMg * 365;
  const annualGramsActive = (annualMg / 1000).toFixed(1);
  const dryFlowerKg = ((annualMg / 1000) / 0.10 / 1000).toFixed(2);
  const dryFlowerMarginKg = (Number(dryFlowerKg) * 1.30).toFixed(2);
  const plantsPerCycle = Math.ceil(targetPlants / 3);
  const seedsNeeded = Math.ceil(targetPlants * 1.30);

  const PdfComponent = () => {
    if (agronomicData?.htmlContent) {
      return (
        <div style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#000000', padding: '40px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          <div dangerouslySetInnerHTML={{ __html: agronomicData.htmlContent }} />
        </div>
      );
    }

    return (
      <div style={{ width: '794px', minHeight: '1123px', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '45px 50px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #10B981', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#065F46', letterSpacing: '-0.5px' }}>MECURA</span>
              <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '4px' }}>PARECER AGRONÔMICO</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
              Assessoria Técnica Pericial em Fitoterapia & Cultivo Medicinal Individualizado
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>LAUDO TÉCNICO DE CULTIVO</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748B' }}>Instrução para Habeas Corpus Preventivo</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#059669', fontWeight: '600' }}>Emissão: {emissionDate}</p>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h1 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            PARECER TÉCNICO AGRONÔMICO DE DIMENSIONAMENTO DE CULTIVO
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569' }}>
            Prescrição Médica e Viabilidade Agronômica para Autossuficiência Terapêutica (RDC ANVISA / GACP)
          </p>
        </div>

        {/* Patient / Agronomist Info Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Paciente Requerente</p>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{sanitizedUserName}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#475569' }}>CPF: <strong>{patientCpf}</strong></p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748B' }}>Indicação: {diagnosis}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Responsável Técnico Agrônomo</p>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{agronomistName}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#475569' }}>Registro Profissional: <strong>{agronomistCrea}</strong></p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748B' }}>Especialidade: Fitotecnia & Fitoquímica Canabinoide</p>
          </div>
        </div>

        {/* Technical Justification */}
        <div style={{ marginBottom: '18px', fontSize: '11px', lineHeight: '1.6', textAlign: 'justify', color: '#334155' }}>
          <p style={{ margin: '0 0 10px 0', textIndent: '20px' }}>
            O presente parecer técnico tem por finalidade estabelecer o dimensionamento agronômico exato, a dosimetria de fitomassa e o planejamento operacional para o cultivo doméstico de espécimes de <em>Cannabis sativa L.</em>, estritamente voltado à produção de extratos terapêuticos integrais de uso contínuo, seguro e exclusivo do(a) paciente acima qualificado(a), em conformidade com as Boas Práticas Agrícolas e de Coleta (GACP) e a prescrição médica individualizada que acompanha este instrumento.
          </p>
          <p style={{ margin: '0 0 10px 0', textIndent: '20px' }}>
            Considerando o custo financeiro proibitivo da importação contínua ou aquisição via farmácias convencionais, o autocultivo com extração artesanal padronizada constitui a única via que assegura a dignidade da saúde, regularidade posológica e soberania terapêutica do(a) paciente contra a descontinuidade de seu tratamento médico.
          </p>
        </div>

        {/* Dimensioning Table */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quadro 1 — Memória de Cálculo & Dimensionamento de Plantas e Biomassa
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #CBD5E1' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
                <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'left' }}>Parâmetro Agronômico / Terapêutico</th>
                <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Base de Cálculo</th>
                <th style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right' }}>Quantitativo Técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Demanda Diária de Princípio Ativo</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Posologia Médica Prescrita</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{dailyMg} mg / dia</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Consumo Anual de Canabinoides</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>365 dias de tratamento</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{annualGramsActive} g ativos / ano</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Teor Médio Fitoquímico das Inflorescências</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Genética terapêutica adaptada</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right' }}>10% peso seco</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Eficiência Média da Extração Caseira</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Extração artesanal segura</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right' }}>~80% de recuperação</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Biomassa Seca Anual com Margem Agronômica (30%)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Pragas, clima e secagem</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', color: '#065F46' }}>{dryFlowerMarginKg} kg de flores secas / ano</td>
              </tr>
              <tr style={{ backgroundColor: '#ECFDF5', fontWeight: 'bold' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '7px 8px', color: '#065F46' }}>Total de Plantas Recomendadas para Salvo-Conduto</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '7px 8px', textAlign: 'center', color: '#065F46' }}>3 ciclos ao ano (Indoor/Estufa)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '7px 8px', textAlign: 'right', color: '#065F46', fontSize: '12px' }}>{targetPlants} espécimes no total</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Plantas em Floração por Ciclo Rotativo</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Garantia de fluxo contínuo</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right' }}>{plantsPerCycle} plantas / ciclo</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px' }}>Sementes / Propágulos Anuais Estimados</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'center' }}>Margem de germinação (30%)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 8px', textAlign: 'right' }}>{seedsNeeded} sementes anuais</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conclusion & Legal Notice */}
        <div style={{ backgroundColor: '#F8FAFC', borderLeft: '3px solid #10B981', padding: '10px 14px', marginBottom: '22px', fontSize: '10.5px', color: '#334155', lineHeight: '1.5' }}>
          <strong>Conclusão Técnica:</strong> A quantidade dimensionada de <strong>{targetPlants} espécimes de Cannabis sativa L.</strong> ({plantsPerCycle} plantas por ciclo em floração, mais matrizes/vegetativo correspondentes) é agronomicamente justificada e compatível com a necessidade médica contínua do paciente para o período de 12 meses. O cultivo destina-se unicamente ao tratamento de sua patologia clínica, sem excedentes para qualquer finalidade diversa ou comercial.
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px', paddingTop: '15px' }}>
          <div style={{ textAlign: 'center', borderTop: '1px solid #94A3B8', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#0F172A' }}>{agronomistName}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#475569' }}>Engenheiro Agrônomo — {agronomistCrea}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#64748B' }}>Perito em Fitotecnia & Dimensionamento Agronômico</p>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #94A3B8', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#0F172A' }}>Centro de Apoio Jurídico & Terapêutico Mecura</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#475569' }}>Documento de Apoio Pericial à Ação de Habeas Corpus</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#059669', fontWeight: '600' }}>Autenticação Digital ICP-Brasil / QR Code</p>
          </div>
        </div>
      </div>
    );
  };

  const root = createRoot(container);
  root.render(<PdfComponent />);

  await new Promise(resolve => setTimeout(resolve, 800));

  const opt = {
    margin: 0,
    filename: `Laudo_Agronomico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`,
    image: { type: "jpeg" as any, quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (agronomicData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt as any).from((container.firstElementChild || container) as any).save();

  root.unmount();
  document.body.removeChild(container);
};
