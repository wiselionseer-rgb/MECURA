import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Send,
  User,
  Pill,
  FileText,
  Sparkles,
  Check,
  Clock,
  DollarSign,
  Truck,
  Tag,
  MessageCircle,
  AlertCircle,
  Building2,
  Globe,
  Stethoscope,
  PackageCheck,
  Edit3,
  X
} from 'lucide-react';
import { useAdminStore, PharmacyOrderItem, PharmacyPreparedOrder } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { cbdGuideData, CBDCategory, CBDProduct, enrichMedicationDetails } from '../data/cbdGuide';
import { FLOWERMED_PRODUCTS } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { mergeProductCatalogs, getBrandTabsFromCategories } from '../utils/productCatalog';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';

interface AdminOrderBuilderViewProps {
  patients: any[];
  onShowToast?: (msg: string) => void;
}

export const AdminOrderBuilderView: React.FC<AdminOrderBuilderViewProps> = ({
  patients,
  onShowToast
}) => {
  const {
    productCategories: rawCategories,
    pharmacyOrders,
    savePharmacyOrder,
    updatePharmacyOrderStatus,
    deletePharmacyOrder
  } = useAdminStore();

  const { queue, exchangeRate } = useStore();

  const productCategories = useMemo(
    () => mergeProductCatalogs(cbdGuideData, rawCategories),
    [rawCategories]
  );

  const brandTabs = useMemo(
    () => getBrandTabsFromCategories(productCategories),
    [productCategories]
  );

  const allCatalogProducts = useMemo(() => {
    const map = new Map<string, CBDProduct>();
    productCategories.forEach(cat => {
      cat.products.forEach(prod => {
        const key = (prod.name || '').trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, prod);
        }
      });
    });
    return Array.from(map.values());
  }, [productCategories]);

  // Listen to active_consultations collection so we know which patients have prescriptions in Firestore
  const [activeConsultationsMap, setActiveConsultationsMap] = useState<Record<string, any>>({});
  const [patientFilterTab, setPatientFilterTab] = useState<'all' | 'with_prescription' | 'approved' | 'requested'>('all');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Order Builder Form State
  const [orderItems, setOrderItems] = useState<PharmacyOrderItem[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [doctorCrm, setDoctorCrm] = useState('CRM/MT 17259');
  const [shippingBRL, setShippingBRL] = useState<number>(0);
  const [discountBRL, setDiscountBRL] = useState<number>(0);
  const [showPricesToPatient, setShowPricesToPatient] = useState<boolean>(true);
  const [orderNotes, setOrderNotes] = useState<string>(
    'Pedido montado conforme a sua receita médica. Confira os itens abaixo e clique em "Solicitar Pedido" para enviar a confirmação no WhatsApp.'
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>('5566996280883');

  // Add from Catalog Modal State
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Custom item quick-add state
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemBrand, setCustomItemBrand] = useState('GreenBudz');
  const [customItemOrigin, setCustomItemOrigin] = useState<'Importado' | 'Nacional'>('Importado');
  const [customItemConcentration, setCustomItemConcentration] = useState('100 mg/mL • Frasco de 30 mL');
  const [customItemForm, setCustomItemForm] = useState('Solução Oleosa Sublingual (Gotas)');
  const [customItemQuantitySpec, setCustomItemQuantitySpec] = useState('01 Frasco de 30 mL');
  const [customItemRoute, setCustomItemRoute] = useState('Via Sublingual / Oral');
  const [customItemDosage, setCustomItemDosage] = useState('Tomar 03 a 05 gotas de 12/12 horas.');
  const [customItemPriceBRL, setCustomItemPriceBRL] = useState('390');

  const notify = useCallback((msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  }, [onShowToast]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'active_consultations'), (snap) => {
        const map: Record<string, any> = {};
        snap.forEach(d => {
          map[d.id] = { id: d.id, ...d.data() };
        });
        setActiveConsultationsMap(map);
      }, (err) => {
        console.warn('active_consultations snapshot warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Failed to subscribe to active_consultations:', e);
    }
  }, []);

  // Resolve price for a product from catalog & official SouCannabis / Sequoia / Pangaia tables
  const resolveProductPrices = useCallback((
    name: string,
    origin?: string,
    rawPriceBRL?: number,
    rawPriceUSD?: number,
    concentrationHint?: string,
    quantityHint?: string
  ) => {
    const cleanName = (name || '').trim().toLowerCase();
    const combinedText = `${cleanName} ${(concentrationHint || '').toLowerCase()} ${(quantityHint || '').toLowerCase()}`;
    const is10ml = /\b10\s*ml\b/i.test(combinedText) && !/\b30\s*ml\b/i.test(cleanName);

    // 1. Exact catalog match first
    for (const prod of allCatalogProducts) {
      const pName = (prod.name || '').trim().toLowerCase();
      if (pName === cleanName) {
        if (prod.priceBRL && prod.priceBRL > 0) {
          return { priceBRL: Number(prod.priceBRL.toFixed(2)), priceUSD: prod.priceUSD };
        }
        if (prod.priceUSD && prod.priceUSD > 0) {
          return { priceBRL: Number((prod.priceUSD * exchangeRate).toFixed(2)), priceUSD: prod.priceUSD };
        }
      }
    }

    // 2. Substring catalog match (respecting 10mL vs 30mL volume)
    for (const prod of allCatalogProducts) {
      const pName = (prod.name || '').trim().toLowerCase();
      const prodIs10ml = /\b10\s*ml\b/i.test(pName);
      const prodIs30ml = /\b30\s*ml\b/i.test(pName);
      if ((prodIs10ml && !is10ml) || (prodIs30ml && is10ml)) continue;

      if (cleanName.includes(pName) || pName.includes(cleanName)) {
        if (prod.priceBRL && prod.priceBRL > 0) {
          return { priceBRL: Number(prod.priceBRL.toFixed(2)), priceUSD: prod.priceUSD };
        }
        if (prod.priceUSD && prod.priceUSD > 0) {
          return { priceBRL: Number((prod.priceUSD * exchangeRate).toFixed(2)), priceUSD: prod.priceUSD };
        }
      }
    }

    // 3. Explicit rawPriceBRL (ignore stale 250 fallback on 30mL 100mg/ml oils so official table applies)
    if (rawPriceBRL && rawPriceBRL > 0 && !(rawPriceBRL === 250 && !is10ml && /100\s*mg/i.test(combinedText))) {
      return { priceBRL: Number(rawPriceBRL.toFixed(2)), priceUSD: rawPriceUSD };
    }
    if (rawPriceUSD && rawPriceUSD > 0) {
      return { priceBRL: Number((rawPriceUSD * exchangeRate).toFixed(2)), priceUSD: rawPriceUSD };
    }

    // 4. Official Pangaia rules if name mentions Pangaia / Maná / Táio / Piatella / Sleep CBN
    if (
      cleanName.includes('pangaia') ||
      cleanName.includes('maná') ||
      cleanName.includes('mana ') ||
      cleanName.includes('táio') ||
      cleanName.includes('taio') ||
      cleanName.includes('piatella') ||
      cleanName.includes('sleep cbn')
    ) {
      if (cleanName.includes('kit') && cleanName.includes('amaz')) return { priceBRL: 797.00, priceUSD: 159.40 };
      if (cleanName.includes('maná') || cleanName.includes('mana') || cleanName.includes('táio') || cleanName.includes('taio')) {
        return { priceBRL: 440.00, priceUSD: 88.00 };
      }
      if (cleanName.includes('5%') || cleanName.includes('1500 mg') || cleanName.includes('1500mg')) return { priceBRL: 397.00, priceUSD: 79.40 };
      if (cleanName.includes('20%') || (cleanName.includes('6000') && !cleanName.includes('sleep'))) return { priceBRL: 897.00, priceUSD: 179.40 };
      if (cleanName.includes('10%') && !cleanName.includes('diamond')) return { priceBRL: 879.00, priceUSD: 175.80 };
      if (cleanName.includes('2500')) return { priceBRL: 499.00, priceUSD: 99.80 };
      if (cleanName.includes('5000')) return { priceBRL: 565.00, priceUSD: 113.00 };
      if (cleanName.includes('sleep cbn') && cleanName.includes('gumm')) return { priceBRL: 300.00, priceUSD: 60.00 };
      if (cleanName.includes('sleep cbn')) return { priceBRL: 430.00, priceUSD: 86.00 };
      if (cleanName.includes('cooling salve') || cleanName.includes('500 mg')) return { priceBRL: 199.90, priceUSD: 39.98 };
      if (cleanName.includes('relief cream')) return { priceBRL: 599.00, priceUSD: 119.80 };
      if (cleanName.includes('750 mg') || cleanName.includes('750mg')) return { priceBRL: 349.99, priceUSD: 70.00 };
      if (cleanName.includes('16 un')) return { priceBRL: 179.90, priceUSD: 35.98 };
      if (cleanName.includes('28 un') || cleanName.includes('strawberry cream')) return { priceBRL: 247.99, priceUSD: 49.60 };
      if (cleanName.includes('2000 mg') || cleanName.includes('2000mg')) return { priceBRL: 599.99, priceUSD: 120.00 };
    }

    // 5. Official SouCannabis & Sequoia & National Association rules
    const isNational =
      (origin || '').toLowerCase().includes('nacional') ||
      (origin || '').toLowerCase().includes('associa') ||
      cleanName.includes('soucannabis') ||
      cleanName.includes('sequoia') ||
      cleanName.includes('óleo integral') ||
      cleanName.includes('oleo integral') ||
      cleanName.includes('alto cbd') ||
      cleanName.includes('alto thc') ||
      cleanName.includes('equilibrado');

    if (isNational) {
      // Sequoia Inflorescências
      if (cleanName.includes('sequoia') || cleanName.includes('infloresc') || cleanName.includes('flor in natura')) {
        if (/\b1\s*g\b/i.test(combinedText) && !/\b10\s*g\b/i.test(combinedText)) {
          return { priceBRL: 65.00, priceUSD: undefined };
        }
        return { priceBRL: 650.00, priceUSD: undefined };
      }

      // Pomada Azul 30g
      if (cleanName.includes('pomada')) {
        return { priceBRL: 110.00, priceUSD: undefined };
      }

      // Supositórios (20un vs 60un, Azul 5:1 vs Laranja 1:10)
      if (cleanName.includes('suposit')) {
        const is60un = /\b60\s*un/i.test(combinedText);
        const isLaranja = cleanName.includes('laranja') || cleanName.includes('1:10');
        if (isLaranja) return { priceBRL: is60un ? 480.00 : 240.00, priceUSD: undefined };
        return { priceBRL: is60un ? 555.00 : 280.00, priceUSD: undefined };
      }

      // Spray Nasal (60mg/ml, 10ml vs 30ml)
      if (cleanName.includes('spray nasal')) {
        const isLaranja = cleanName.includes('laranja') || cleanName.includes('1:10');
        if (isLaranja) return { priceBRL: is10ml ? 165.00 : 325.00, priceUSD: undefined };
        return { priceBRL: is10ml ? 200.00 : 395.00, priceUSD: undefined };
      }

      // Lubrificante Íntimo (1:1, 60mg/ml vs 100mg/ml, 10ml vs 30ml)
      if (cleanName.includes('lubrificante')) {
        const is100mg = /100\s*mg|10%/i.test(combinedText);
        if (is100mg) return { priceBRL: is10ml ? 280.00 : 555.00, priceUSD: undefined };
        return { priceBRL: is10ml ? 200.00 : 395.00, priceUSD: undefined };
      }

      // Extratos Puros SouCannabis
      if (cleanName.includes('extrato puro')) {
        const isThc = cleanName.includes('thc');
        const is3g = /\b3\s*g\b/i.test(combinedText);
        if (isThc) return { priceBRL: is3g ? 300.00 : 100.00, priceUSD: undefined };
        return { priceBRL: is3g ? 270.00 : 90.00, priceUSD: undefined };
      }

      // SouCannabis / National Oils by Line & Concentration (10 mL vs 30 mL)
      // Determine line:
      // - Azul (5:1 THC:CBD / Predominante THC / Alto THC) or Lilás (1:1 THC:CBD / Equilibrado / Balanceado 1:1)
      // - Rosa (1:5 THC:CBD / Alto CBD 5:1)
      // - Laranja (1:10 THC:CBD) or Branco (CBD sem THC / Isolado / Broad Spectrum / Predominante CBD)
      const isAzulOrLilas =
        cleanName.includes('azul') ||
        cleanName.includes('lilás') ||
        cleanName.includes('lilas') ||
        cleanName.includes('1:1') ||
        cleanName.includes('equilibrado') ||
        cleanName.includes('predominante thc') ||
        cleanName.includes('alto thc') ||
        cleanName.includes('thc/cbd');

      const isRosa =
        cleanName.includes('rosa') ||
        cleanName.includes('1:5') ||
        cleanName.includes('cbd 5:1') ||
        cleanName.includes('5:1 thc');

      const conc =
        /200\s*mg|20%/i.test(combinedText) ? 200 :
        /150\s*mg|15%/i.test(combinedText) ? 150 :
        /100\s*mg|10%/i.test(combinedText) ? 100 :
        /60\s*mg|6%|50\s*mg/i.test(combinedText) ? 60 :
        /30\s*mg|3%/i.test(combinedText) ? 30 :
        /20\s*mg|2%/i.test(combinedText) ? 20 : 100;

      const priceTable = isAzulOrLilas
        ? {
            20: [120, 240],
            30: [135, 270],
            60: [200, 395],
            100: [280, 555],
            150: [375, 750],
            200: [480, 955]
          }
        : isRosa
        ? {
            20: [110, 220],
            30: [130, 255],
            60: [185, 365],
            100: [250, 500],
            150: [355, 710],
            200: [440, 880]
          }
        : {
            // Laranja (1:10) & Branco (CBD sem THC / Predominante CBD)
            20: [105, 210],
            30: [120, 240],
            60: [165, 325],
            100: [240, 480],
            150: [295, 590],
            200: [385, 770]
          };

      const pair = priceTable[conc as keyof typeof priceTable] || [240, 480];
      return { priceBRL: is10ml ? pair[0] : pair[1], priceUSD: undefined };
    }

    const fe = FLOWER_EXTRACTIONS_PRODUCTS.find(
      p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase())
    );
    if (fe) {
      const usd = fe.priceUSD || (fe.priceBRL ? fe.priceBRL / 5.0 : undefined);
      const brl = fe.priceBRL || (usd ? usd * exchangeRate : 0);
      return { priceBRL: Number(brl.toFixed(2)), priceUSD: usd };
    }

    const fm = FLOWERMED_PRODUCTS.find(
      p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase())
    );
    if (fm) {
      const usd = fm.priceUSD || (fm.priceBRL ? fm.priceBRL / 5.0 : undefined);
      const brl = fm.priceBRL || (usd ? usd * exchangeRate : 0);
      return { priceBRL: Number(brl.toFixed(2)), priceUSD: usd };
    }

    return { priceBRL: Number((79.90 * exchangeRate).toFixed(2)), priceUSD: 79.90 };
  }, [allCatalogProducts, exchangeRate]);

  // Read saved prescriptions from localStorage
  const localSavedPrescriptions = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mecura_saved_prescriptions_v2') : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [selectedPatientId, activeConsultationsMap]);

  // Build unified list of patients with their consultation & prescription status
  const unifiedPatients = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      cpf: string;
      consultationStatus: string;
      prescribedItemsPreview: any[];
      updatedAtMs: number;
    }>();

    // 1. From users collection
    patients.forEach(p => {
      if (!p.id) return;
      const pName = (p.name || p.patientName || 'Paciente').trim();
      const qItem = queue.find(q => q.id === p.id);
      const activeConsult = activeConsultationsMap[p.id];
      const localPresc = localSavedPrescriptions[p.id.toLowerCase()] || localSavedPrescriptions[pName.toLowerCase()];

      const prescItems =
        activeConsult?.prescriptionData?.items ||
        (qItem as any)?.prescriptionData?.items ||
        p.prescriptionData?.items ||
        localPresc?.items ||
        [];

      const status =
        qItem?.status ||
        p.consultationStatus ||
        (p.isConsultationFinished ? 'finished' : 'registered');

      const ts = p.lastUpdated || p.createdAt || activeConsult?.lastPrescriptionUpdated || 0;
      const updatedAtMs = ts ? new Date(ts).getTime() || 0 : 0;

      map.set(p.id, {
        id: p.id,
        name: pName,
        email: p.email || qItem?.email || '',
        phone: p.phone || p.whatsapp || qItem?.phone || p.answers?.phone || '',
        cpf: p.cpf || qItem?.cpf || p.answers?.cpf || '',
        consultationStatus: status,
        prescribedItemsPreview: Array.isArray(prescItems) ? prescItems : [],
        updatedAtMs
      });
    });

    // 2. From queue
    queue.forEach(q => {
      if (!q.id) return;
      const existing = map.get(q.id);
      const activeConsult = activeConsultationsMap[q.id];
      const pName = (q.patientName || existing?.name || 'Paciente').trim();
      const localPresc = localSavedPrescriptions[q.id.toLowerCase()] || localSavedPrescriptions[pName.toLowerCase()];

      const prescItems =
        activeConsult?.prescriptionData?.items ||
        (q as any)?.prescriptionData?.items ||
        localPresc?.items ||
        existing?.prescribedItemsPreview ||
        [];

      map.set(q.id, {
        id: q.id,
        name: pName,
        email: q.email || existing?.email || '',
        phone: q.phone || existing?.phone || q.answers?.phone || '',
        cpf: q.cpf || existing?.cpf || q.answers?.cpf || '',
        consultationStatus: q.status || existing?.consultationStatus || 'waiting',
        prescribedItemsPreview: Array.isArray(prescItems) ? prescItems : [],
        updatedAtMs: Math.max(
          existing?.updatedAtMs || 0,
          q.lastMessageAt ? new Date(q.lastMessageAt).getTime() || 0 : 0
        )
      });
    });

    // 3. From active_consultations
    Object.values(activeConsultationsMap).forEach((ac: any) => {
      if (!ac?.id) return;
      const existing = map.get(ac.id);
      const prescData = ac.prescriptionData;
      const pName = (prescData?.patientName || existing?.name || 'Paciente').trim();
      const prescItems = prescData?.items || existing?.prescribedItemsPreview || [];

      if (!existing && pName === 'Paciente' && (!Array.isArray(prescItems) || prescItems.length === 0)) {
        return;
      }

      map.set(ac.id, {
        id: ac.id,
        name: pName,
        email: existing?.email || '',
        phone: existing?.phone || '',
        cpf: prescData?.cpf || existing?.cpf || '',
        consultationStatus: existing?.consultationStatus || 'finished',
        prescribedItemsPreview: Array.isArray(prescItems) ? prescItems : [],
        updatedAtMs: Math.max(
          existing?.updatedAtMs || 0,
          ac.lastPrescriptionUpdated ? new Date(ac.lastPrescriptionUpdated).getTime() || 0 : 0
        )
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      const aOrder = pharmacyOrders.find(o => o.patientId === a.id);
      const bOrder = pharmacyOrders.find(o => o.patientId === b.id);
      const aHasPresc = a.prescribedItemsPreview.length > 0 ? 1 : 0;
      const bHasPresc = b.prescribedItemsPreview.length > 0 ? 1 : 0;
      const aFinished = a.consultationStatus === 'finished' ? 1 : 0;
      const bFinished = b.consultationStatus === 'finished' ? 1 : 0;

      if (aHasPresc !== bHasPresc) return bHasPresc - aHasPresc;
      if (aFinished !== bFinished) return bFinished - aFinished;
      if (Boolean(aOrder) !== Boolean(bOrder)) return aOrder ? -1 : 1;
      return (b.updatedAtMs || 0) - (a.updatedAtMs || 0);
    });

    return list;
  }, [patients, queue, activeConsultationsMap, localSavedPrescriptions, pharmacyOrders]);

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return unifiedPatients.filter(p => {
      const order = pharmacyOrders.find(o => o.patientId === p.id);
      if (patientFilterTab === 'with_prescription') {
        if (p.prescribedItemsPreview.length === 0 && p.consultationStatus !== 'finished') return false;
      } else if (patientFilterTab === 'approved') {
        if (!order || order.status !== 'approved') return false;
      } else if (patientFilterTab === 'requested') {
        if (!order || order.status !== 'requested') return false;
      }

      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.cpf.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
      );
    });
  }, [unifiedPatients, patientFilterTab, patientSearch, pharmacyOrders]);

  const selectedPatient = useMemo(
    () => unifiedPatients.find(p => p.id === selectedPatientId) || null,
    [unifiedPatients, selectedPatientId]
  );

  const existingPatientOrder = useMemo(() => {
    if (!selectedPatientId) return null;
    return pharmacyOrders.find(
      o =>
        o.patientId === selectedPatientId ||
        (selectedPatient?.cpf && o.patientCpf && o.patientCpf.replace(/\D/g, '') === selectedPatient.cpf.replace(/\D/g, '') && selectedPatient.cpf.replace(/\D/g, '').length >= 11)
    ) || null;
  }, [pharmacyOrders, selectedPatientId, selectedPatient]);

  // Convert raw prescribed items into PharmacyOrderItem[]
  const convertRawPrescribedToOrderItems = useCallback((rawItems: any[]): PharmacyOrderItem[] => {
    const seen = new Set<string>();
    const result: PharmacyOrderItem[] = [];

    rawItems.forEach((it, idx) => {
      if (!it || !it.name) return;
      const cleanKey = String(it.name).trim().toLowerCase();
      if (seen.has(cleanKey)) return;
      seen.add(cleanKey);

      const enriched = enrichMedicationDetails(
        it.name,
        it.brand || it.manufacturer || 'Associação Brasileira',
        it.origin || 'Nacional',
        it.type
      );

      const resolvedOrigin = it.origin || enriched.origin || 'Nacional';
      const resolvedConcentration = it.concentration || enriched.concentration || '100 mg/mL';
      const resolvedQuantitySpec = it.quantity || it.quantitySpec || enriched.quantity || '01 Frasco de 30 mL';
      const { priceBRL, priceUSD } = resolveProductPrices(
        it.name,
        resolvedOrigin,
        it.priceBRL,
        it.priceUSD,
        resolvedConcentration,
        resolvedQuantitySpec
      );

      const dosageArr = Array.isArray(it.dosage)
        ? it.dosage.filter(Boolean)
        : it.dosage
        ? [String(it.dosage)]
        : enriched.usageInstructions
        ? [enriched.usageInstructions]
        : ['Tomar conforme orientação médica.'];

      result.push({
        id: `presc_${idx}_${Date.now()}`,
        name: it.name,
        brand: it.brand || it.manufacturer || enriched.brand || 'GreenBudz',
        origin: resolvedOrigin,
        type: it.type || enriched.type || 'Óleo Medicinal',
        activeIngredients: it.activeIngredients || enriched.activeIngredients || 'Canabidiol (CBD)',
        concentration: resolvedConcentration,
        pharmaceuticalForm: it.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
        quantitySpec: resolvedQuantitySpec,
        administrationRoute: it.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral',
        dosage: dosageArr,
        unitQuantity: Number(it.unitQuantity) || 1,
        unitPriceBRL: priceBRL,
        priceUSD,
        image: it.image || undefined,
        prescribedByDoctor: true
      });
    });

    return result;
  }, [resolveProductPrices]);

  // Fetch all prescribed medications for a patient from Firestore & localStorage
  const loadPatientPrescribedMedications = useCallback(async (patientId: string, forceReloadFromPrescription = false) => {
    if (!patientId) return;
    setIsLoadingPrescription(true);

    try {
      const pInfo = unifiedPatients.find(p => p.id === patientId);
      const existingOrder = pharmacyOrders.find(o => o.patientId === patientId);

      // If an order was already prepared for this patient and we're not forcing a fresh reload from prescription, load it (refreshing any stale fallback prices)
      if (existingOrder && !forceReloadFromPrescription && existingOrder.items.length > 0) {
        const refreshedItems = existingOrder.items.map(it => {
          const isStaleFallbackPrice =
            it.unitPriceBRL === 250 ||
            it.unitPriceBRL === 220 ||
            it.unitPriceBRL === 230 ||
            it.unitPriceBRL === 290 ||
            it.unitPriceBRL === 310 ||
            it.unitPriceBRL === 360 ||
            it.unitPriceBRL === 380 ||
            it.unitPriceBRL === 489 ||
            it.unitPriceBRL === 1099 ||
            !it.unitPriceBRL;
          if (isStaleFallbackPrice) {
            const { priceBRL, priceUSD } = resolveProductPrices(
              it.name,
              it.origin,
              undefined,
              undefined,
              it.concentration,
              it.quantitySpec
            );
            return { ...it, unitPriceBRL: priceBRL, priceUSD: priceUSD ?? it.priceUSD };
          }
          return it;
        });
        setOrderItems(refreshedItems);
        setDoctorName(existingOrder.doctorName || 'Dr. Guilherme Taveira Dias');
        setDoctorCrm(existingOrder.doctorCrm || 'CRM/MT 17259');
        setShippingBRL(existingOrder.shippingBRL || 0);
        setDiscountBRL(existingOrder.discountBRL || 0);
        setShowPricesToPatient(existingOrder.showPricesToPatient !== undefined ? existingOrder.showPricesToPatient : true);
        setOrderNotes(existingOrder.notes || '');
        setWhatsappNumber(existingOrder.whatsappNumber || '5566996280883');
        setIsLoadingPrescription(false);
        return;
      }

      const collectedRawItems: any[] = [];
      let detectedDoctorName = 'Dr. Guilherme Taveira Dias';
      let detectedDoctorCrm = 'CRM/MT 17259';

      // 1. Check active_consultations/{patientId} and queue/{patientId}
      const [acSnap, qSnap, msgsSnap] = await Promise.all([
        getDoc(doc(db, 'active_consultations', patientId)).catch(() => null),
        getDoc(doc(db, 'queue', patientId)).catch(() => null),
        getDocs(collection(db, 'active_consultations', patientId, 'messages')).catch(() => null)
      ]);

      if (acSnap && acSnap.exists()) {
        const acData = acSnap.data();
        if (acData?.prescriptionData?.items?.length) {
          collectedRawItems.push(...acData.prescriptionData.items);
          if (acData.prescriptionData.doctorName) detectedDoctorName = acData.prescriptionData.doctorName;
          if (acData.prescriptionData.doctorCrm) detectedDoctorCrm = acData.prescriptionData.doctorCrm;
        }
      }

      if (qSnap && qSnap.exists()) {
        const qData = qSnap.data();
        if (qData?.prescriptionData?.items?.length) {
          collectedRawItems.push(...qData.prescriptionData.items);
        }
      }

      // 2. Check messages in active_consultations/{patientId}/messages
      if (msgsSnap && !msgsSnap.empty) {
        msgsSnap.forEach(mDoc => {
          const m = mDoc.data();
          if (m.type === 'receita_previa' && m.receitaPreviaData?.items?.length) {
            collectedRawItems.push(...m.receitaPreviaData.items);
            if (m.receitaPreviaData.doctorName) detectedDoctorName = m.receitaPreviaData.doctorName;
            if (m.receitaPreviaData.doctorCrm) detectedDoctorCrm = m.receitaPreviaData.doctorCrm;
          } else if (m.type === 'product' && m.productData?.name) {
            collectedRawItems.push(m.productData);
          }
        });
      }

      // 3. Check localStorage saved prescriptions
      if (pInfo) {
        const localById = localSavedPrescriptions[patientId.toLowerCase()];
        const localByName = localSavedPrescriptions[pInfo.name.toLowerCase()];
        const localPresc = localById || localByName;
        if (localPresc?.items?.length) {
          collectedRawItems.push(...localPresc.items);
        }
        if (pInfo.prescribedItemsPreview?.length) {
          collectedRawItems.push(...pInfo.prescribedItemsPreview);
        }
      }

      const converted = convertRawPrescribedToOrderItems(collectedRawItems);
      setOrderItems(converted);
      setDoctorName(detectedDoctorName);
      setDoctorCrm(detectedDoctorCrm);

      // Default shipping if there are imported products
      const hasImported = converted.some(
        it => (it.origin || '').toLowerCase().includes('importado') || (it.origin || '').toLowerCase().includes('eua')
      );
      setShippingBRL(hasImported ? Number((36 * exchangeRate + 39.90).toFixed(2)) : 0);
      setDiscountBRL(0);

      if (forceReloadFromPrescription) {
        notify(
          converted.length > 0
            ? `✓ ${converted.length} medicamento(s) carregado(s) da receita médica de ${pInfo?.name || 'Paciente'}!`
            : `Nenhum medicamento encontrado na receita automática. Você pode adicionar do catálogo abaixo.`
        );
      }
    } catch (e) {
      console.warn('Error loading patient prescription for order builder:', e);
    } finally {
      setIsLoadingPrescription(false);
    }
  }, [unifiedPatients, pharmacyOrders, localSavedPrescriptions, convertRawPrescribedToOrderItems, exchangeRate, notify]);

  // Auto-select first patient when list loads
  useEffect(() => {
    if (!selectedPatientId && unifiedPatients.length > 0) {
      const firstId = unifiedPatients[0].id;
      setSelectedPatientId(firstId);
      loadPatientPrescribedMedications(firstId, false);
    }
  }, [unifiedPatients, selectedPatientId, loadPatientPrescribedMedications]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    loadPatientPrescribedMedications(patientId, false);
  };

  // Calculations
  const subtotalBRL = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (Number(item.unitPriceBRL) || 0) * (Number(item.unitQuantity) || 1), 0);
  }, [orderItems]);

  const totalBRL = useMemo(() => {
    return Math.max(0, subtotalBRL + (Number(shippingBRL) || 0) - (Number(discountBRL) || 0));
  }, [subtotalBRL, shippingBRL, discountBRL]);

  // Item handlers
  const handleUpdateItemQuantity = (itemId: string, delta: number) => {
    setOrderItems(prev =>
      prev.map(it =>
        it.id === itemId
          ? { ...it, unitQuantity: Math.max(1, (it.unitQuantity || 1) + delta) }
          : it
      )
    );
  };

  const handleUpdateItemField = (itemId: string, field: keyof PharmacyOrderItem, value: any) => {
    setOrderItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, [field]: value } : it))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleAddProductFromCatalog = (prod: CBDProduct) => {
    const enriched = enrichMedicationDetails(
      prod.name,
      prod.manufacturer,
      prod.origin,
      prod.type,
      prod
    );
    const { priceBRL, priceUSD } = resolveProductPrices(
      prod.name,
      prod.origin,
      prod.priceBRL,
      prod.priceUSD
    );

    const newItem: PharmacyOrderItem = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: prod.name,
      brand: prod.manufacturer || enriched.brand || 'GreenBudz',
      origin: prod.origin || enriched.origin || 'Nacional',
      type: prod.type || enriched.type || 'Óleo Medicinal',
      activeIngredients: prod.activeIngredients || enriched.activeIngredients || 'Canabidiol (CBD)',
      concentration: prod.concentration || enriched.concentration || '100 mg/mL',
      pharmaceuticalForm: prod.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
      quantitySpec: prod.quantity || enriched.quantity || '01 Frasco de 30 mL',
      administrationRoute: prod.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral',
      dosage: [prod.posologyDetails || prod.usageInstructions || enriched.usageInstructions || 'Tomar 03 a 05 gotas sublinguais de 12/12 horas.'],
      unitQuantity: 1,
      unitPriceBRL: priceBRL,
      priceUSD,
      image: prod.image,
      prescribedByDoctor: false
    };

    setOrderItems(prev => [...prev, newItem]);
    setShowCatalogModal(false);
    notify(`✓ "${prod.name}" adicionado ao pedido!`);
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      notify('Informe o nome do medicamento para adicionar ao pedido.');
      return;
    }

    const newItem: PharmacyOrderItem = {
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      brand: customItemBrand.trim() || 'GreenBudz',
      origin: customItemOrigin,
      type: 'Medicamento Prescrito',
      activeIngredients: 'Canabidiol (CBD) Full Spectrum',
      concentration: customItemConcentration.trim() || '100 mg/mL',
      pharmaceuticalForm: customItemForm.trim() || 'Solução Oleosa Sublingual (Gotas)',
      quantitySpec: customItemQuantitySpec.trim() || '01 Frasco de 30 mL',
      administrationRoute: customItemRoute.trim() || 'Via Sublingual / Oral',
      dosage: [customItemDosage.trim() || 'Tomar conforme orientação médica.'],
      unitQuantity: 1,
      unitPriceBRL: Number(customItemPriceBRL) || 0,
      prescribedByDoctor: true
    };

    setOrderItems(prev => [...prev, newItem]);
    setCustomItemName('');
    setShowCustomItemForm(false);
    notify(`✓ "${newItem.name}" adicionado ao pedido!`);
  };

  // Approve Order & Push to Patient's Pharmacy
  const handleApproveAndReleaseOrder = async () => {
    if (!selectedPatient) {
      notify('Selecione um paciente antes de aprovar o pedido.');
      return;
    }
    if (orderItems.length === 0) {
      notify('Adicione pelo menos 1 medicamento ao pedido antes de aprovar.');
      return;
    }

    setIsApproving(true);
    try {
      const nowIso = new Date().toISOString();
      const orderId = existingPatientOrder?.id || `order_${selectedPatient.id}`;

      const preparedOrder: PharmacyPreparedOrder = {
        id: orderId,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientEmail: selectedPatient.email,
        patientCpf: selectedPatient.cpf,
        patientPhone: selectedPatient.phone,
        doctorName,
        doctorCrm,
        items: orderItems,
        subtotalBRL,
        shippingBRL: Number(shippingBRL) || 0,
        discountBRL: Number(discountBRL) || 0,
        totalBRL,
        showPricesToPatient,
        notes: orderNotes.trim(),
        whatsappNumber: whatsappNumber.replace(/\D/g, '') || '5566996280883',
        status: 'approved',
        createdAt: existingPatientOrder?.createdAt || nowIso,
        updatedAt: nowIso,
        approvedAt: nowIso,
        deliveryAddress: existingPatientOrder?.deliveryAddress
      };

      await savePharmacyOrder(preparedOrder);

      // Send in-app notification to the patient
      await setDoc(doc(db, 'notifications', selectedPatient.id), {
        text: `🎉 Seu pedido com os medicamentos prescritos já foi montado e aprovado! Acesse a Farmácia no aplicativo para conferir e solicitar seu pedido.`,
        timestamp: nowIso,
        type: 'pharmacy_order_approved'
      }).catch(() => {});

      notify(`✅ Pedido de ${selectedPatient.name} aprovado e liberado na Farmácia do paciente!`);
    } catch (e: any) {
      console.error('Erro ao aprovar pedido:', e);
      notify('Erro ao aprovar pedido: ' + (e?.message || 'Tente novamente'));
    } finally {
      setIsApproving(false);
    }
  };

  // Notify patient on WhatsApp that their order is ready in the app's Pharmacy
  const handleNotifyPatientOnWhatsApp = () => {
    if (!selectedPatient) return;
    const rawPhone = (selectedPatient.phone || '').replace(/\D/g, '');
    const formattedPhone = rawPhone.length === 10 || rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;

    const itemsSummary = orderItems
      .map(it => `• *${it.unitQuantity}x* ${it.name} (${it.brand})`)
      .join('\n');

    const msg = `Olá *${selectedPatient.name.split(' ')[0]}*! 🌿\n\nO seu pedido com os medicamentos prescritos na consulta médica já foi montado e aprovado em nosso sistema:\n\n${itemsSummary}\n\n👉 *Acesse a aba "Farmácia" no aplicativo MeCura* para conferir o seu pedido completo e clicar em *"Solicitar Pedido"* para confirmarmos o envio! ✨`;

    const url = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const filteredCatalogForModal = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return allCatalogProducts.filter(p => {
      if (catalogBrandFilter !== 'all') {
        const bClean = catalogBrandFilter.toLowerCase();
        if (!(p.manufacturer || '').toLowerCase().includes(bClean)) return false;
      }
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q) ||
        (p.concentration || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
    });
  }, [allCatalogProducts, catalogSearch, catalogBrandFilter]);

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161622] border border-[#262636] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              Pacientes c/ Receita ou Pós-Consulta
            </span>
            <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
              {unifiedPatients.filter(p => p.prescribedItemsPreview.length > 0 || p.consultationStatus === 'finished').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#161622] border border-[#262636] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              Pedidos Aprovados na Farmácia
            </span>
            <div className="text-2xl font-black text-mecura-neon font-mono tabular-nums mt-1">
              {pharmacyOrders.filter(o => o.status === 'approved').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#161622] border border-[#262636] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A9E]">
              Solicitados pelo Paciente (WhatsApp)
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1">
              {pharmacyOrders.filter(o => o.status === 'requested' || o.status === 'completed').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient List & Prescription Status (4 cols) */}
        <div className="lg:col-span-4 bg-[#161622] border border-[#262636] rounded-2xl p-4 flex flex-col gap-4 max-h-[820px]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-mecura-neon" />
              1. Selecionar Paciente
            </h3>
            <p className="text-xs text-[#8A8A9E] mt-0.5">
              Clique no paciente que saiu da consulta para carregar a receita automaticamente.
            </p>
          </div>

          {/* Search Input */}
          <div className="bg-[#0A0A0F] border border-[#262636] rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Search className="w-4 h-4 text-mecura-neon shrink-0" />
            <input
              type="text"
              placeholder="Buscar nome, CPF ou telefone..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
            />
            {patientSearch && (
              <button
                type="button"
                onClick={() => setPatientSearch('')}
                className="text-[10px] text-[#8A8A9E] hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#0A0A0F] p-1.5 rounded-xl border border-[#262636]">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'with_prescription', label: 'Pós-Consulta / Receita' },
              { id: 'approved', label: 'Aprovados' },
              { id: 'requested', label: 'Solicitados (Whats)' }
            ].map((tab, tIdx) => (
              <button
                key={`order-filter-tab-${tab.id}-${tIdx}`}
                type="button"
                onClick={() => setPatientFilterTab(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${
                  patientFilterTab === tab.id
                    ? 'bg-mecura-neon text-[#0A0A0F]'
                    : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Patient Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8A8A9E] border border-dashed border-[#262636] rounded-xl">
                Nenhum paciente encontrado neste filtro.
              </div>
            ) : (
              filteredPatients.map((p, pIdx) => {
                const isSelected = p.id === selectedPatientId;
                const pOrder = pharmacyOrders.find(o => o.patientId === p.id);
                const prescCount = p.prescribedItemsPreview.length;

                return (
                  <button
                    key={`order-patient-${p.id || pIdx}-${pIdx}`}
                    type="button"
                    onClick={() => handleSelectPatient(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.12)]'
                        : 'bg-[#0A0A0F] border-[#262636] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-white leading-snug break-words">
                        {p.name}
                      </div>
                      {pOrder?.status === 'requested' ? (
                        <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          📲 Solicitado
                        </span>
                      ) : pOrder?.status === 'approved' ? (
                        <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/40">
                          ✓ Aprovado
                        </span>
                      ) : prescCount > 0 ? (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Montar Pedido
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8A8A9E]">
                      {p.phone && <span>📱 {p.phone}</span>}
                      {p.cpf && <span>• CPF: {p.cpf}</span>}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
                      {prescCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded border border-mecura-neon/25">
                          <Pill className="w-3 h-3" /> {prescCount} {prescCount === 1 ? 'medicamento receitado' : 'medicamentos receitados'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8A8A9E]">
                          Sem receita automática registrada
                        </span>
                      )}

                      {p.consultationStatus === 'finished' && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Consulta Finalizada
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Builder & Approval Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedPatient ? (
            <div className="bg-[#161622] border border-[#262636] rounded-2xl p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-mecura-neon mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-white">Selecione um Paciente ao lado</h3>
              <p className="text-xs text-[#8A8A9E] max-w-md mx-auto">
                Escolha um paciente na coluna à esquerda para visualizar todos os medicamentos prescritos pelo médico, montar o pedido e liberar na Farmácia do paciente.
              </p>
            </div>
          ) : (
            <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6 space-y-6">
              {/* Patient Header & Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#262636]">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-bold text-white">{selectedPatient.name}</h3>
                    {existingPatientOrder?.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Liberado na Farmácia do Paciente
                      </span>
                    )}
                    {existingPatientOrder?.status === 'requested' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <MessageCircle className="w-3.5 h-3.5" /> Pedido Solicitado pelo Paciente no WhatsApp
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8A9E] mt-1.5">
                    <span>📧 {selectedPatient.email || 'Sem e-mail'}</span>
                    {selectedPatient.phone && <span>📱 {selectedPatient.phone}</span>}
                    {selectedPatient.cpf && <span>🪪 CPF: {selectedPatient.cpf}</span>}
                    <span>🩺 Médico: <strong className="text-white">{doctorName}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadPatientPrescribedMedications(selectedPatient.id, true)}
                    disabled={isLoadingPrescription}
                    className="px-3 py-2 rounded-xl bg-[#0A0A0F] hover:bg-white/5 border border-[#262636] text-xs font-bold text-mecura-neon flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Recarregar todos os medicamentos prescritos pelo médico para este paciente"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrescription ? 'animate-spin' : ''}`} />
                    Puxar da Receita Médica
                  </button>

                  {existingPatientOrder && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deletePharmacyOrder(existingPatientOrder.id);
                        notify('Pedido removido da Farmácia do paciente.');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Remover pedido aprovado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revogar Pedido
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Address Alert if Patient Already Requested */}
              {existingPatientOrder?.deliveryAddress && existingPatientOrder.deliveryAddress.street && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> Endereço Informado pelo Paciente na Solicitação:
                    </div>
                    <p className="text-white/90">
                      {existingPatientOrder.deliveryAddress.street}, {existingPatientOrder.deliveryAddress.number || 'S/N'}
                      {existingPatientOrder.deliveryAddress.complement ? ` (${existingPatientOrder.deliveryAddress.complement})` : ''} — Bairro: {existingPatientOrder.deliveryAddress.neighborhood || 'N/A'} — {existingPatientOrder.deliveryAddress.city || ''}/{existingPatientOrder.deliveryAddress.state || ''} — CEP: {existingPatientOrder.deliveryAddress.cep || ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Medications Section Header + Actions */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Pill className="w-4 h-4 text-mecura-neon" />
                      2. Medicamentos Receitados / Itens do Pedido ({orderItems.length})
                    </h4>
                    <p className="text-xs text-[#8A8A9E]">
                      Estes medicamentos aparecerão prontos na Farmácia do paciente assim que você aprovar o pedido.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-mecura-neon text-[#0A0A0F] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#b5ff33] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Adicionar do Catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                      className="px-3.5 py-2 rounded-xl bg-[#0A0A0F] border border-[#262636] hover:border-mecura-neon/40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-mecura-neon" /> Item Manual
                    </button>
                  </div>
                </div>

                {/* Quick Custom Item Form */}
                {showCustomItemForm && (
                  <div className="bg-[#0A0A0F] border border-mecura-neon/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-mecura-neon uppercase tracking-wider">
                        Adicionar Medicamento Manual ao Pedido
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCustomItemForm(false)}
                        className="text-[#8A8A9E] hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Nome do Medicamento</label>
                        <input
                          type="text"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          placeholder="Ex: Óleo CBD Full Spectrum 3000mg"
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white focus:border-mecura-neon outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Marca / Associação</label>
                        <input
                          type="text"
                          value={customItemBrand}
                          onChange={(e) => setCustomItemBrand(e.target.value)}
                          placeholder="Ex: GreenBudz / SouCannabis"
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white focus:border-mecura-neon outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Origem</label>
                        <select
                          value={customItemOrigin}
                          onChange={(e) => setCustomItemOrigin(e.target.value as any)}
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white focus:border-mecura-neon outline-none"
                        >
                          <option value="Importado">Importado (EUA)</option>
                          <option value="Nacional">Nacional (Associação)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Concentração / Apresentação</label>
                        <input
                          type="text"
                          value={customItemConcentration}
                          onChange={(e) => setCustomItemConcentration(e.target.value)}
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white focus:border-mecura-neon outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Valor Unitário (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customItemPriceBRL}
                          onChange={(e) => setCustomItemPriceBRL(e.target.value)}
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-mecura-neon outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Posologia Prescrita</label>
                        <input
                          type="text"
                          value={customItemDosage}
                          onChange={(e) => setCustomItemDosage(e.target.value)}
                          className="w-full bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-xs text-white focus:border-mecura-neon outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomItemForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-[#8A8A9E] hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomItem}
                        className="px-4 py-1.5 rounded-lg bg-mecura-neon text-[#0A0A0F] font-bold text-xs hover:bg-[#b5ff33] cursor-pointer"
                      >
                        Incluir no Pedido
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Items Cards */}
                {isLoadingPrescription ? (
                  <div className="p-8 text-center text-xs text-[#8A8A9E] bg-[#0A0A0F] border border-[#262636] rounded-2xl flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-mecura-neon" />
                    Buscando medicamentos prescritos na consulta médica...
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="p-8 text-center bg-[#0A0A0F] border border-dashed border-[#262636] rounded-2xl space-y-3">
                    <Pill className="w-8 h-8 text-[#8A8A9E] mx-auto opacity-50" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Nenhum medicamento listado neste pedido ainda</p>
                      <p className="text-xs text-[#8A8A9E] max-w-md mx-auto">
                        Clique em <strong>"Adicionar do Catálogo"</strong> para incluir os medicamentos receitados para {selectedPatient.name} ou em <strong>"Puxar da Receita Médica"</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-mecura-neon text-[#0A0A0F] font-extrabold text-xs inline-flex items-center gap-1.5 hover:bg-[#b5ff33] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Escolher Medicamentos do Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, idx) => {
                      const isEditing = editingItemId === item.id;
                      const isImported = (item.origin || '').toLowerCase().includes('importado') || (item.origin || '').toLowerCase().includes('eua');
                      const itemTotal = (Number(item.unitPriceBRL) || 0) * (Number(item.unitQuantity) || 1);

                      return (
                        <div
                          key={item.id || idx}
                          className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30">
                                  {item.prescribedByDoctor ? '🩺 Receitado pelo Médico' : '➕ Adicionado ao Pedido'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                    isImported
                                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  {isImported ? '🇺🇸 Importado' : '🇧🇷 Nacional'}
                                </span>
                                <span className="text-xs font-bold text-white/80">
                                  Marca: <strong className="text-white">{item.brand}</strong>
                                </span>
                              </div>

                              <h5 className="text-base font-bold text-white leading-snug pt-0.5">
                                {item.name}
                              </h5>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8A8A9E]">
                                {item.concentration && <span className="text-mecura-neon font-mono">{item.concentration}</span>}
                                {item.pharmaceuticalForm && <span>• {item.pharmaceuticalForm}</span>}
                                {item.quantitySpec && <span>• {item.quantitySpec}</span>}
                                {item.administrationRoute && <span>• {item.administrationRoute}</span>}
                              </div>

                              {item.dosage && item.dosage.length > 0 && (
                                <div className="text-xs text-white/80 bg-[#161622] border border-white/5 rounded-xl px-3 py-2 mt-2">
                                  <span className="text-[10px] font-bold uppercase text-mecura-neon block mb-0.5">
                                    Posologia Prescrita:
                                  </span>
                                  {item.dosage.join(' ')}
                                </div>
                              )}
                            </div>

                            {/* Quantity, Price & Actions */}
                            <div className="flex sm:flex-col items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#262636]">
                              <div className="flex items-center gap-2">
                                {/* Quantity Stepper */}
                                <div className="flex items-center gap-1 bg-[#161622] border border-[#262636] rounded-xl p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(item.id, -1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-white/5 cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-7 text-center font-mono font-bold text-xs text-white tabular-nums">
                                    {item.unitQuantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(item.id, 1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(isEditing ? null : item.id)}
                                  className="p-2 rounded-xl bg-[#161622] border border-[#262636] text-[#8A8A9E] hover:text-mecura-neon cursor-pointer"
                                  title="Editar detalhes e valor deste item"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-2 rounded-xl bg-[#161622] border border-[#262636] text-[#8A8A9E] hover:text-red-400 cursor-pointer"
                                  title="Remover item do pedido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Price Input & Subtotal */}
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <label className="block text-[10px] text-[#8A8A9E]">Unitário (R$)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.unitPriceBRL}
                                    onChange={(e) => handleUpdateItemField(item.id, 'unitPriceBRL', Number(e.target.value) || 0)}
                                    className="w-24 bg-[#161622] border border-[#262636] rounded-lg px-2 py-1 text-right text-xs font-mono font-bold text-white focus:border-mecura-neon outline-none tabular-nums"
                                  />
                                </div>
                                <div className="text-right min-w-[85px]">
                                  <span className="block text-[10px] text-[#8A8A9E]">Total Item</span>
                                  <span className="text-sm font-mono font-extrabold text-emerald-400 tabular-nums">
                                    R$ {itemTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Item Details Editor */}
                          {isEditing && (
                            <div className="pt-3 border-t border-[#262636] grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Nome do Medicamento</label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateItemField(item.id, 'name', e.target.value)}
                                  className="w-full bg-[#161622] border border-[#262636] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Marca / Associação</label>
                                <input
                                  type="text"
                                  value={item.brand}
                                  onChange={(e) => handleUpdateItemField(item.id, 'brand', e.target.value)}
                                  className="w-full bg-[#161622] border border-[#262636] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Apresentação / Frasco</label>
                                <input
                                  type="text"
                                  value={item.quantitySpec || ''}
                                  onChange={(e) => handleUpdateItemField(item.id, 'quantitySpec', e.target.value)}
                                  className="w-full bg-[#161622] border border-[#262636] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">Posologia / Modo de Uso</label>
                                <input
                                  type="text"
                                  value={(item.dosage || []).join(' ')}
                                  onChange={(e) => handleUpdateItemField(item.id, 'dosage', [e.target.value])}
                                  className="w-full bg-[#161622] border border-[#262636] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Order Financial Summary, Notes & WhatsApp Config */}
              <div className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262636] pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-mecura-neon" />
                    3. Condições do Pedido & Confirmação via WhatsApp
                  </h4>

                  <label className="flex items-center gap-2 text-xs text-white/90 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPricesToPatient}
                      onChange={(e) => setShowPricesToPatient(e.target.checked)}
                      className="rounded border-[#262636] text-mecura-neon focus:ring-mecura-neon"
                    />
                    Exibir valores (R$) na Farmácia do Paciente
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">
                      Subtotal Itens (R$)
                    </label>
                    <div className="bg-[#161622] border border-[#262636] rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white tabular-nums">
                      R$ {subtotalBRL.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">
                      Frete / Taxas (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingBRL}
                      onChange={(e) => setShippingBRL(Number(e.target.value) || 0)}
                      className="w-full bg-[#161622] border border-[#262636] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-mecura-neon outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountBRL}
                      onChange={(e) => setDiscountBRL(Number(e.target.value) || 0)}
                      className="w-full bg-[#161622] border border-[#262636] rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:border-mecura-neon outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-mecura-neon uppercase mb-1">
                      Total Final (R$)
                    </label>
                    <div className="bg-mecura-neon/10 border border-mecura-neon/40 rounded-xl px-3 py-2.5 text-base font-mono font-black text-mecura-neon tabular-nums">
                      R$ {totalBRL.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">
                      WhatsApp Recebedor do Pedido
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="5566996280883"
                      className="w-full bg-[#161622] border border-[#262636] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:border-mecura-neon outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#8A8A9E] uppercase mb-1">
                      Observações para o Paciente na Farmácia
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Ex: Pedido liberado! Confira os itens e clique em Solicitar Pedido para confirmar no WhatsApp."
                      className="w-full bg-[#161622] border border-[#262636] rounded-xl px-3 py-2.5 text-xs text-white focus:border-mecura-neon outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Action Buttons: Approve & Release to Patient's Pharmacy */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleNotifyPatientOnWhatsApp}
                  disabled={orderItems.length === 0}
                  className="px-4 py-3.5 rounded-xl bg-[#0A0A0F] hover:bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <MessageCircle className="w-4 h-4" />
                  Avisar Paciente no WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndReleaseOrder}
                  disabled={isApproving || orderItems.length === 0}
                  className="flex-1 py-4 px-6 rounded-xl bg-mecura-neon hover:bg-[#b5ff33] text-[#0A0A0F] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(166,255,0,0.25)] transition-all cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isApproving
                    ? 'Aprovando e Liberando...'
                    : existingPatientOrder?.status === 'approved'
                    ? 'Atualizar Pedido Aprovado na Farmácia do Paciente'
                    : 'Aprovar Pedido e Liberar na Farmácia do Paciente'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Medication from Catalog */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#262636] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#262636] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-mecura-neon" />
                  Adicionar Medicamento do Catálogo ao Pedido
                </h3>
                <p className="text-xs text-[#8A8A9E]">
                  Selecione qualquer medicamento das marcas cadastradas para incluir no pedido de {selectedPatient?.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="p-2 rounded-lg text-[#8A8A9E] hover:text-white bg-[#0A0A0F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-[#262636] space-y-3 bg-[#0A0A0F]">
              <div className="flex items-center gap-2 bg-[#161622] border border-[#262636] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-mecura-neon" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar por nome do medicamento, marca ou concentração..."
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setCatalogBrandFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                    catalogBrandFilter === 'all'
                      ? 'bg-mecura-neon text-[#0A0A0F]'
                      : 'bg-[#161622] text-[#8A8A9E] hover:text-white'
                  }`}
                >
                  Todas as Marcas
                </button>
                {brandTabs.map((b, bIdx) => (
                  <button
                    key={`cat-brand-tab-${b.categoryId}-${bIdx}`}
                    type="button"
                    onClick={() => setCatalogBrandFilter(b.brandName)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                      catalogBrandFilter === b.brandName
                        ? 'bg-mecura-neon text-[#0A0A0F]'
                        : 'bg-[#161622] text-[#8A8A9E] hover:text-white'
                    }`}
                  >
                    {b.origin === 'Importado' ? '🇺🇸' : '🇧🇷'} {b.brandName}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCatalogForModal.map((prod, idx) => {
                const { priceBRL } = resolveProductPrices(prod.name, prod.origin, prod.priceBRL, prod.priceUSD);
                return (
                  <div
                    key={`${prod.name}-${idx}`}
                    className="bg-[#0A0A0F] border border-[#262636] hover:border-mecura-neon/50 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-mecura-neon uppercase">
                          {prod.manufacturer}
                        </span>
                        <span className="text-[10px] text-[#8A8A9E]">{prod.origin || 'Nacional'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{prod.name}</h4>
                      {prod.concentration && (
                        <div className="text-[11px] text-[#8A8A9E] font-mono mt-1">{prod.concentration}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262636]">
                      <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        R$ {priceBRL.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddProductFromCatalog(prod)}
                        className="px-3 py-1.5 rounded-lg bg-mecura-neon text-[#0A0A0F] font-extrabold text-xs hover:bg-[#b5ff33] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Incluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
