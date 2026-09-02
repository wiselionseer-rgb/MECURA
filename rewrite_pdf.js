const fs = require('fs');
const content = `import React from 'react';
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
  patientData?: PatientPrescriptionData
) => {
  const sanitize = (text: string) => {
    return (text || '')
      .replace(/[–—]/g, '-')
      .replace(/[^\\x0A\\x0D\\x20-\\x7E\\xA0-\\xFF\\u0152\\u0153\\u0178]/g, '');
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
    : messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\\n\\n');

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
      <div className="space-y-8 flex flex-col items-center w-[794px]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        {guidesToRender.map((guide, gIdx) => (
          <div key={gIdx} className="w-[794px] h-[1123px] bg-white text-[#111827] relative p-12 border border-slate-200 box-border flex flex-col justify-between" style={{ pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}>
            {/* Guide Badge */}
            <div className="absolute top-4 right-6 bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
                  <p className="text-xs text-slate-600 font-semibold m-0">{docCrm}</p>
                  <p className="text-[10px] text-slate-500 m-0">{docSpec}</p>
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
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Paciente</span>
                  <span className="font-bold text-slate-900 text-sm">{sanitizedUserName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">CPF / Nasc.</span>
                  <span className="font-semibold text-slate-700 text-xs">{cpfText} • {birthDateText}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-6 my-6">
                {guide.items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum produto cadastrado para esta guia.</p>
                ) : (
                  guide.items.map((item, idx) => {
                    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                    const activeIng = item.activeIngredients || enriched.activeIngredients;
                    const pharmForm = item.pharmaceuticalForm || enriched.pharmaceuticalForm;
                    const quantity = item.quantity || enriched.quantity;
                    const admRoute = item.administrationRoute || enriched.administrationRoute;

                    return (
                      <div key={idx} className="border-b border-slate-100 pb-5">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">
                            {idx + 1}. {item.name}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                            {item.brand || enriched.brand} ({item.origin || enriched.origin})
                          </span>
                        </div>

                        {/* Active Ingredient & Presentation */}
                        <div className="pl-5 mb-3 space-y-1 text-xs text-slate-600">
                          <p className="m-0"><span className="font-semibold text-slate-800">Princípio Ativo:</span> {activeIng}</p>
                          <p className="m-0"><span className="font-semibold text-slate-800">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
                        </div>

                        {/* Dosage */}
                        <div className="pl-5 space-y-1 text-xs text-slate-700">
                          <span className="font-semibold text-slate-800 block text-[11px] mb-1">Posologia e Modo de Uso:</span>
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
                <div className="bg-slate-50 border-l-2 border-[#1E1B4B] p-4 text-xs text-slate-700 mt-6 rounded-r">
                  <span className="font-bold block text-[11px] uppercase text-slate-600 mb-1">Orientações Farmacológicas e Clínicas</span>
                  <p className="whitespace-pre-line text-[11px] leading-relaxed m-0">{customNotesText}</p>
                </div>
              )}
            </div>

            {/* Independent Signature Block for this guide */}
            <div className="pt-8 border-t border-slate-200 mt-auto flex justify-between items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <p className="m-0">Data de Emissão: {emissionDateStr}</p>
                <p className="m-0">Validade: 30 dias a partir da data de emissão</p>
                <p className="text-[9px] text-slate-400 mt-1 m-0">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022</p>
              </div>

              <div className="text-center w-52">
                <div className="border-b border-slate-400 pb-1 mb-2" />
                <p className="text-xs font-bold text-slate-900 m-0">{docName}</p>
                <p className="text-[10px] text-slate-600 font-semibold m-0">{docCrm}</p>
                <p className="text-[9px] text-slate-500 m-0">Assinatura Digital / Prescritor</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  // Wait for React to render and Tailwind to apply styles
  await new Promise(resolve => setTimeout(resolve, 800));

  const opt = {
    margin: 0,
    filename: \`Receita_Medica_\${sanitizedUserName}.pdf\`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(container).save();

  root.unmount();
  document.body.removeChild(container);
};

export const generateMedicalReportPDF = async (userName: string) => {};
export const generatePsychomotorReportPDF = async (userName: string) => {};
`;

fs.writeFileSync('src/utils/pdfGenerator.tsx', content);
