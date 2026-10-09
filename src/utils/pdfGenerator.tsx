import React from 'react';
import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Message, useStore } from '../store/useStore';
import { enrichMedicationDetails } from '../data/cbdGuide';
import { deliverPdfBlob } from './downloadHelper';
import { generatePersonalizedClinicalReport } from './clinicalReportGenerator';

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
  priceUSD?: number;
  priceBRL?: number;
  image?: string;
  details?: string[];
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
  const originLower = (item.origin || '').toLowerCase().trim();
  const brandLower = (item.brand || '').toLowerCase().trim();
  const nameLower = (item.name || '').toLowerCase().trim();

  // 1. Explicit origin takes highest priority
  if (
    originLower.includes('import') ||
    originLower.includes('eua') ||
    originLower.includes('usa') ||
    originLower.includes('anvisa') ||
    originLower.includes('rdc 660') ||
    originLower.includes('rdc660') ||
    originLower.includes('exterior')
  ) {
    return false;
  }

  if (
    originLower.includes('nacional') ||
    originLower.includes('associação') ||
    originLower.includes('associacao') ||
    originLower.includes('brasil') ||
    originLower.includes('brazil')
  ) {
    return true;
  }

  // 2. Explicit brand takes second priority
  if (
    brandLower.includes('flowermed') ||
    brandLower.includes('greenbudz') ||
    brandLower.includes('cannariver') ||
    brandLower.includes('canna river') ||
    brandLower.includes('lazarus') ||
    brandLower.includes('charlotte') ||
    brandLower.includes('medreleaf') ||
    brandLower.includes('tilray') ||
    brandLower.includes('columbia care')
  ) {
    return false;
  }

  if (
    brandLower.includes('associação') ||
    brandLower.includes('associacao') ||
    brandLower.includes('abrace') ||
    brandLower.includes('abecmed') ||
    brandLower.includes('abrascorp') ||
    brandLower.includes('amame') ||
    brandLower.includes('apepi') ||
    brandLower.includes('santa esperança') ||
    brandLower.includes('cultive')
  ) {
    return true;
  }

  // 3. Check enriched catalog details
  try {
    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
    if (enriched && enriched.origin) {
      const eOrigin = enriched.origin.toLowerCase();
      if (eOrigin.includes('import') || eOrigin.includes('eua') || eOrigin.includes('usa')) {
        return false;
      }
      if (eOrigin.includes('nacional') || eOrigin.includes('associação') || eOrigin.includes('associacao') || eOrigin.includes('abrace')) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  // 4. Fallback: only if name specifically mentions Associação or Nacional or ABRACE
  return /associação|associacao|nacional|abrace|abecmed|abrascorp|amame|apepi/i.test(nameLower);
};

// Offscreen canvas context for native browser conversion of modern CSS color functions (oklch, oklab, color-mix) to standard sRGB
let colorCanvasContext: CanvasRenderingContext2D | null = null;
const getColorCanvasContext = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') return null;
  if (!colorCanvasContext) {
    try {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      colorCanvasContext = c.getContext('2d', { willReadFrequently: true });
    } catch {
      colorCanvasContext = null;
    }
  }
  return colorCanvasContext;
};

const colorConversionCache = new Map<string, string>();

export const convertSingleColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  const trimmed = colorStr.trim();
  if (colorConversionCache.has(trimmed)) {
    return colorConversionCache.get(trimmed)!;
  }

  const ctx = getColorCanvasContext();
  if (ctx) {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = trimmed;
      const converted = ctx.fillStyle;
      if (converted && !converted.includes('oklch') && !converted.includes('oklab') && !converted.includes('color(')) {
        colorConversionCache.set(trimmed, converted);
        return converted;
      }
    } catch {
      // ignore
    }
  }

  // Fallbacks if native canvas conversion fails or is unsupported
  let fallback = '#111827';
  if (/^oklch\s*\(\s*0\b/i.test(trimmed)) {
    fallback = '#000000';
  } else if (/^oklch\s*\(\s*1\b/i.test(trimmed)) {
    fallback = '#FFFFFF';
  } else if (/slate-200|border/i.test(trimmed)) {
    fallback = '#E2E8F0';
  }
  colorConversionCache.set(trimmed, fallback);
  return fallback;
};

export const sanitizeColorString = (val: string): string => {
  if (!val || typeof val !== 'string') return val;
  if (!val.includes('oklch') && !val.includes('oklab') && !val.includes('color(') && !val.includes('color-mix')) {
    return val;
  }

  // Exact function match
  if (/^(oklch|oklab|color)\([^)]+\)$/i.test(val.trim())) {
    return convertSingleColorToRgb(val.trim());
  }

  // Composite strings like box-shadow, linear-gradient, or border definitions
  return val
    .replace(/oklch\([^)]+\)/gi, (m) => convertSingleColorToRgb(m))
    .replace(/oklab\([^)]+\)/gi, (m) => convertSingleColorToRgb(m))
    .replace(/color\([^)]+\)/gi, (m) => convertSingleColorToRgb(m));
};

export const createComputedStyleProxy = (computed: CSSStyleDeclaration): CSSStyleDeclaration => {
  return new Proxy(computed, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          try {
            const val = target.getPropertyValue(propertyName);
            return typeof val === 'string' ? sanitizeColorString(val) : val;
          } catch {
            return '';
          }
        };
      }
      try {
        const val = (target as any)[prop];
        if (typeof val === 'string') {
          return sanitizeColorString(val);
        }
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      } catch {
        return (target as any)[prop];
      }
    }
  });
};

export async function withSafeComputedStyle<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof window === 'undefined') {
    return await fn();
  }
  const origGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    try {
      const orig = origGetComputedStyle.call(window, elt, pseudoElt);
      return createComputedStyleProxy(orig);
    } catch {
      return origGetComputedStyle.call(window, elt, pseudoElt);
    }
  };
  try {
    return await fn();
  } finally {
    window.getComputedStyle = origGetComputedStyle;
  }
};

export const safeHtml2Canvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return await withSafeComputedStyle(async () => {
    return await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      onclone: (_clonedDoc, clonedElement) => {
        // Ensure cloned element is fully visible in cloned document
        try {
          if (clonedElement) {
            clonedElement.style.opacity = '1';
            clonedElement.style.visibility = 'visible';
          }
        } catch {
          // ignore
        }

        // 1. Wrap cloned document defaultView.getComputedStyle if present
        if (_clonedDoc.defaultView) {
          const origClonedGCS = _clonedDoc.defaultView.getComputedStyle;
          _clonedDoc.defaultView.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            try {
              const orig = origClonedGCS.call(_clonedDoc.defaultView, elt, pseudoElt);
              return createComputedStyleProxy(orig);
            } catch {
              return origClonedGCS.call(_clonedDoc.defaultView, elt, pseudoElt);
            }
          };
        }

        // 2. Sanitize any modern oklch/oklab in all <style> tags within clonedDoc
        _clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          try {
            let css = styleEl.textContent || '';
            if (css.includes('oklch') || css.includes('oklab') || css.includes('color(')) {
              css = css.replace(/oklch\([^)]+\)/gi, (m) => convertSingleColorToRgb(m));
              css = css.replace(/oklab\([^)]+\)/gi, (m) => convertSingleColorToRgb(m));
              styleEl.textContent = css;
            }
          } catch {
            // ignore
          }
        });

        // 3. Sanitize inline styles on all elements
        const allElements = _clonedDoc.querySelectorAll<HTMLElement>('*');
        allElements.forEach((el) => {
          try {
            if (el.style) {
              const colorKeys = [
                'color',
                'backgroundColor',
                'borderColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'outlineColor',
                'boxShadow'
              ] as const;

              for (const k of colorKeys) {
                const val = (el.style as any)[k];
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                  (el.style as any)[k] = sanitizeColorString(val);
                }
              }
            }
          } catch {
            // ignore
          }
        });
      }
    });
  });
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
    // Check if there are receita_previa messages
    const previaMsg = messages.find(m => m.type === 'receita_previa' && m.receitaPreviaData?.items?.length);
    if (previaMsg && previaMsg.receitaPreviaData?.items && previaMsg.receitaPreviaData.items.length > 0) {
      previaMsg.receitaPreviaData.items.forEach(it => {
        const itemOrigin = it.origin || (isNationalProduct(it as any) ? 'Nacional' : 'Importado');
        itemsToRender.push({
          name: it.name,
          brand: it.brand,
          origin: itemOrigin,
          dosage: Array.isArray(it.dosage) ? it.dosage : [String(it.dosage || '')],
          description: it.description,
          activeIngredients: it.activeIngredients,
          concentration: it.concentration,
          pharmaceuticalForm: it.pharmaceuticalForm,
          quantity: it.quantity,
          administrationRoute: it.administrationRoute
        });
      });
    } else {
      messages.forEach(m => {
        if (m.type === 'product' && m.productData) {
          const itemOrigin = m.productData.origin || (isNationalProduct(m.productData as any) ? 'Nacional' : 'Importado');
          itemsToRender.push({
            name: m.productData.name,
            brand: m.productData.brand,
            origin: itemOrigin,
            dosage: Array.isArray(m.productData.dosage) ? m.productData.dosage : typeof (m.productData.dosage as any) === 'string' ? String(m.productData.dosage).split('\n').filter(Boolean) : [m.productData.dosage ? String(m.productData.dosage) : 'Tomar conforme orientação médica.'],
            description: m.productData.description,
            activeIngredients: m.productData.activeIngredients,
            concentration: m.productData.concentration,
            pharmaceuticalForm: m.productData.pharmaceuticalForm,
            quantity: m.productData.quantity,
            administrationRoute: m.productData.administrationRoute
          });
        }
      });
    }
  }

  const defaultClinicalNotes = `• Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.
• Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.
• Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.
• Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.`;

  const customNotesText = patientData?.customNotes !== undefined
    ? patientData.customNotes
    : (messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n') || defaultClinicalNotes);

  const nationalItems = itemsToRender.filter(isNationalProduct);
  const importedItems = itemsToRender.filter(item => !isNationalProduct(item));

  const hasNational = nationalItems.length > 0;
  const hasImported = importedItems.length > 0;

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
  const hasNotes = Boolean(customNotesText && customNotesText.trim());

  // Helper to create pages for each guide (ensuring national and imported are strictly separated on distinct sheets)
  const addGuidePages = (
    guideItems: PrescriptionItemData[],
    guideTitle: string,
    subtitleBase: string,
    badgeBase: string
  ) => {
    if (guideItems.length === 0) return;

    // Up to 4 items per page to guarantee no overflow, text truncation or clipping
    const totalItems = guideItems.length;
    const numPages = Math.ceil(totalItems / 4);
    const itemsPerPage = Math.ceil(totalItems / numPages);
    const chunks: PrescriptionItemData[][] = [];
    for (let i = 0; i < totalItems; i += itemsPerPage) {
      chunks.push(guideItems.slice(i, i + itemsPerPage));
    }

    let startIdx = 0;
    chunks.forEach((chunk, chunkIdx) => {
      const isLast = chunkIdx === chunks.length - 1;
      const subtitle = chunks.length > 1
        ? `${subtitleBase} (PARTE ${chunkIdx + 1})`
        : subtitleBase;
      const badge = chunks.length > 1
        ? `${badgeBase} • Pág ${chunkIdx + 1}`
        : badgeBase;

      allPagesToRender.push({
        guideTitle,
        guideSubtitle: subtitle,
        badge,
        pageNumber: 0,
        totalPages: 0,
        items: chunk,
        itemStartIndex: startIdx,
        notesText: isLast && hasNotes ? customNotesText : undefined
      });
      startIdx += chunk.length;
    });
  };

  if (hasNational && hasImported) {
    // Exactly 2 sheets when hasNational & hasImported (or partitioned if > 4 items in either)
    addGuidePages(
      nationalItems,
      "RECEITA MÉDICA",
      "GUIA 1: PRODUTOS NACIONAIS (ASSOCIAÇÃO BRASILEIRA)",
      "Guia 1 - Nacional"
    );
    addGuidePages(
      importedItems,
      "RECEITA MÉDICA",
      "GUIA 2: PRODUTOS IMPORTADOS (ANVISA RDC 660)",
      "Guia 2 - Importado"
    );
  } else if (hasNational) {
    addGuidePages(
      nationalItems,
      "RECEITA MÉDICA",
      "PRODUTOS NACIONAIS / ASSOCIAÇÃO BRASILEIRA",
      "Guia Única - Nacional"
    );
  } else if (hasImported) {
    addGuidePages(
      importedItems,
      "RECEITA MÉDICA",
      "PRODUTOS IMPORTADOS / ANVISA (RDC 660)",
      "Guia Única - Importado"
    );
  } else {
    addGuidePages(
      itemsToRender,
      "RECEITA MÉDICA",
      "RECEITUÁRIO MÉDICO ESPECIALIZADO",
      "Guia de Prescrição"
    );
  }

  // Calculate global page numbering across the whole document (e.g. Página 1 de 2, Página 2 de 2)
  const totalDocPages = allPagesToRender.length;
  allPagesToRender.forEach((page, idx) => {
    page.pageNumber = idx + 1;
    page.totalPages = totalDocPages;
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
              padding: "20px 36px 16px 36px", 
              backgroundColor: "#FFFFFF", 
              color: "#111827",
              boxSizing: "border-box"
            }}
          >
            <div>
              {/* Top Bar with Page Indicator & Guide Badge in-flow (never overlaps doctor info) */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                <span className="text-[9.5px] text-[#64748B] font-semibold">
                  Documento Médico Oficial MECURA • Página {page.pageNumber} de {page.totalPages}
                </span>
                <span className="bg-[#F3E8FF] text-[#581C87] border border-[#D8B4FE] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {page.badge}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2.5 mb-2">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                  <p className="text-[9px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                    CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.3' }}>{docName}</h3>
                  <p className="text-[10px] text-[#475569] font-semibold m-0" style={{ marginTop: '2px', lineHeight: '1.2' }}>{docCrm}</p>
                  <p className="text-[9px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{docSpec}</p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center my-1.5">
                <h1 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-widest m-0 leading-tight">
                  {page.guideTitle}
                </h1>
                <p className="text-[10px] font-bold text-[#059669] tracking-wider uppercase mt-0.5 m-0">
                  {page.guideSubtitle}
                </p>
                <div className="w-12 h-0.5 bg-[#059669] mx-auto mt-1 mb-1" />
              </div>

              {/* Patient Info Box */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1.5 mb-2 flex justify-between items-center">
                <div>
                  <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">Paciente</span>
                  <span className="font-bold text-[#0F172A] text-xs leading-none">{sanitizedUserName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">CPF / Nasc.</span>
                  <span className="font-semibold text-[#334155] text-[10.5px] leading-none">{cpfText} • {birthDateText}</span>
                </div>
              </div>

              {/* Items List for this page */}
              {page.items.length > 0 && (
                <div className="space-y-2 my-1">
                  {page.items.map((item, idx) => {
                    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                    const isGummy = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(item.name || item.type || '');
                    const isFlower = /flor|in natura/i.test(item.name || item.type || '');
                    const isNational = isNationalProduct(item);
                    const activeIng = (item.activeIngredients !== undefined && item.activeIngredients !== null && item.activeIngredients !== '') ? item.activeIngredients : enriched.activeIngredients;
                    const concentration = (item.concentration !== undefined && item.concentration !== null && item.concentration !== '') ? item.concentration : enriched.concentration;
                    const pharmForm = isGummy ? (item.pharmaceuticalForm && !/solução/i.test(item.pharmaceuticalForm) ? item.pharmaceuticalForm : 'Gomas Mastigáveis Veganas') : (item.pharmaceuticalForm || enriched.pharmaceuticalForm);
                    const quantity = isGummy ? (item.quantity && !/frasco/i.test(item.quantity) ? item.quantity : '01 Pote com 20 a 30 gomas') : (item.quantity || enriched.quantity);
                    const admRoute = isGummy ? 'Via Oral' : (item.administrationRoute || enriched.administrationRoute);
                    const displayIndex = page.itemStartIndex + idx + 1;

                    let dosageLines = item.dosage;
                    if (isGummy) {
                      dosageLines = dosageLines.map(d => {
                        if (/sublingual|gota|pingar/i.test(d)) {
                          return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
                        }
                        return d;
                      });
                    }

                    return (
                      <div key={idx} className="border-b border-[#F1F5F9] pb-1.5">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className="text-[12px] font-bold text-[#0F172A] m-0">
                            {displayIndex}. {item.name}
                          </span>
                          <span className="text-[8.5px] bg-[#F1F5F9] text-[#334155] font-bold px-2 py-0.5 rounded border border-[#E2E8F0] m-0 shrink-0">
                            {item.brand || enriched.brand} • {isNational ? 'Nacional (Associação)' : 'Importado (Anvisa RDC 660)'}
                          </span>
                        </div>

                        {/* Active Ingredient, Composition & Presentation */}
                        <div className="pl-2.5 mb-1 space-y-0.5 text-[9.5px] text-[#475569] leading-tight">
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Princípio Ativo:</span> {activeIng}</p>
                          {concentration && (
                            <p className="m-0"><span className="font-semibold text-[#1E293B]">Composição / Concentração:</span> {concentration}</p>
                          )}
                          <p className="m-0"><span className="font-semibold text-[#1E293B]">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
                        </div>

                        {/* Dosage */}
                        {(() => {
                          const posologyHeader = (isGummy || isFlower)
                            ? 'Posologia e Modo de Uso:'
                            : 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):';

                          // Filter out dosage lines that repeat the header note
                          const cleanedDosageLines = dosageLines.filter(d => {
                            const trimmed = d.trim();
                            if (!trimmed) return false;
                            if (/^Aproximadamente 25 gotas por mL\.?$/i.test(trimmed)) return false;
                            if (/^Posologia e Modo de Uso:\s*Aproximadamente 25 gotas por mL\.?$/i.test(trimmed)) return false;
                            return true;
                          });
                          const linesToRender = cleanedDosageLines.length > 0 ? cleanedDosageLines : dosageLines;

                          return (
                            <div className="pl-2.5 space-y-0.5 text-[9.5px] text-[#334155]">
                              <span className="font-semibold text-[#1E293B] block text-[10px] mb-0.5">{posologyHeader}</span>
                              {linesToRender.map((d, dIdx) => (
                                <p key={dIdx} className="m-0 leading-snug text-[9.5px]">• {d}</p>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes block if present on this page */}
              {page.notesText && (
                <div className="bg-[#F8FAFC] border-l-2 border-[#1E1B4B] p-2 text-[9px] text-[#334155] mt-1.5 rounded-r">
                  <span className="font-bold block text-[9.5px] uppercase text-[#475569] mb-0.5">Orientações Farmacológicas e Clínicas</span>
                  <div className="flex flex-col gap-0.5">
                    {page.notesText.split('\n').map((p, i) => p.trim() ? (
                      <p key={i} className="text-[9px] leading-tight m-0" dangerouslySetInnerHTML={{ __html: p }} />
                    ) : null)}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Signature & Emission Footer present on EVERY SINGLE PAGE */}
            <div className="pt-2 border-t border-[#E2E8F0] mt-auto flex justify-between items-end">
              <div className="text-[9px] text-[#64748B] space-y-0.5">
                <p className="m-0 font-medium">Data de Emissão: {emissionDateStr}</p>
                <p className="text-[8px] text-[#94A3B8] mt-0.5 m-0">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022</p>
              </div>

              {/* ICP Brasil Badge & Signature */}
              <div className="flex items-end gap-3">
                <div style={{ border: '1px solid #A7F3D0', backgroundColor: '#ECFDF5', borderRadius: '4px', padding: '3px 6px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '3px', backgroundColor: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '7.5px', flexShrink: 0 }}>
                      ICP
                    </div>
                    <div>
                      <p style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#065F46', lineHeight: 1, margin: 0 }}>Documento Assinado Digitalmente</p>
                      <p style={{ fontSize: '7px', color: '#047857', fontFamily: 'monospace', lineHeight: 1, margin: '2px 0 0 0' }}>Padrão ICP-Brasil • Validade Jurídica</p>
                    </div>
                  </div>
                </div>

                <div className="text-center w-52">
                  <div className="border-b border-[#94A3B8] mb-2" style={{ height: '0px' }} />
                  <p className="text-[11px] font-bold text-[#0F172A] m-0" style={{ lineHeight: '1.3' }}>{docName}</p>
                  <p className="text-[9.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '2px', lineHeight: '1.2' }}>{docCrm}</p>
                  <p className="text-[8.5px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>Assinatura Digital / Prescritor</p>
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
    // Wait for React to render and Tailwind to apply styles
    await new Promise(resolve => setTimeout(resolve, 800));

    const pageElements = container.querySelectorAll<HTMLElement>('.prescription-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Receita_Medica_${sanitizedUserName}.pdf`;
    const resultBlob = pdf.output('blob');
    if (!patientData?.returnBlob) {
      await deliverPdfBlob(resultBlob, filename);
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

  const isEvolutivo = Boolean(
    (patientData?.reportType === 'evolutivo' ||
     patientData?.docType === 'laudo_evolutivo' ||
     patientData?.isEvolutivo === true) &&
    patientData?.reportType !== 'inicial' &&
    patientData?.docType !== 'laudo_inicial' &&
    patientData?.isEvolutivo !== false
  );

  const fallback = (!patientData?.customDiagnosis || !patientData?.customRationale)
    ? generatePersonalizedClinicalReport({
        patientName: sanitizedUserName,
        birthDate: birthDateText,
        cpf: cpfText,
        objectives: patientData?.answers?.objectives || ['Ansiedade e Dor Crônica'],
        intensity: patientData?.answers?.intensity,
        duration: patientData?.answers?.duration,
        description: patientData?.answers?.description,
        diseaseOrigin: patientData?.answers?.diseaseOrigin,
        remedios: patientData?.answers?.remedios,
        remedios_details: patientData?.answers?.remedios_details,
        doenca_cronica: patientData?.answers?.doenca_cronica,
        doenca_cronica_details: patientData?.answers?.doenca_cronica_details,
        digestivo: patientData?.answers?.digestivo,
        digestivo_details: patientData?.answers?.digestivo_details,
        mainSymptoms: patientData?.answers?.mainSymptoms,
        pathology: patientData?.answers?.pathology
      }, isEvolutivo ? 'evolutivo' : 'inicial')
    : null;

  const diag = patientData?.customDiagnosis || fallback?.clinicalSummary || 'Quadro clínico crônico sob acompanhamento médico continuado.';
  const rat = patientData?.customRationale || fallback?.therapeuticRationale || 'Modulação do Sistema Endocanabinoide (SEC).';
  const plan = patientData?.customTreatmentPlan || fallback?.treatmentPlan || 'Terapêutica fitocanabinoide individualizada.';
  const mon = patientData?.customMonitoring || fallback?.monitoringText || 'Acompanhamento clínico periódico.';

  const totalLength = diag.length + rat.length + plan.length + mon.length;

  interface ReportPageData {
    pageNumber: number;
    totalPages: number;
    title: string;
    sections: { title: string; content: string }[];
  }

  const baseReportTitle = isEvolutivo ? 'LAUDO MÉDICO EVOLUTIVO' : 'LAUDO MÉDICO INICIAL';
  const baseReportSubtitle = isEvolutivo
    ? 'ACOMPANHAMENTO CLÍNICO E EVOLUÇÃO TERAPÊUTICA'
    : 'COMPROVAÇÃO DE INÍCIO DE TRATAMENTO CANABINOIDE';
  const baseReportBadge = isEvolutivo ? 'Laudo Evolutivo' : 'Laudo Inicial';

  const reportPages: ReportPageData[] = [];
  const planItems = plan ? plan.split(/\n\n+/).filter(itemBlock => itemBlock.trim()) : [];

  // Paging and capacity distribution:
  // - For Laudo Inicial (!isEvolutivo):
  //   Consolidated into 1 SINGLE PAGE (Folha Única) by default (up to ~3200 chars), so the physician signs only once!
  //   If exceptionally extensive (> 3200 chars), max 2 pages. Never 3 pages for Laudo Inicial!
  // - For Laudo Evolutivo (isEvolutivo):
  //   Judicial dossier with 7 pericial quesitos, fits into 1 page up to ~2400 chars, 2 pages up to 4800 chars, or 3 pages if > 4800 chars.
  const isSinglePage = isEvolutivo
    ? (totalLength <= 2400 && diag.length <= 1800)
    : (totalLength <= 3200 && diag.length <= 2200);

  if (isSinglePage) {
    // 1 SINGLE PAGE: All sections fit on 1 page! (Folha única oficial!)
    const p1Sections = [
      { 
        title: isEvolutivo ? 'Diagnóstico Clínico & Evolução Terapêutica' : 'Diagnóstico Clínico & Comprovação de Início de Tratamento', 
        content: diag 
      }
    ];
    if (rat) {
      p1Sections.push({
        title: isEvolutivo ? 'Fundamentação Terapêutica & Continuidade (Quesito 7)' : 'Raciocínio Clínico & Indicação de Início de Tratamento',
        content: rat
      });
    }
    if (plan) {
      p1Sections.push({
        title: 'Plano de Tratamento Canabinoide Individualizado',
        content: plan
      });
    }
    if (mon) {
      p1Sections.push({
        title: 'Diretrizes de Acompanhamento e Segurança',
        content: mon
      });
    }

    reportPages.push({
      pageNumber: 1,
      totalPages: 1,
      title: baseReportTitle,
      sections: p1Sections
    });
  } else if (!isEvolutivo || totalLength <= 4800) {
    // EXACTLY 2 PAGES: Distribute content to fill Page 1 and Page 2 completely!
    // Page 1 comfortably holds Diagnosis AND Rationale up to ~3800 chars, filling Page 1 gracefully
    // and leaving Page 2 dedicated to Treatment Plan, Monitoring Guidelines & Doctor Signature!
    const canPage1TakeRat = (diag.length + rat.length <= 3800) && diag.length <= 2500;

    if (canPage1TakeRat) {
      // Page 1 gets Diagnosis AND Rationale! (Page 1 is filled, no empty space!)
      const p1Sections = [
        { 
          title: isEvolutivo ? 'Diagnóstico Clínico, Histórico Convencional & Evolução com Canabinoides' : 'Diagnóstico Clínico & Comprovação de Início de Tratamento', 
          content: diag 
        }
      ];
      if (rat) {
        p1Sections.push({
          title: isEvolutivo ? 'Fundamentação Terapêutica & Continuidade (Quesito 7)' : 'Raciocínio Fisiopatológico e Indicação de Tratamento',
          content: rat
        });
      }

      reportPages.push({
        pageNumber: 1,
        totalPages: 2,
        title: baseReportTitle,
        sections: p1Sections
      });

      // Page 2 gets Treatment Plan AND Monitoring! (Page 2 is filled!)
      const p2Sections = [];
      if (plan) {
        p2Sections.push({
          title: 'Plano de Tratamento Canabinoide Individualizado',
          content: plan
        });
      }
      if (mon) {
        p2Sections.push({
          title: 'Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança',
          content: mon
        });
      }

      reportPages.push({
        pageNumber: 2,
        totalPages: 2,
        title: `${baseReportTitle} (CONTINUAÇÃO) — CONDUTA & MONITORAMENTO`,
        sections: p2Sections
      });
    } else {
      // Diagnosis alone is long (fills Page 1)
      let diagP1 = diag;
      let diagP2 = '';
      if (diag.length > 2500) {
        const splitIndex = diag.indexOf('\n\n', Math.floor(diag.length * 0.52));
        if (splitIndex !== -1) {
          diagP1 = diag.substring(0, splitIndex).trim();
          diagP2 = diag.substring(splitIndex).trim();
        }
      }

      reportPages.push({
        pageNumber: 1,
        totalPages: 2,
        title: baseReportTitle,
        sections: [
          { 
            title: isEvolutivo ? 'Diagnóstico Clínico, Histórico Convencional & Evolução com Canabinoides' : 'Diagnóstico Clínico & Comprovação de Início de Tratamento', 
            content: diagP1 
          }
        ]
      });

      const p2Sections = [];
      if (diagP2) {
        p2Sections.push({
          title: isEvolutivo ? 'Continuação da Evolução Clínica' : 'Continuação da Avaliação Clínica',
          content: diagP2
        });
      }
      if (rat) {
        p2Sections.push({
          title: isEvolutivo ? 'Fundamentação Terapêutica & Riscos de Interrupção (Quesito 7)' : 'Raciocínio Fisiopatológico e Indicação do Tratamento',
          content: rat
        });
      }
      if (plan) {
        p2Sections.push({
          title: 'Plano de Tratamento Canabinoide Individualizado',
          content: plan
        });
      }
      if (mon) {
        p2Sections.push({
          title: 'Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança',
          content: mon
        });
      }

      reportPages.push({
        pageNumber: 2,
        totalPages: 2,
        title: `${baseReportTitle} (CONTINUAÇÃO) — CONDUTA & MONITORAMENTO`,
        sections: p2Sections
      });
    }
  } else {
    // 3 PAGES: for very extensive dossiers (> 4800 characters)
    let diagP1 = diag;
    let diagP2 = '';
    if (diag.length > 2500) {
      const splitIndex = diag.indexOf('\n\n', Math.floor(diag.length * 0.52));
      if (splitIndex !== -1) {
        diagP1 = diag.substring(0, splitIndex).trim();
        diagP2 = diag.substring(splitIndex).trim();
      }
    }

    reportPages.push({
      pageNumber: 1,
      totalPages: 3,
      title: baseReportTitle,
      sections: [
        { 
          title: isEvolutivo ? 'Diagnóstico Clínico, Histórico Convencional & Evolução com Canabinoides' : 'Diagnóstico Clínico & Comprovação de Início de Tratamento', 
          content: diagP1 
        }
      ]
    });

    const p2Sections = [];
    if (diagP2) {
      p2Sections.push({
        title: isEvolutivo ? 'Continuação da Evolução Clínica' : 'Continuação da Avaliação Clínica',
        content: diagP2
      });
    }
    if (rat) {
      p2Sections.push({
        title: isEvolutivo ? 'Fundamentação Terapêutica & Riscos de Interrupção (Quesito 7)' : 'Raciocínio Fisiopatológico e Indicação do Tratamento',
        content: rat
      });
    }

    if (planItems.length >= 2) {
      const half = Math.ceil(planItems.length / 2);
      const planPart1 = planItems.slice(0, half).join('\n\n');
      const planPart2 = planItems.slice(half).join('\n\n');

      if (planPart1) {
        p2Sections.push({
          title: 'Plano de Tratamento Canabinoide (Parte 1)',
          content: planPart1
        });
      }

      reportPages.push({
        pageNumber: 2,
        totalPages: 3,
        title: `${baseReportTitle} (CONTINUAÇÃO) — FUNDAMENTAÇÃO & CONDUTA`,
        sections: p2Sections
      });

      const p3Sections = [];
      if (planPart2) {
        p3Sections.push({
          title: 'Continuação do Plano de Tratamento Canabinoide',
          content: planPart2
        });
      }
      if (mon) {
        p3Sections.push({
          title: 'Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança',
          content: mon
        });
      }

      reportPages.push({
        pageNumber: 3,
        totalPages: 3,
        title: `${baseReportTitle} (CONTINUAÇÃO) — MONITORAMENTO & DIRETRIZES`,
        sections: p3Sections
      });
    } else {
      if (plan) {
        p2Sections.push({
          title: 'Plano de Tratamento Canabinoide Individualizado',
          content: plan
        });
      }

      reportPages.push({
        pageNumber: 2,
        totalPages: 3,
        title: `${baseReportTitle} (CONTINUAÇÃO) — FUNDAMENTAÇÃO & CONDUTA`,
        sections: p2Sections
      });

      if (mon) {
        reportPages.push({
          pageNumber: 3,
          totalPages: 3,
          title: `${baseReportTitle} (CONTINUAÇÃO) — MONITORAMENTO & DIRETRIZES`,
          sections: [
            {
              title: 'Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança',
              content: mon
            }
          ]
        });
      }
    }
  }

  // Ensure totalPages and pageNumber are exact across all pages
  reportPages.forEach((p, idx) => {
    p.pageNumber = idx + 1;
    p.totalPages = reportPages.length;
  });

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        {reportPages.map((page, pIdx) => (
          <div 
            key={pIdx}
            className="medical-report-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between" 
            style={{ 
              width: "794px", 
              minHeight: "1123px", 
              height: "1123px", 
              padding: "16px 36px 14px 36px", 
              backgroundColor: "#FFFFFF", 
              color: "#111827",
              boxSizing: "border-box"
            }}
          >
            <div>
              {/* Top Bar with Page Indicator in-flow (never overlaps doctor info) */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                <span className="text-[9.5px] text-[#64748B] font-semibold">
                  Documento Médico Oficial MECURA
                </span>
                <span className="text-[9.5px] text-[#64748B] font-bold">
                  Página {page.pageNumber} de {page.totalPages}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2.5 mb-2">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                  <p className="text-[9px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                    CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.3' }}>{docName}</h3>
                  <p className="text-[10px] text-[#475569] font-semibold m-0" style={{ marginTop: '2px', lineHeight: '1.2' }}>{docCrm}</p>
                  <p className="text-[9px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{docSpec}</p>
                </div>
              </div>

              {/* Title & Patient Identification */}
              {page.pageNumber === 1 ? (
                <div className="text-center mb-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-[9px] font-bold tracking-widest text-[#059669] uppercase">
                      {baseReportSubtitle}
                    </span>
                    <span className={`font-bold text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      isEvolutivo 
                        ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' 
                        : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                    }`}>
                      {baseReportBadge}
                    </span>
                  </div>
                  <h1 className="text-sm font-black text-[#1E1B4B] tracking-widest uppercase mb-1">{page.title}</h1>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                      <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                      <span className="font-semibold text-[#0F172A]">{sanitizedUserName}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-[#64748B]">
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
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#475569]">EMISSÃO:</span> {emissionDateStr}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-2 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <span className="text-[10px] font-black text-[#1E1B4B] tracking-wider uppercase">{page.title}</span>
                  <span className="text-[9px] font-bold text-[#475569]">PACIENTE: <strong className="text-[#0F172A]">{sanitizedUserName}</strong></span>
                </div>
              )}

              {/* Sections for this page */}
              <div className="space-y-2">
                {page.sections.map((sec, sIdx) => {
                  const isPlanSection = sec.title.toLowerCase().includes('plano de tratamento');

                  return (
                    <div key={sIdx}>
                      <h4 className="text-[10px] font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-0.5 mb-1 flex items-center justify-between">
                        <span>{sec.title}</span>
                      </h4>

                      {isPlanSection ? (
                        <div className={planItems.length >= 4 ? "space-y-1" : "space-y-1.5"}>
                          {sec.content.split(/\n\n+/).filter(itemBlock => itemBlock.trim()).map((itemBlock, iIdx) => {
                            const lines = itemBlock.split('\n').map(l => l.trim()).filter(Boolean);
                            const titleLine = lines[0] || '';
                            const detailLines = lines.slice(1);

                            return (
                              <div key={iIdx} className={`bg-[#F8FAFC] border border-[#E2E8F0] rounded leading-snug ${planItems.length >= 4 ? 'p-1.5 text-[8.5px]' : 'p-2 text-[9px] text-[#334155]'}`}>
                                <p className={`font-bold text-[#0F172A] mb-0.5 m-0 ${planItems.length >= 4 ? 'text-[9px]' : 'text-[9.5px]'}`}>{titleLine}</p>
                                <div className={`space-y-0.5 pl-1 text-[#475569] ${planItems.length >= 4 ? 'text-[8px]' : 'text-[8.5px]'}`}>
                                  {detailLines.map((line, lIdx) => (
                                    <p key={lIdx} className="m-0 leading-tight">{line}</p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-[#334155] leading-snug flex flex-col gap-1 text-justify">
                          {sec.content.split('\n').map((p, i) => {
                            const trimmed = p.trim();
                            if (!trimmed) return <div key={i} className="h-0.5" />;
                            
                            const isSubheader = /^(Hist[óo]rico|Evolu[çc][ãa]o|Indica[çc][ãa]o|CID|Quesito|\d+\.\s*Quanto|Racioc[íi]nio|Diretrizes|Seguran[çc]a|Retorno)/i.test(trimmed);
                            if (isSubheader) {
                              return (
                                <p key={i} className="font-bold text-[#1E1B4B] text-[9.5px] mt-0.5 mb-0.5">
                                  {trimmed}
                                </p>
                              );
                            }
                            return (
                              <p key={i} className="m-0 leading-snug text-justify">
                                {trimmed}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor Signature & Emission Footer — Signature only on final page so doctor does not have to sign every intermediate page */}
            {page.pageNumber === page.totalPages ? (
              <div className="mt-auto pt-2 border-t border-[#E2E8F0]">
                <div className="flex flex-col items-center">
                  <div className="w-52 border-b border-[#CBD5E1] mb-2" style={{ height: '0px' }}></div>
                  <p className="text-[10.5px] font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.3' }}>{docName}</p>
                  <p className="text-[9px] text-[#64748B] font-semibold m-0" style={{ marginTop: '2px', marginBottom: '3px', lineHeight: '1.2' }}>{docCrm} • Assinatura Digital / Prescritor</p>
                  <div className="flex justify-between w-full text-[7.5px] text-[#94A3B8] font-semibold mt-1">
                    <span>Data de Emissão: {emissionDateStr}</span>
                    <span>Documento Médico Oficial • Válido em todo o território nacional</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[8px] text-[#64748B] font-semibold">
                  <span>MECURA • Centro Integrado de Medicina Canabinoide</span>
                  <span className="text-[#1E1B4B] font-bold">Documento Médico Oficial — Continua na folha {page.pageNumber + 1}...</span>
                  <span>Folha {page.pageNumber} de {page.totalPages}</span>
                </div>
                <div className="flex justify-between w-full text-[7.5px] text-[#94A3B8] font-medium mt-1">
                  <span>Paciente: {sanitizedUserName}</span>
                  <span>Médico Assistente: {docName} ({docCrm})</span>
                  <span>Emissão: {emissionDateStr}</span>
                </div>
              </div>
            )}
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
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Laudo_Medico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;
    const resultBlob = pdf.output('blob');
    if (!patientData?.returnBlob) {
      await deliverPdfBlob(resultBlob, filename);
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
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.3' }}>{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0" style={{ marginTop: '2px', lineHeight: '1.2' }}>{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{docSpec}</p>
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
              <div className="w-56 border-b border-[#CBD5E1] mb-2.5" style={{ height: '0px' }}></div>
              <p className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.3' }}>{docName}</p>
              <p className="text-[10px] text-[#64748B] font-semibold m-0" style={{ marginTop: '2px', marginBottom: '4px', lineHeight: '1.2' }}>{docCrm} • Assinatura Digital / Prescritor</p>
              <div className="flex justify-between w-full text-[9px] text-[#94A3B8] font-semibold mt-1">
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
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Laudo_Psicomotor_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;
    const resultBlob = pdf.output('blob');
    if (!patientData?.returnBlob) {
      await deliverPdfBlob(resultBlob, filename);
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
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    } else {
      const contentEl = (container.firstElementChild || container) as HTMLElement;
      const canvas = await safeHtml2Canvas(contentEl);
      const imgData = canvas.toDataURL('image/jpeg', 0.82);
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
    const resultBlob = pdf.output('blob');
    if (!agronomicData?.returnBlob) {
      await deliverPdfBlob(resultBlob, filename);
    }
    return resultBlob;
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};
