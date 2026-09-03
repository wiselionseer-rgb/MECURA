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
          <div key={gIdx} className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", height: "1123px", backgroundColor: "#FFFFFF", color: "#111827", pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}>
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
                      <div key={idx} className="border-b border-[#F1F5F9] pb-5">
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
                  <p className="whitespace-pre-line text-[11px] leading-relaxed m-0">{customNotesText}</p>
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
    filename: `Receita_Medica_${sanitizedUserName}.pdf`,
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt).from(container.firstElementChild || container).save();

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
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt).from(container.firstElementChild || container).save();

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
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt).from(container.firstElementChild || container).save();

  root.unmount();
  document.body.removeChild(container);
};
