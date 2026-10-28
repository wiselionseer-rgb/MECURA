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
  posologyHeader?: string;
  dosage: string[];
  description?: string;
  priceUSD?: number;
  priceBRL?: number;
  image?: string;
  details?: string[];
  sourceMedName?: string;
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

export const formatDoctorCrmLine = (crm: string, spec?: string) => {
  const trimmedCrm = (crm || '').trim();
  const hasUf = /(?:CRM[/-]?[A-Z]{2}|[/-][A-Z]{2}\b|\bMT\b|\bSP\b|\bRJ\b)/i.test(trimmedCrm);
  const crmPart = hasUf ? trimmedCrm : `${trimmedCrm} • Estado MT`;
  const specPart = spec || 'Clínico Geral';
  return `${crmPart} • ${specPart}`;
};

export const isNationalProduct = (item: PrescriptionItemData): boolean => {
  const originLower = (item.origin || '').toLowerCase().trim();
  const brandLower = (item.brand || '').toLowerCase().trim();
  const nameLower = (item.name || '').toLowerCase().trim();

  // 1. Explicit doctor user choice in UI dropdown takes immediate precedence
  if (
    originLower === 'nacional' ||
    originLower.includes('nacional') ||
    originLower.includes('associação') ||
    originLower.includes('associacao') ||
    originLower.includes('brasil') ||
    originLower.includes('brazil')
  ) {
    return true;
  }

  if (
    originLower === 'importado' ||
    originLower.includes('import') ||
    originLower.includes('eua') ||
    originLower.includes('usa') ||
    originLower.includes('exterior') ||
    originLower.includes('rdc 660') ||
    originLower.includes('rdc660') ||
    originLower.includes('folheto especial')
  ) {
    return false;
  }

  // 2. Explicit import brands and product lines when origin is unspecified
  if (
    brandLower.includes('flowermed') ||
    nameLower.includes('flowermed') ||
    brandLower.includes('pangaia') ||
    nameLower.includes('pangaia') ||
    brandLower.includes('greenbudz') ||
    nameLower.includes('greenbudz') ||
    nameLower.includes('drops by') ||
    nameLower.includes('calm vibe') ||
    nameLower.includes('full balance') ||
    nameLower.includes('looking glass') ||
    nameLower.includes('beethoven') ||
    nameLower.includes('evergreen') ||
    nameLower.includes('nightshade') ||
    nameLower.includes('chill vibe') ||
    nameLower.includes('dried hemp') ||
    nameLower.includes('stirred hemp') ||
    nameLower.includes('sphera') ||
    nameLower.includes('nano syrup') ||
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

  // 3. Explicit national origin or brand
  if (
    originLower.includes('nacional') ||
    originLower.includes('associação') ||
    originLower.includes('associacao') ||
    originLower.includes('brasil') ||
    originLower.includes('brazil') ||
    originLower.includes('abrace') ||
    originLower.includes('abecmed') ||
    originLower.includes('soucannabis') ||
    originLower.includes('sou cannabis') ||
    originLower.includes('abrascorp') ||
    originLower.includes('amame') ||
    originLower.includes('apepi') ||
    originLower.includes('cultive') ||
    originLower.includes('salva') ||
    originLower.includes('santa cannabis') ||
    originLower.includes('flor da vida') ||
    brandLower.includes('associação') ||
    brandLower.includes('associacao') ||
    brandLower.includes('abrace') ||
    brandLower.includes('abecmed') ||
    brandLower.includes('soucannabis') ||
    brandLower.includes('sou cannabis') ||
    brandLower.includes('abrascorp') ||
    brandLower.includes('amame') ||
    brandLower.includes('apepi') ||
    brandLower.includes('santa esperança') ||
    brandLower.includes('santa cannabis') ||
    brandLower.includes('flor da vida') ||
    brandLower.includes('cultive') ||
    brandLower.includes('salva') ||
    brandLower.includes('curando ivan') ||
    brandLower.includes('acolher') ||
    brandLower.includes('aliança') ||
    brandLower.includes('carm') ||
    brandLower.includes('prati-donaduzzi') ||
    brandLower.includes('herbarium') ||
    brandLower.includes('tegum') ||
    brandLower.includes('ease labs')
  ) {
    return true;
  }

  // 4. Name indicators for Brazilian associations
  if (
    /soucannabis|sou\s*cannabis|abrace|abecmed|abrascorp|amame|apepi|cultive|santa cannabis|flor da vida|associação|associacao|nacional|brasil|óleo integral/i.test(nameLower)
  ) {
    return true;
  }

  // 5. Check enriched catalog details
  try {
    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
    if (enriched && enriched.origin) {
      const eOrigin = enriched.origin.toLowerCase();
      if (eOrigin.includes('import') || eOrigin.includes('eua') || eOrigin.includes('usa')) {
        return false;
      }
      if (eOrigin.includes('nacional') || eOrigin.includes('associação') || eOrigin.includes('associacao') || eOrigin.includes('abrace') || eOrigin.includes('abecmed') || eOrigin.includes('soucannabis') || eOrigin.includes('sou cannabis')) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  // 6. Default: If not specifically marked as imported, treat as National
  return !/import|eua|usa/i.test(originLower);
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

// Mathematical conversion from OKLCH space to sRGB for html2canvas compatibility
function oklchToRgb(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

  const r = Math.min(255, Math.max(0, Math.round(gamma(rLin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gamma(gLin) * 255)));
  const bVal = Math.min(255, Math.max(0, Math.round(gamma(bLin) * 255)));

  return `rgb(${r}, ${g}, ${bVal})`;
}

export const parseOklchString = (str: string): string | null => {
  if (!str) return null;
  const match = str.match(/oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
  if (!match) return null;
  const [, lStr, cStr, hStr, aStr] = match;
  let l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
  let c = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
  let h = parseFloat(hStr) || 0;
  let alpha = aStr ? (aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr)) : 1;

  if (isNaN(l) || isNaN(c) || isNaN(h)) return null;

  const rgbStr = oklchToRgb(l, c, h);
  if (alpha < 1) {
    const rgbMatch = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
    }
  }
  return rgbStr;
};

export const convertSingleColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  const trimmed = colorStr.trim();
  if (colorConversionCache.has(trimmed)) {
    return colorConversionCache.get(trimmed)!;
  }

  // Direct mathematical parse for OKLCH strings
  if (trimmed.includes('oklch')) {
    const parsed = parseOklchString(trimmed);
    if (parsed) {
      colorConversionCache.set(trimmed, parsed);
      return parsed;
    }
  }

  const ctx = getColorCanvasContext();
  if (ctx) {
    try {
      ctx.fillStyle = '#123456';
      ctx.fillStyle = trimmed;
      const converted = ctx.fillStyle;
      if (converted && converted !== '#123456' && !converted.includes('oklch') && !converted.includes('oklab') && !converted.includes('color(')) {
        colorConversionCache.set(trimmed, converted);
        return converted;
      }
    } catch {
      // ignore
    }
  }

  let fallback = '#FAF5FF';
  if (/^oklch\s*\(\s*(0|0?\.\d+)\b/i.test(trimmed)) {
    const match = trimmed.match(/oklch\(\s*([\d.%]+)/i);
    if (match) {
      const l = match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
      if (l < 0.4) fallback = '#3B0764'; // dark purple / black
      else if (l > 0.8) fallback = '#FAF5FF'; // light background
      else fallback = '#7E22CE';
    }
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

        // 4. Ensure cloned target and all ancestor nodes have opacity: 1 and visibility: visible
        let curr: HTMLElement | null = clonedElement;
        while (curr) {
          if (curr.style) {
            curr.style.opacity = '1';
            curr.style.visibility = 'visible';
          }
          curr = curr.parentElement;
        }
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

  const rawDocSpec = patientData?.customDoctorSpecialty || "Clínico Geral • Medicina Canabinoide";
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = rawDocSpec.toLowerCase().includes('clínico geral') || rawDocSpec.toLowerCase().includes('clinico geral')
    ? rawDocSpec
    : `Clínico Geral • ${rawDocSpec}`;
  const docContactLine = "Tel: +55 65 3190-0629 • E-mail: Wiselionseer@gmail.com";
  const docAddressLine = "Primavera do Leste - MT • CEP 78850-000";

  // Check localStorage for saved prescription matching this patient if customItems are not directly provided
  let savedStoragePrescription: any = null;
  try {
    const rawSavedPresc = localStorage.getItem('mecura_saved_prescriptions_v2');
    if (rawSavedPresc) {
      const parsedPresc = JSON.parse(rawSavedPresc);
      const targetName = (sanitizedUserName || '').trim().toLowerCase();
      const candidateKeys = [
        (patientData as any)?.patientId ? `id:${String((patientData as any).patientId).toLowerCase().trim()}` : '',
        ((patientData as any)?.patientId || '').toLowerCase().trim(),
        targetName && targetName !== 'paciente' ? `name:${targetName}` : '',
        targetName && targetName !== 'paciente' ? targetName : ''
      ].filter(Boolean);

      for (const k of candidateKeys) {
        const cand = parsedPresc?.[k];
        if (cand && Array.isArray(cand.items) && cand.items.length > 0) {
          const cachedName = (cand.patientName || '').trim().toLowerCase();
          if (!cachedName || !targetName || targetName === 'paciente' || cachedName === targetName) {
            savedStoragePrescription = cand;
            break;
          }
        }
      }
    }
  } catch {
    // ignore storage errors
  }

  // Gather items from customItems, savedStoragePrescription, prescription/receita_previa messages, or product messages
  let itemsToRender: PrescriptionItemData[] = [];
  if (patientData?.customItems && patientData.customItems.length > 0) {
    itemsToRender = patientData.customItems;
  } else if (savedStoragePrescription?.items && savedStoragePrescription.items.length > 0) {
    itemsToRender = savedStoragePrescription.items;
  } else {
    // Check if there are prescription or receita_previa messages (use the latest one)
    const msgList = Array.isArray(messages) ? messages : [];
    const previaOrPrescMsgs = msgList.filter(
      m => (m.type === 'prescription' || m.type === 'receita_previa' || (m as any).prescriptionData?.items?.length) &&
           ((m.receitaPreviaData?.items && m.receitaPreviaData.items.length > 0) || ((m as any).prescriptionData?.items && (m as any).prescriptionData.items.length > 0))
    );
    const latestPrescMsg = previaOrPrescMsgs.length > 0 ? previaOrPrescMsgs[previaOrPrescMsgs.length - 1] : null;
    const msgItems = latestPrescMsg?.receitaPreviaData?.items || (latestPrescMsg as any)?.prescriptionData?.items;

    if (msgItems && Array.isArray(msgItems) && msgItems.length > 0) {
      msgItems.forEach((it: any) => {
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
          administrationRoute: it.administrationRoute,
          posologyHeader: it.posologyHeader
        });
      });
    } else {
      msgList.forEach(m => {
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

  const msgListForNotes = Array.isArray(messages) ? messages : [];
  const latestPrescNotesFromMsg = [...msgListForNotes]
    .reverse()
    .find(m => (m.type === 'prescription' || m.type === 'receita_previa') && m.receitaPreviaData?.notes)?.receitaPreviaData?.notes;

  const customNotesText = patientData?.customNotes !== undefined
    ? patientData.customNotes
    : (savedStoragePrescription?.notes ||
       msgListForNotes.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n') ||
       latestPrescNotesFromMsg ||
       defaultClinicalNotes);

  const nationalItems = itemsToRender.filter(isNationalProduct);
  const importedItems = itemsToRender.filter(item => !isNationalProduct(item));

  const hasNational = nationalItems.length > 0;
  const hasImported = importedItems.length > 0;
  const hasNotes = Boolean(customNotesText && customNotesText.trim());

  interface PrescriptionPageData {
    guideTitle: string;
    guideSubtitle: string;
    badge: string;
    pageNumber: number;
    totalPages: number;
    items: PrescriptionItemData[];
    itemStartIndex: number;
    notesText?: string;
    isCompactGuide: boolean;
    isDenseGuide: boolean;
  }

  const renderPrescriptionItemCard = (
    item: PrescriptionItemData,
    displayIndex: number,
    isDense: boolean,
    isCompact: boolean,
    key: string | number,
    measureAttr?: { [k: string]: any }
  ) => {
    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
    const isGummy = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(item.name || item.type || '');
    const isFlower = /flor|in natura/i.test(item.name || item.type || '');
    const isNational = isNationalProduct(item);
    const activeIng = (item.activeIngredients !== undefined && item.activeIngredients !== null && item.activeIngredients !== '') ? item.activeIngredients : enriched.activeIngredients;
    const concentration = (item.concentration !== undefined && item.concentration !== null && item.concentration !== '') ? item.concentration : enriched.concentration;
    const pharmForm = isGummy ? (item.pharmaceuticalForm && !/solução/i.test(item.pharmaceuticalForm) ? item.pharmaceuticalForm : 'Gomas Mastigáveis Veganas') : (item.pharmaceuticalForm || enriched.pharmaceuticalForm);
    const quantity = isGummy ? (item.quantity && !/frasco/i.test(item.quantity) ? item.quantity : '01 Pote com 20 a 30 gomas') : (item.quantity || enriched.quantity);
    const admRoute = isGummy ? 'Via Oral' : (item.administrationRoute || enriched.administrationRoute);

    let dosageLines = item.dosage;
    if (isGummy) {
      dosageLines = dosageLines.map(d => {
        if (/sublingual|gota|pingar/i.test(d)) {
          return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
        }
        return d;
      });
    }

    const isSyringeOrMl = /seringa|marcação de ml|via oral sublingual 0|em ml/i.test(`${pharmForm} ${item.name} ${admRoute} ${dosageLines.join(' ')}`);
    const posologyHeader = item.posologyHeader !== undefined
      ? (item.posologyHeader.trim() ? item.posologyHeader.trim() : 'Posologia e Modo de Uso:')
      : ((isGummy || isFlower || isSyringeOrMl)
          ? 'Posologia e Modo de Uso:'
          : 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):');

    const cleanedDosageLines = dosageLines.filter(d => {
      const trimmed = d.trim();
      if (!trimmed) return false;
      if (posologyHeader.includes('25 gotas') && /^Aproximadamente 25 gotas por mL\.?$/i.test(trimmed)) return false;
      if (/^Posologia e Modo de Uso:\s*Aproximadamente 25 gotas por mL\.?$/i.test(trimmed)) return false;
      return true;
    });
    const linesToRender = cleanedDosageLines.length > 0 ? cleanedDosageLines : dosageLines;

    return (
      <div
        key={key}
        {...(measureAttr || {})}
        className={
          isDense
            ? "bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1"
            : isCompact
              ? "bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2.5 py-1.5"
              : "bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        }
      >
        <div className="flex items-baseline justify-between mb-0.5 gap-2">
          <span className={`font-bold text-[#0F172A] m-0 ${isDense ? 'text-[9.5px]' : isCompact ? 'text-[10.5px]' : 'text-[11.5px]'}`}>
            {displayIndex}. {item.name}
          </span>
          <span className={`bg-[#EEF2F6] text-[#334155] font-bold px-1.5 py-0.2 rounded border border-[#CBD5E1] m-0 shrink-0 ${isDense ? 'text-[7px]' : isCompact ? 'text-[7.5px]' : 'text-[8px]'}`}>
            {item.brand || enriched.brand} • {isNational ? 'Nacional (Associação)' : 'Importado (Anvisa RDC 660)'}
          </span>
        </div>

        <div className={`pl-1 mb-0.5 space-y-0 text-[#475569] leading-tight ${isDense ? 'text-[7.5px]' : isCompact ? 'text-[8px]' : 'text-[8.5px]'}`}>
          <p className="m-0"><span className="font-semibold text-[#1E293B]">Princípio Ativo:</span> {activeIng}</p>
          {concentration && (
            <p className="m-0"><span className="font-semibold text-[#1E293B]">Composição / Concentração:</span> {concentration}</p>
          )}
          <p className="m-0"><span className="font-semibold text-[#1E293B]">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
        </div>

        <div className={`pl-1 space-y-0 text-[#334155] ${isDense ? 'text-[7.5px]' : isCompact ? 'text-[8px]' : 'text-[8.5px]'}`}>
          <span className={`font-semibold text-[#1E293B] block ${isDense ? 'text-[7.5px]' : isCompact ? 'text-[8.5px]' : 'text-[9px]'}`}>{posologyHeader}</span>
          {linesToRender.map((d, dIdx) => (
            <p key={dIdx} className="m-0 leading-tight">• {d}</p>
          ))}
        </div>
      </div>
    );
  };

  const renderNotesBlock = (notesText: string, isDense: boolean, isCompact: boolean) => (
    <div className={`bg-[#F8FAFC] border-l-2 border-[#1E1B4B] rounded-r ${isDense ? 'p-1.5 text-[7.5px] mt-1' : isCompact ? 'p-2 text-[8px] mt-1.5' : 'p-2.5 text-[8.5px] mt-2'} text-[#334155]`}>
      <span className={`font-bold block uppercase text-[#1E1B4B] mb-0.5 ${isDense ? 'text-[8px]' : isCompact ? 'text-[8.5px]' : 'text-[9px]'}`}>
        Orientações Farmacológicas e Clínicas
      </span>
      <div className="flex flex-col gap-0.5">
        {notesText.split('\n').map((p, i) => p.trim() ? (
          <p key={i} className="leading-tight m-0" dangerouslySetInnerHTML={{ __html: p }} />
        ) : null)}
      </div>
    </div>
  );

  const renderDispensacaoBlock = (isNationalGuide: boolean, isCompact: boolean) => (
    <div className={`bg-[#F8FAFC] border border-[#E2E8F0] rounded-md ${isCompact ? 'p-2 mt-1.5 text-[8px]' : 'p-2.5 mt-2 text-[8.5px]'} text-[#475569] leading-snug`}>
      <span className="font-bold block text-[8.5px] uppercase text-[#1E1B4B] mb-0.5">
        {isNationalGuide
          ? 'Dispensação Associativa & Conformidade Farmacoterapêutica (Brasil)'
          : 'Autorização de Importação Excepcional & Conformidade Sanitária (RDC Anvisa nº 660/2022)'}
      </span>
      <p className="m-0">
        {isNationalGuide
          ? '• Prescrição médica oficial destinada à dispensação exclusiva junto a Associações de Pacientes legalmente constituídas no território nacional.'
          : '• Prescrição médica oficial habilitada para importação excepcional de produtos derivados de Cannabis por pessoa física para uso próprio sob fiscalização da ANVISA (RDC nº 660/2022).'}
      </p>
      <p className="m-0">
        • Tratamento individualizado de uso contínuo sob estrita supervisão médica. Manter o produto em sua embalagem original ao abrigo de luz e calor.
      </p>
    </div>
  );

  const renderPrescriptionSignatureBlock = () => (
    <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-end shrink-0 w-full">
      <div className="text-[8px] text-[#64748B] space-y-0.5">
        <p className="m-0 font-bold text-[#1E1B4B] text-[8.5px]">Validade Legal em Todo o Território Nacional</p>
        <p className="m-0">Data de Emissão: <strong>{emissionDateStr}</strong> • Local: <strong>{docAddressLine}</strong></p>
        <p className="m-0 text-[#475569] font-medium">{docContactLine}</p>
        <p className="text-[7.5px] text-[#94A3B8] m-0">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022 • CFM</p>
      </div>

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

        <div className="text-center w-56">
          <div className="border-b border-[#94A3B8] mb-1" style={{ height: '0px' }} />
          <p className="text-[10.5px] font-bold text-[#0F172A] m-0" style={{ lineHeight: '1.2' }}>{docName}</p>
          <p className="text-[8.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{formatDoctorCrmLine(docCrm, 'Clínico Geral')}</p>
          <p className="text-[7.5px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>+55 65 3190-0629 • Wiselionseer@gmail.com</p>
        </div>
      </div>
    </div>
  );

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    interface GuideGroupSpec {
      items: PrescriptionItemData[];
      guideTitle: string;
      subtitleBase: string;
      badgeBase: string;
    }

    const guideGroups: GuideGroupSpec[] = [];
    if (hasNational && hasImported) {
      guideGroups.push({
        items: nationalItems,
        guideTitle: "RECEITA MÉDICA",
        subtitleBase: "GUIA 1: PRODUTOS NACIONAIS (ASSOCIAÇÃO BRASILEIRA)",
        badgeBase: "Guia 1 - Nacional"
      });
      guideGroups.push({
        items: importedItems,
        guideTitle: "RECEITA MÉDICA",
        subtitleBase: "GUIA 2: PRODUTOS IMPORTADOS (ANVISA RDC 660)",
        badgeBase: "Guia 2 - Importado"
      });
    } else if (hasNational) {
      guideGroups.push({
        items: nationalItems,
        guideTitle: "RECEITA MÉDICA",
        subtitleBase: "PRODUTOS NACIONAIS / ASSOCIAÇÃO BRASILEIRA",
        badgeBase: "Guia Única - Nacional"
      });
    } else if (hasImported) {
      guideGroups.push({
        items: importedItems,
        guideTitle: "RECEITA MÉDICA",
        subtitleBase: "PRODUTOS IMPORTADOS / ANVISA (RDC 660)",
        badgeBase: "Guia Única - Importado"
      });
    } else {
      guideGroups.push({
        items: itemsToRender,
        guideTitle: "RECEITA MÉDICA",
        subtitleBase: "RECEITUÁRIO MÉDICO ESPECIALIZADO",
        badgeBase: "Guia de Prescrição"
      });
    }

    // PASS 1: Measure DOM heights of header chrome, signature, notes, and each guide's items in compact/dense/normal modes
    const MeasureRxComponent = () => (
      <div
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          width: '794px',
          padding: '14px 36px 16px 36px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#111827'
        }}
      >
        <div id="rx-measure-chrome">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-100">
            <span className="text-[9.5px] text-[#64748B] font-semibold">Documento Médico Oficial MECURA • Página 1 de 1</span>
            <span className="bg-[#F3E8FF] text-[#581C87] border border-[#D8B4FE] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Guia</span>
          </div>
          <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2 mb-1.5">
            <div>
              <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
              <p className="text-[9px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">CENTRO INTEGRADO DE MEDICINA CANABINOIDE</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-[#1E1B4B] m-0">{docName}</h3>
              <p className="text-[9.5px] text-[#475569] font-semibold m-0">{formatDoctorCrmLine(docCrm, docSpec)}</p>
              <p className="text-[8px] text-[#64748B] m-0">{docContactLine}</p>
              <p className="text-[8px] text-[#64748B] m-0">{docAddressLine}</p>
            </div>
          </div>
          <div className="text-center my-1">
            <h1 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-widest m-0 leading-tight">RECEITA MÉDICA</h1>
            <p className="text-[10px] font-bold text-[#059669] tracking-wider uppercase mt-0.5 m-0">SUBTÍTULO</p>
            <div className="w-12 h-0.5 bg-[#059669] mx-auto mt-0.5 mb-1" />
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1 mb-1.5 flex justify-between items-center">
            <div>
              <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">Paciente</span>
              <span className="font-bold text-[#0F172A] text-xs leading-none">{sanitizedUserName}</span>
            </div>
            <div className="text-right">
              <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">CPF / Nasc.</span>
              <span className="font-semibold text-[#334155] text-[10px] leading-none">{cpfText} • {birthDateText}</span>
            </div>
          </div>
        </div>

        <div id="rx-measure-sig">{renderPrescriptionSignatureBlock()}</div>
        <div id="rx-measure-dispensacao">{renderDispensacaoBlock(true, false)}</div>
        <div id="rx-measure-notes-dense">{hasNotes ? renderNotesBlock(customNotesText, true, true) : null}</div>
        <div id="rx-measure-notes-normal">{hasNotes ? renderNotesBlock(customNotesText, false, false) : null}</div>

        {guideGroups.map((g, gIdx) => {
          const isDense = g.items.length >= 5;
          const isCompact = g.items.length >= 4;
          return (
            <div key={gIdx}>
              {g.items.map((it, iIdx) =>
                renderPrescriptionItemCard(it, iIdx + 1, isDense, isCompact, `m-${gIdx}-${iIdx}`, {
                  'data-rx-group': gIdx,
                  'data-rx-idx': iIdx
                })
              )}
            </div>
          );
        })}
      </div>
    );

    root.render(<MeasureRxComponent />);
    await new Promise(resolve => setTimeout(resolve, 140));

    const chromeH = container.querySelector<HTMLElement>('#rx-measure-chrome')?.offsetHeight || 180;
    const sigH = container.querySelector<HTMLElement>('#rx-measure-sig')?.offsetHeight || 70;
    const dispensacaoH = container.querySelector<HTMLElement>('#rx-measure-dispensacao')?.offsetHeight || 65;
    const notesDenseH = hasNotes ? (container.querySelector<HTMLElement>('#rx-measure-notes-dense')?.offsetHeight || 68) : 0;
    const notesNormalH = hasNotes ? (container.querySelector<HTMLElement>('#rx-measure-notes-normal')?.offsetHeight || 78) : 0;

    // A4 inner height = 1123 - 32 (top/bottom padding) - 22 (bottom rodapé bar) = 1069px
    const RX_PAGE_INNER_H = 1065;
    const availWithoutNotes = RX_PAGE_INNER_H - chromeH - sigH - 12;

    const allPagesToRender: PrescriptionPageData[] = [];

    guideGroups.forEach((group, gIdx) => {
      const gItems = group.items;
      if (gItems.length === 0) return;

      const isDense = gItems.length >= 5;
      const isCompact = gItems.length >= 4;
      const gap = isDense ? 4 : isCompact ? 5 : 8;
      const notesH = isDense || isCompact ? notesDenseH : notesNormalH;
      const availWithNotes = availWithoutNotes - notesH - (hasNotes ? 6 : 0);

      const itemHeights: number[] = gItems.map((_, iIdx) => {
        const el = container.querySelector<HTMLElement>(`[data-rx-group="${gIdx}"][data-rx-idx="${iIdx}"]`);
        return el?.offsetHeight || 95;
      });

      const totalItemsH = itemHeights.reduce((sum, h, i) => sum + h + (i > 0 ? gap : 0), 0);

      // If all items in this guide + notes fit on 1 single page, keep them on 1 single page!
      if (totalItemsH <= availWithNotes) {
        allPagesToRender.push({
          guideTitle: group.guideTitle,
          guideSubtitle: group.subtitleBase,
          badge: group.badgeBase,
          pageNumber: 0,
          totalPages: 0,
          items: gItems,
          itemStartIndex: 0,
          notesText: hasNotes ? customNotesText : undefined,
          isCompactGuide: isCompact,
          isDenseGuide: isDense
        });
      } else {
        // Pack items greedily per page using exact measured DOM heights
        const chunks: PrescriptionItemData[][] = [];
        let cursor = 0;

        while (cursor < gItems.length) {
          const chunk: PrescriptionItemData[] = [];
          let usedH = 0;

          // Check if remaining items from cursor to end fit together with notes on a single final page
          const remH = itemHeights
            .slice(cursor)
            .reduce((sum, h, i) => sum + h + (i > 0 ? gap : 0), 0);

          if (remH <= availWithNotes) {
            chunks.push(gItems.slice(cursor));
            break;
          }

          while (cursor < gItems.length) {
            const h = itemHeights[cursor];
            const addGap = chunk.length > 0 ? gap : 0;
            if (chunk.length > 0 && usedH + addGap + h > availWithoutNotes) {
              break;
            }
            chunk.push(gItems[cursor]);
            usedH += addGap + h;
            cursor++;
          }
          chunks.push(chunk);
        }

        // Verify if the last chunk + notes exceeds availWithNotes; if so, move 1 item or notes to a final page
        let startIdx = 0;
        chunks.forEach((chunk, chunkIdx) => {
          const isLast = chunkIdx === chunks.length - 1;
          const subtitle = chunks.length > 1
            ? `${group.subtitleBase} (PARTE ${chunkIdx + 1})`
            : group.subtitleBase;
          const badge = chunks.length > 1
            ? `${group.badgeBase} • Pág ${chunkIdx + 1}`
            : group.badgeBase;

          allPagesToRender.push({
            guideTitle: group.guideTitle,
            guideSubtitle: subtitle,
            badge,
            pageNumber: 0,
            totalPages: 0,
            items: chunk,
            itemStartIndex: startIdx,
            notesText: isLast && hasNotes ? customNotesText : undefined,
            isCompactGuide: chunk.length >= 4,
            isDenseGuide: chunk.length >= 5
          });
          startIdx += chunk.length;
        });
      }
    });

    const totalDocPages = allPagesToRender.length;
    allPagesToRender.forEach((page, idx) => {
      page.pageNumber = idx + 1;
      page.totalPages = totalDocPages;
    });

    // PASS 2: Render Final Prescription Pages
    const PdfComponent = () => {
      return (
        <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
          {allPagesToRender.map((page, pIdx) => {
            const isDense = page.isDenseGuide;
            const isCompact = page.isCompactGuide;
            const isNationalGuide = page.badge.toLowerCase().includes('nacional') || (page.items[0] ? isNationalProduct(page.items[0]) : true);

            return (
              <div
                key={pIdx}
                className="prescription-pdf-page relative box-border flex flex-col justify-between"
                style={{
                  width: "794px",
                  height: "1123px",
                  maxHeight: "1123px",
                  padding: isDense ? "14px 36px 16px 36px" : isCompact ? "15px 36px 16px 36px" : "16px 38px 18px 38px",
                  backgroundColor: "#FFFFFF",
                  color: "#111827",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
              >
                <div className="flex-1 flex flex-col justify-start min-h-0">
                  {/* Top Bar with Page Indicator & Guide Badge */}
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-100">
                    <span className="text-[9.5px] text-[#64748B] font-semibold">
                      Documento Médico Oficial MECURA • Página {page.pageNumber} de {page.totalPages}
                    </span>
                    <span className="bg-[#F3E8FF] text-[#581C87] border border-[#D8B4FE] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {page.badge}
                    </span>
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2 mb-1.5">
                    <div>
                      <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                      <p className="text-[9px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                        CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.25' }}>{docName}</h3>
                      <p className="text-[9.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{formatDoctorCrmLine(docCrm, docSpec)}</p>
                      <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docContactLine}</p>
                      <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docAddressLine}</p>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="text-center my-1">
                    <h1 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-widest m-0 leading-tight">
                      {page.guideTitle}
                    </h1>
                    <p className="text-[10px] font-bold text-[#059669] tracking-wider uppercase mt-0.5 m-0">
                      {page.guideSubtitle}
                    </p>
                    <div className="w-12 h-0.5 bg-[#059669] mx-auto mt-0.5 mb-1" />
                  </div>

                  {/* Patient Info Box */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1 mb-1.5 flex justify-between items-center">
                    <div>
                      <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">Paciente</span>
                      <span className="font-bold text-[#0F172A] text-xs leading-none">{sanitizedUserName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#64748B] block text-[8px] uppercase font-bold leading-none mb-0.5">CPF / Nasc. • Emissão</span>
                      <span className="font-semibold text-[#334155] text-[10px] leading-none">{cpfText} • {birthDateText} • {emissionDateStr}</span>
                    </div>
                  </div>

                  {/* Items List for this page */}
                  {page.items.length > 0 && (
                    <div className="flex flex-col" style={{ gap: isDense ? '4px' : isCompact ? '5px' : '8px' }}>
                      {page.items.map((item, idx) =>
                        renderPrescriptionItemCard(
                          item,
                          page.itemStartIndex + idx + 1,
                          isDense,
                          isCompact,
                          `${page.pageNumber}-item-${idx}`
                        )
                      )}
                    </div>
                  )}

                  {/* Clinical Notes block */}
                  {page.notesText && renderNotesBlock(page.notesText, isDense, isCompact)}

                  {/* Dispensação & Regulatory box when <= 2 items (or <= 3 without notes) so the signature is never clipped */}
                  {(page.items.length <= 2 || (page.items.length === 3 && !page.notesText && dispensacaoH < 80)) && renderDispensacaoBlock(isNationalGuide, isCompact)}
                </div>

                {/* Rodapé Oficial Fixado no Final da Folha (Assinatura + ICP-Brasil + Barra Institucional) */}
                <div className="shrink-0 mt-auto pt-2 space-y-1.5">
                  {renderPrescriptionSignatureBlock()}

                  {/* Slim Institutional Rodapé anchored at the very bottom */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[7.5px] text-[#94A3B8] font-medium">
                    <span>MECURA • Primavera do Leste - MT (CEP 78850-000)</span>
                    <span>Paciente: {sanitizedUserName} • CPF: {cpfText}</span>
                    <span>Receituário Oficial • Folha {page.pageNumber} de {page.totalPages}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    root.render(<PdfComponent />);
    await new Promise(resolve => setTimeout(resolve, 600));

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
  
  const rawDocSpec = patientData?.customDoctorSpecialty || "Clínico Geral • Medicina Canabinoide";
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = rawDocSpec.toLowerCase().includes('clínico geral') || rawDocSpec.toLowerCase().includes('clinico geral')
    ? rawDocSpec
    : `Clínico Geral • ${rawDocSpec}`;
  const docContactLine = "Tel: +55 65 3190-0629 • E-mail: Wiselionseer@gmail.com";
  const docAddressLine = "Primavera do Leste - MT • CEP 78850-000";

  const isEvolutivo = Boolean(
    (patientData?.reportType === 'evolutivo' ||
     patientData?.docType === 'laudo_evolutivo' ||
     patientData?.isEvolutivo === true) &&
    patientData?.reportType !== 'inicial' &&
    patientData?.docType !== 'laudo_inicial' &&
    patientData?.isEvolutivo !== false
  );

  // Fallback to saved report in localStorage ONLY if it strictly matches this patient
  let savedStorageReport: any = null;
  try {
    const rawSaved = localStorage.getItem('mecura_saved_reports_v2');
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved);
      const reportKeyType = isEvolutivo ? 'evolutivo' : 'inicial';
      const candidateKeys = [
        patientData?.patientId ? `id:${String(patientData.patientId).toLowerCase().trim()}` : '',
        (patientData?.patientId || '').toLowerCase().trim(),
        sanitizedUserName && sanitizedUserName.toLowerCase() !== 'paciente' ? `name:${sanitizedUserName.toLowerCase().trim()}` : '',
        sanitizedUserName && sanitizedUserName.toLowerCase() !== 'paciente' ? sanitizedUserName.toLowerCase().trim() : ''
      ].filter(Boolean);
      for (const k of candidateKeys) {
        const candidateReport = parsed?.[k]?.[reportKeyType];
        if (candidateReport) {
          // Verify that the cached report does not belong to a different patient name
          const cachedName = (candidateReport.patientName || '').trim().toLowerCase();
          const targetName = (sanitizedUserName || '').trim().toLowerCase();
          if (!cachedName || !targetName || targetName === 'paciente' || cachedName === targetName) {
            savedStorageReport = candidateReport;
            break;
          }
        }
      }
    }
  } catch {
    // ignore storage errors
  }

  const effectiveCustomDiagnosis = patientData?.customDiagnosis || savedStorageReport?.diagnosis;
  const effectiveCustomRationale = patientData?.customRationale || savedStorageReport?.rationale;
  const effectiveCustomTreatmentPlan = patientData?.customTreatmentPlan || savedStorageReport?.treatmentPlan;
  const effectiveCustomMonitoring = patientData?.customMonitoring || savedStorageReport?.monitoring;

  const fallback = (!effectiveCustomDiagnosis || !effectiveCustomRationale || !effectiveCustomTreatmentPlan)
    ? generatePersonalizedClinicalReport({
        patientName: sanitizedUserName,
        birthDate: birthDateText,
        cpf: cpfText,
        objectives: patientData?.answers?.objectives,
        intensity: patientData?.answers?.intensity,
        duration: patientData?.answers?.duration,
        description: patientData?.answers?.description,
        diseaseOrigin: patientData?.answers?.diseaseOrigin,
        remedios: patientData?.answers?.remedios,
        remedios_details: patientData?.answers?.remedios_details,
        doenca_cronica: patientData?.answers?.doenca_cronica,
        doenca_cronica_details: patientData?.answers?.doenca_cronica_details,
        tratamento_atual: patientData?.answers?.tratamento_atual,
        tratamento_atual_details: patientData?.answers?.tratamento_atual_details,
        digestivo: patientData?.answers?.digestivo,
        digestivo_details: patientData?.answers?.digestivo_details,
        cannabis: patientData?.answers?.cannabis,
        cannabis_details: patientData?.answers?.cannabis_details,
        mainSymptoms: patientData?.answers?.mainSymptoms,
        pathology: patientData?.answers?.pathology,
        answers: patientData?.answers
      }, isEvolutivo ? 'evolutivo' : 'inicial')
    : null;

  const diag = effectiveCustomDiagnosis || fallback?.clinicalSummary || 'Quadro clínico crônico sob acompanhamento médico continuado.';
  const rat = effectiveCustomRationale || fallback?.therapeuticRationale || 'Modulação do Sistema Endocanabinoide (SEC).';
  const plan = effectiveCustomTreatmentPlan || fallback?.treatmentPlan || 'Terapêutica fitocanabinoide individualizada.';
  const mon = effectiveCustomMonitoring || fallback?.monitoringText || 'Acompanhamento clínico periódico.';

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

  const splitPlanItems = (text: string): string[] => {
    if (!text) return [];
    const rawBlocks = text.split(/\n\n+|(?=\n\s*(?:\d+\.|•)\s+)/).map(b => b.trim()).filter(Boolean);
    if (rawBlocks.length === 0) return [text.trim()];

    return rawBlocks.map((block, idx) => {
      const withoutLeadingPrefix = block.replace(/^(?:\d+\.|•)\s*/, '').trim();
      return `${idx + 1}. ${withoutLeadingPrefix}`;
    });
  };

  const planItems = splitPlanItems(plan);

  interface FlowBlock {
    id: string;
    type: 'section-header' | 'subheader' | 'paragraph' | 'plan-item';
    sectionKey: 'diag' | 'rat' | 'plan' | 'mon';
    text?: string;
    planTitle?: string;
    planDetails?: string[];
    keepWithNext?: boolean;
  }

  const isSubheaderLine = (trimmed: string): boolean => {
    return /^(Hist[óo]rico|Evolu[çc][ãa]o|Indica[çc][ãa]o|CID|Quesito|\d+\.\s*Quanto|Racioc[íi]nio|Diretrizes|Seguran[çc]a|Retorno|Comprova[çc][ãa]o|Em resposta|Enquadramento|[a-d]\)\s*Inviabilidade|[a-d]\)\s*Especificidade|[a-d]\)\s*Indisponibilidade|[a-d]\)\s*Autonomia|\d+\.\s*[A-ZÁÉÍÓÚ])/i.test(trimmed);
  };

  const isShortHeadingLine = (trimmed: string): boolean => {
    if (!isSubheaderLine(trimmed)) return false;
    return trimmed.endsWith(':') || trimmed.length < 105;
  };

  const pushTextParagraphBlocks = (
    target: FlowBlock[],
    rawText: string,
    sectionKey: 'diag' | 'rat' | 'mon',
    prefixId: string,
    redundantHeaderPattern?: RegExp
  ) => {
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    lines.forEach((line, idx) => {
      if (idx === 0 && redundantHeaderPattern && redundantHeaderPattern.test(line)) {
        return;
      }
      const sub = isSubheaderLine(line);
      target.push({
        id: `${prefixId}-p-${idx}`,
        type: sub ? 'subheader' : 'paragraph',
        sectionKey,
        text: line,
        keepWithNext: isShortHeadingLine(line)
      });
    });
  };

  const flowBlocks: FlowBlock[] = [];

  // 1. Diagnóstico & Evolução (continuous flow without forced page break after Quesito 3)
  if (isEvolutivo) {
    let diagPart1 = diag;
    let diagPart2 = '';
    const evolMarker = diag.search(/(?:Evolu[çc][ãa]o Cl[íi]nica e Resposta|Evolu[çc][ãa]o Cl[íi]nica|4\.\s*Quanto [àa] evolu[çc][ãa]o|Quesitos?\s*4)/i);
    if (evolMarker > 100) {
      diagPart1 = diag.substring(0, evolMarker).trim();
      diagPart2 = diag.substring(evolMarker).trim();
    }

    flowBlocks.push({
      id: 'sec-diag-1',
      type: 'section-header',
      sectionKey: 'diag',
      text: diagPart2
        ? 'Diagnóstico Clínico, Histórico Convencional & Refratariedade (Quesitos 1, 2 e 3)'
        : 'Diagnóstico Clínico, Histórico Convencional & Evolução Terapêutica',
      keepWithNext: true
    });
    pushTextParagraphBlocks(flowBlocks, diagPart1, 'diag', 'diag1');

    if (diagPart2) {
      flowBlocks.push({
        id: 'sec-diag-2',
        type: 'section-header',
        sectionKey: 'diag',
        text: 'Evolução Clínica e Resposta com Canabinoides e Autocultivo (Quesitos 4, 5 e 6)',
        keepWithNext: true
      });
      pushTextParagraphBlocks(
        flowBlocks,
        diagPart2,
        'diag',
        'diag2',
        /^Evolu[çc][ãa]o Cl[íi]nica e Resposta com Canabinoides/i
      );
    }
  } else {
    flowBlocks.push({
      id: 'sec-diag-init',
      type: 'section-header',
      sectionKey: 'diag',
      text: 'Diagnóstico Clínico & Comprovação de Início de Tratamento',
      keepWithNext: true
    });
    pushTextParagraphBlocks(flowBlocks, diag, 'diag', 'diagInit');
  }

  // 2. Fundamentação Farmacológica / Raciocínio Fisiopatológico
  if (rat && rat.trim()) {
    flowBlocks.push({
      id: 'sec-rat',
      type: 'section-header',
      sectionKey: 'rat',
      text: isEvolutivo
        ? 'Fundamentação Farmacológica, Continuidade (Quesito 7) & Enquadramento CID-10'
        : 'Raciocínio Fisiopatológico & Indicação de Tratamento',
      keepWithNext: true
    });
    pushTextParagraphBlocks(
      flowBlocks,
      rat,
      'rat',
      'rat',
      /^Racioc[íi]nio Fisiopatol[óo]gico e Fundamenta[çc][ãa]o/i
    );
  }

  // 3. Plano de Tratamento Canabinoide Individualizado
  if (planItems.length > 0) {
    flowBlocks.push({
      id: 'sec-plan',
      type: 'section-header',
      sectionKey: 'plan',
      text: 'Plano de Tratamento Canabinoide Individualizado',
      keepWithNext: true
    });
    planItems.forEach((itemBlock, iIdx) => {
      const lines = itemBlock.split('\n').map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0] || '';
      const detailLines = lines.slice(1);
      flowBlocks.push({
        id: `plan-item-${iIdx}`,
        type: 'plan-item',
        sectionKey: 'plan',
        planTitle: titleLine,
        planDetails: detailLines,
        keepWithNext: false
      });
    });
  }

  // 4. Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança
  if (mon && mon.trim()) {
    flowBlocks.push({
      id: 'sec-mon',
      type: 'section-header',
      sectionKey: 'mon',
      text: 'Diretrizes de Acompanhamento Clínico, Farmacovigilância e Segurança',
      keepWithNext: true
    });
    pushTextParagraphBlocks(flowBlocks, mon, 'mon', 'mon');
  }

  const isCompactMode = totalLength > 2600 || planItems.length >= 4;

  const renderBlockElement = (block: FlowBlock, key: string | number, dataIdx?: number) => {
    const commonProps = dataIdx !== undefined ? { 'data-flow-idx': dataIdx } : {};

    if (block.type === 'section-header') {
      return (
        <div key={key} {...commonProps} className="pt-1">
          <h4 className="text-[10px] font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#CBD5E1] pb-0.5 m-0 flex items-center justify-between">
            <span>{block.text}</span>
          </h4>
        </div>
      );
    }

    if (block.type === 'plan-item') {
      return (
        <div
          key={key}
          {...commonProps}
          className={`bg-[#F8FAFC] border border-[#E2E8F0] rounded leading-snug ${
            isCompactMode ? 'px-2 py-1 text-[8.5px]' : 'p-2 text-[9px]'
          } text-[#334155]`}
        >
          <p className={`font-bold text-[#0F172A] mb-0.5 m-0 ${isCompactMode ? 'text-[8.5px]' : 'text-[9.5px]'}`}>
            {block.planTitle}
          </p>
          <div className={`space-y-0.5 pl-1 text-[#475569] ${isCompactMode ? 'text-[8px]' : 'text-[8.5px]'}`}>
            {(block.planDetails || []).map((line, lIdx) => (
              <p key={lIdx} className="m-0 leading-tight">
                {line}
              </p>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'subheader') {
      return (
        <p
          key={key}
          {...commonProps}
          className={`font-bold text-[#1E1B4B] ${
            isCompactMode ? 'text-[9px]' : 'text-[9.5px]'
          } m-0 leading-snug text-justify`}
        >
          {block.text}
        </p>
      );
    }

    return (
      <p
        key={key}
        {...commonProps}
        className={`${
          isCompactMode ? 'text-[9px]' : 'text-[9.5px]'
        } text-[#334155] m-0 leading-snug text-justify`}
      >
        {block.text}
      </p>
    );
  };

  const renderPageHeaderChrome = (pageNum: number, totalPagesCount: number, pageTitle: string) => (
    <div>
      {/* Top Bar with Page Indicator in-flow */}
      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-100">
        <span className="text-[9.5px] text-[#64748B] font-semibold">
          Documento Médico Oficial MECURA
        </span>
        <span className="text-[9.5px] text-[#64748B] font-bold">
          Página {pageNum} de {totalPagesCount}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2 mb-1.5">
        <div>
          <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
          <p className="text-[9px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
            CENTRO INTEGRADO DE MEDICINA CANABINOIDE
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.25' }}>{docName}</h3>
          <p className="text-[9.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{formatDoctorCrmLine(docCrm, docSpec)}</p>
          <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docContactLine}</p>
          <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docAddressLine}</p>
        </div>
      </div>

      {/* Title & Patient Identification */}
      {pageNum === 1 ? (
        <div className="text-center mb-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2.5 py-1.5">
          <div className="flex items-center justify-between mb-0.5 px-1">
            <span className="text-[8.5px] font-bold tracking-widest text-[#059669] uppercase">
              {baseReportSubtitle}
            </span>
            <span className={`font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${
              isEvolutivo 
                ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' 
                : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
            }`}>
              {baseReportBadge}
            </span>
          </div>
          <h1 className="text-sm font-black text-[#1E1B4B] tracking-widest uppercase mb-0.5">{pageTitle}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-[10px] text-[#64748B]">
            <span className="text-[11px] text-[#475569]">
              <strong className="text-[#1E1B4B]">PACIENTE:</strong> <strong className="text-[#0F172A]">{sanitizedUserName}</strong>
            </span>
            {birthDateText !== 'Não informada' && (
              <span>
                <strong className="text-[#475569]">NASCIMENTO:</strong> {birthDateText}
              </span>
            )}
            {cpfText !== 'Não informado' && (
              <span>
                <strong className="text-[#475569]">CPF:</strong> {cpfText}
              </span>
            )}
            <span>
              <strong className="text-[#475569]">EMISSÃO:</strong> {emissionDateStr}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-1.5 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
          <span className="text-[9.5px] font-black text-[#1E1B4B] tracking-wider uppercase">{pageTitle}</span>
          <span className="text-[9px] font-bold text-[#475569]">PACIENTE: <strong className="text-[#0F172A]">{sanitizedUserName}</strong></span>
        </div>
      )}
    </div>
  );

  const renderContinuationFooter = (pageNum: number, totalPagesCount: number) => (
    <div className="shrink-0 mt-auto pt-1.5 border-t border-[#E2E8F0]">
      <div className="flex items-center justify-between text-[8px] text-[#64748B] font-semibold">
        <span>MECURA • Primavera do Leste - MT (CEP 78850-000)</span>
        <span className="text-[#1E1B4B] font-bold">Documento Médico Oficial — Continua na folha {pageNum + 1}...</span>
        <span>Folha {pageNum} de {totalPagesCount}</span>
      </div>
      <div className="flex justify-between w-full text-[7.5px] text-[#94A3B8] font-medium mt-0.5">
        <span>Paciente: {sanitizedUserName}</span>
        <span>Médico: {docName} ({docCrm} • Clínico Geral • +55 65 3190-0629)</span>
        <span>Emissão: {emissionDateStr}</span>
      </div>
    </div>
  );

  const renderFinalSignatureAndFooter = (pageNum: number, totalPagesCount: number) => (
    <div className="shrink-0 pt-2">
      <div className="pt-2.5 border-t border-[#E2E8F0] flex items-end justify-between gap-4">
        <div className="text-[8px] text-[#64748B] space-y-0.5">
          <p className="m-0 font-bold text-[#1E1B4B] text-[8.5px]">Validade Assistencial e Pericial</p>
          <p className="m-0">Laudo médico emitido em conformidade com as diretrizes do CFM e RDC Anvisa nº 327/2019 e nº 660/2022.</p>
          <p className="m-0 text-[#475569] font-medium">{docContactLine} • {docAddressLine}</p>
          <p className="m-0 text-[#94A3B8]">Data de Emissão: {emissionDateStr} • Folha {pageNum} de {totalPagesCount}</p>
        </div>
        <div className="flex flex-col items-center shrink-0 w-60">
          <div className="w-52 border-b border-[#94A3B8] mb-1" style={{ height: '0px' }}></div>
          <p className="text-[10.5px] font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.2' }}>{docName}</p>
          <p className="text-[8.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{formatDoctorCrmLine(docCrm, 'Clínico Geral')}</p>
          <p className="text-[7.5px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>+55 65 3190-0629 • Wiselionseer@gmail.com</p>
        </div>
      </div>
    </div>
  );

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    // PASS 1: Render all flow blocks & chrome elements in real DOM at exact 726px content width to measure exact heights
    const MeasureComponent = () => (
      <div
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          width: '794px',
          padding: '14px 34px 16px 34px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#111827'
        }}
      >
        <div id="measure-chrome-p1">{renderPageHeaderChrome(1, 2, baseReportTitle)}</div>
        <div id="measure-chrome-cont">{renderPageHeaderChrome(2, 2, `${baseReportTitle} (CONTINUAÇÃO)`)}</div>
        <div id="measure-footer-cont">{renderContinuationFooter(1, 2)}</div>
        <div id="measure-footer-final">{renderFinalSignatureAndFooter(2, 2)}</div>
        <div id="measure-cont-plan-header">
          {renderBlockElement(
            {
              id: 'cont-plan-hdr',
              type: 'section-header',
              sectionKey: 'plan',
              text: 'Continuação do Plano de Tratamento Canabinoide'
            },
            'cont-plan-hdr'
          )}
        </div>
        <div id="measure-blocks" className="flex flex-col" style={{ gap: '4px' }}>
          {flowBlocks.map((b, idx) => renderBlockElement(b, `flow-${b.id}-${idx}`, idx))}
        </div>
      </div>
    );

    root.render(<MeasureComponent />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const p1ChromeH = container.querySelector<HTMLElement>('#measure-chrome-p1')?.offsetHeight || 165;
    const contChromeH = container.querySelector<HTMLElement>('#measure-chrome-cont')?.offsetHeight || 110;
    const contFooterH = container.querySelector<HTMLElement>('#measure-footer-cont')?.offsetHeight || 36;
    const finalFooterH = container.querySelector<HTMLElement>('#measure-footer-final')?.offsetHeight || 64;
    const contPlanHeaderH = container.querySelector<HTMLElement>('#measure-cont-plan-header')?.offsetHeight || 22;

    const blockEls = container.querySelectorAll<HTMLElement>('[data-flow-idx]');
    const blockHeights: number[] = new Array(flowBlocks.length).fill(24);
    blockEls.forEach(el => {
      const idx = Number(el.getAttribute('data-flow-idx'));
      if (!isNaN(idx)) {
        blockHeights[idx] = el.offsetHeight;
      }
    });

    // Total A4 height = 1123px; top padding (14px) + bottom padding (16px) = 30px -> inner height = 1093px
    const PAGE_INNER_H = 1093;
    const BLOCK_GAP = 4;
    const SAFETY_BUFFER = 6;

    const availSinglePage = PAGE_INNER_H - p1ChromeH - finalFooterH - SAFETY_BUFFER;
    const availP1 = PAGE_INNER_H - p1ChromeH - contFooterH - SAFETY_BUFFER;
    const availIntermediate = PAGE_INNER_H - contChromeH - contFooterH - SAFETY_BUFFER;
    const availFinal = PAGE_INNER_H - contChromeH - finalFooterH - SAFETY_BUFFER;

    interface PackedPage {
      blocks: FlowBlock[];
      usedH: number;
    }

    const totalAllBlocksH = blockHeights.reduce((sum, h, i) => sum + h + (i > 0 ? BLOCK_GAP : 0), 0);
    const packedPages: PackedPage[] = [];

    if (totalAllBlocksH <= availSinglePage) {
      packedPages.push({
        blocks: [...flowBlocks],
        usedH: totalAllBlocksH
      });
    } else {
      let cursor = 0;

      while (cursor < flowBlocks.length) {
        const isFirstPage = packedPages.length === 0;
        const maxH = isFirstPage ? availP1 : availIntermediate;
        const currentBlocks: FlowBlock[] = [];
        let usedH = 0;

        // If a new page starts right in the middle of plan-item blocks, prepend a continuation section header
        if (cursor > 0 && flowBlocks[cursor].type === 'plan-item') {
          currentBlocks.push({
            id: `cont-plan-p-${packedPages.length + 1}`,
            type: 'section-header',
            sectionKey: 'plan',
            text: 'Continuação do Plano de Tratamento Canabinoide',
            keepWithNext: true
          });
          usedH += contPlanHeaderH;
        }

        while (cursor < flowBlocks.length) {
          const b = flowBlocks[cursor];
          const gapBefore = currentBlocks.length > 0 ? BLOCK_GAP : 0;
          const bHeight = blockHeights[cursor];

          // Calculate chain height if keepWithNext is set so headings are never orphaned at page bottom
          let chainHeight = gapBefore + bHeight;
          if (b.keepWithNext) {
            let lookahead = cursor + 1;
            let chainCount = 1;
            while (lookahead < flowBlocks.length && chainCount < 3) {
              chainHeight += BLOCK_GAP + blockHeights[lookahead];
              if (!flowBlocks[lookahead].keepWithNext) {
                break;
              }
              lookahead++;
              chainCount++;
            }
          }

          if (currentBlocks.length > 0 && usedH + chainHeight > maxH) {
            // Avoid leaving only a synthetic continuation header alone on the page
            const hasRealContent = currentBlocks.some(cb => !cb.id.startsWith('cont-plan-p-'));
            if (hasRealContent) {
              break;
            }
          }

          currentBlocks.push(b);
          usedH += gapBefore + bHeight;
          cursor++;
        }

        packedPages.push({
          blocks: currentBlocks,
          usedH
        });
      }

      // Check if the final page exceeds availFinal (since finalFooterH is slightly taller than contFooterH)
      if (packedPages.length > 1) {
        const lastPage = packedPages[packedPages.length - 1];
        const maxFinalH = availFinal;
        if (lastPage.usedH > maxFinalH && lastPage.blocks.length > 1) {
          const overflowBlocks: FlowBlock[] = [];
          while (lastPage.blocks.length > 1 && lastPage.usedH > maxFinalH) {
            const popped = lastPage.blocks.pop()!;
            const origIdx = flowBlocks.findIndex(fb => fb.id === popped.id);
            const poppedH = origIdx !== -1 ? blockHeights[origIdx] : 28;
            lastPage.usedH -= (poppedH + BLOCK_GAP);
            overflowBlocks.unshift(popped);
          }
          // Also move any trailing keepWithNext heading from the end of lastPage to the new page
          while (lastPage.blocks.length > 1 && lastPage.blocks[lastPage.blocks.length - 1].keepWithNext) {
            const poppedHdr = lastPage.blocks.pop()!;
            const origIdx = flowBlocks.findIndex(fb => fb.id === poppedHdr.id);
            const poppedH = origIdx !== -1 ? blockHeights[origIdx] : 22;
            lastPage.usedH -= (poppedH + BLOCK_GAP);
            overflowBlocks.unshift(poppedHdr);
          }
          if (overflowBlocks.length > 0) {
            const newPageUsedH = overflowBlocks.reduce((acc, ob, i) => {
              const oIdx = flowBlocks.findIndex(fb => fb.id === ob.id);
              return acc + (oIdx !== -1 ? blockHeights[oIdx] : 28) + (i > 0 ? BLOCK_GAP : 0);
            }, 0);
            packedPages.push({
              blocks: overflowBlocks,
              usedH: newPageUsedH
            });
          }
        }
      }
    }

    const totalPagesCount = packedPages.length;

    // PASS 2: Render final paginated document
    const FinalPdfComponent = () => (
      <div
        className="flex flex-col items-center"
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          width: '794px',
          backgroundColor: '#F8FAFC'
        }}
      >
        {packedPages.map((page, pIdx) => {
          const pageNumber = pIdx + 1;
          const isLastPage = pageNumber === totalPagesCount;
          const pageTitle =
            pageNumber === 1
              ? baseReportTitle
              : `${baseReportTitle} (CONTINUAÇÃO — FOLHA ${pageNumber} DE ${totalPagesCount})`;

          return (
            <div
              key={pIdx}
              className="medical-report-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between"
              style={{
                width: '794px',
                minHeight: '1123px',
                height: '1123px',
                maxHeight: '1123px',
                padding: '14px 34px 16px 34px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <div className="flex-1 flex flex-col justify-start min-h-0">
                {renderPageHeaderChrome(pageNumber, totalPagesCount, pageTitle)}

                <div className="flex flex-col" style={{ gap: `${BLOCK_GAP}px` }}>
                  {page.blocks.map((block, bIdx) => renderBlockElement(block, `${pageNumber}-${block.id}-${bIdx}`))}
                </div>

                {/* On the last page, anchor signature at the bottom of the page */}
                {isLastPage && (
                  <div className="mt-auto pt-2">
                    {renderFinalSignatureAndFooter(pageNumber, totalPagesCount)}
                  </div>
                )}
              </div>

              {!isLastPage ? (
                renderContinuationFooter(pageNumber, totalPagesCount)
              ) : (
                <div className="shrink-0 mt-auto pt-1.5 border-t border-slate-100 flex items-center justify-between text-[7.5px] text-[#94A3B8] font-medium">
                  <span>MECURA • Centro Integrado de Medicina Canabinoide</span>
                  <span>Paciente: {sanitizedUserName} • CPF: {cpfText}</span>
                  <span>Documento Médico Oficial • Folha {pageNumber}/{totalPagesCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    root.render(<FinalPdfComponent />);
    await new Promise(resolve => setTimeout(resolve, 600));

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
  
  const rawDocSpec = patientData?.customDoctorSpecialty || "Clínico Geral • Medicina Canabinoide";
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = rawDocSpec.toLowerCase().includes('clínico geral') || rawDocSpec.toLowerCase().includes('clinico geral')
    ? rawDocSpec
    : `Clínico Geral • ${rawDocSpec}`;
  const docContactLine = "Tel: +55 65 3190-0629 • E-mail: Wiselionseer@gmail.com";
  const docAddressLine = "Primavera do Leste - MT • CEP 78850-000";

  const defaultParagraphs = [
    `Declaro, para os devidos fins de direito, salvaguarda clínica e comprovação perante autoridades de trânsito e órgãos públicos, que o(a) paciente <strong>${sanitizedUserName}</strong>, inscrito(a) no CPF sob o nº <strong>${cpfText}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide.`,
    `O(a) paciente faz uso estritamente terapêutico e controlado de produtos à base de <em>Cannabis</em> medicinal, mediante prescrição médica individualizada, com titulação posológica gradual e monitoramento clínico contínuo de resposta terapêutica e segurança neurocognitiva.`,
    `Atesto, com base em anamnese dirigida, exame clínico neurológico e aplicação de testes clínicos de rastreio da função psicomotora e cognitiva realizados nas consultas de acompanhamento, que o uso regular das medicações prescritas, nas doses e horários estabelecidos, <strong>NÃO PRODUZ</strong> alteração da capacidade psicomotora, sedação residual diurna, prejuízo cognitivo, lentificação de reflexos ou comprometimento do estado de vigília e atenção sustentada.`,
    `O protocolo terapêutico instituído <strong>não interfere</strong> na aptidão física e mental do(a) paciente para conduzir veículos automotores em vias públicas, operar máquinas ou equipamentos de precisão, bem como exercer atividades laborais de alta exigência cognitiva, não configurando sob nenhuma hipótese a alteração da capacidade psicomotora prevista no <strong>Art. 165 e Art. 277 do Código de Trânsito Brasileiro (Lei nº 9.503/1997)</strong> e na <strong>Resolução CONTRAN nº 432/2013</strong>.`,
    `Ressalta-se tecnicamente que a eventual detecção de metabólitos inativos (como o <em>11-nor-9-carboxi-THC / THC-COOH</em>) em exames toxicológicos de matriz biológica de larga janela (queratina/cabelo, urina ou fluido oral) reflete exclusivamente o uso médico continuado e legalmente amparado pela <strong>RDC nº 660/2022 e RDC nº 327/2019 da ANVISA</strong>, não guardando correlação com intoxicação aguda, uso recreativo ou comprometimento sensório-motor.`
  ];

  const customText = patientData?.customPsychomotorText;
  const paragraphs: string[] = customText
    ? customText.split('\n').map((p: string) => p.trim()).filter(Boolean)
    : defaultParagraphs;

  interface PsychomotorBlock {
    id: string;
    kind: 'intro-card' | 'paragraph' | 'eval-table' | 'legal-box' | 'conclusion-card';
    html?: string;
  }

  const allBlocks: PsychomotorBlock[] = [
    { id: 'intro-card', kind: 'intro-card' },
    ...paragraphs.map((p, idx) => ({
      id: `p-${idx}`,
      kind: 'paragraph' as const,
      html: p
    })),
    { id: 'eval-table', kind: 'eval-table' },
    { id: 'legal-box', kind: 'legal-box' },
    { id: 'conclusion-card', kind: 'conclusion-card' }
  ];

  const renderPsychomotorBlock = (block: PsychomotorBlock) => {
    switch (block.kind) {
      case 'intro-card':
        return (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', fontSize: '10.5px', color: '#1E293B' }}>
              <div>
                <p style={{ margin: '0 0 3px 0' }}>
                  <span style={{ fontWeight: 800, color: '#1E1B4B' }}>PACIENTE AVALIADO(A): </span>
                  <span style={{ fontWeight: 700 }}>{sanitizedUserName}</span>
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 800, color: '#1E1B4B' }}>FINALIDADE: </span>
                  <span>Atestado de Aptidão Psicomotora e Cognitiva (CTB)</span>
                </p>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
                <p style={{ margin: '0 0 3px 0' }}>
                  <span style={{ fontWeight: 800, color: '#1E1B4B' }}>CPF: </span>
                  <span>{cpfText}</span>
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 800, color: '#1E1B4B' }}>NASCIMENTO: </span>
                  <span>{birthDateText}</span>
                </p>
              </div>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <p
            style={{
              margin: 0,
              fontSize: '11.2px',
              lineHeight: '1.58',
              color: '#1E293B',
              textAlign: 'justify',
              textIndent: '20px'
            }}
            dangerouslySetInnerHTML={{ __html: block.html || '' }}
          />
        );

      case 'eval-table':
        return (
          <div style={{ marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
              <h3 style={{ margin: 0, fontSize: '10.5px', fontWeight: 800, color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Protocolo de Avaliação Clínica das Funções Psicomotoras e Neurocognitivas
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.8px', border: '1px solid #CBD5E1' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', color: '#1E1B4B' }}>
                  <th style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'left', fontWeight: 800 }}>Domínio Neuropsicomotor Avaliado</th>
                  <th style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'left', fontWeight: 800 }}>Parâmetro Clínico / Exame Físico</th>
                  <th style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center', fontWeight: 800, width: '140px' }}>Resultado Clínico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', fontWeight: 700 }}>Estado de Alerta e Vigília</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', color: '#334155' }}>Orientação têmporo-espacial, atenção sustentada e prontidão</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>PRESERVADO / NORMAL</td>
                </tr>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', fontWeight: 700 }}>Coordenação Motora Fina e Global</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', color: '#334155' }}>Provas índex-nariz, diadococinesia, marcha e equilíbrio estático</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>SEM ALTERAÇÕES</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', fontWeight: 700 }}>Tempo de Reação e Reflexos</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', color: '#334155' }}>Resposta sensório-motora a estímulos visuais e auditivos</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>PRESERVADO / NORMAL</td>
                </tr>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', fontWeight: 700 }}>Funções Executivas e Julgamento</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', color: '#334155' }}>Tomada de decisão rápida, memória operacional e percepção de risco</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>PLENAMENTE APTO</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', fontWeight: 700 }}>Sinais de Intoxicação Aguda / Sedação</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', color: '#334155' }}>Pesquisa de sonolência patológica, disartria, nistagmo ou euforia</td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>AUSENTES</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'legal-box':
        return (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '3.5px solid #1E1B4B', borderRadius: '6px', padding: '9px 12px', fontSize: '9.8px', lineHeight: '1.48', color: '#334155' }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: 800, color: '#1E1B4B', textTransform: 'uppercase', fontSize: '9.5px' }}>
              Fundamentação Técnico-Científica e Enquadramento Normativo
            </p>
            <p style={{ margin: 0, textAlign: 'justify' }}>
              • <strong>Código de Trânsito Brasileiro (Art. 165 e Art. 277) & Res. CONTRAN nº 432/2013:</strong> A caracterização de infração ou impedimento à condução veicular exige comprovação clínica de <em>alteração da capacidade psicomotora</em>. O uso terapêutico estabilizado sob prescrição médica, na ausência de sinais clínicos de comprometimento psicomotor, preserva integralmente a aptidão legal do condutor e trabalhador.
            </p>
          </div>
        );

      case 'conclusion-card':
        return (
          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderLeft: '3.5px solid #059669', borderRadius: '6px', padding: '9px 12px', fontSize: '10px', lineHeight: '1.48', color: '#064E3B' }}>
            <p style={{ margin: 0, textAlign: 'justify' }}>
              <strong>PARECER MÉDICO CONCLUSIVO:</strong> O(a) paciente <strong>{sanitizedUserName}</strong> encontra-se <strong>CLÍNICA E PSICOMOTORAMENTE APTO(A)</strong> para conduzir veículos automotores, operar equipamentos e exercer suas atividades profissionais regulares em vigência de seu tratamento médico canabinoide prescrito.
            </p>
          </div>
        );
    }
  };

  const renderHeader = (isContinuation: boolean) => (
    <div style={{ marginBottom: isContinuation ? '12px' : '14px' }}>
      <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-2.5 mb-3 pt-0.5">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none">MECURA</h2>
            <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 7px', borderRadius: '4px', border: '1px solid #A7F3D0', textTransform: 'uppercase' }}>
              AVALIAÇÃO MÉDICA & APTIDÃO
            </span>
          </div>
          <p className="text-[9.5px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none mt-1">
            CENTRO INTEGRADO DE MEDICINA CANABINOIDE
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-[#1E1B4B] m-0" style={{ lineHeight: '1.25' }}>{docName}</h3>
          <p className="text-[9.5px] text-[#475569] font-semibold m-0" style={{ marginTop: '1px', lineHeight: '1.2' }}>{formatDoctorCrmLine(docCrm, docSpec)}</p>
          <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docContactLine}</p>
          <p className="text-[8px] text-[#64748B] m-0" style={{ marginTop: '1px', lineHeight: '1.15' }}>{docAddressLine}</p>
        </div>
      </div>

      {!isContinuation && (
        <div className="text-center mb-2">
          <h1 className="text-base font-black text-[#1E1B4B] tracking-widest uppercase mb-0.5 m-0">
            LAUDO MÉDICO DE APTIDÃO PSICOMOTORA E COGNITIVA
          </h1>
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#059669] m-0">
            AVALIAÇÃO CLÍNICA — LEI DO DROGÔMETRO (ART. 165 CTB)
          </p>
        </div>
      )}
    </div>
  );

  const renderSignature = () => (
    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #CBD5E1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '8.5px', color: '#64748B', lineHeight: '1.4' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#1E1B4B' }}>Mecura • Centro Integrado de Medicina Canabinoide</p>
          <p style={{ margin: 0 }}>{docContactLine} • {docAddressLine}</p>
          <p style={{ margin: 0 }}>Data de Emissão: <strong>{emissionDateStr}</strong> • Prescritor Responsável: <strong>{docCrm} (MT)</strong></p>
        </div>
        <div style={{ textAlign: 'center', minWidth: '240px' }}>
          <div style={{ borderBottom: '1.5px solid #1E1B4B', marginBottom: '5px', height: '14px' }}></div>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#1E1B4B' }}>{docName}</p>
          <p style={{ margin: '1px 0 0 0', fontSize: '9px', fontWeight: 600, color: '#475569' }}>{formatDoctorCrmLine(docCrm, 'Clínico Geral')}</p>
          <p style={{ margin: '1px 0 0 0', fontSize: '8px', color: '#64748B' }}>+55 65 3190-0629 • Wiselionseer@gmail.com</p>
        </div>
      </div>
    </div>
  );

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    // 1. Measure real DOM heights to pack pages without blank gaps or clipping
    const MeasurePass = () => (
      <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', width: '794px', padding: '32px 42px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}>
        <div id="psy-measure-header-first">{renderHeader(false)}</div>
        <div id="psy-measure-header-cont">{renderHeader(true)}</div>
        <div id="psy-measure-sig">{renderSignature()}</div>
        <div id="psy-measure-blocks" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allBlocks.map((b, idx) => (
            <div key={`psy-measure-${b.id || idx}-${idx}`} data-psy-idx={idx}>
              {renderPsychomotorBlock(b)}
            </div>
          ))}
        </div>
      </div>
    );

    root.render(<MeasurePass />);
    await new Promise(resolve => setTimeout(resolve, 250));

    const headerFirstH = container.querySelector<HTMLElement>('#psy-measure-header-first')?.offsetHeight || 110;
    const headerContH = container.querySelector<HTMLElement>('#psy-measure-header-cont')?.offsetHeight || 65;
    const sigH = container.querySelector<HTMLElement>('#psy-measure-sig')?.offsetHeight || 85;
    const blockEls = Array.from(container.querySelectorAll<HTMLElement>('[data-psy-idx]'));
    const blockHeights = blockEls.map(el => el.offsetHeight);

    const USABLE_PAGE_H = 1123 - 64 - 28; // 1123 - top/bottom padding (64px) - footer bar (28px)
    const GAP = 10;

    const pages: PsychomotorBlock[][] = [];
    let cursor = 0;

    while (cursor < allBlocks.length) {
      const isFirst = pages.length === 0;
      const availH = USABLE_PAGE_H - (isFirst ? headerFirstH : headerContH);
      const pageBlocks: PsychomotorBlock[] = [];
      let usedH = 0;

      while (cursor < allBlocks.length) {
        const h = blockHeights[cursor] || 45;
        const g = pageBlocks.length > 0 ? GAP : 0;
        const isLastBlock = cursor === allBlocks.length - 1;
        const extraSig = isLastBlock ? sigH + 14 : 0;

        if (pageBlocks.length > 0 && usedH + g + h + extraSig > availH) {
          break;
        }
        pageBlocks.push(allBlocks[cursor]);
        usedH += g + h;
        cursor++;
      }
      pages.push(pageBlocks);
    }

    const PdfComponent = () => (
      <div className="flex flex-col items-center" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', width: '794px', backgroundColor: '#F8FAFC' }}>
        {pages.map((pageBlocks, pIdx) => {
          const isLastPage = pIdx === pages.length - 1;
          return (
            <div
              key={`psy-page-${pIdx}`}
              className="psychomotor-pdf-page relative border border-[#E2E8F0] box-border flex flex-col justify-between"
              style={{
                width: '794px',
                height: '1123px',
                minHeight: '1123px',
                maxHeight: '1123px',
                padding: '32px 42px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <div className="flex-1 flex flex-col justify-start min-h-0">
                {renderHeader(pIdx > 0)}
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                  {pageBlocks.map((b, bIdx) => (
                    <div key={`psy-p${pIdx}-${b.id || bIdx}-${bIdx}`}>{renderPsychomotorBlock(b)}</div>
                  ))}
                </div>
              </div>

              {isLastPage && (
                <div style={{ marginTop: 'auto', paddingTop: '10px', marginBottom: '8px' }}>
                  {renderSignature()}
                </div>
              )}

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', color: '#64748B' }}>
                <span>Mecura • Laudo Médico de Aptidão Psicomotora e Cognitiva</span>
                <span style={{ fontWeight: 700, color: '#1E1B4B' }}>Página {pIdx + 1} de {pages.length}</span>
                <span>Válido em todo o território nacional (Art. 165 CTB / RDC 660 ANVISA)</span>
              </div>
            </div>
          );
        })}
      </div>
    );

    root.render(<PdfComponent />);
    await new Promise(resolve => setTimeout(resolve, 600));

    const pageElements = container.querySelectorAll<HTMLElement>('.psychomotor-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
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

export interface PsychologicalTestResultItem {
  id: string;
  name: string;
  shortName?: string;
  applied: boolean;
  score: number | string;
  maxScore?: number;
  classification: string;
  clinicalInterpretation?: string;
  cutoffText?: string;
}

export interface PsychologicalReportData {
  reportType?: 'inicial' | 'evolutivo';
  customPatientName?: string;
  cpf?: string;
  birthDate?: string;
  emissionDate?: string;
  psychologistName?: string;
  psychologistCrp?: string;
  purpose?: string;
  demandDescription?: string;
  technicalProcedures?: string;
  clinicalAnalysis?: string;
  diagnosticHypothesis?: string;
  conclusion?: string;
  observations?: string;
  evolutionSummary?: string;
  selectedTests?: PsychologicalTestResultItem[];
  returnBlob?: boolean;
}

export const generatePsychologicalReportPDF = async (userName: string, reportData?: PsychologicalReportData) => {
  const sanitize = (text: string) => {
    return (text || '').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const isEvolutivo = reportData?.reportType === 'evolutivo';
  const rawUserName = reportData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);
  
  const birthDateText = sanitize(reportData?.birthDate || 'Não informada');
  const cpfText = sanitize(reportData?.cpf || 'Não informado');
  const emissionDateStr = reportData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  
  const psicoName = reportData?.psychologistName || "Marco Antônio Boastik";
  const psicoCrp = reportData?.psychologistCrp || "CRP 08/49215";

  const defaultPurpose = isEvolutivo
    ? "Relatório de Acompanhamento Psicológico Evolutivo para Registro da Evolução Clínica, Resposta Psicoterapêutica e Manejo em Saúde Mental"
    : "Relatório de Acompanhamento Psicológico Inicial para Acolhimento, Investigação Clínica, Rastreio Psicométrico e Planejamento Psicoterapêutico";
  const rawPurpose = reportData?.purpose || defaultPurpose;
  const purposeText = sanitize(rawPurpose.replace(/\s*(e|&)\s*pericial/gi, '').replace(/\s*pericial/gi, ''));
  const demandText = sanitize(reportData?.demandDescription || (isEvolutivo 
    ? "Paciente em acompanhamento psicológico continuado. Apresenta evolução do quadro emocional prévio, com foco no monitoramento de estressores, regulação afetiva, qualidade do sono e sustentação das metas terapêuticas estabelecidas."
    : "Paciente comparece para acolhimento e avaliação psicológica inicial, relatando queixas emocionais marcadas por sobrecarga psicofísica, tensão ansiosa, oscilações do humor e impactos no desempenho e qualidade de vida."));
  const procText = sanitize(reportData?.technicalProcedures || "Realizadas sessões clínicas psicológicas semiestruturadas, escuta qualificada da história de vida, exame detalhado das funções psíquicas superiores e aplicação de instrumentos psicométricos de rastreio clínico padronizados, em estrita consonância com a Resolução CFP nº 06/2019 do Conselho Federal de Psicologia.");
  const analysisText = sanitize(reportData?.clinicalAnalysis || "Ao exame psíquico atual, o(a) paciente apresenta-se lúcido(a) e orientado(a) autopsiquicamente e alopsiquicamente, com discurso coerente e atitude colaborativa. Observa-se afeto congruente com as demandas relatadas, com mobilização para a psicoterapia e preservação do juízo crítico da realidade. Evidencia-se necessidade de suporte psicológico contínuo para consolidação da regulação emocional.");
  const diagText = sanitize(reportData?.diagnosticHypothesis || "F41.1 - Transtorno de Ansiedade Generalizada / F43.2 - Transtorno de Adaptação com Sintomas Emocionais");
  const conclusionText = sanitize(reportData?.conclusion || (isEvolutivo
    ? "Com base no acompanhamento psicológico evolutivo, constata-se engajamento no processo psicoterapêutico. Recomenda-se a continuidade das sessões regulares para fortalecimento das estratégias de autorregulação e acompanhamento multidisciplinar integrativo."
    : "Conclui-se que o(a) paciente apresenta demandas que justificam acompanhamento psicológico regular para estabilização emocional, fortalecimento de recursos adaptativos e promoção de saúde mental em conjunto com a equipe multidisciplinar."));
  const observationsText = sanitize(reportData?.observations || "De acordo com a Resolução CFP nº 06/2019, este documento de acompanhamento psicológico possui caráter sigiloso e técnico-científico, refletindo a avaliação clínica do(a) paciente. Não constitui laudo pericial ou prescrição médica farmacológica.");

  const appliedTests = (reportData?.selectedTests || []).filter(t => t.applied);

  interface PsychBlock {
    id: string;
    kind: 'patient-card' | 'section' | 'mental-exam-grid' | 'diag-box' | 'normative-note' | 'psychometric-scales';
    title?: string;
    content?: string;
  }

  const allBlocks: PsychBlock[] = [
    { id: 'patient-card', kind: 'patient-card' },
    { id: 'sec-1', kind: 'section', title: '1. IDENTIFICAÇÃO DO SOLICITANTE E FINALIDADE DO ACOMPANHAMENTO', content: purposeText },
    { id: 'sec-2', kind: 'section', title: isEvolutivo ? '2. HISTÓRICO DO ATENDIMENTO & DEMANDA CLÍNICA' : '2. DESCRIÇÃO DA DEMANDA E HISTÓRICO CLÍNICO-PSICOLÓGICO', content: demandText },
    { id: 'sec-3', kind: 'section', title: '3. PROCEDIMENTOS E INSTRUMENTOS TÉCNICO-CIENTÍFICOS (RES. CFP Nº 06/2019)', content: procText },
  ];

  if (appliedTests.length > 0) {
    allBlocks.push({ id: 'scales-table', kind: 'psychometric-scales' });
  }

  allBlocks.push(
    { id: 'sec-4', kind: 'section', title: isEvolutivo ? '4. EVOLUÇÃO CLÍNICA, RESPOSTA PSICOTERAPÊUTICA E EXAME PSÍQUICO' : '4. ANÁLISE PSICOLÓGICA E EXAME DO ESTADO MENTAL', content: analysisText },
    { id: 'mental-grid', kind: 'mental-exam-grid' },
    { id: 'sec-5', kind: 'diag-box', title: '5. HIPÓTESE DIAGNÓSTICA NOSOLÓGICA (CID-10 / CID-11)', content: diagText },
    { id: 'sec-6', kind: 'section', title: isEvolutivo ? '6. PARECER CONCLUSIVO E DIRETRIZES DE EVOLUÇÃO' : '6. CONCLUSÃO TÉCNICA E ENCAMINHAMENTO TERAPÊUTICO', content: conclusionText },
    { id: 'sec-7', kind: 'normative-note', title: '7. RECOMENDAÇÕES CLÍNICAS, SIGILO E VALIDADE DO DOCUMENTO', content: observationsText }
  );

  const renderPsychBlock = (block: PsychBlock) => {
    switch (block.kind) {
      case 'patient-card':
        return (
          <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #D8B4FE', borderRadius: '8px', padding: '10px 14px', fontSize: '10.5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '8px' }}>
              <div>
                <p style={{ margin: '0 0 3px 0' }}>
                  <span style={{ fontWeight: 800, color: '#3B0764' }}>PACIENTE AVALIADO(A): </span>
                  <span style={{ fontWeight: 700, color: '#1F2937' }}>{sanitizedUserName}</span>
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 800, color: '#3B0764' }}>DATA DE NASCIMENTO: </span>
                  <span style={{ color: '#1F2937' }}>{birthDateText}</span>
                </p>
              </div>
              <div style={{ borderLeft: '1px solid #E9D5FF', paddingLeft: '12px' }}>
                <p style={{ margin: '0 0 3px 0' }}>
                  <span style={{ fontWeight: 800, color: '#3B0764' }}>CPF: </span>
                  <span style={{ color: '#1F2937', fontWeight: 600 }}>{cpfText}</span>
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 800, color: '#3B0764' }}>DATA DA EMISSÃO: </span>
                  <span style={{ color: '#1F2937', fontWeight: 600 }}>{emissionDateStr}</span>
                </p>
              </div>
            </div>
          </div>
        );

      case 'section':
        return (
          <div>
            <h4 style={{ margin: '0 0 4px 0', paddingBottom: '3px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#581C87', borderBottom: '1px solid #E9D5FF' }}>
              {block.title}
            </h4>
            <p style={{ margin: 0, fontSize: '10.8px', lineHeight: '1.52', textAlign: 'justify', color: '#334155' }}>
              {block.content}
            </p>
          </div>
        );

      case 'psychometric-scales':
        return (
          <div style={{ backgroundColor: '#FAF5FF', border: '1.5px solid #D8B4FE', borderRadius: '8px', padding: '10px 12px', marginTop: '4px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #E9D5FF', paddingBottom: '4px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#3B0764', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Instrumentos e Escalas Psicométricas Padronizadas Aplicadas
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: 700, backgroundColor: '#E9D5FF', color: '#581C87', padding: '1px 6px', borderRadius: '4px' }}>
                {appliedTests.length} {appliedTests.length === 1 ? 'escala utilizada' : 'escalas utilizadas'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {appliedTests.map((test, idx) => (
                <div key={test.id || idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9D5FF', borderRadius: '6px', padding: '7px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#3B0764' }}>
                      {sanitize(test.name)}
                    </span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '2px 8px', borderRadius: '4px', border: '1px solid #D8B4FE' }}>
                      Escore: {test.score}{test.maxScore ? ` / ${test.maxScore}` : ''} pts
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '9.5px', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#581C87' }}>Classificação: </span>
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>{sanitize(test.classification)}</span>
                    </div>
                  </div>

                  {test.clinicalInterpretation && (
                    <p style={{ margin: '3px 0 0 0', fontSize: '9px', lineHeight: '1.4', color: '#475569', textAlign: 'justify' }}>
                      {sanitize(test.clinicalInterpretation)}
                    </p>
                  )}

                  {test.cutoffText && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '8px', color: '#7E22CE', fontStyle: 'italic' }}>
                      Referência: {sanitize(test.cutoffText)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'mental-exam-grid':
        return (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 12px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '9.5px', fontWeight: 800, color: '#3B0764', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Síntese Estruturada das Funções Psíquicas Avaliadas
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '9.5px', color: '#334155' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '4px 7px' }}>
                <span style={{ fontWeight: 800, color: '#581C87', display: 'block', fontSize: '8.8px' }}>CONSCIÊNCIA & ORIENTAÇÃO</span>
                <span>Lúcido(a), orientado(a) no tempo e espaço</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '4px 7px' }}>
                <span style={{ fontWeight: 800, color: '#581C87', display: 'block', fontSize: '8.8px' }}>PENSAMENTO & JUÍZO CRÍTICO</span>
                <span>Curso lógico, coerente, juízo preservado</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '4px 7px' }}>
                <span style={{ fontWeight: 800, color: '#581C87', display: 'block', fontSize: '8.8px' }}>HUMOR, AFETO & SONO</span>
                <span>{isEvolutivo ? 'Evolução estável, foco em regulação' : 'Ansiedade reativa, hipervigilância'}</span>
              </div>
            </div>
          </div>
        );

      case 'diag-box':
        return (
          <div style={{ backgroundColor: '#FAF5FF', border: '1.5px solid #D8B4FE', borderLeft: '4px solid #6B21A8', borderRadius: '6px', padding: '9px 12px' }}>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#581C87' }}>
              {block.title}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#3B0764', lineHeight: '1.4' }}>
              {block.content}
            </p>
          </div>
        );

      case 'normative-note':
        return (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 12px' }}>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#581C87' }}>
              {block.title}
            </h4>
            <p style={{ margin: 0, fontSize: '9.8px', lineHeight: '1.45', textAlign: 'justify', color: '#475569' }}>
              {block.content}
            </p>
          </div>
        );
    }
  };

  const renderHeader = (isContinuation: boolean) => (
    <div style={{ marginBottom: isContinuation ? '10px' : '12px' }}>
      <div className="flex items-start justify-between pb-2.5 mb-2.5 pt-0" style={{ borderBottom: '2px solid #3B0764' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="text-2xl font-black tracking-tight m-0 leading-none" style={{ color: '#3B0764' }}>MECURA</h2>
            <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#FAF5FF', color: '#6B21A8', padding: '2px 7px', borderRadius: '4px', border: '1px solid #D8B4FE', textTransform: 'uppercase' }}>
              ACOMPANHAMENTO PSICOLÓGICO
            </span>
          </div>
          <p className="text-[9.5px] font-bold tracking-wider uppercase m-0 leading-none mt-1" style={{ color: '#6B21A8' }}>
            DEPARTAMENTO DE PSICOLOGIA CLÍNICA & SAÚDE MENTAL
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold m-0" style={{ color: '#3B0764', lineHeight: '1.25' }}>{psicoName}</h3>
          <p className="text-[10px] font-semibold m-0" style={{ color: '#6B21A8', marginTop: '1px', lineHeight: '1.2' }}>Psicólogo Clínico</p>
          <p className="text-[10px] font-bold m-0" style={{ color: '#64748B', marginTop: '1px', lineHeight: '1.2' }}>{psicoCrp}</p>
        </div>
      </div>

      {!isContinuation && (
        <div className="text-center mb-1">
          <h1 className="text-base font-black tracking-widest uppercase mb-0.5 m-0" style={{ color: '#3B0764' }}>
            {isEvolutivo
              ? 'RELATÓRIO DE ACOMPANHAMENTO PSICOLÓGICO (EVOLUTIVO)'
              : 'RELATÓRIO DE ACOMPANHAMENTO PSICOLÓGICO (INICIAL)'}
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-wider m-0" style={{ color: '#6B21A8' }}>
            DOCUMENTO TÉCNICO DE ACOMPANHAMENTO • RESOLUÇÃO CFP Nº 06/2019
          </p>
        </div>
      )}
    </div>
  );

  const renderSignature = () => (
    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E9D5FF' }}>
      <div className="flex items-end justify-between">
        <div className="text-[9px] space-y-0.5" style={{ color: '#64748B', lineHeight: '1.4' }}>
          <p className="m-0 font-bold" style={{ color: '#3B0764' }}>Mecura Saúde Mental • Atendimento Psicológico Especializado</p>
          <p className="m-0">Documento técnico com validade clínica conforme Código de Ética Profissional do Psicólogo.</p>
          <p className="m-0">Data de Emissão: <strong>{emissionDateStr}</strong> • Registro Profissional: <strong>{psicoCrp}</strong></p>
        </div>

        <div className="text-center flex flex-col items-center" style={{ minWidth: '220px' }}>
          <div style={{ width: '190px', borderBottom: '1.5px solid #3B0764', marginBottom: '5px', height: '12px' }} />
          <p className="text-xs font-bold m-0 leading-tight" style={{ color: '#3B0764' }}>{psicoName}</p>
          <p className="text-[9.5px] font-semibold m-0 leading-tight" style={{ color: '#6B21A8' }}>Psicólogo Clínico</p>
          <p className="text-[9.5px] font-mono m-0 leading-tight" style={{ color: '#4B5563' }}>{psicoCrp}</p>
        </div>
      </div>
    </div>
  );

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    const MeasurePass = () => (
      <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', width: '794px', padding: '28px 38px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}>
        <div id="psico-measure-header-first">{renderHeader(false)}</div>
        <div id="psico-measure-header-cont">{renderHeader(true)}</div>
        <div id="psico-measure-sig">{renderSignature()}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {allBlocks.map((b, idx) => (
            <div key={`psico-measure-${b.id || idx}-${idx}`} data-psico-idx={idx}>
              {renderPsychBlock(b)}
            </div>
          ))}
        </div>
      </div>
    );

    root.render(<MeasurePass />);
    await new Promise(resolve => setTimeout(resolve, 250));

    const headerFirstH = container.querySelector<HTMLElement>('#psico-measure-header-first')?.offsetHeight || 105;
    const headerContH = container.querySelector<HTMLElement>('#psico-measure-header-cont')?.offsetHeight || 65;
    const sigH = container.querySelector<HTMLElement>('#psico-measure-sig')?.offsetHeight || 80;
    const blockEls = Array.from(container.querySelectorAll<HTMLElement>('[data-psico-idx]'));
    const blockHeights = blockEls.map(el => el.offsetHeight);

    const USABLE_PAGE_H = 1123 - 56 - 26;
    const GAP = 9;

    const pages: PsychBlock[][] = [];
    let cursor = 0;

    while (cursor < allBlocks.length) {
      const isFirst = pages.length === 0;
      const availH = USABLE_PAGE_H - (isFirst ? headerFirstH : headerContH);
      const pageBlocks: PsychBlock[] = [];
      let usedH = 0;

      while (cursor < allBlocks.length) {
        const h = blockHeights[cursor] || 45;
        const g = pageBlocks.length > 0 ? GAP : 0;
        const isLastBlock = cursor === allBlocks.length - 1;
        const extraSig = isLastBlock ? sigH + 14 : 0;

        if (pageBlocks.length > 0 && usedH + g + h + extraSig > availH) {
          break;
        }
        pageBlocks.push(allBlocks[cursor]);
        usedH += g + h;
        cursor++;
      }
      pages.push(pageBlocks);
    }

    const PdfComponent = () => (
      <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', width: '794px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {pages.map((pageBlocks, pIdx) => {
          const isLastPage = pIdx === pages.length - 1;
          return (
            <div
              key={`psico-page-${pIdx}`}
              className="psychological-pdf-page relative box-border flex flex-col justify-between"
              style={{
                width: '794px',
                height: '1123px',
                minHeight: '1123px',
                maxHeight: '1123px',
                padding: '28px 38px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                boxSizing: 'border-box',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}
            >
              <div>
                {renderHeader(pIdx > 0)}
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                  {pageBlocks.map((b, bIdx) => (
                    <div key={`psico-p${pIdx}-${b.id || bIdx}-${bIdx}`}>{renderPsychBlock(b)}</div>
                  ))}
                </div>
                {isLastPage && renderSignature()}
              </div>

              <div style={{ borderTop: '1px solid #E9D5FF', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', color: '#6B7280' }}>
                <span>Mecura Saúde Mental • Departamento de Psicologia Clínica</span>
                <span style={{ fontWeight: 700, color: '#3B0764' }}>Página {pIdx + 1} de {pages.length}</span>
                <span>Resolução CFP nº 06/2019 • Documento Sigiloso</span>
              </div>
            </div>
          );
        })}
      </div>
    );

    root.render(<PdfComponent />);
    await new Promise(resolve => setTimeout(resolve, 600));

    const pageElements = container.querySelectorAll<HTMLElement>('.psychological-pdf-page');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await safeHtml2Canvas(pageEl);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }

    const filename = `Laudo_Psicologico_${sanitizedUserName.replace(/\s+/g, '_')}.pdf`;
    const resultBlob = pdf.output('blob');
    if (!reportData?.returnBlob) {
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
  patientId?: string;
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
  answers?: Record<string, any>;
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

  const storeState = useStore.getState();
  const patientAnswers = agronomicData?.answers || storeState.answers || {};
  const rawPatientName = (agronomicData?.customPatientName || userName || storeState.userName || 'Paciente').trim();
  const sanitizedUserName = rawPatientName.toUpperCase();
  const patientCpf = agronomicData?.cpf || patientAnswers?.cpf || storeState.userCpf || 'Não informado';
  const patientBirthDate = agronomicData?.birthDate || patientAnswers?.birthDate || storeState.userBirthDate || 'Não informada';
  const emissionDate = agronomicData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  const agronomistName = agronomicData?.agronomistName || 'Wilian Dalenogare Pereira';
  const agronomistCrea = agronomicData?.agronomistCrea || 'CREA-PR 172.458/D';

  const objectivesArray = (Array.isArray(patientAnswers?.objectives) && patientAnswers.objectives.length > 0)
    ? patientAnswers.objectives
    : (patientAnswers?.objective ? [String(patientAnswers.objective)] : []);

  const personalized = generatePersonalizedClinicalReport({
    patientName: rawPatientName,
    birthDate: patientBirthDate,
    cpf: patientCpf,
    sex: patientAnswers?.sex,
    height: patientAnswers?.height,
    weight: patientAnswers?.weight,
    objectives: objectivesArray,
    intensity: patientAnswers?.intensity,
    duration: patientAnswers?.duration,
    description: patientAnswers?.description,
    diseaseOrigin: patientAnswers?.diseaseOrigin,
    remedios: patientAnswers?.remedios,
    remedios_details: patientAnswers?.remedios_details,
    doenca_cronica: patientAnswers?.doenca_cronica,
    doenca_cronica_details: patientAnswers?.doenca_cronica_details,
    tratamento_atual: patientAnswers?.tratamento_atual,
    tratamento_atual_details: patientAnswers?.tratamento_atual_details,
    cirurgia: patientAnswers?.cirurgia,
    cirurgia_details: patientAnswers?.cirurgia_details,
    alergia: patientAnswers?.alergia,
    alergia_details: patientAnswers?.alergia_details,
    digestivo: patientAnswers?.digestivo,
    digestivo_details: patientAnswers?.digestivo_details,
    dor_cabeca: patientAnswers?.dor_cabeca,
    dor_cabeca_details: patientAnswers?.dor_cabeca_details,
    cansado: patientAnswers?.cansado,
    cannabis: patientAnswers?.cannabis,
    cannabis_details: patientAnswers?.cannabis_details,
    arritmia: patientAnswers?.arritmia,
    arritmia_details: patientAnswers?.arritmia_details,
    tristeza: patientAnswers?.tristeza,
    foco: patientAnswers?.foco,
    memoria: patientAnswers?.memoria,
    irritado: patientAnswers?.irritado,
    estresse: patientAnswers?.estresse,
    panico: patientAnswers?.panico,
    panico_details: patientAnswers?.panico_details,
    ansiedade_diag: patientAnswers?.ansiedade_diag,
    ansiedade_diag_details: patientAnswers?.ansiedade_diag_details,
    adhdTestResult: patientAnswers?.adhdTestResult,
    autismTestResult: patientAnswers?.autismTestResult,
    hcPlantCalculator: patientAnswers?.hcPlantCalculator,
    mainSymptoms: patientAnswers?.mainSymptoms,
    pathology: patientAnswers?.pathology,
    answers: patientAnswers
  }, 'inicial');

  const diagnosis = agronomicData?.diagnosis || personalized.agronomic.diagnosis;
  const dailyMg = agronomicData?.dailyDoseMg || personalized.agronomic.dailyDoseMg || 5000;
  const customAgroText = (agronomicData?.customText || personalized.agronomic.text || '').trim();
  const prescribedProductsText = (agronomicData?.prescribedProducts || '').trim();

  // Technical calculations based on agronomic standards
  const monthlyMg = Math.round(dailyMg * 31);
  const annualMg = Math.round(dailyMg * 365);
  const monthlyGrams = (monthlyMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const annualGrams = (annualMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const annualGramsNum = (annualMg / 1000);

  // Fitoquímica: teor médio de 10% nas inflorescências secas; extração caseira recupera ~80%
  const dryFlowerKgBase = Number(((annualGramsNum / 0.10) / 1000).toFixed(3));
  const dryFlowerKgStr = agronomicData?.dryFlowerKg || dryFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Margem de segurança agronômica de 30% contra pragas, doenças e perdas de cultivo
  const dryFlowerMarginKgBase = Number((dryFlowerKgBase * 1.3038).toFixed(3));
  const dryFlowerMarginKgStr = agronomicData?.dryFlowerMarginKg || dryFlowerMarginKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Perda de umidade na secagem: as inflorescências perdem entre 70% a 80% do peso em água
  const wetFlowerKgBase = Number((dryFlowerMarginKgBase / 0.30).toFixed(3));
  const wetFlowerKgStr = agronomicData?.wetFlowerKg || wetFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Rendimento médio por planta no cultivo indoor (paciente): 100g a 150g de flores secas por ciclo de 120 dias
  const calculatedPlants = Math.round((dryFlowerMarginKgBase * 1000) / 150);
  const targetPlants = agronomicData?.targetPlants || personalized.agronomic.targetPlants || calculatedPlants || 158;

  // Divisão em 3 momentos de colheita ao longo do ano
  const plantsPerCycle = agronomicData?.plantsPerCycle || Math.round(targetPlants / 4) || 40;

  // Importação estimada de sementes feminizadas com taxa de segurança de 30%
  const seedsNeeded = agronomicData?.seedsNeeded || Math.round(targetPlants * 1.3038) || 206;

  interface AgroBlock {
    id: string;
    render: () => React.ReactNode;
  }

  const agroBlocks: AgroBlock[] = [
    {
      id: 'qualificacao',
      render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '12px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '8.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identificação do Paciente Requerente</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Paciente: {sanitizedUserName}</p>
            <p style={{ margin: '1px 0 0 0', fontSize: '10.5px', color: '#334155' }}>CPF PACIENTE: <strong>{patientCpf}</strong></p>
            <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#475569' }}>
              Indicação Clínica: <strong>{diagnosis}</strong>
            </p>
          </div>
          <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
            <p style={{ margin: 0, fontSize: '8.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Responsável Técnico Pericial</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', fontWeight: '800', color: '#0F172A' }}>Consultor e Eng. Agr: {agronomistName}</p>
            <p style={{ margin: '1px 0 0 0', fontSize: '10.5px', color: '#334155' }}>Registro Profissional: <strong>{agronomistCrea}</strong></p>
            <p style={{ margin: '1px 0 0 0', fontSize: '9.5px', color: '#059669', fontWeight: '600' }}>
              Perito em Fitotecnia & Fitoquímica Canabinoide
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-1',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              1. Resumo & Enquadramento Regulatório (ANVISA)
            </h2>
          </div>
          <div style={{ fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#334155' }}>
            <p style={{ margin: '0 0 5px 0', textIndent: '18px' }}>
              A ANVISA definiu, por meio da <strong>Resolução da Diretoria Colegiada (RDC) nº 335/2020</strong>, alterada pela <strong>RDC nº 570/2021</strong> e consolidada na <strong>RDC nº 660/2022</strong>, os critérios e os procedimentos para a importação de Produto derivado de <em>Cannabis</em>, por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, para tratamento de saúde. Dessa forma, ainda que o produto não tenha registro para comercialização no Brasil, a importação poderá ser autorizada se os critérios e procedimentos definidos na mencionada RDC forem cumpridos, conforme a <strong>Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA</strong>.
            </p>
            <p style={{ margin: 0, textIndent: '18px' }}>
              A fim de proporcionar uma orientação adequada para um cultivo em pequena escala, conhecido comumente como <strong>"cultivo caseiro"</strong>, para paciente que necessita utilizar as moléculas produzidas pela espécie vegetal — nomeadamente o <strong>Δ9–Tetrahidrocanabinol (THC)</strong>, o <strong>Cannabidiol (CBD)</strong> e o <strong>Canabigerol (CBG)</strong>, reconhecidas por suas propriedades terapêuticas —, foi elaborado este parecer com indicações técnicas para o cultivo sob as boas práticas comercialmente conhecidas por <strong>GACP (Good Agriculture and Collection Practices)</strong>, aplicadas para garantir produtividade, pureza biológica e sanidade adequada dos cultivos.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-2',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              2. Dimensionamento do Cultivo e Soberania Terapêutica
            </h2>
          </div>
          <div style={{ fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#334155' }}>
            <p style={{ margin: '0 0 5px 0', textIndent: '18px' }}>
              O cultivo caseiro é a maneira indicada de garantir o acesso continuado aos medicamentos para pacientes que não têm condições de arcar com os elevados custos dos fármacos atualmente disponíveis no mercado, que normalmente <strong>ultrapassam a barreira dos R$ 2.000,00 a R$ 5.000,00 mensais</strong> para produtos comercializados nacionalmente ou importados.
            </p>
            <p style={{ margin: 0, textIndent: '18px' }}>
              Ademais, a segurança da autossuficiência na produção e na manipulação artesanal do próprio fitofármaco garante que o paciente não sofra com desabastecimentos, retenções alfandegárias, quebras de importação ou descontinuidade posológica do seu tratamento médico.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-3',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              3. Anamnese da Triagem, Prescrição Médica e Demanda Terapêutica Individual
            </h2>
          </div>
          <div style={{ fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#334155' }}>
            {customAgroText ? (
              <div style={{ backgroundColor: '#F8FAFC', borderLeft: '3px solid #059669', borderTop: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', borderRadius: '4px', padding: '7px 10px', marginBottom: '6px' }}>
                {customAgroText.split('\n').filter(Boolean).map((para, pIdx) => (
                  <p key={pIdx} style={{ margin: pIdx === 0 ? 0 : '4px 0 0 0', fontSize: '9.8px', lineHeight: '1.45', color: '#1E293B' }}>
                    {para}
                  </p>
                ))}
              </div>
            ) : null}
            {prescribedProductsText ? (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '4px', padding: '6px 10px', marginBottom: '6px' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '8.8px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase' }}>
                  Protocolo Prescrito Vinculado ao Dimensionamento:
                </p>
                <p style={{ margin: 0, fontSize: '9.5px', color: '#064E3B', whiteSpace: 'pre-line' }}>
                  {prescribedProductsText}
                </p>
              </div>
            ) : null}
            <p style={{ margin: 0, textIndent: '18px' }}>
              Estes medicamentos contêm, em média, entre 5-6g de fitocanabinoides em sua composição por frasco de 30 ml (200 mg/ml), com teores modulados de CBD, THC e CBG. No caso do(a) paciente <strong>{sanitizedUserName}</strong>, conforme recomendações médicas oficiais que balizam este parecer técnico, o quadro clínico de <strong>{diagnosis}</strong> visa ser tratado com o uso concomitante de extratos integrais (Full Spectrum) com predominância de CBD/THC, CBD, THC e CBG, além de inflorescências secas padronizadas para vaporização terapêutica em crises álgicas ou insônia aguda, instruindo a memória de cálculo fitoquímico e de biomassa a seguir demonstrada.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-4',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              4. Dosimetria Farmacológica e Consumo Anual Estimado
            </h2>
          </div>
          <p style={{ margin: '0 0 5px 0', fontSize: '10.2px', color: '#334155', textAlign: 'justify', textIndent: '18px' }}>
            Extrapolando o consumo dos extratos artesanais integrais prescritos para intervalos diários, mensais e anuais de uso terapêutico ininterrupto, temos a seguinte dosimetria de substância ativa (CBD/THC/CBG):
          </p>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', fontSize: '10px' }}>
            <div>
              <span style={{ fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Diário:</span>
              <p style={{ margin: '1px 0 0 0', fontWeight: '800', color: '#065F46', fontSize: '11.5px' }}>{dailyMg} mg / dia</p>
              <span style={{ fontSize: '8.5px', color: '#64748B' }}>Óleo integral + extrato bruto</span>
            </div>
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '10px' }}>
              <span style={{ fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Mensal (31 dias):</span>
              <p style={{ margin: '1px 0 0 0', fontWeight: '800', color: '#0F172A', fontSize: '11.5px' }}>{monthlyGrams} g / mês</p>
              <span style={{ fontSize: '8.5px', color: '#64748B' }}>{monthlyMg.toLocaleString('pt-BR')} mg ativos</span>
            </div>
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '10px' }}>
              <span style={{ fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Consumo Anual (365 dias):</span>
              <p style={{ margin: '1px 0 0 0', fontWeight: '800', color: '#0F172A', fontSize: '11.5px' }}>{annualGrams} g / ano</p>
              <span style={{ fontSize: '8.5px', color: '#64748B' }}>{annualMg.toLocaleString('pt-BR')} mg fitocanabinoides</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sec-5',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              5. Fitoquímica, Eficiência de Extração & Relação Flor Seca / Molhada
            </h2>
          </div>
          <div style={{ fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#334155' }}>
            <p style={{ margin: '0 0 5px 0', textIndent: '18px' }}>
              Considerando que o conteúdo médio de canabinoides nas variedades terapêuticas de <em>Cannabis</em> é de <strong>10% em peso seco de flores</strong>, e que a extração artesanal na residência do paciente (sem equipamentos industriais de CO2 supercrítico) atinge uma <strong>eficiência média de recuperação de 80%</strong> das moléculas presentes na biomassa vegetal, a cada 100g de flores secas obtêm-se 10g de extrato bruto concentrado.
            </p>
            <p style={{ margin: 0, textIndent: '18px' }}>
              Para obter os {annualGrams}g anuais prescritos, o cultivo exigiria {dryFlowerKgStr} kg de flores secas anuais. Aplicando-se a <strong>taxa de segurança agronômica de 30% de perdas</strong> (pragas, fungos e oscilações climáticas), o cultivo deve garantir a colheita de <strong>{dryFlowerMarginKgStr} kg de flores secas por ano</strong>. Considerando que as inflorescências perdem entre <strong>70% a 80% de seu peso em água na secagem</strong> e que cada planta indoor rende de 100g a 150g secas por ciclo de 120 dias, o paciente deverá colher <strong>{wetFlowerKgStr} kg de flores molhadas (frescas)</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'quadro-1',
      render: () => (
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '10px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Quadro 1 — Memória de Cálculo & Dimensionamento Agronômico Oficial
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', border: '1.5px solid #CBD5E1', marginBottom: '8px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
                <th style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'left', fontWeight: '800' }}>Parâmetro Agronômico / Terapêutico</th>
                <th style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'center', fontWeight: '800' }}>Base de Cálculo e Referência Técnica</th>
                <th style={{ border: '1px solid #CBD5E1', padding: '4.5px 8px', textAlign: 'right', fontWeight: '800' }}>Quantitativo Técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Demanda Diária de Princípio Ativo</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>Posologia Médica Prescrita</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>{dailyMg} mg / dia</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Consumo Anual de Extrato / Ativos</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>365 dias de tratamento ininterrupto</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>{annualGrams} g / ano</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Teor Fitoquímico & Eficiência de Extração</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>10% peso seco • ~80% recuperação artesanal</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right' }}>{dryFlowerKgStr} kg base seca</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Biomassa Seca Requerida (com 30% de margem)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>Segurança contra pragas, fungos e clima</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold', color: '#065F46' }}>{dryFlowerMarginKgStr} kg secas / ano</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Biomassa Fresca (Flores Molhadas)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>70% a 80% de perda hídrica na secagem</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>{wetFlowerKgStr} kg molhadas / ano</td>
              </tr>
              <tr style={{ backgroundColor: '#ECFDF5', fontWeight: 'bold' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', color: '#065F46' }}>Total de Plantas Recomendadas para Salvo-Conduto</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'center', color: '#065F46' }}>120 dias/ciclo (100-150g secas/planta)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '5px 8px', textAlign: 'right', color: '#065F46', fontSize: '10.5px' }}>{targetPlants} plantas anuais</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px' }}>Plantas em Floração por Ciclo & Sementes Anuais</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'center' }}>3 colheitas/ano • +30% margem germinativa</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold', color: '#065F46' }}>{plantsPerCycle} plantas/ciclo • {seedsNeeded} sementes</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Flor Seca Anual</span>
              <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', fontWeight: '900', color: '#065F46' }}>{dryFlowerMarginKgStr} kg</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Flor Molhada Anual</span>
              <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', fontWeight: '900', color: '#0F172A' }}>{wetFlowerKgStr} kg</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Plantas Totais / Ano</span>
              <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', fontWeight: '900', color: '#065F46' }}>{targetPlants} espécimes</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Sementes Importadas</span>
              <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', fontWeight: '900', color: '#0F172A' }}>{seedsNeeded} un.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sec-6',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              6. Designer de Cultivo e Planejamento Operacional Rotativo
            </h2>
          </div>
          <div style={{ fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#334155' }}>
            <p style={{ margin: 0, textIndent: '18px' }}>
              Para garantir que o cultivo atenda ao consumo anual do paciente de forma contínua, estabelece-se um plano dividido em <strong>3 momentos de colheita ao longo do ano</strong> (ciclo médio de 120 dias), conduzindo aproximadamente <strong>{plantsPerCycle} plantas em floração por ciclo rotativo</strong>. Considerando que apenas plantas em floração sintetizam canabinoides em concentração terapêutica, o paciente poderá manter plantas-mãe em estado vegetativo (fotoperíodo &gt;18h de luz) para clonagem ou realizar o cultivo a partir de <strong>{seedsNeeded} sementes feminizadas anuais</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-7',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              7. Boas Práticas Agrícolas e de Coleta (GACP) & Parâmetros Indoor
            </h2>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 12px', fontSize: '9.8px', lineHeight: '1.45', color: '#334155' }}>
            <p style={{ margin: '0 0 3px 0' }}>
              • <strong>Ambiente Indoor & Iluminação:</strong> Cultivo fechado por biossegurança e controle fitossanitário, sob painéis LED Full Spectrum (vegetativo 18h/6h; floração estrita 12h/12h).
            </p>
            <p style={{ margin: '0 0 3px 0' }}>
              • <strong>Climatização, Substrato & Isenção de Agrotóxicos:</strong> Exaustão mecânica com <strong>filtro de carvão ativado</strong> (retenção de odores/terpenos), 20°C–26°C, 45%–65% UR, substrato orgânico/inerte (pH 5.8–6.5) e <strong>vedação absoluta de pesticidas sintéticos</strong>.
            </p>
            <p style={{ margin: 0 }}>
              • <strong>Pós-Colheita (Secagem & Cura):</strong> Secagem lenta ao abrigo de luz (18–20°C e 55% UR) por 10 a 14 dias e cura hermética (Boveda 62%) por no mínimo 30 dias para estabilização fitoquímica.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-8',
      render: () => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '13px', backgroundColor: '#059669', borderRadius: '2px' }}></span>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              8. Conclusão Pericial Agronômica
            </h2>
          </div>
          <div style={{ backgroundColor: '#F0FDF4', borderLeft: '3.5px solid #059669', borderRight: '1px solid #BBF7D0', borderTop: '1px solid #BBF7D0', borderBottom: '1px solid #BBF7D0', padding: '9px 12px', fontSize: '10.2px', lineHeight: '1.48', textAlign: 'justify', color: '#064E3B' }}>
            <p style={{ margin: 0 }}>
              <strong>Conclusão Técnica:</strong> Com base nas prescrições médicas que amparam este parecer, nos cálculos dosimétricos de fitomassa e na biologia da espécie, conclui-se que o dimensionamento anual de <strong>{targetPlants} espécimes de <em>Cannabis sativa L.</em></strong> (em ciclos de aproximadamente <strong>{plantsPerCycle} plantas em floração por colheita</strong>), juntamente com a importação de <strong>{seedsNeeded} sementes feminizadas</strong>, é <strong>agronomicamente justificado, estritamente proporcional e indispensável</strong> para assegurar a autossuficiência e continuidade do tratamento médico do(a) paciente <strong>{sanitizedUserName}</strong> por 12 meses, sem excedentes para finalidade diversa.
            </p>
          </div>
        </div>
      )
    }
  ];

  const renderAgroHeader = (isContinuation: boolean) => {
    if (isContinuation) {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #065F46', paddingBottom: '7px', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#065F46' }}>MECURA</span>
            <span style={{ fontSize: '9.5px', color: '#64748B', marginLeft: '8px' }}>PARECER AGRONÔMICO PERICIAL — DIMENSIONAMENTO & MANEJO GACP</span>
          </div>
          <div style={{ fontSize: '9.5px', color: '#334155' }}>
            Paciente: <strong>{sanitizedUserName}</strong> • CPF: <strong>{patientCpf}</strong>
          </div>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #065F46', paddingBottom: '10px', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#065F46', letterSpacing: '-0.5px' }}>MECURA</span>
              <span style={{ fontSize: '9.5px', fontWeight: '800', backgroundColor: '#ECFDF5', color: '#065F46', padding: '2px 8px', borderRadius: '4px', border: '1px solid #A7F3D0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                LAUDO TÉCNICO PERICIAL
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', color: '#475569', fontWeight: '600' }}>
              Centro Integrado de Medicina Canabinoide & Assessoria Pericial em Fitotecnia
            </p>
            <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', color: '#059669', fontWeight: '600' }}>
              Boas Práticas de Agricultura e Coleta (GACP / OMS) • Salvo-Conduto para Autocultivo
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: '800', color: '#065F46', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              HABEAS CORPUS PREVENTIVO
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', fontWeight: '700', color: '#0F172A' }}>AUTOCULTIVO MEDICINAL</p>
            <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#64748B' }}>Data de Emissão: <strong>{emissionDate}</strong></p>
          </div>
        </div>

        <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px' }}>
          <h1 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Auto cultivo para finalidade medicinal — Parecer Técnico Agronômico
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#334155' }}>
            Indicações técnicas e dimensionamento pericial de <em>Cannabis sativa L.</em> com finalidade medicinal
          </p>
        </div>
      </div>
    );
  };

  const renderAgroSignature = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginTop: '14px', paddingTop: '8px' }}>
      <div style={{ textAlign: 'center', borderTop: '1.5px solid #94A3B8', paddingTop: '7px' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '900', color: '#0F172A' }}>{agronomistName}</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '9.5px', fontWeight: '700', color: '#065F46' }}>Engenheiro Agrônomo — {agronomistCrea}</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', color: '#475569' }}>Perito em Fitotecnia, Fitoquímica Canabinoide & GACP</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '8px', color: '#64748B' }}>ART de Perícia Agronômica vinculada ao CREA-PR</p>
      </div>
      <div style={{ textAlign: 'center', borderTop: '1.5px solid #94A3B8', paddingTop: '7px' }}>
        <p style={{ margin: 0, fontSize: '10.5px', fontWeight: '800', color: '#0F172A' }}>MECURA SAÚDE & BEM-ESTAR</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#475569' }}>Núcleo de Apoio Jurídico & Pericial à Ação de Habeas Corpus</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '8px', color: '#059669', fontWeight: '700' }}>Certificação Digital ICP-Brasil / Hash Autenticidade</p>
        <p style={{ margin: '1px 0 0 0', fontSize: '7.5px', color: '#94A3B8', fontFamily: 'monospace' }}>MEC-AGRO-HC-{new Date().getFullYear()}-{patientCpf.replace(/\D/g, '').slice(0, 6)}</p>
      </div>
    </div>
  );

  const root = createRoot(container);

  try {
    if (agronomicData?.htmlContent) {
      root.render(
        <div style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#000000', padding: '40px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          <div dangerouslySetInnerHTML={{ __html: agronomicData.htmlContent }} />
        </div>
      );
      await new Promise(resolve => setTimeout(resolve, 600));
    } else {
      // Real DOM measurement pass so pages pack tightly without blank spaces
      const MeasurePass = () => (
        <div style={{ width: '794px', padding: '30px 40px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
          <div id="agro-measure-h-first">{renderAgroHeader(false)}</div>
          <div id="agro-measure-h-cont">{renderAgroHeader(true)}</div>
          <div id="agro-measure-sig">{renderAgroSignature()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {agroBlocks.map((b, idx) => (
              <div key={`agro-measure-${b.id || idx}-${idx}`} data-agro-idx={idx}>{b.render()}</div>
            ))}
          </div>
        </div>
      );

      root.render(<MeasurePass />);
      await new Promise(resolve => setTimeout(resolve, 250));

      const hFirst = container.querySelector<HTMLElement>('#agro-measure-h-first')?.offsetHeight || 135;
      const hCont = container.querySelector<HTMLElement>('#agro-measure-h-cont')?.offsetHeight || 42;
      const sigH = container.querySelector<HTMLElement>('#agro-measure-sig')?.offsetHeight || 82;
      const blockEls = Array.from(container.querySelectorAll<HTMLElement>('[data-agro-idx]'));
      const blockHeights = blockEls.map(el => el.offsetHeight);

      const USABLE_PAGE_H = 1120 - 60 - 26;
      const GAP = 11;

      const pages: AgroBlock[][] = [];
      let cursor = 0;

      while (cursor < agroBlocks.length) {
        const isFirst = pages.length === 0;
        const availH = USABLE_PAGE_H - (isFirst ? hFirst : hCont);
        const pageBlocks: AgroBlock[] = [];
        let usedH = 0;

        while (cursor < agroBlocks.length) {
          const h = blockHeights[cursor] || 70;
          const g = pageBlocks.length > 0 ? GAP : 0;
          const isLast = cursor === agroBlocks.length - 1;
          const extraSig = isLast ? sigH + 14 : 0;

          if (pageBlocks.length > 0 && usedH + g + h + extraSig > availH) {
            break;
          }
          pageBlocks.push(agroBlocks[cursor]);
          usedH += g + h;
          cursor++;
        }
        pages.push(pageBlocks);
      }

      const PdfComponent = () => (
        <div style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#1E293B', fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
          {pages.map((pageBlocks, pIdx) => {
            const isLastPage = pIdx === pages.length - 1;
            return (
              <div
                key={`agro-page-${pIdx}`}
                className="agronomic-pdf-page"
                style={{
                  width: '794px',
                  height: '1120px',
                  maxHeight: '1120px',
                  overflow: 'hidden',
                  padding: '30px 40px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div>
                  {renderAgroHeader(pIdx > 0)}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                    {pageBlocks.map((b, bIdx) => (
                      <div key={`agro-p${pIdx}-${b.id || bIdx}-${bIdx}`}>{b.render()}</div>
                    ))}
                  </div>
                  {isLastPage && renderAgroSignature()}
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', color: '#64748B' }}>
                  <span>Mecura • Assessoria Pericial em Fitotecnia & Autocultivo Medicinal</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>Parecer Técnico — Página {pIdx + 1} de {pages.length}</span>
                  <span>Documento para Instrução de Habeas Corpus Preventivo</span>
                </div>
              </div>
            );
          })}
        </div>
      );

      root.render(<PdfComponent />);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

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
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    } else {
      const contentEl = (container.firstElementChild || container) as HTMLElement;
      const canvas = await safeHtml2Canvas(contentEl);
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
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

