import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  Sparkles, 
  User, 
  Calendar, 
  ShieldCheck,
  Building2,
  Globe,
  BookOpen,
  Search,
  RefreshCw,
  Check,
  Pill,
  AlertTriangle,
  ChevronRight,
  Layers
} from 'lucide-react';
import { PrescriptionItemData, isNationalProduct } from '../utils/pdfGenerator';
import { enrichMedicationDetails, NATIONAL_ASSOCIATION_PRODUCTS, ABECMED_PRODUCTS, ABECMED_COMPANY_INFO, cbdGuideData, CBDProduct, AbecmedProduct } from '../data/cbdGuide';
import { FLOWERMED_PRODUCTS, FlowermedProduct } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS, FlowerExtractionProduct } from '../data/flowerExtractionsCatalog';
import { useAdminStore } from '../store/useAdminStore';

interface PrescriptionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  setPatientName: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  cpf: string;
  setCpf: (val: string) => void;
  emissionDate: string;
  setEmissionDate: (val: string) => void;
  doctorName: string;
  setDoctorName: (val: string) => void;
  doctorCrm: string;
  setDoctorCrm: (val: string) => void;
  doctorSpecialty: string;
  setDoctorSpecialty: (val: string) => void;
  items: PrescriptionItemData[];
  setItems: React.Dispatch<React.SetStateAction<PrescriptionItemData[]>>;
  notes: string;
  setNotes: (val: string) => void;
  onDownloadPDF: () => void;
  onSendToChat?: (includeProductCards?: boolean) => Promise<void>;
  onSendPreviewToChat?: () => Promise<void>;
}

export function PrescriptionEditorModal({
  isOpen,
  onClose,
  patientName,
  setPatientName,
  birthDate,
  setBirthDate,
  cpf,
  setCpf,
  emissionDate,
  setEmissionDate,
  doctorName,
  setDoctorName,
  doctorCrm,
  setDoctorCrm,
  doctorSpecialty,
  setDoctorSpecialty,
  items,
  setItems,
  notes,
  setNotes,
  onDownloadPDF,
  onSendToChat,
  onSendPreviewToChat
}: PrescriptionEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingToChat, setIsSendingToChat] = useState(false);
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [sendProductsToChat, setSendProductsToChat] = useState(false);

  const { productCategories } = useAdminStore();
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [librarySelectedCategory, setLibrarySelectedCategory] = useState<string>('all');
  const [libraryOriginFilter, setLibraryOriginFilter] = useState<'all' | 'Nacional' | 'Importado'>('all');
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  // All catalog products merged from ALL categories of cbdGuideData, useAdminStore, Flowermed, Flores/Extrações e Associações
  const allLibraryProducts = useMemo(() => {
    const list: (CBDProduct & { categoryName?: string; sourceCatalog?: string })[] = [];
    const seenNames = new Set<string>();

    const addProd = (prod: any, catName?: string, source?: string) => {
      if (!prod || !prod.name) return;
      const key = prod.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push({ ...prod, categoryName: catName || 'Outros', sourceCatalog: source || 'Geral' });
      }
    };

    // 1. From all categories in cbdGuideData (all 15 categories)
    if (cbdGuideData && Array.isArray(cbdGuideData)) {
      for (const cat of cbdGuideData) {
        const cTitle = cat.title || cat.description?.split('.')[0] || 'Geral';
        if (cat.products && Array.isArray(cat.products)) {
          for (const p of cat.products) {
            addProd(p, cTitle, 'Biblioteca Mecura');
          }
        }
      }
    }

    // 2. From useAdminStore productCategories (if customized or synced)
    if (productCategories && Array.isArray(productCategories)) {
      for (const cat of productCategories) {
        const cTitle = (cat as any).title || (cat as any).name || 'Painel Clínico';
        if (cat.products && Array.isArray(cat.products)) {
          for (const p of cat.products) {
            addProd(p, cTitle, 'Catálogo Admin');
          }
        }
      }
    }

    // 3. From Flowermed Catalog (EUA)
    for (const p of FLOWERMED_PRODUCTS) {
      addProd(p, 'Linha Flowermed (EUA)', 'Flowermed');
    }

    // 4. From Flower Extractions Catalog (14g)
    for (const p of FLOWER_EXTRACTIONS_PRODUCTS) {
      addProd(p, 'Flores & Extrações (14g)', 'Flores/Extrações');
    }

    // 5. From National Association Catalog (Brasil)
    for (const p of NATIONAL_ASSOCIATION_PRODUCTS) {
      addProd(p, 'Associações Nacionais (Brasil)', 'Associação');
    }

    // 6. From ABECMED Official National Catalog (Brasil)
    for (const p of ABECMED_PRODUCTS) {
      addProd(p, 'ABECMED (Associação Nacional)', 'ABECMED');
    }

    return list;
  }, [productCategories]);

  // Dynamic filter for Library modal
  const filteredLibraryProducts = useMemo(() => {
    let result = allLibraryProducts;

    if (librarySelectedCategory !== 'all') {
      if (librarySelectedCategory === 'abecmed') {
        result = result.filter(p => 
          (p.manufacturer || '').toLowerCase().includes('abec') || 
          (p.sourceCatalog || '').toLowerCase().includes('abec') || 
          (p.name || '').toLowerCase().includes('abec')
        );
      } else if (librarySelectedCategory === 'gomas') {
        result = result.filter(p => /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(p.name || p.type || p.pharmaceuticalForm || ''));
      } else if (librarySelectedCategory === 'nacionais') {
        result = result.filter(p => 
          p.origin === 'Nacional' || 
          (p.manufacturer || '').toLowerCase().includes('associação') ||
          (p.manufacturer || '').toLowerCase().includes('abec')
        );
      } else if (librarySelectedCategory === 'flowermed') {
        result = result.filter(p => (p.manufacturer || '').toLowerCase().includes('flowermed') || p.sourceCatalog === 'Flowermed');
      } else if (librarySelectedCategory === 'flores') {
        result = result.filter(p => /flor|in natura|extraç|budder|syringe/i.test(p.name || p.type || ''));
      } else if (librarySelectedCategory === 'oleos') {
        result = result.filter(p => /óleo|oil|gotas|sublingual/i.test(p.name || p.type || p.pharmaceuticalForm || ''));
      } else if (librarySelectedCategory === 'topicos') {
        result = result.filter(p => /pomada|creme|tópico|pele/i.test(p.name || p.type || p.pharmaceuticalForm || ''));
      } else {
        result = result.filter(p => p.categoryName === librarySelectedCategory);
      }
    }

    if (libraryOriginFilter !== 'all') {
      if (libraryOriginFilter === 'Nacional') {
        result = result.filter(p => 
          p.origin === 'Nacional' || 
          (p.manufacturer || '').toLowerCase().includes('associação') ||
          (p.manufacturer || '').toLowerCase().includes('abec')
        );
      } else {
        result = result.filter(p => 
          p.origin !== 'Nacional' && 
          !(p.manufacturer || '').toLowerCase().includes('associação') &&
          !(p.manufacturer || '').toLowerCase().includes('abec')
        );
      }
    }

    if (librarySearchTerm.trim()) {
      const q = librarySearchTerm.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q)) ||
        (p.activeIngredients && p.activeIngredients.toLowerCase().includes(q)) ||
        (p.concentration && p.concentration.toLowerCase().includes(q)) ||
        (p.pharmaceuticalForm && p.pharmaceuticalForm.toLowerCase().includes(q)) ||
        (p.indications && p.indications.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allLibraryProducts, librarySelectedCategory, libraryOriginFilter, librarySearchTerm]);

  // Auto-correct any Goma that might have been accidentally saved with sublingual or drops
  useEffect(() => {
    if (!isOpen) return;
    setItems(prev => {
      let changed = false;
      const updated = prev.map(item => {
        const isGummy = /goma|gumm|comest[íi]vel/i.test(item.name || item.type || '') ||
                        /goma/i.test(item.pharmaceuticalForm || '');
        if (isGummy) {
          let newRoute = item.administrationRoute;
          let newDosage = item.dosage;
          let newForm = item.pharmaceuticalForm;

          if (!newRoute || /sublingual|inalat[óo]ria/i.test(newRoute)) {
            newRoute = 'Via Oral';
            changed = true;
          }
          if (!newForm || /solução oleosa/i.test(newForm)) {
            newForm = 'Gomas Mastigáveis Veganas';
            changed = true;
          }
          // Sanitize dosage lines
          if (Array.isArray(newDosage)) {
            const sanitizedDosage = newDosage.map(line => {
              if (/sublingual|gota/i.test(line)) {
                changed = true;
                return 'Mastigar 01 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
              }
              return line;
            });
            newDosage = sanitizedDosage;
          }

          if (changed) {
            return {
              ...item,
              administrationRoute: newRoute,
              pharmaceuticalForm: newForm,
              dosage: newDosage
            };
          }
        }
        return item;
      });
      return changed ? updated : prev;
    });
  }, [isOpen, setItems]);

  const handleSelectLibraryProduct = (product: any, replaceIndex?: number | null) => {
    const isGummy = /goma|gumm|comest[íi]vel/i.test(product.name || product.type || '');
    const isFlower = /flor|in natura/i.test(product.name || product.type || '');
    const isTopical = /pomada|t[óo]pico/i.test(product.name || product.type || '');
    const isSyrup = /syrup|xarope/i.test(product.name || product.type || '');

    const isNat = product.origin === 'Nacional' || (product.manufacturer || '').toLowerCase().includes('associação');

    const enriched = enrichMedicationDetails(
      product.name,
      product.manufacturer || (isNat ? 'Associação Brasileira (Nacional)' : 'GreenBudzCBD'),
      product.origin || (isNat ? 'Nacional' : 'Importado'),
      product.type,
      product
    );

    let form = product.pharmaceuticalForm || enriched.pharmaceuticalForm;
    let qty = product.quantity || product.volumeOrQuantity || enriched.quantity;
    let route = product.administrationRoute || enriched.administrationRoute;
    let dosageLines: string[] = [];

    if (isGummy) {
      form = form && !form.toLowerCase().includes('solução') ? form : 'Gomas Mastigáveis Veganas';
      qty = qty && !qty.toLowerCase().includes('frasco de 30') ? qty : (product.details?.find((d: string) => d.includes('gomas')) || '01 Pote com 20 a 30 gomas');
      route = 'Via Oral';
      dosageLines = [
        'Mastigar 01 goma ao final da tarde ou 1 hora antes de dormir (via oral).',
        'Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas).'
      ];
    } else if (isFlower) {
      form = form || 'Flores Secas In Natura (14g)';
      qty = qty || '01 Embalagem Selada (14g)';
      route = 'Via Inalatória (Vaporização Medicinal)';
      dosageLines = [
        'Utilizar em vaporizador térmico medicinal a 170°C a 195°C para resgate agudo. Não fumar.',
        'Inalação sob demanda para alívio imediato sem combustão.'
      ];
    } else if (isTopical) {
      form = form || 'Pomada Canábica Terapêutica (50g)';
      qty = qty || '01 Pote de 50g';
      route = 'Uso Tópico';
      dosageLines = [
        'Aplicar quantidade suficiente sobre a área dolorida/afetada 2 a 3 vezes ao dia.',
        'Massagear suavemente até completa absorção dérmica.'
      ];
    } else if (isSyrup) {
      form = form || 'Xarope Hidrossolúvel Nano-emulsão';
      qty = qty || '01 Frasco de 177 mL';
      route = 'Via Oral';
      dosageLines = [
        'Ingerir 1 a 2 mL diluído em água ou puro sob demanda.'
      ];
    } else {
      form = form || 'Solução Oleosa Sublingual (Gotas)';
      qty = qty || (product.name.includes('15ml') ? '01 Frasco de 15 mL' : '01 Frasco de 30 mL');
      route = route && !route.toLowerCase().includes('inalatória') ? route : 'Via Sublingual / Oral';
      if (product.usageInstructions && !product.usageInstructions.toLowerCase().includes('vaporizador')) {
        dosageLines = product.usageInstructions
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean);
      } else {
        dosageLines = [
          'Tomar 03 a 05 gotas por via sublingual de 12/12 horas.',
          'Reter sob a língua por 60 segundos antes de engolir para rápida absorção.'
        ];
      }
    }

    const newItem: PrescriptionItemData = {
      name: product.name,
      brand: product.manufacturer || (isNat ? 'Associação Brasileira (Nacional)' : 'GreenBudzCBD'),
      origin: isNat ? 'Nacional' : 'Importado',
      type: product.type || enriched.type,
      activeIngredients: product.activeIngredients || enriched.activeIngredients,
      concentration: product.concentration || enriched.concentration,
      pharmaceuticalForm: form,
      quantity: qty,
      administrationRoute: route,
      dosage: dosageLines,
      description: product.description || enriched.description || '',
      priceUSD: product.priceUSD,
      priceBRL: product.priceBRL,
      image: product.image
    };

    if (typeof replaceIndex === 'number' && replaceIndex >= 0) {
      setItems(prev => {
        const copy = [...prev];
        copy[replaceIndex] = newItem;
        return copy;
      });
    } else {
      setItems(prev => [...prev, newItem]);
    }

    setIsLibraryModalOpen(false);
    setReplaceTargetIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clean up legacy confusing dosage phrasing if present
  useEffect(() => {
    if (isOpen && notes && notes.includes('2/3 a noite')) {
      const sanitized = notes.replace(
        /reduzir em 1\/3 a dose da manh[ãa] e 2\/3 a noite/gi,
        'reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição'
      );
      if (sanitized !== notes) {
        setNotes(sanitized);
      }
    }
  }, [isOpen, notes, setNotes]);

  if (!isOpen) return null;

  const handleAddItem = (type: 'cbd' | 'balanced' | 'thc' | 'broad_cbn' | 'pomada' | 'custom' | 'blank') => {
    let newItem: PrescriptionItemData;
    if (type === 'blank') {
      newItem = {
        name: '',
        brand: 'Associação Nacional',
        origin: 'Nacional',
        activeIngredients: '',
        concentration: '',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual / Oral',
        dosage: [
          'Tomar conforme orientação médica.'
        ],
        description: ''
      };
    } else if (type === 'cbd') {
      const enriched = enrichMedicationDetails('ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml (30ml)', 'Associação Brasileira (Nacional)', 'Nacional');
      newItem = {
        name: 'ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        dosage: [
          'Tomar 03 gotas de 12/12 horas (sublingual).',
          'Aumentar 01 gota a cada 05 dias até atingir a dose de controle homeostático.'
        ],
        description: 'Extrato integral rico em CBD com alto rendimento terapêutico.'
      };
    } else if (type === 'broad_cbn') {
      const enriched = enrichMedicationDetails('Broad SPECTRUM CBD, CBN 1065mg —————- 15ml', 'Associação Nacional', 'Nacional');
      newItem = {
        name: 'Broad SPECTRUM CBD, CBN 1065mg —————- 15ml',
        brand: 'Associação Nacional (Brasil)',
        origin: 'Nacional',
        activeIngredients: enriched.activeIngredients || 'Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg',
        concentration: enriched.concentration || 'CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL',
        pharmaceuticalForm: enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
        quantity: enriched.quantity || '01 Frasco de 15 mL',
        administrationRoute: enriched.administrationRoute || 'Via Sublingual / Oral',
        dosage: [
          'Pingar 2 gotas pela manhã e 4 a noite.',
          '- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.',
          '- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.'
        ],
        description: 'Extrato Broad Spectrum rico em CBD e CBN (1065mg em 15ml), 0% THC, para sono e controle de estresse.'
      };
    } else if (type === 'balanced') {
      const enriched = enrichMedicationDetails('ÓLEO INTEGRAL THC/CBD 100mg/ml (30ml)', 'Associação Brasileira (Nacional)', 'Nacional');
      newItem = {
        name: 'ÓLEO INTEGRAL THC/CBD 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        dosage: [
          'Tomar 03 gotas de 12/12 horas (sublingual).',
          'Aumentar gradualmente 01 gota a cada 04 dias conforme intensidade dos sintomas.'
        ],
        description: 'Extrato balanceado 1:1 indicado para analgesia e rigidez.'
      };
    } else if (type === 'thc') {
      const enriched = enrichMedicationDetails('ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml (30ml)', 'Associação Brasileira (Nacional)', 'Nacional');
      newItem = {
        name: 'ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        dosage: [
          'Tomar 04 a 06 gotas sublinguais 1 hora antes de deitar.',
          'Uso noturno preferencial para indução do sono e controle álgico.'
        ],
        description: 'Extrato predominante em THC para insônia e dores noturnas.'
      };
    } else if (type === 'pomada') {
      const enriched = enrichMedicationDetails('Pomada Canábica Terapêutica 500mg (50g)', 'Associação Brasileira (Nacional)', 'Nacional');
      newItem = {
        name: 'Pomada Canábica Terapêutica 500mg (50g)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        dosage: [
          'Aplicar quantidade suficiente na região dolorida/afetada 2 a 3 vezes ao dia, massageando suavemente até completa absorção.'
        ],
        description: 'Uso tópico para alívio localizado de dores musculares e articulares.'
      };
    } else {
      const enriched = enrichMedicationDetails('GreenBudzCBD CalmVibe CBD 6000mg + Mint', 'GreenBudzCBD', 'Importado');
      newItem = {
        name: 'GreenBudzCBD CalmVibe CBD 6000mg + Mint',
        brand: 'GreenBudzCBD',
        origin: 'Importado',
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        dosage: [
          'Tomar 08 a 10 gotas sublinguais de 12/12 horas. Reter sob a língua por 60 segundos antes de deglutir.'
        ],
        description: 'Canabidiol Full Spectrum importado de alta pureza.'
      };
    }
    setItems(prev => [...prev, newItem]);
  };

  const handleAddFlowermedItem = (productName: string) => {
    const prod = FLOWERMED_PRODUCTS.find(p => p.name === productName);
    if (!prod) return;
    const enriched = enrichMedicationDetails(prod.name, 'Flowermed', 'Importado (EUA)', prod.type, prod);
    const newItem: PrescriptionItemData = {
      name: prod.name,
      brand: 'Flowermed (EUA)',
      origin: 'Importado (EUA)',
      activeIngredients: enriched.activeIngredients,
      concentration: enriched.concentration,
      pharmaceuticalForm: enriched.pharmaceuticalForm,
      quantity: enriched.quantity,
      administrationRoute: enriched.administrationRoute,
      dosage: [
        prod.usageInstructions || 'Tomar 03 gotas por via sublingual de 12/12 horas. Reter por 60s antes de engolir.',
        'Aumentar 01 gota a cada 04 a 05 dias conforme resposta terapêutica individual.'
      ],
      description: prod.description || 'Medicamento fabricado sob normas FDA nos EUA, importação ANVISA RDC 660. COA lote a lote.'
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddFlowerExtItem = (productName: string) => {
    const prod = FLOWER_EXTRACTIONS_PRODUCTS.find(p => p.name === productName);
    if (!prod) return;
    const enriched = enrichMedicationDetails(prod.name, 'Importado (Folheto Especial)', 'Importado', prod.type, prod);
    const newItem: PrescriptionItemData = {
      name: prod.name,
      brand: 'Importado (Folheto Especial)',
      origin: 'Importado',
      activeIngredients: enriched.activeIngredients,
      concentration: enriched.concentration,
      pharmaceuticalForm: enriched.pharmaceuticalForm,
      quantity: enriched.quantity,
      administrationRoute: enriched.administrationRoute,
      dosage: [
        prod.usageInstructions || 'Utilizar vaporizador medicinal calibrado para controle térmico sem combustão.',
        `Perfil: ${prod.strainProfile} • Momento: ${prod.usageMoment}. Microdosagem com avaliação de resposta a cada 15-30 minutos.`
      ],
      description: prod.description || 'Produto vegetal importado em embalagem selada de 14g ou extração concentrada com laudo sob demanda.'
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddNationalItem = (productName: string) => {
    const prod = NATIONAL_ASSOCIATION_PRODUCTS.find(p => p.name === productName || productName.includes(p.name));
    const enriched = enrichMedicationDetails(productName, 'Associação Nacional', 'Nacional', prod?.type, prod);
    
    let dosageLines: string[];
    if (prod?.usageInstructions) {
      dosageLines = prod.usageInstructions
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    } else {
      dosageLines = [
        'Tomar 03 gotas de 12/12 horas por via sublingual.',
        'Aumentar 01 gota a cada 05 dias até atingir a dose terapêutica de controle.'
      ];
    }

    const newItem: PrescriptionItemData = {
      name: prod?.name || productName,
      brand: 'Associação Nacional (Brasil)',
      origin: 'Nacional',
      activeIngredients: enriched.activeIngredients,
      concentration: enriched.concentration,
      pharmaceuticalForm: enriched.pharmaceuticalForm,
      quantity: enriched.quantity,
      administrationRoute: enriched.administrationRoute,
      dosage: dosageLines,
      description: prod?.description || enriched.description || 'Medicamento nacional autorizado de associação brasileira.'
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddAbecmedItem = (productName: string) => {
    const prod = ABECMED_PRODUCTS.find(p => p.name === productName || productName.includes(p.name));
    if (!prod) return;
    const enriched = enrichMedicationDetails(prod.name, 'ABECMED', 'Nacional', prod.type, prod);

    let dosageLines: string[];
    if (prod.usageInstructions) {
      dosageLines = prod.usageInstructions
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    } else {
      dosageLines = [
        'Conforme determinação individual do prescritor habilitado.',
        'Administrar por via sublingual/oral conforme orientação médica.'
      ];
    }

    const newItem: PrescriptionItemData = {
      name: prod.name,
      brand: 'ABECMED (Associação Nacional)',
      origin: 'Nacional',
      type: prod.type || enriched.type,
      activeIngredients: prod.activeIngredients || enriched.activeIngredients,
      concentration: prod.concentration || enriched.concentration,
      pharmaceuticalForm: prod.pharmaceuticalForm || enriched.pharmaceuticalForm,
      quantity: prod.quantity || enriched.quantity,
      administrationRoute: prod.administrationRoute || enriched.administrationRoute,
      dosage: dosageLines,
      description: prod.description || enriched.description || 'Produto oficial da Associação Brasileira de Cannabis Medicinal (ABECMED).',
      priceBRL: prod.priceBRL
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PrescriptionItemData, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      
      // If name is edited and no custom active ingredients, auto infer
      if (field === 'name' && (!current.activeIngredients || current.activeIngredients.length < 5)) {
        const enriched = enrichMedicationDetails(value, current.brand, current.origin, current.type);
        current.activeIngredients = enriched.activeIngredients;
        current.pharmaceuticalForm = enriched.pharmaceuticalForm;
        current.quantity = enriched.quantity;
        current.administrationRoute = enriched.administrationRoute;
      }
      
      updated[index] = current;
      return updated;
    });
  };

  const handleUpdateDosageLine = (itemIdx: number, lineIdx: number, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      const newDosage = [...updated[itemIdx].dosage];
      newDosage[lineIdx] = value;
      updated[itemIdx] = { ...updated[itemIdx], dosage: newDosage };
      return updated;
    });
  };

  const handleAddDosageLine = (itemIdx: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[itemIdx] = { ...updated[itemIdx], dosage: [...updated[itemIdx].dosage, ''] };
      return updated;
    });
  };

  const handleRemoveDosageLine = (itemIdx: number, lineIdx: number) => {
    setItems(prev => {
      const updated = [...prev];
      const newDosage = updated[itemIdx].dosage.filter((_, i) => i !== lineIdx);
      updated[itemIdx] = { ...updated[itemIdx], dosage: newDosage.length > 0 ? newDosage : [''] };
      return updated;
    });
  };

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      onDownloadPDF();
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handleSendToChatClick = async () => {
    if (!onSendToChat) return;
    setIsSendingToChat(true);
    try {
      await onSendToChat(sendProductsToChat);
    } finally {
      setIsSendingToChat(false);
    }
  };

  const handleSendPreviewClick = async () => {
    if (!onSendPreviewToChat) return;
    setIsSendingPreview(true);
    try {
      await onSendPreviewToChat();
    } finally {
      setIsSendingPreview(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0D0D12] border border-mecura-elevated rounded-2xl md:rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-mecura-elevated bg-[#0A0A0F]/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">Receita Médica Oficial</h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/30">
                    Editor & Validador de Prescrição
                  </span>
                </div>
                <p className="text-xs text-mecura-silver">
                  Verifique e edite os princípios ativos, apresentações e posologias antes de gerar o PDF
                </p>
              </div>
            </div>

            {/* Actions & Tab Switch */}
            <div className="flex items-center gap-2">
              <div className="bg-[#12121A] p-1 rounded-xl border border-mecura-elevated flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'edit'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizar A4</span>
                </button>
              </div>

              {onSendPreviewToChat && (
                <button
                  type="button"
                  onClick={handleSendPreviewClick}
                  disabled={isGenerating || isSendingPreview || items.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-mecura-neon hover:bg-[#b5ff33] text-black rounded-xl text-xs font-bold shadow-lg shadow-mecura-neon/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Enviar receita prévia para conferência e confirmação do paciente"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isSendingPreview ? 'Enviando...' : 'Enviar Receita Prévia'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Gerando...' : 'Baixar PDF'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all shadow-sm group"
                title="Fechar receita"
                aria-label="Fechar receita"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Fechar</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0D0D12]">
            {activeTab === 'edit' ? (
              <div className="space-y-6">
                {/* Section 1: Patient & Doctor Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Patient Box */}
                  <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      <span>Identificação do Paciente</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-mecura-silver font-medium block mb-1">Nome Completo</label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CPF</label>
                          <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data Nasc.</label>
                          <input
                            type="text"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Box */}
                  <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Dados do Médico Prescritor</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-mecura-silver font-medium block mb-1">Médico Responsável</label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CRM / UF</label>
                          <input
                            type="text"
                            value={doctorCrm}
                            onChange={(e) => setDoctorCrm(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data de Emissão</label>
                          <input
                            type="text"
                            value={emissionDate}
                            onChange={(e) => setEmissionDate(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Prescribed Medications */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Medicamentos Prescritos & Princípios Ativos</span>
                        <span className="text-xs font-normal text-mecura-silver">({items.length} item(ns))</span>
                      </h4>
                      <p className="text-[11px] text-mecura-silver">
                        Detalhamento completo de cada fármaco: princípio ativo, forma farmacêutica, concentração e via
                      </p>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceTargetIndex(null);
                          setIsLibraryModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-mecura-neon via-[#c7ff42] to-mecura-neon text-black rounded-lg text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_18px_rgba(166,255,0,0.35)] ring-1 ring-mecura-neon/50 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" /> 📚 Biblioteca Completa ({allLibraryProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('blank')}
                        className="px-3 py-1.5 bg-mecura-surface border border-mecura-elevated text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> + Preenchimento Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('broad_cbn')}
                        className="px-2.5 py-1.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Broad SPECTRUM CBD/CBN (15ml)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('cbd')}
                        className="px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + CBD Nacional
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('balanced')}
                        className="px-2.5 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 rounded-lg text-xs font-semibold hover:bg-teal-500/25 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + 1:1 Balanceado
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('thc')}
                        className="px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/25 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + THC Noturno
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('pomada')}
                        className="px-2.5 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-500/25 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Pomada Tópica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('custom')}
                        className="px-2.5 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold hover:bg-purple-500/25 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Importado
                      </button>

                      {/* Associação Nacional Quick Prescribe Dropdown */}
                      <div className="relative inline-block">
                        <select
                          id="select-add-nacional"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddNationalItem(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        >
                          <option value="" disabled className="bg-[#0A0A0F] text-amber-300 font-bold">
                            + Prescrever Associação Nacional...
                          </option>
                          <optgroup label="Linha Broad Spectrum & CBN (Sono & Estresse)" className="bg-[#0A0A0F] text-white">
                            <option value="Broad SPECTRUM CBD, CBN 1065mg —————- 15ml">Broad SPECTRUM CBD, CBN 1065mg (15ml) - R$ 210</option>
                          </optgroup>
                          <optgroup label="Óleos CBD Isolado (0% THC)" className="bg-[#0A0A0F] text-white">
                            <option value="Óleo Rico em CBD ISOLADO 100mg/ml - Associação Nacional">CBD Isolado 100mg/ml (30ml) - R$ 180</option>
                            <option value="Óleo Rico em CBD ISOLADO 200mg/ml - Associação Nacional">CBD Isolado 200mg/ml (30ml) - R$ 280</option>
                          </optgroup>
                          <optgroup label="Óleos Balanceados CBD / THC" className="bg-[#0A0A0F] text-white">
                            <option value="Óleo Balanceado CBD/THC 1:1 (CBD 25mg/ml + THC 25mg/ml)">Balanceado 1:1 (CBD 25mg + THC 25mg) - R$ 210</option>
                            <option value="Óleo Balanceado CBD/THC 2:1 (CBD 50mg/ml + THC 25mg/ml)">Balanceado 2:1 (CBD 50mg + THC 25mg) - R$ 230</option>
                            <option value="Óleo Balanceado CBD/THC 3:1 (CBD 30mg/ml + THC 10mg/ml)">Balanceado 3:1 (CBD 30mg + THC 10mg) - R$ 190</option>
                            <option value="Óleo Balanceado CBD/THC 5:1 (CBD 50mg/ml + THC 10mg/ml)">Balanceado 5:1 (CBD 50mg + THC 10mg) - R$ 220</option>
                          </optgroup>
                          <optgroup label="Extratos Integrais e Outros" className="bg-[#0A0A0F] text-white">
                            <option value="Óleo Integral THC/CBD 100mg/ml - Associação Nacional">Óleo Integral THC/CBD 100mg/ml - R$ 210</option>
                            <option value="Óleo Integral PREDOMINANTE THC 100mg/ml - Associação Nacional">Óleo Integral THC 100mg/ml (Noturno) - R$ 240</option>
                            <option value="Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional">Pomada Canábica 500mg (50g) - R$ 140</option>
                            <option value="Flor in natura PREDOMINANTE THC (Para Vaporização) 15g - Associação Nacional">Flor in natura THC 15g (Vaporização) - R$ 450</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* ABECMED Quick Prescribe Dropdown */}
                      <div className="relative inline-block">
                        <select
                          id="select-add-abecmed"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddAbecmedItem(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        >
                          <option value="" disabled className="bg-[#0A0A0F] text-amber-300 font-bold">
                            🟠 + Linha ABECMED Nacional...
                          </option>
                          <optgroup label="🟠 Óleo Rico em CBD (Laranja)" className="bg-[#0A0A0F] text-orange-400 font-bold">
                            <option value="Óleo ABEC CBD Full Spectrum 2% (20 mg/mL — 600 mg)">Laranja 2% (20 mg/mL — 600 mg / 30 mL)</option>
                            <option value="Óleo ABEC CBD Full Spectrum 5% (50 mg/mL — 1.500 mg)">Laranja 5% (50 mg/mL — 1.500 mg / 30 mL)</option>
                            <option value="Óleo ABEC CBD Full Spectrum 10% (100 mg/mL — 3.000 mg)">Laranja 10% (100 mg/mL — 3.000 mg / 30 mL)</option>
                          </optgroup>
                          <optgroup label="🔵 Óleo Rico em CBD + THC (Azul)" className="bg-[#0A0A0F] text-sky-400 font-bold">
                            <option value="Óleo ABEC CBD + THC Full Spectrum 2% (20 mg/mL — 600 mg)">Azul 2% (20 mg/mL — 600 mg / 30 mL)</option>
                            <option value="Óleo ABEC CBD + THC Full Spectrum 5% (50 mg/mL — 1.500 mg)">Azul 5% (50 mg/mL — 1.500 mg / 30 mL)</option>
                            <option value="Óleo ABEC CBD + THC Full Spectrum 10% (100 mg/mL — 3.000 mg)">Azul 10% (100 mg/mL — 3.000 mg / 30 mL)</option>
                          </optgroup>
                          <optgroup label="🟢 Óleo Rico em THC (Verde)" className="bg-[#0A0A0F] text-emerald-400 font-bold">
                            <option value="Óleo ABEC Rico em THC Verde 2% (20 mg/mL — 600 mg)">Verde 2% (20 mg/mL — 600 mg / 30 mL)</option>
                            <option value="Óleo ABEC Rico em THC Verde 5% (50 mg/mL — 1.500 mg)">Verde 5% (50 mg/mL — 1.500 mg / 30 mL)</option>
                            <option value="Óleo ABEC Rico em THC Verde 10% (100 mg/mL — 3.000 mg)">Verde 10% (100 mg/mL — 3.000 mg / 30 mL)</option>
                          </optgroup>
                          <optgroup label="🔴 Óleo Rico em CBG (Vermelho)" className="bg-[#0A0A0F] text-rose-400 font-bold">
                            <option value="Óleo ABEC Rico em CBG Vermelho 5% (50 mg/mL — 1.500 mg)">Vermelho 5% (50 mg/mL — 1.500 mg / 30 mL)</option>
                            <option value="Óleo ABEC Rico em CBG Vermelho 10% (100 mg/mL — 3.000 mg)">Vermelho 10% (100 mg/mL — 3.000 mg / 30 mL)</option>
                          </optgroup>
                          <optgroup label="🟡 Óleo CBD + CBN (Limão)" className="bg-[#0A0A0F] text-yellow-400 font-bold">
                            <option value="Óleo ABEC CBD + CBN Limão 5% (50 mg/mL — 1.500 mg)">Limão 5% (50 mg/mL — 1.500 mg / 30 mL - Sono)</option>
                          </optgroup>
                          <optgroup label="🟣 Óleo CBD + CBG (Lilás)" className="bg-[#0A0A0F] text-purple-400 font-bold">
                            <option value="Óleo ABEC CBD + CBG Lilás 5% (50 mg/mL — 1.500 mg)">Lilás 5% (50 mg/mL — 1.500 mg / 30 mL - Foco)</option>
                          </optgroup>
                          <optgroup label="🌿 Inflorescências In Natura ABECMED" className="bg-[#0A0A0F] text-green-400 font-bold">
                            <option value="Inflorescências ABEC ricas em THC (15% a 30% THC)">Flores ABEC ricas em THC (~15-30% THC - 5g a 25g)</option>
                            <option value="Inflorescências ABEC ricas em CBD (8% a 18% CBD)">Flores ABEC ricas em CBD (~8-18% CBD - 5g a 25g)</option>
                          </optgroup>
                          <optgroup label="⚗️ Extrações Sem Solvente ABECMED" className="bg-[#0A0A0F] text-violet-400 font-bold">
                            <option value="Extração Sem Solvente ABEC rica em THC (30% a 50% THC)">Extração Sem Solvente THC (30-50% - 2g/5g)</option>
                            <option value="Extrato Peneirado Full Spectrum ABEC">Extrato Peneirado Dry Sift Full Spectrum (2g/5g)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Flowermed Quick Prescribe Dropdown */}
                      <div className="relative inline-block">
                        <select
                          id="select-add-flowermed"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddFlowermedItem(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-sky-500/20 border border-sky-400/40 text-sky-200 rounded-lg text-xs font-bold hover:bg-sky-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                        >
                          <option value="" disabled className="bg-[#0A0A0F] text-sky-300 font-bold">
                            + Prescrever Linha Flowermed (EUA)...
                          </option>
                          <optgroup label="Linha Hemp Oil (Óleos 30mL)" className="bg-[#0A0A0F] text-white">
                            <option value="Full Spectrum Hemp Oil 3.000 mg">Flowermed Full Spectrum 3.000 mg (R$ 440)</option>
                            <option value="Full Spectrum Hemp Oil 6.000 mg">Flowermed Full Spectrum 6.000 mg (R$ 650)</option>
                          </optgroup>
                          <optgroup label="Canabinoides Direcionados (30mL)" className="bg-[#0A0A0F] text-white">
                            <option value="CBG Isolado 3.000 mg">Flowermed CBG Isolado 3.000 mg (R$ 510)</option>
                            <option value="THCV 300 mg + CBD 900 mg">Flowermed THCV 300 mg + CBD 900 mg (R$ 490)</option>
                            <option value="Full Spectrum 1:1 THC + CBD">Flowermed Full Spectrum 1:1 THC:CBD (R$ 490)</option>
                            <option value="CBN 300 mg + CBD 900 mg">Flowermed CBN 300 mg + CBD 900 mg (R$ 490)</option>
                          </optgroup>
                          <optgroup label="Linha Sphera Premium" className="bg-[#0A0A0F] text-white">
                            <option value="Sphera 10% CBD Broad Spectrum 3.000 mg">Sphera 10% CBD Broad Spectrum (R$ 290)</option>
                            <option value="Sphera 20% CBD Broad Spectrum 6.000 mg">Sphera 20% CBD Broad Spectrum (R$ 480)</option>
                            <option value="Sphera ISO CBD + Terpenos 1.000 mg">Sphera ISO CBD + Terpenos 1.000 mg (R$ 260)</option>
                            <option value="Sphera Delta-8 THC 800 mg">Sphera Delta-8 THC 800 mg (R$ 380)</option>
                            <option value="Sphera Full Spectrum 1.000 mg">Sphera Full Spectrum 1.000 mg (R$ 260)</option>
                          </optgroup>
                          <optgroup label="Linha Syrup Nano-emulsão" className="bg-[#0A0A0F] text-white">
                            <option value="D9 Nano Syrup 500 mg Sem Sabor 177 mL">D9 Nano Syrup 500 mg 177mL (R$ 450)</option>
                          </optgroup>
                          <optgroup label="Linha Gummies (30 unidades)" className="bg-[#0A0A0F] text-white">
                            <option value="CBN Sleep Gummies 30 un">CBN Sleep Gummies (R$ 310)</option>
                            <option value="Gummies D9 10 mg 30 un">Gummies D9 10 mg (R$ 340)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Flores & Extrações Quick Prescribe Dropdown */}
                      <div className="relative inline-block">
                        <select
                          id="select-add-flower-ext"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddFlowerExtItem(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        >
                          <option value="" disabled className="bg-[#0A0A0F] text-emerald-300 font-bold">
                            + Prescrever Flores & Extrações (14g)...
                          </option>
                          <optgroup label="Flores In Natura CBD (14g • R$ 50/g)" className="bg-[#0A0A0F] text-white">
                            <option value="Flor In Natura Sour Lifter (CBD) 14g">Sour Lifter (CBD) 14g - Diurno (R$ 700)</option>
                            <option value="Flor In Natura Lemon Octane (CBD) 14g">Lemon Octane (CBD) 14g - Noturno (R$ 700)</option>
                          </optgroup>
                          <optgroup label="Flores In Natura Delta-8 THC (14g • R$ 60/g)" className="bg-[#0A0A0F] text-white">
                            <option value="Flor In Natura Forbidden Fruit (D8 THC) 14g">Forbidden Fruit (D8 THC) 14g - Noturno (R$ 840)</option>
                            <option value="Flor In Natura Gellato (D8 THC) 14g">Gellato (D8 THC) 14g - Flexível (R$ 840)</option>
                          </optgroup>
                          <optgroup label="Flores In Natura THCA (14g • R$ 85,70/g)" className="bg-[#0A0A0F] text-white">
                            <option value="Flor In Natura Glitter Bomb (THCA) 14g">Glitter Bomb (THCA) 14g - Noturno (R$ 1.200)</option>
                            <option value="Flor In Natura Astro Candy (THCA) 14g">Astro Candy (THCA) 14g - Diurno (R$ 1.200)</option>
                            <option value="Flor In Natura Strawpicana (THCA) 14g">Strawpicana (THCA) 14g - Energizante (R$ 1.200)</option>
                            <option value="Flor In Natura Superglue (THCA) 14g">Superglue (THCA) 14g - Relaxante (R$ 1.200)</option>
                            <option value="Flor In Natura Zoap (THCA) 14g">Zoap (THCA) 14g - Híbrido (R$ 1.200)</option>
                            <option value="Flor In Natura Trop Banana (THCA) 14g">Trop Banana (THCA) 14g - Produtividade (R$ 1.200)</option>
                            <option value="Flor In Natura Girl Cookies (THCA) 14g">Girl Cookies (THCA) 14g - Noturno (R$ 1.200)</option>
                          </optgroup>
                          <optgroup label="Extrações: Seringas & Gold Budder" className="bg-[#0A0A0F] text-white">
                            <option value="Hemp Oil Syringe Gelato 2ml (71,6% THCA)">Syringe Gelato 2ml (71,6% THCA) - R$ 600</option>
                            <option value="Hemp Oil Syringe CBD 1ml (OG Kush)">Syringe CBD 1ml (OG Kush) - R$ 320</option>
                            <option value="Hemp Oil Gold Budder 5g (Versão CBD)">Gold Budder OG Kush 5g (CBD) - R$ 680</option>
                            <option value="Hemp Oil Gold Budder 5g (Versão THCA)">Gold Budder OG Kush 5g (THCA) - R$ 880</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Toda a Biblioteca Quick Prescribe Dropdown */}
                      <div className="relative inline-block">
                        <select
                          id="select-add-all-library"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const prod = allLibraryProducts.find(p => p.name === e.target.value);
                              if (prod) {
                                handleSelectLibraryProduct(prod, null);
                              }
                              e.target.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-purple-500/20 border border-purple-400/40 text-purple-200 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                        >
                          <option value="" disabled className="bg-[#0A0A0F] text-purple-300 font-bold">
                            + 📚 Toda a Biblioteca ({allLibraryProducts.length} produtos)...
                          </option>
                          {allLibraryProducts.map((p, pIdx) => (
                            <option key={`lib-opt-${p.name}-${pIdx}`} value={p.name} className="bg-[#0A0A0F] text-white">
                              {p.name} {p.origin ? `[${p.origin}]` : ''} {p.priceBRL ? `- R$ ${p.priceBRL}` : p.priceUSD ? `- US$ ${p.priceUSD}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 border border-dashed border-mecura-elevated rounded-2xl text-center">
                      <p className="text-mecura-silver text-sm mb-3">Nenhum medicamento adicionado à receita.</p>
                      <button
                        type="button"
                        onClick={() => handleAddItem('cbd')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors"
                      >
                        Adicionar Medicamento Inicial
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, itemIdx) => {
                        const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                        const activeIng = item.activeIngredients !== undefined ? item.activeIngredients : enriched.activeIngredients;
                        const concentration = item.concentration !== undefined ? item.concentration : enriched.concentration;
                        const pharmForm = item.pharmaceuticalForm !== undefined ? item.pharmaceuticalForm : enriched.pharmaceuticalForm;
                        const quantity = item.quantity !== undefined ? item.quantity : enriched.quantity;
                        const admRoute = item.administrationRoute !== undefined ? item.administrationRoute : enriched.administrationRoute;

                        const isGummy = /goma|gumm|comest[íi]vel/i.test(item.name || item.type || '') || /goma/i.test(pharmForm || '');
                        const isFlower = /flor|in natura/i.test(item.name || item.type || '');
                        const isTopical = /pomada|t[óo]pico/i.test(item.name || item.type || '');
                        const hasWrongGummyDosage = isGummy && Array.isArray(item.dosage) && item.dosage.some(d => /sublingual|gota/i.test(d));

                        return (
                          <div
                            key={`presc-item-${itemIdx}-${item.name}`}
                            className="p-4 bg-mecura-surface/30 border border-mecura-elevated rounded-2xl space-y-3.5 relative group"
                          >
                            {/* Top Card Bar: Number, Type Badge & Actions */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center justify-center font-mono">
                                  {itemIdx + 1}
                                </span>
                                {isGummy ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    🍬 GOMA COMESTÍVEL (VIA ORAL)
                                  </span>
                                ) : isFlower ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                    🌿 FLOR IN NATURA (VAPORIZAÇÃO)
                                  </span>
                                ) : isTopical ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                                    🧴 USO TÓPICO (POMADA)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30 flex items-center gap-1">
                                    💧 ÓLEO SUBLINGUAL (GOTAS)
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Quick Format Switch Chips */}
                                <div className="hidden sm:flex items-center gap-1 bg-[#050508]/80 p-0.5 rounded-lg border border-mecura-elevated/40">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateItem(itemIdx, 'pharmaceuticalForm', 'Gomas Mastigáveis Veganas');
                                      handleUpdateItem(itemIdx, 'administrationRoute', 'Via Oral');
                                      handleUpdateItem(itemIdx, 'quantity', '01 Pote com 20 a 30 gomas');
                                      setItems(prev => {
                                        const c = [...prev];
                                        c[itemIdx] = {
                                          ...c[itemIdx],
                                          pharmaceuticalForm: 'Gomas Mastigáveis Veganas',
                                          administrationRoute: 'Via Oral',
                                          quantity: '01 Pote com 20 a 30 gomas',
                                          dosage: [
                                            'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral).',
                                            'Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas). Não engolir inteira.'
                                          ]
                                        };
                                        return c;
                                      });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      isGummy 
                                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50' 
                                        : 'text-mecura-silver hover:text-amber-300 hover:bg-white/5'
                                    }`}
                                    title="Converter este item para formato Goma Mastigável (Via Oral)"
                                  >
                                    🍬 Goma
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateItem(itemIdx, 'pharmaceuticalForm', 'Solução Oleosa Sublingual (Gotas)');
                                      handleUpdateItem(itemIdx, 'administrationRoute', 'Via Sublingual / Oral');
                                      handleUpdateItem(itemIdx, 'quantity', '01 Frasco de 30 mL');
                                      setItems(prev => {
                                        const c = [...prev];
                                        c[itemIdx] = {
                                          ...c[itemIdx],
                                          pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
                                          administrationRoute: 'Via Sublingual / Oral',
                                          quantity: '01 Frasco de 30 mL',
                                          dosage: [
                                            'Tomar 03 a 05 gotas por via sublingual de 12/12 horas.',
                                            'Reter sob a língua por 60 segundos antes de engolir para rápida absorção.'
                                          ]
                                        };
                                        return c;
                                      });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      !isGummy && !isFlower && !isTopical
                                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50' 
                                        : 'text-mecura-silver hover:text-blue-300 hover:bg-white/5'
                                    }`}
                                    title="Converter este item para formato Óleo Sublingual (Gotas)"
                                  >
                                    💧 Gotas
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateItem(itemIdx, 'pharmaceuticalForm', 'Flores Secas In Natura (14g)');
                                      handleUpdateItem(itemIdx, 'administrationRoute', 'Via Inalatória (Vaporização Medicinal)');
                                      handleUpdateItem(itemIdx, 'quantity', '01 Embalagem Selada de 14g');
                                      setItems(prev => {
                                        const c = [...prev];
                                        c[itemIdx] = {
                                          ...c[itemIdx],
                                          pharmaceuticalForm: 'Flores Secas In Natura (14g)',
                                          administrationRoute: 'Via Inalatória (Vaporização Medicinal)',
                                          quantity: '01 Embalagem Selada de 14g',
                                          dosage: [
                                            'Utilizar em vaporizador térmico medicinal a 170°C a 195°C para resgate agudo. Não fumar.',
                                            'Inalação sob demanda para alívio imediato sem combustão.'
                                          ]
                                        };
                                        return c;
                                      });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      isFlower
                                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50' 
                                        : 'text-mecura-silver hover:text-emerald-300 hover:bg-white/5'
                                    }`}
                                    title="Converter este item para formato Flor Seca In Natura (Vaporização)"
                                  >
                                    🌿 Flor
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateItem(itemIdx, 'pharmaceuticalForm', 'Pomada Canábica Terapêutica (50g)');
                                      handleUpdateItem(itemIdx, 'administrationRoute', 'Uso Tópico');
                                      handleUpdateItem(itemIdx, 'quantity', '01 Pote de 50g');
                                      setItems(prev => {
                                        const c = [...prev];
                                        c[itemIdx] = {
                                          ...c[itemIdx],
                                          pharmaceuticalForm: 'Pomada Canábica Terapêutica (50g)',
                                          administrationRoute: 'Uso Tópico',
                                          quantity: '01 Pote de 50g',
                                          dosage: [
                                            'Aplicar quantidade suficiente sobre a área dolorida/afetada 2 a 3 vezes ao dia.',
                                            'Massagear suavemente até completa absorção dérmica.'
                                          ]
                                        };
                                        return c;
                                      });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      isTopical
                                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50' 
                                        : 'text-mecura-silver hover:text-cyan-300 hover:bg-white/5'
                                    }`}
                                    title="Converter este item para formato Pomada Tópica"
                                  >
                                    🧴 Pomada
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplaceTargetIndex(itemIdx);
                                    setIsLibraryModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-mecura-neon bg-mecura-neon/10 hover:bg-mecura-neon/20 border border-mecura-neon/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Substituir este medicamento por outro da Biblioteca"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Trocar da Biblioteca</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(itemIdx)}
                                  className="p-1.5 text-mecura-silver hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Remover Medicamento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Row 1: Name, Brand, Origin */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                              {/* Product Name */}
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Nome Comercial / Formulação
                                </label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'name', e.target.value)}
                                  placeholder="Nome do produto ou formulação"
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 font-bold"
                                />
                              </div>

                              {/* Brand / Association - Circle from Image 2 */}
                              <div className="sm:col-span-3">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Fabricante / Associação
                                </label>
                                <input
                                  type="text"
                                  list={`brand-suggestions-${itemIdx}`}
                                  value={item.brand !== undefined ? item.brand : (enriched.brand || '')}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'brand', e.target.value)}
                                  placeholder="Digite ou escolha a associação"
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 font-semibold"
                                />
                                <datalist id={`brand-suggestions-${itemIdx}`}>
                                  <option value="Associação Brasileira (Nacional)" />
                                  <option value="Santa Cannabis" />
                                  <option value="Abrace Esperança" />
                                  <option value="Flor da Vida" />
                                  <option value="Apepi" />
                                  <option value="Cultive" />
                                  <option value="Associação Nacional (Brasil)" />
                                  <option value="Flowermed (EUA)" />
                                  <option value="GreenBudzCBD" />
                                  <option value="Importado (Folheto Especial)" />
                                </datalist>
                                {/* Quick Brand Chips */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {['Associação Brasileira', 'Abrace', 'Santa Cannabis', 'Flor da Vida', 'Flowermed', 'GreenBudz'].map(b => (
                                    <button
                                      key={b}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateItem(itemIdx, 'brand', b);
                                        if (['Flowermed', 'GreenBudz'].includes(b)) {
                                          handleUpdateItem(itemIdx, 'origin', 'Importado');
                                        } else {
                                          handleUpdateItem(itemIdx, 'origin', 'Nacional');
                                        }
                                      }}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-mecura-elevated/40 hover:bg-mecura-neon/20 hover:text-mecura-neon text-mecura-silver transition-colors cursor-pointer"
                                    >
                                      {b}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Origin */}
                              <div className="sm:col-span-3">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Origem
                                </label>
                                <select
                                  value={item.origin !== undefined ? item.origin : (enriched.origin || 'Nacional')}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'origin', e.target.value)}
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                >
                                  <option value="Nacional">Associação Nacional (Brasil)</option>
                                  <option value="Importado">Importado (EUA/Europa)</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 2: Concentration & Active Ingredients */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Composição / Concentração
                                </label>
                                <input
                                  type="text"
                                  value={concentration || ''}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'concentration', e.target.value)}
                                  placeholder="Ex: CBD 100mg/mL (10%), Delta-9-THC < 0,2%"
                                  className="w-full bg-[#0A0A0F] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-medium"
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-cyan-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Princípio(s) Ativo(s)
                                </label>
                                <input
                                  type="text"
                                  value={activeIng || ''}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'activeIngredients', e.target.value)}
                                  placeholder="Ex: Canabidiol (CBD) Broad Spectrum + Terpenos"
                                  className="w-full bg-[#0A0A0F] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-medium"
                                />
                              </div>

                              {/* Forma Farmacêutica */}
                              <div className="sm:col-span-4">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Forma & Apresentação
                                </label>
                                <input
                                  type="text"
                                  list={`form-suggestions-${itemIdx}`}
                                  value={pharmForm || ''}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'pharmaceuticalForm', e.target.value)}
                                  placeholder="Ex: Solução Oleosa Sublingual"
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                                <datalist id={`form-suggestions-${itemIdx}`}>
                                  <option value="Solução Oleosa Sublingual (Gotas)" />
                                  <option value="Gomas Mastigáveis Veganas" />
                                  <option value="Flores Secas In Natura (14g)" />
                                  <option value="Pomada Canábica Terapêutica" />
                                  <option value="Xarope Hidrossolúvel Nano-emulsão" />
                                </datalist>
                              </div>

                              {/* Quantidade / Embalagem (Separated) */}
                              <div className="sm:col-span-4">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Qtd / Embalagem
                                </label>
                                <input
                                  type="text"
                                  list={`qty-suggestions-${itemIdx}`}
                                  value={quantity || ''}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'quantity', e.target.value)}
                                  placeholder={isGummy ? "01 Pote com 20 gomas" : isFlower ? "01 Embalagem de 14g" : isTopical ? "01 Pote de 50g" : "01 Frasco de 30 mL"}
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                                <datalist id={`qty-suggestions-${itemIdx}`}>
                                  <option value="01 Frasco de 30 mL" />
                                  <option value="01 Frasco de 15 mL" />
                                  <option value="01 Pote com 20 gomas" />
                                  <option value="01 Pote com 30 gomas" />
                                  <option value="01 Embalagem Selada de 14g" />
                                  <option value="01 Pote de 50g" />
                                </datalist>
                              </div>

                              {/* Via de Administração (Separated) */}
                              <div className="sm:col-span-4">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Via de Administração
                                </label>
                                <select
                                  value={admRoute || (isGummy ? 'Via Oral' : isFlower ? 'Via Inalatória (Vaporização)' : isTopical ? 'Uso Tópico' : 'Via Sublingual / Oral')}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'administrationRoute', e.target.value)}
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 font-semibold"
                                >
                                  <option value="Via Oral">Via Oral (Mastigável / Ingestão)</option>
                                  <option value="Via Sublingual / Oral">Via Sublingual / Oral (Gotas)</option>
                                  <option value="Via Inalatória (Vaporização)">Via Inalatória (Vaporização Medicinal)</option>
                                  <option value="Uso Tópico">Uso Tópico (Cutâneo)</option>
                                </select>
                              </div>
                            </div>

                            {/* Gummy Posology Warning Safeguard */}
                            {hasWrongGummyDosage && (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                  <span>
                                    <strong>Atenção:</strong> Este medicamento é uma <strong>goma</strong> e está com orientação sublingual ou gotas.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateItem(itemIdx, 'administrationRoute', 'Via Oral');
                                    handleUpdateItem(itemIdx, 'pharmaceuticalForm', 'Gomas Mastigáveis Veganas');
                                    setItems(prev => {
                                      const copy = [...prev];
                                      copy[itemIdx] = {
                                        ...copy[itemIdx],
                                        administrationRoute: 'Via Oral',
                                        pharmaceuticalForm: 'Gomas Mastigáveis Veganas',
                                        dosage: [
                                          'Mastigar 01 goma ao final da tarde ou 1 hora antes de dormir (via oral).',
                                          'Mastigar bem antes de engolir. Ação terapêutica prolongada (4 a 6 horas).'
                                        ]
                                      };
                                      return copy;
                                    });
                                  }}
                                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto"
                                >
                                  ✓ Corrigir para Mastigar (Via Oral)
                                </button>
                              </div>
                            )}

                            {/* Posology / Dosage Lines */}
                            <div className="pt-2 border-t border-mecura-elevated/40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                                  Posologia & Modo de Uso {isGummy && '(Via Oral - Mastigável)'}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddDosageLine(itemIdx)}
                                  className="text-[10px] text-mecura-silver hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> + Linha de dosagem
                                </button>
                              </div>

                              {item.dosage.map((line, lineIdx) => (
                                <div key={lineIdx} className="flex items-center gap-2">
                                  <span className="text-[10px] text-mecura-silver w-4 text-center font-mono">{lineIdx + 1}.</span>
                                  <input
                                    type="text"
                                    value={line}
                                    onChange={(e) => handleUpdateDosageLine(itemIdx, lineIdx, e.target.value)}
                                    placeholder={isGummy ? "Ex: Mastigar 01 goma ao final da tarde..." : "Ex: Tomar 05 gotas sublinguais pela manhã..."}
                                    className="flex-1 bg-[#0A0A0F] border border-mecura-elevated rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                  />
                                  {item.dosage.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDosageLine(itemIdx, lineIdx)}
                                      className="text-mecura-silver hover:text-red-400 p-1 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 3: Notes & Instructions */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      Orientações Gerais & Observações Farmacológicas
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const standardText = 'Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\n- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.\n- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.';
                        if (!notes || !notes.trim()) {
                          setNotes(standardText);
                        } else if (!notes.includes('alimentos gordurosos')) {
                          setNotes(notes.trim() + '\n\n' + standardText);
                        }
                      }}
                      className="text-[11px] font-semibold text-mecura-neon hover:text-mecura-neon-light flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Inserir orientações padrão
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instruções de titulação, conservação do frasco, retorno em 30 dias..."
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const phrase = '- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.';
                        if (!notes.includes('reduzir em 1/3 a dose da manhã')) {
                          setNotes(notes ? `${notes.trim()}\n${phrase}` : phrase);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-mecura-silver hover:text-white transition-colors border border-white/5 cursor-pointer"
                    >
                      + Sonolência diurna (reduzir 1/3 manhã, noite normal conforme prescrição)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const phrase = '- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.';
                        if (!notes.includes('alimentos gordurosos')) {
                          setNotes(notes ? `${notes.trim()}\n${phrase}` : phrase);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-mecura-silver hover:text-white transition-colors border border-white/5 cursor-pointer"
                    >
                      + Alimentos gordurosos (+ absorção)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const phrase = '- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.';
                        if (!notes.includes('2 horas antes ou depois')) {
                          setNotes(notes ? `${notes.trim()}\n${phrase}` : phrase);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-mecura-silver hover:text-white transition-colors border border-white/5 cursor-pointer"
                    >
                      + Intervalo de 2h de outros remédios
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* A4 Sheet Preview */
              <div className="space-y-8 flex flex-col items-center">
                {(() => {
                  const nationalItems = items.filter(isNationalProduct);
                  const importedItems = items.filter(item => !isNationalProduct(item));
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
                      items: items,
                      badge: "Guia de Prescrição"
                    });
                  }

                  return guidesToRender.map((guide, gIdx) => (
                    <div key={`guide-doc-${gIdx}-${guide.title}`} className="w-full max-w-2xl bg-white text-[#111827] rounded-xl shadow-2xl p-8 sm:p-12 border border-slate-200 font-sans min-h-[650px] flex flex-col justify-between relative">
                      {/* Guide Badge */}
                      <div className="absolute top-3 right-4 bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {guide.badge}
                      </div>

                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6">
                          <div>
                            <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight">MECURA</h2>
                            <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase">
                              CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                            </p>
                          </div>
                          <div className="text-right pr-28 sm:pr-0">
                            <h3 className="text-sm font-bold text-[#1E1B4B]">{doctorName}</h3>
                            <p className="text-xs text-slate-600 font-semibold">{doctorCrm}</p>
                            <p className="text-[10px] text-slate-500">{doctorSpecialty}</p>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="text-center my-4">
                          <h1 className="text-lg font-bold text-[#1E1B4B] uppercase tracking-widest">
                            {guide.title}
                          </h1>
                          <p className="text-xs font-semibold text-[#059669] tracking-wider uppercase mt-0.5">
                            {guide.subtitle}
                          </p>
                          <div className="w-16 h-0.5 bg-[#059669] mx-auto mt-2" />
                        </div>

                        {/* Patient Info Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 text-xs flex justify-between items-center">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Paciente</span>
                            <span className="font-bold text-slate-900 text-sm">{patientName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">CPF / Nasc.</span>
                            <span className="font-semibold text-slate-700">{cpf} • {birthDate}</span>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-5 my-6">
                          {guide.items.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nenhum produto cadastrado para esta guia.</p>
                          ) : (
                            guide.items.map((item, idx) => {
                              const isGummy = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(item.name || item.type || '');
                              const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                              const activeIng = item.activeIngredients || enriched.activeIngredients;
                              const pharmForm = isGummy ? (item.pharmaceuticalForm && !/solução/i.test(item.pharmaceuticalForm) ? item.pharmaceuticalForm : 'Gomas Mastigáveis Veganas') : (item.pharmaceuticalForm || enriched.pharmaceuticalForm);
                              const quantity = isGummy ? (item.quantity && !/frasco/i.test(item.quantity) ? item.quantity : '01 Pote com 20 a 30 gomas') : (item.quantity || enriched.quantity);
                              const admRoute = isGummy ? 'Via Oral' : (item.administrationRoute || enriched.administrationRoute);

                              let dosageList = item.dosage;
                              if (isGummy) {
                                dosageList = dosageList.map(d => {
                                  if (/sublingual|gota|pingar/i.test(d)) {
                                    return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
                                  }
                                  return d;
                                });
                              }

                              return (
                                <div key={`guide-${gIdx}-item-${idx}-${item.name}`} className="border-b border-slate-100 pb-4">
                                  <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-sm font-bold text-slate-900">
                                      {idx + 1}. {item.name}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                                      {item.brand || enriched.brand} ({item.origin || enriched.origin})
                                    </span>
                                  </div>

                                  {/* Active Ingredient & Presentation */}
                                  <div className="pl-4 mb-2 space-y-0.5 text-xs text-slate-600">
                                    <p><span className="font-semibold text-slate-800">Princípio Ativo:</span> {activeIng}</p>
                                    {(item.concentration || enriched.concentration) && (
                                      <p><span className="font-semibold text-slate-800">Composição / Concentração:</span> {item.concentration || enriched.concentration}</p>
                                    )}
                                    <p><span className="font-semibold text-slate-800">Apresentação & Via:</span> {pharmForm} • Qtd: {quantity} • {admRoute}</p>
                                  </div>

                                  {/* Dosage */}
                                  <div className="pl-4 space-y-0.5 text-xs text-slate-700">
                                    <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Posologia:</span>
                                    {dosageList.map((d, dIdx) => (
                                      <p key={`guide-${gIdx}-dose-${dIdx}`} className="leading-relaxed">• {d}</p>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Notes */}
                        {notes && (
                          <div className="bg-slate-50 border-l-2 border-[#1E1B4B] p-3 text-xs text-slate-700 mt-4 rounded-r">
                            <span className="font-bold block text-[10px] uppercase text-slate-600 mb-0.5">Orientações Farmacológicas</span>
                            <p className="whitespace-pre-line text-[11px] leading-relaxed">{notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Independent Signature Block for this guide */}
                      <div className="pt-8 border-t border-slate-200 mt-8 flex justify-between items-end">
                        <div className="text-[10px] text-slate-500">
                          <p>Data de Emissão: {emissionDate}</p>
                          <p className="text-[9px] text-slate-400 mt-1">Conforme RDC Anvisa nº 327/2019 e RDC nº 660/2022</p>
                        </div>

                        <div className="text-center w-52">
                          <div className="border-b border-slate-400 pb-1 mb-1" />
                          <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                          <p className="text-[10px] text-slate-600 font-semibold">{doctorCrm}</p>
                          <p className="text-[9px] text-slate-500">Assinatura Digital / Prescritor</p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-mecura-elevated bg-[#0A0A0F]/90 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-mecura-elevated rounded-xl text-xs md:text-sm font-bold text-mecura-silver hover:text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating || isSendingToChat || isSendingPreview}
                className="w-full sm:w-auto px-5 py-2.5 bg-mecura-surface border border-mecura-elevated hover:bg-white/5 text-white font-bold text-xs md:text-sm rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Baixando PDF...' : 'Baixar Cópia (PDF)'}
              </button>

              {onSendPreviewToChat && (
                <button
                  type="button"
                  onClick={handleSendPreviewClick}
                  disabled={isGenerating || isSendingPreview || items.length === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs md:text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingPreview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Enviando Prévia...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-black" />
                      <span>Enviar Receita Prévia ao Paciente</span>
                    </>
                  )}
                </button>
              )}

              {onSendToChat && (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  {items.length > 0 && (
                    <label 
                      className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-mecura-silver hover:text-white transition-colors bg-white/5 border border-mecura-elevated px-3 py-2 rounded-xl"
                      title="Se desmarcado, apenas o PDF da Receita Oficial será emitido sem enviar cards separados para o chat/farmácia"
                    >
                      <input
                        type="checkbox"
                        checked={sendProductsToChat}
                        onChange={(e) => setSendProductsToChat(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-mecura-neon focus:ring-0 cursor-pointer accent-[#a6ff00]"
                      />
                      <span>Incluir produtos no chat/farmácia</span>
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={handleSendToChatClick}
                    disabled={isGenerating || isSendingToChat || isSendingPreview}
                    className="w-full sm:w-auto px-6 py-3 bg-mecura-neon hover:bg-[#b5ff33] text-black font-extrabold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(166,255,0,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingToChat ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Enviando Receita...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-black" />
                        <span>Emitir Receita Final</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visual Full Library Search & Selection Modal */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl max-h-[90vh] bg-[#0A0A0F] border border-mecura-elevated rounded-2xl flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-mecura-elevated bg-mecura-surface/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mecura-neon/15 border border-mecura-neon/40 flex items-center justify-center text-mecura-neon flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Biblioteca Completa de Medicamentos</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-mecura-neon/20 text-mecura-neon font-mono font-bold">
                      {allLibraryProducts.length} produtos
                    </span>
                  </h3>
                  <p className="text-xs text-mecura-silver">
                    {typeof replaceTargetIndex === 'number' && replaceTargetIndex >= 0
                      ? `Substituindo Medicamento #${replaceTargetIndex + 1}: "${items[replaceTargetIndex]?.name || 'Item selecionado'}"`
                      : 'Selecione qualquer produto para adicionar à receita médica'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLibraryModalOpen(false);
                  setReplaceTargetIndex(null);
                }}
                className="p-2 text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-mecura-elevated bg-[#0D0D12] space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mecura-silver" />
                <input
                  type="text"
                  value={librarySearchTerm}
                  onChange={(e) => setLibrarySearchTerm(e.target.value)}
                  placeholder="Buscar medicamento por nome, princípio ativo, indicação (ex: ansiedade, sono, dor, goma, thc, cbn)..."
                  className="w-full bg-[#050508] border border-mecura-elevated rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-mecura-neon/50 placeholder:text-zinc-500"
                  autoFocus
                />
                {librarySearchTerm && (
                  <button
                    type="button"
                    onClick={() => setLibrarySearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mecura-silver hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Category & Origin Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-1">
                  {[
                    { id: 'all', label: `Todos (${allLibraryProducts.length})` },
                    { id: 'abecmed', label: '🟠 ABECMED Oficial (Nacional)' },
                    { id: 'gomas', label: '🍬 Gomas & Comestíveis' },
                    { id: 'nacionais', label: '🇧🇷 Associações Nacionais' },
                    { id: 'flowermed', label: '🇺🇸 Linha Flowermed' },
                    { id: 'flores', label: '🌿 Flores & Extrações' },
                    { id: 'oleos', label: '💧 Óleos Sublinguais' },
                    { id: 'topicos', label: '🧴 Pomadas & Tópicos' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLibrarySelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        librarySelectedCategory === cat.id
                          ? 'bg-mecura-neon text-black font-bold shadow-sm shadow-mecura-neon/30'
                          : 'bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white border border-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Origin Filter */}
                <div className="flex items-center gap-1 bg-[#050508] p-0.5 rounded-lg border border-mecura-elevated">
                  {(['all', 'Nacional', 'Importado'] as const).map(orig => (
                    <button
                      key={orig}
                      type="button"
                      onClick={() => setLibraryOriginFilter(orig)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        libraryOriginFilter === orig
                          ? 'bg-purple-500 text-white font-bold'
                          : 'text-mecura-silver hover:text-white'
                      }`}
                    >
                      {orig === 'all' ? 'Todas Origens' : orig === 'Nacional' ? '🇧🇷 Nacionais' : '🇺🇸 Importados'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products List / Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#08080C] space-y-3">
              {filteredLibraryProducts.length === 0 ? (
                <div className="py-12 text-center text-mecura-silver space-y-2">
                  <p className="text-sm font-semibold text-white">Nenhum medicamento encontrado para essa busca.</p>
                  <p className="text-xs">Tente outros termos ou limpe o filtro de categoria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLibrarySearchTerm('');
                      setLibrarySelectedCategory('all');
                      setLibraryOriginFilter('all');
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer mt-2"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLibraryProducts.map((prod, pIdx) => {
                    const isGummyProd = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(prod.name || prod.type || prod.pharmaceuticalForm || '');
                    const isFlowerProd = /flor|in natura/i.test(prod.name || prod.type || '');
                    const isTopicalProd = /pomada|t[óo]pico/i.test(prod.name || prod.type || '');
                    const isNat = prod.origin === 'Nacional' || (prod.manufacturer || '').toLowerCase().includes('associação');

                    return (
                      <div
                        key={`lib-grid-${prod.name}-${pIdx}`}
                        className="p-3.5 rounded-xl bg-mecura-surface/40 hover:bg-mecura-surface/70 border border-mecura-elevated hover:border-mecura-neon/40 transition-all flex flex-col justify-between gap-3 group relative"
                      >
                        <div className="space-y-1.5">
                          {/* Badges Bar */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              isNat 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {isNat ? '🇧🇷 NACIONAL' : '🇺🇸 IMPORTADO'}
                            </span>

                            {isGummyProd ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40">
                                🍬 GOMA MASTIGÁVEL (VIA ORAL)
                              </span>
                            ) : isFlowerProd ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🌿 FLOR (VAPORIZAÇÃO)
                              </span>
                            ) : isTopicalProd ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                🧴 TÓPICO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                💧 GOTAS SUBLINGUAIS
                              </span>
                            )}

                            {prod.priceBRL ? (
                              <span className="text-[11px] font-extrabold text-emerald-400">
                                R$ {prod.priceBRL}
                              </span>
                            ) : prod.priceUSD ? (
                              <span className="text-[11px] font-extrabold text-emerald-400">
                                US$ {prod.priceUSD}
                              </span>
                            ) : null}
                          </div>

                          {/* Product Name */}
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-mecura-neon transition-colors">
                            {prod.name}
                          </h4>

                          {/* Manufacturer / Origin */}
                          <p className="text-[11px] text-zinc-400 font-medium">
                            <span className="text-mecura-silver">Fabricante:</span> {prod.manufacturer || (isNat ? 'Associação Brasileira' : 'GreenBudzCBD')}
                          </p>

                          {/* Formulation details */}
                          <div className="space-y-0.5 text-[11px] text-zinc-400">
                            {prod.activeIngredients && (
                              <p className="line-clamp-1"><strong className="text-zinc-300">Princípio Ativo:</strong> {prod.activeIngredients}</p>
                            )}
                            {prod.concentration && (
                              <p className="line-clamp-1"><strong className="text-zinc-300">Concentração:</strong> {prod.concentration}</p>
                            )}
                            <p className="text-[10px] text-zinc-400">
                              <span className="text-zinc-300 font-semibold">Apresentação:</span> {isGummyProd ? 'Gomas Mastigáveis Veganas' : (prod.pharmaceuticalForm || 'Solução Oleosa')} • <span className="text-zinc-300 font-semibold">Via:</span> {isGummyProd ? 'Via Oral' : (prod.administrationRoute || 'Via Sublingual / Oral')}
                            </p>
                          </div>

                          {/* Description / Indications snippet */}
                          {prod.description && (
                            <p className="text-[10px] text-zinc-500 line-clamp-2 italic pt-1 border-t border-white/5">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        {/* Prescribe Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectLibraryProduct(prod, replaceTargetIndex)}
                          className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-mecura-neon to-[#c7ff42] hover:opacity-95 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {typeof replaceTargetIndex === 'number' && replaceTargetIndex >= 0
                              ? `Substituir Medicamento #${replaceTargetIndex + 1}`
                              : 'Prescrever este Medicamento'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-mecura-elevated bg-[#0A0A0F] flex items-center justify-between text-xs text-mecura-silver">
              <span>{filteredLibraryProducts.length} de {allLibraryProducts.length} medicamentos exibidos</span>
              <button
                type="button"
                onClick={() => {
                  setIsLibraryModalOpen(false);
                  setReplaceTargetIndex(null);
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors cursor-pointer"
              >
                Fechar Biblioteca
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
