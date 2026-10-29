import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Brain, 
  Moon, 
  Sun, 
  Activity, 
  Check, 
  Plus, 
  FileText, 
  Pill, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  Clock,
  RotateCcw,
  Upload,
  Info,
  User,
  Search,
  CheckCircle2,
  Download,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Save,
  Edit3,
  FolderPlus,
  PlusCircle,
  BookmarkCheck
} from 'lucide-react';
import { 
  ProgrammedPrescriptionProfile, 
  getProgrammedProfiles, 
  saveProgrammedProfiles, 
  resetProgrammedProfilesToDefault,
  getDoctorCustomModel,
  saveDoctorCustomModel
} from '../data/programmedPrescriptions';
import { PrescriptionItemData } from '../utils/pdfGenerator';
import { useAdminStore } from '../store/useAdminStore';
import { getBestCategoryIdForProduct } from '../utils/productCatalog';
import { 
  enrichMedicationDetails, 
  NATIONAL_ASSOCIATION_PRODUCTS, 
  ABECMED_PRODUCTS, 
  ABRACE_PRODUCTS, 
  SOUCANNABIS_PRODUCTS, 
  SANTA_GAIA_PRODUCTS,
  ACAFLOR_PRODUCTS,
  PANGAIA_PRODUCTS, 
  cbdGuideData 
} from '../data/cbdGuide';
import { FLOWERMED_PRODUCTS } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { GREENBUDZ_PRODUCTS } from '../data/greenbudzCatalog';

export interface PatientInfoForPrescription {
  id?: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
}

interface ProgrammedPrescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo?: PatientInfoForPrescription | null;
  allPatients?: any[];
  onApplyProfile: (profile: ProgrammedPrescriptionProfile, mode: 'replace' | 'append', targetPatient?: PatientInfoForPrescription) => void;
  onDirectEmitPDF?: (profile: ProgrammedPrescriptionProfile, targetPatient?: PatientInfoForPrescription) => Promise<void> | void;
}

export function ProgrammedPrescriptionsModal({
  isOpen,
  onClose,
  patientInfo: initialPatientInfo,
  allPatients = [],
  onApplyProfile,
  onDirectEmitPDF
}: ProgrammedPrescriptionsModalProps) {
  const { productCategories, addProduct } = useAdminStore();
  const [profiles, setProfiles] = useState<ProgrammedPrescriptionProfile[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeProfileId, setActiveProfileId] = useState<string>('perfil-ansiedade');
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEmittingDirect, setIsEmittingDirect] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Active Patient for this modal session
  const [selectedPatient, setSelectedPatient] = useState<PatientInfoForPrescription | null>(initialPatientInfo || null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // Modals state for: Creating new protocol, Adding medication to protocol, Editing protocol details
  const [showNewProtocolModal, setShowNewProtocolModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showEditProtocolModal, setShowEditProtocolModal] = useState(false);

  // In-app Confirmation Dialog (100% reliable in iframes, never blocked by browser window.confirm!)
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'protocol' | 'medication' | 'reset_defaults';
    title: string;
    message: string;
    itemName?: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Form State: New Protocol
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newProtocolTag, setNewProtocolTag] = useState<'ansiedade' | 'insonia' | 'depressao' | 'combinado' | 'dor' | 'custom'>('ansiedade');
  const [newProtocolBadge, setNewProtocolBadge] = useState('Personalizado');
  const [newProtocolDescription, setNewProtocolDescription] = useState('');
  const [newProtocolNotes, setNewProtocolNotes] = useState('- Administrar conforme posologia médica.\n- Preferencialmente após refeição com lipídios para melhor absorção.\n- Armazenar ao abrigo de luz e calor excessivo.');

  // Form State: Add / Edit Medication in Protocol
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);
  const [medAddTab, setMedAddTab] = useState<'catalog' | 'manual'>('catalog');
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [catalogOriginFilter, setCatalogOriginFilter] = useState<string>('all');
  const [medName, setMedName] = useState('');
  const [medBrand, setMedBrand] = useState('Associação Brasileira (Nacional)');
  const [medOrigin, setMedOrigin] = useState<'Nacional' | 'Importado'>('Nacional');
  const [medActiveIngredients, setMedActiveIngredients] = useState('Canabidiol (CBD) Full Spectrum');
  const [medConcentration, setMedConcentration] = useState('100 mg/mL (3.000 mg de CBD) • Frasco de 30 mL');
  const [medQuantity, setMedQuantity] = useState('01 Frasco de 30 mL');
  const [medForm, setMedForm] = useState('Solução Oleosa Sublingual (Gotas)');
  const [medRoute, setMedRoute] = useState('Via Sublingual / Oral');
  const [medDosageLines, setMedDosageLines] = useState<string>('1º ao 5º dia: Iniciar com 03 gotas pela manhã e 03 gotas à noite.\nManutenção: Aumentar 01 gota a cada 5 dias até controle dos sintomas.\nReter sob a língua por 60 segundos antes de engolir.');
  const [medDescription, setMedDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loaded = getProgrammedProfiles();
      setProfiles(loaded);
      if (loaded.length > 0 && !loaded.some(p => p.id === activeProfileId)) {
        setActiveProfileId(loaded[0].id);
      }
      if (initialPatientInfo) {
        setSelectedPatient(initialPatientInfo);
      }
      setHasUnsavedChanges(false);
    }
  }, [isOpen, initialPatientInfo]);

  // Complete catalog list containing ALL National Associations & ALL Imported Brands
  const allCatalogProducts = useMemo(() => {
    const list: any[] = [];
    const seenNames = new Set<string>();

    const addProductToList = (p: any, categoryName: string, defaultOrigin: 'Nacional' | 'Importado', defaultBrand?: string) => {
      if (!p || !p.name) return;
      const clean = p.name.trim().toLowerCase();
      if (seenNames.has(clean)) return;
      seenNames.add(clean);

      const isImported = defaultOrigin === 'Importado' ||
        p.origin === 'Importado' ||
        /pangaia|flowermed|flower|extraction|extração|greenbudz|eua|importad|14g|terp/i.test(
          `${p.name} ${p.manufacturer || ''} ${p.brand || ''} ${categoryName}`
        );

      const resolvedOrigin: 'Nacional' | 'Importado' = isImported ? 'Importado' : 'Nacional';
      const resolvedBrand = p.manufacturer || defaultBrand || p.brand || categoryName;
      const enriched = enrichMedicationDetails(p.name, resolvedBrand, resolvedOrigin, p.type, p);

      list.push({
        ...p,
        categoryName,
        origin: resolvedOrigin,
        brand: resolvedBrand,
        activeIngredients: p.activeIngredients || enriched.activeIngredients || 'Canabidiol (CBD) Full Spectrum',
        concentration: p.concentration || enriched.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL',
        pharmaceuticalForm: p.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
        quantity: p.quantity || enriched.quantity || '01 Frasco de 30 mL',
        administrationRoute: p.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral'
      });
    };

    // 1. From Pangaia Biopharmaceuticals (Importado EUA / Anvisa RDC 660)
    if (PANGAIA_PRODUCTS && Array.isArray(PANGAIA_PRODUCTS)) {
      for (const p of PANGAIA_PRODUCTS) {
        addProductToList(p, 'Pangaia Biopharmaceuticals (Importado)', 'Importado', 'Pangaia Biopharma');
      }
    }

    // 1b. From GreenBudzCBD (Importado EUA / Anvisa RDC 660)
    if (GREENBUDZ_PRODUCTS && Array.isArray(GREENBUDZ_PRODUCTS)) {
      for (const p of GREENBUDZ_PRODUCTS) {
        addProductToList(p, 'GreenBudzCBD (Importado EUA)', 'Importado', 'GreenBudzCBD');
      }
    }

    // 2. From Flowermed Catalog (Importado EUA)
    if (FLOWERMED_PRODUCTS && Array.isArray(FLOWERMED_PRODUCTS)) {
      for (const p of FLOWERMED_PRODUCTS) {
        addProductToList(p, 'Linha Flowermed (Importado)', 'Importado', 'Flowermed');
      }
    }

    // 3. From Flower Extractions Catalog (Flores & Extrações 14g - Importado)
    if (FLOWER_EXTRACTIONS_PRODUCTS && Array.isArray(FLOWER_EXTRACTIONS_PRODUCTS)) {
      for (const p of FLOWER_EXTRACTIONS_PRODUCTS) {
        addProductToList(p, 'Flores & Extrações In natura (Importado)', 'Importado', 'Flores & Extrações');
      }
    }

    // 4. From GreenBudzCBD & Other categories in cbdGuideData (Full Spectrum, Broad Spectrum, Isolate, Gummies, Topicals)
    if (cbdGuideData && Array.isArray(cbdGuideData)) {
      for (const cat of cbdGuideData) {
        const cTitle = cat.title || 'Catálogo MeCura';
        if (cat.products && Array.isArray(cat.products)) {
          for (const p of cat.products) {
            const isNationalCat = /soucannabis|abrace|abecmed|nacional|associa/i.test(cTitle);
            addProductToList(
              p, 
              cTitle, 
              isNationalCat ? 'Nacional' : 'Importado', 
              p.manufacturer || (isNationalCat ? 'Associação Nacional' : 'GreenBudzCBD')
            );
          }
        }
      }
    }

    // 5. From SouCannabis (Associação Nacional Brasil)
    if (SOUCANNABIS_PRODUCTS && Array.isArray(SOUCANNABIS_PRODUCTS)) {
      for (const p of SOUCANNABIS_PRODUCTS) {
        addProductToList(p, 'SouCannabis (Associação Nacional)', 'Nacional', 'SouCannabis');
      }
    }

    // 6. From ABRACE Esperança (Associação Nacional Brasil)
    if (ABRACE_PRODUCTS && Array.isArray(ABRACE_PRODUCTS)) {
      for (const p of ABRACE_PRODUCTS) {
        addProductToList(p, 'ABRACE Esperança (Associação Nacional)', 'Nacional', 'ABRACE');
      }
    }

    // 7. From ABECMED (Associação Nacional Brasil)
    if (ABECMED_PRODUCTS && Array.isArray(ABECMED_PRODUCTS)) {
      for (const p of ABECMED_PRODUCTS) {
        addProductToList(p, 'ABECMED (Associação Nacional)', 'Nacional', 'ABECMED');
      }
    }

    // 7b. From Santa Gaia & Acaflor (Associações Nacionais Brasil)
    if (SANTA_GAIA_PRODUCTS && Array.isArray(SANTA_GAIA_PRODUCTS)) {
      for (const p of SANTA_GAIA_PRODUCTS) {
        addProductToList(p, 'Associação Santa Gaia (Nacional)', 'Nacional', 'Associação Santa Gaia');
      }
    }
    if (ACAFLOR_PRODUCTS && Array.isArray(ACAFLOR_PRODUCTS)) {
      for (const p of ACAFLOR_PRODUCTS) {
        addProductToList(p, 'Associação Acaflor (Nacional)', 'Nacional', 'Associação Acaflor');
      }
    }

    // 8. From National Association Products
    if (NATIONAL_ASSOCIATION_PRODUCTS && Array.isArray(NATIONAL_ASSOCIATION_PRODUCTS)) {
      for (const p of NATIONAL_ASSOCIATION_PRODUCTS) {
        addProductToList(p, 'Associação Nacional (Brasil)', 'Nacional', 'Associação Nacional');
      }
    }

    // 9. From useAdminStore productCategories
    if (productCategories && Array.isArray(productCategories)) {
      productCategories.forEach(cat => {
        const cTitle = (cat as any).title || (cat as any).name || 'Catálogo MeCura';
        if (cat.products && Array.isArray(cat.products)) {
          cat.products.forEach(p => {
            const isNat = p.origin === 'Nacional' || /soucannabis|santa\s*gaia|santagaia|acaflor|açaflor|abrace|abecmed|nacional/i.test(`${p.name} ${p.manufacturer || ''} ${cTitle}`);
            addProductToList(p, cTitle, isNat ? 'Nacional' : 'Importado');
          });
        }
      });
    }

    return list;
  }, [productCategories]);

  const filteredCatalogProducts = useMemo(() => {
    let result = allCatalogProducts;

    // Filter by origin / brand pill
    if (catalogOriginFilter === 'importados') {
      result = result.filter(p => p.origin === 'Importado');
    } else if (catalogOriginFilter === 'nacionais') {
      result = result.filter(p => p.origin === 'Nacional');
    } else if (catalogOriginFilter === 'pangaia') {
      result = result.filter(p => /pangaia/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'flowermed') {
      result = result.filter(p => /flowermed/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'greenbudz') {
      result = result.filter(p => /greenbudz|drops by greenbud|calm vibe|chill vibe|nightshade|beethoven|evergreen|looking glass/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'flores') {
      result = result.filter(p => /flor|extraction|extração|14g|terp/i.test(`${p.name} ${p.brand} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'soucannabis') {
      result = result.filter(p => /soucannabis/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'abrace') {
      result = result.filter(p => /abrace/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter === 'abecmed') {
      result = result.filter(p => /abec/i.test(`${p.name} ${p.brand} ${p.manufacturer} ${p.categoryName}`));
    } else if (catalogOriginFilter.startsWith('brand_')) {
      const targetCat = productCategories.find(c => c.id === catalogOriginFilter);
      const brandNameLower = (((targetCat as any)?.name || targetCat?.title || '') as string).split('(')[0].trim().toLowerCase();
      const catNames = new Set((targetCat?.products || []).map(cp => cp.name.trim().toLowerCase()));
      result = result.filter(p =>
        catNames.has((p.name || '').trim().toLowerCase()) ||
        (brandNameLower && `${p.brand || ''} ${p.manufacturer || ''} ${p.categoryName || ''}`.toLowerCase().includes(brandNameLower))
      );
    }

    if (!catalogSearchTerm.trim()) {
      return result;
    }
    const term = catalogSearchTerm.toLowerCase().trim();
    return result.filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(term)) ||
      (p.type && p.type.toLowerCase().includes(term)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(term)) ||
      (p.concentration && p.concentration.toLowerCase().includes(term)) ||
      (p.activeIngredients && p.activeIngredients.toLowerCase().includes(term))
    );
  }, [allCatalogProducts, catalogSearchTerm, catalogOriginFilter]);

  // Filtered patients for dropdown search
  const filteredPatients = useMemo(() => {
    if (!allPatients || !Array.isArray(allPatients)) return [];
    if (!patientSearchTerm.trim()) return allPatients.slice(0, 15);
    const term = patientSearchTerm.toLowerCase().trim();
    return allPatients.filter(p => {
      const pName = (p.patientName || p.name || '').toLowerCase();
      const pCpf = (p.cpf || p.answers?.cpf || '').toLowerCase();
      return pName.includes(term) || pCpf.includes(term);
    }).slice(0, 15);
  }, [allPatients, patientSearchTerm]);

  const isProfileImported = (p: ProgrammedPrescriptionProfile) => {
    return p.category === 'importado' || 
      /importad|pangaia|flowermed|eua|rdc 660|greenbudz|folheto/i.test(`${p.name} ${p.badge} ${p.id}`) ||
      Boolean(p.items && p.items.some(it => it.origin === 'Importado' || /pangaia|flowermed|importad/i.test(`${it.name} ${it.brand}`)));
  };

  const importedCatalogCount = useMemo(() => allCatalogProducts.filter(p => p.origin === 'Importado').length, [allCatalogProducts]);
  const nationalCatalogCount = useMemo(() => allCatalogProducts.filter(p => p.origin === 'Nacional').length, [allCatalogProducts]);
  const importedProfilesCount = useMemo(() => profiles.filter(p => isProfileImported(p)).length, [profiles]);
  const nationalProfilesCount = useMemo(() => profiles.filter(p => !isProfileImported(p)).length, [profiles]);

  if (!isOpen) return null;

  const filteredProfiles = selectedTag === 'all' 
    ? profiles 
    : selectedTag === 'importado'
      ? profiles.filter(p => isProfileImported(p))
      : selectedTag === 'nacional'
        ? profiles.filter(p => !isProfileImported(p))
        : profiles.filter(p => p.conditionTag === selectedTag);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Save Profiles to Storage
  const handleSaveAllProfiles = (newProfilesList?: ProgrammedPrescriptionProfile[], profileNameToMention?: string) => {
    const listToSave = newProfilesList || profiles;
    saveProgrammedProfiles(listToSave);
    setProfiles(listToSave);
    setHasUnsavedChanges(false);
    const targetName = profileNameToMention || activeProfile?.name || 'Protocolo';
    showToast(`✓ Protocolo "${targetName}" salvo e programado com sucesso!`);
  };

  // 2. Add or Edit Medication in Active Profile
  const handleOpenAddMedicationModal = () => {
    setEditingMedIndex(null);
    setMedName('');
    setMedBrand('Associação Brasileira (Nacional)');
    setMedOrigin('Nacional');
    setMedActiveIngredients('Canabidiol (CBD) Full Spectrum');
    setMedConcentration('100 mg/mL (3.000 mg de CBD) • Frasco de 30 mL');
    setMedQuantity('01 Frasco de 30 mL');
    setMedForm('Solução Oleosa Sublingual (Gotas)');
    setMedRoute('Via Sublingual / Oral');
    setMedDosageLines('1º ao 5º dia: Iniciar com 03 gotas pela manhã e 03 gotas à noite.\nManutenção: Aumentar 01 gota a cada 5 dias até controle dos sintomas.\nReter sob a língua por 60 segundos antes de engolir.');
    setMedDescription('');
    setCatalogSearchTerm('');
    setMedAddTab('catalog');
    setShowAddMedicationModal(true);
  };

  const handleOpenEditMedicationModal = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeProfile || !activeProfile.items[index]) return;
    const item = activeProfile.items[index];
    const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);

    setEditingMedIndex(index);
    setMedName(item.name || '');
    setMedBrand(item.brand || enriched.brand || 'Associação Brasileira (Nacional)');
    setMedOrigin(item.origin === 'Importado' ? 'Importado' : 'Nacional');
    setMedActiveIngredients(item.activeIngredients || enriched.activeIngredients || 'Canabidiol (CBD) Full Spectrum');
    setMedConcentration(item.concentration || enriched.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL');
    setMedQuantity(item.quantity || enriched.quantity || '01 Frasco de 30 mL');
    setMedForm(item.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)');
    setMedRoute(item.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral');
    setMedDosageLines(
      Array.isArray(item.dosage) && item.dosage.length > 0
        ? item.dosage.join('\n')
        : typeof item.dosage === 'string' && item.dosage
          ? item.dosage
          : 'Iniciar com 03 a 05 gotas 2 vezes ao dia.\nReter sob a língua por 60 segundos antes de engolir.'
    );
    setMedDescription(item.description || enriched.description || '');
    setMedAddTab('manual');
    setShowAddMedicationModal(true);
  };

  const handleAutoFillFromMedicationName = (targetName?: string) => {
    const queryName = (targetName ?? medName).trim();
    if (!queryName) {
      showToast('⚠️ Digite o nome do medicamento para preencher os dados automaticamente.');
      return;
    }
    const matchedCatalog = allCatalogProducts.find(
      p => p.name.toLowerCase() === queryName.toLowerCase() || p.name.toLowerCase().includes(queryName.toLowerCase())
    );
    const enriched = enrichMedicationDetails(
      matchedCatalog?.name || queryName,
      matchedCatalog?.brand || medBrand,
      matchedCatalog?.origin || medOrigin,
      matchedCatalog?.type,
      matchedCatalog
    );
    setMedBrand(matchedCatalog?.brand || enriched.brand || medBrand || 'Associação Brasileira (Nacional)');
    setMedOrigin((matchedCatalog?.origin === 'Importado' || enriched.origin?.includes('Importado')) ? 'Importado' : 'Nacional');
    setMedActiveIngredients(matchedCatalog?.activeIngredients || enriched.activeIngredients || 'Canabidiol (CBD) Full Spectrum');
    setMedConcentration(matchedCatalog?.concentration || enriched.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL');
    setMedQuantity(matchedCatalog?.quantity || enriched.quantity || '01 Frasco de 30 mL');
    setMedForm(matchedCatalog?.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)');
    setMedRoute(matchedCatalog?.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral');
    if (enriched.usageInstructions) {
      setMedDosageLines(enriched.usageInstructions);
    }
    showToast('✓ Princípio ativo, concentração, forma farmacêutica, via e quantidade preenchidos!');
  };

  const handleSelectCatalogProduct = (prod: any) => {
    const enriched = enrichMedicationDetails(prod.name, prod.manufacturer || prod.brand, prod.origin, prod.type, prod);
    setMedName(prod.name);
    setMedBrand(prod.manufacturer || prod.brand || enriched.brand || 'Associação Brasileira');
    setMedOrigin((prod.origin === 'Nacional' || prod.origin === 'Importado') ? prod.origin : (enriched.origin?.includes('Importado') ? 'Importado' : 'Nacional'));
    setMedActiveIngredients(prod.activeIngredients || enriched.activeIngredients || prod.type || 'Canabidiol (CBD) Full Spectrum');
    setMedConcentration(prod.concentration || enriched.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL');
    setMedQuantity(prod.quantity || enriched.quantity || '01 Frasco de 30 mL');
    setMedForm(prod.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)');
    setMedRoute(prod.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral');
    
    let dosage = prod.dosage || (enriched as any).dosage || enriched.usageInstructions;
    if (Array.isArray(dosage)) {
      setMedDosageLines(dosage.join('\n'));
    } else if (typeof dosage === 'string' && dosage.trim()) {
      setMedDosageLines(dosage);
    } else {
      setMedDosageLines('Iniciar com 03 a 05 gotas 2 vezes ao dia.\nTitular gradativamente conforme resposta terapêutica.\nReter sob a língua por 60 segundos.');
    }
    setMedDescription(prod.description || enriched.description || '');
    setMedAddTab('manual'); // Switch to manual so doctor can review and confirm!
  };

  const handleConfirmAddMedication = () => {
    if (!medName.trim()) {
      showToast('⚠️ Por favor, informe o nome do medicamento.');
      return;
    }
    if (!activeProfile) return;

    const enrichedFallback = enrichMedicationDetails(medName.trim(), medBrand.trim(), medOrigin);

    const dosageLinesArray = medDosageLines
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const newMedItem: PrescriptionItemData = {
      name: medName.trim(),
      brand: medBrand.trim() || enrichedFallback.brand || 'Associação Brasileira (Nacional)',
      origin: medOrigin,
      activeIngredients: medActiveIngredients.trim() || enrichedFallback.activeIngredients || 'Canabidiol (CBD) Full Spectrum',
      concentration: medConcentration.trim() || enrichedFallback.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL',
      pharmaceuticalForm: medForm.trim() || enrichedFallback.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
      quantity: medQuantity.trim() || enrichedFallback.quantity || '01 Frasco de 30 mL',
      administrationRoute: medRoute.trim() || enrichedFallback.administrationRoute || 'Via Sublingual / Oral',
      dosage: dosageLinesArray.length > 0 ? dosageLinesArray : ['Tomar conforme orientação médica.'],
      description: medDescription.trim() || enrichedFallback.description || undefined
    };

    const nextItems = editingMedIndex !== null
      ? activeProfile.items.map((it, idx) => (idx === editingMedIndex ? newMedItem : it))
      : [...activeProfile.items, newMedItem];

    const updatedProfile: ProgrammedPrescriptionProfile = {
      ...activeProfile,
      items: nextItems
    };

    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    saveProgrammedProfiles(updatedProfiles);

    // Also register in the global Brand Tab catalog so it stays organized in the brand's tab
    const targetCategoryId = getBestCategoryIdForProduct(newMedItem.origin, newMedItem.brand, newMedItem.name);
    addProduct(targetCategoryId, {
      name: newMedItem.name,
      manufacturer: newMedItem.brand,
      origin: newMedItem.origin,
      type: newMedItem.pharmaceuticalForm,
      activeIngredients: newMedItem.activeIngredients,
      concentration: newMedItem.concentration,
      pharmaceuticalForm: newMedItem.pharmaceuticalForm,
      administrationRoute: newMedItem.administrationRoute,
      quantity: newMedItem.quantity,
      description: newMedItem.description || `${newMedItem.activeIngredients} • ${newMedItem.concentration}`
    });
    window.dispatchEvent(new Event('mecura_bula_updated'));

    setShowAddMedicationModal(false);
    setEditingMedIndex(null);
    showToast(
      editingMedIndex !== null
        ? `✓ Medicamento "${newMedItem.name}" atualizado no protocolo e na aba da marca "${newMedItem.brand}"!`
        : `✓ Medicamento "${newMedItem.name}" adicionado ao protocolo e salvo na aba da marca "${newMedItem.brand}"!`
    );
  };

  // 3. Delete Medication from Active Profile
  const handleDeleteMedication = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeProfile) return;
    const itemToDelete = activeProfile.items[index];
    const itemName = itemToDelete?.name || 'Medicamento';

    const updatedItems = activeProfile.items.filter((_, idx) => idx !== index);
    const updatedProfile: ProgrammedPrescriptionProfile = {
      ...activeProfile,
      items: updatedItems
    };
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    saveProgrammedProfiles(updatedProfiles);
    showToast(`✓ Medicamento "${itemName}" removido do protocolo com sucesso!`);
  };

  // 4. Delete Entire Protocol
  const handleDeleteProfile = (profileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;

    setConfirmDialog({
      type: 'protocol',
      title: 'Excluir Protocolo Programado',
      message: `Tem certeza que deseja EXCLUIR o protocolo "${target.name}"? Esta ação removerá permanentemente o perfil e seus medicamentos salvos.`,
      itemName: target.name,
      confirmLabel: 'Sim, Excluir Protocolo',
      onConfirm: () => {
        const remaining = profiles.filter(p => p.id !== profileId);
        setProfiles(remaining);
        saveProgrammedProfiles(remaining, profileId);
        if (activeProfileId === profileId) {
          setActiveProfileId(remaining[0]?.id || '');
        }
        setConfirmDialog(null);
        showToast(`✓ Protocolo "${target.name}" excluído com sucesso!`);
      }
    });
  };

  // 5. Create New Protocol
  const handleOpenNewProtocolModal = () => {
    setNewProtocolName('');
    setNewProtocolTag('ansiedade');
    setNewProtocolBadge('Personalizado');
    setNewProtocolDescription('');
    setNewProtocolNotes('- Administrar conforme posologia médica contínua.\n- Preferencialmente após refeição com lipídios para melhor absorção.\n- Armazenar ao abrigo de luz e calor excessivo.');
    setShowNewProtocolModal(true);
  };

  const handleConfirmCreateProtocol = () => {
    if (!newProtocolName.trim()) {
      showToast('⚠️ Por favor, informe o nome do novo protocolo.');
      return;
    }

    let icon = 'Sparkles';
    let color = 'from-emerald-600 to-teal-700';
    if (newProtocolTag === 'ansiedade') {
      icon = 'Brain';
      color = 'from-blue-600 to-indigo-600';
    } else if (newProtocolTag === 'insonia') {
      icon = 'Moon';
      color = 'from-purple-600 to-indigo-800';
    } else if (newProtocolTag === 'depressao') {
      icon = 'Sun';
      color = 'from-amber-600 to-rose-600';
    } else if (newProtocolTag === 'dor') {
      icon = 'Activity';
      color = 'from-rose-600 to-red-800';
    } else if (newProtocolTag === 'combinado') {
      icon = 'Sparkles';
      color = 'from-indigo-600 to-purple-800';
    }

    const newProfile: ProgrammedPrescriptionProfile = {
      id: 'protocolo-' + Date.now(),
      name: newProtocolName.trim(),
      conditionTag: newProtocolTag,
      badge: newProtocolBadge.trim() || 'Personalizado',
      color,
      icon,
      description: newProtocolDescription.trim() || 'Protocolo clínico personalizado criado pelo médico.',
      items: [],
      defaultNotes: newProtocolNotes.trim()
    };

    const updated = [newProfile, ...profiles];
    setProfiles(updated);
    saveProgrammedProfiles(updated);
    setActiveProfileId(newProfile.id);
    setShowNewProtocolModal(false);
    showToast(`✓ Novo protocolo "${newProfile.name}" criado com sucesso! Agora você pode adicionar os medicamentos.`);
  };

  // 6. Edit Protocol Details
  const handleOpenEditProtocolModal = () => {
    if (!activeProfile) return;
    setNewProtocolName(activeProfile.name);
    setNewProtocolTag(activeProfile.conditionTag);
    setNewProtocolBadge(activeProfile.badge);
    setNewProtocolDescription(activeProfile.description);
    setNewProtocolNotes(activeProfile.defaultNotes || '');
    setShowEditProtocolModal(true);
  };

  const handleConfirmEditProtocol = () => {
    if (!newProtocolName.trim() || !activeProfile) return;
    const updatedProfile: ProgrammedPrescriptionProfile = {
      ...activeProfile,
      name: newProtocolName.trim(),
      conditionTag: newProtocolTag,
      badge: newProtocolBadge.trim() || activeProfile.badge,
      description: newProtocolDescription.trim(),
      defaultNotes: newProtocolNotes.trim()
    };
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    saveProgrammedProfiles(updatedProfiles);
    setShowEditProtocolModal(false);
    showToast(`✓ Dados do protocolo "${updatedProfile.name}" atualizados com sucesso!`);
  };

  // Actions for Prescription Application & Direct Issuance
  const handleApply = (mode: 'replace' | 'append') => {
    if (!activeProfile) return;
    onApplyProfile(activeProfile, mode, selectedPatient || undefined);
    showToast(`✓ Protocolo "${activeProfile.name}" aplicado com sucesso!`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleDirectEmit = async () => {
    if (!activeProfile || !onDirectEmitPDF) return;
    try {
      setIsEmittingDirect(true);
      await onDirectEmitPDF(activeProfile, selectedPatient || undefined);
      showToast(`✓ Receita emitida e PDF gerado com sucesso para ${selectedPatient?.name || 'o paciente'}!`);
      setTimeout(() => {
        setIsEmittingDirect(false);
        onClose();
      }, 700);
    } catch (e: any) {
      setIsEmittingDirect(false);
      showToast(`Erro ao emitir: ${e?.message || 'Tente novamente'}`);
    }
  };

  const handleImportJson = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.name || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        throw new Error('O formato precisa ter "name" e uma lista "items" com pelo menos um medicamento.');
      }
      const newProfile: ProgrammedPrescriptionProfile = {
        id: 'custom-' + Date.now(),
        name: parsed.name,
        conditionTag: parsed.conditionTag || 'custom',
        badge: parsed.badge || 'Personalizado',
        color: parsed.color || 'from-emerald-600 to-teal-700',
        icon: 'Sparkles',
        description: parsed.description || 'Perfil programado importado pelo médico.',
        items: parsed.items,
        defaultNotes: parsed.defaultNotes || '- Uso sob orientação médica contínua.'
      };
      const updated = [newProfile, ...profiles];
      setProfiles(updated);
      saveProgrammedProfiles(updated);
      setActiveProfileId(newProfile.id);
      setShowImportForm(false);
      setImportText('');
      showToast('✓ Novo perfil de receita importado e salvo com sucesso!');
    } catch (e: any) {
      setImportError(e.message || 'Erro ao processar JSON. Verifique a estrutura do texto.');
    }
  };

  const handleResetDefaults = () => {
    setConfirmDialog({
      type: 'reset_defaults',
      title: 'Restaurar Protocolos Padrões de Fábrica',
      message: 'Deseja restaurar os protocolos padrões originais (Nacionais e Importados EUA)? Todas as alterações personalizadas serão redefinidas para as formulações originais.',
      confirmLabel: 'Sim, Restaurar Originais',
      onConfirm: () => {
        resetProgrammedProfilesToDefault();
        const fresh = getProgrammedProfiles();
        setProfiles(fresh);
        setActiveProfileId(fresh[0]?.id || 'perfil-ansiedade');
        setConfirmDialog(null);
        showToast('✓ Perfis de receitas restaurados para os padrões originais!');
      }
    });
  };

  const handleRestoreDoctorModel = () => {
    resetProgrammedProfilesToDefault();
    const fresh = getProgrammedProfiles();
    setProfiles(fresh);
    setActiveProfileId('perfil-ansiedade');
    showToast('⭐ Modelo Salvo restaurado com sucesso! (Óleo Predominante CBD + Broad Spectrum CBD+CBN)');
  };

  const handleSaveActiveAsDoctorModel = () => {
    if (!activeProfile) return;
    saveDoctorCustomModel(activeProfile);
    showToast(`⭐ "${activeProfile.name}" definido como seu Modelo Salvo Permanente!`);
  };

  const getProfileIcon = (icon: string) => {
    switch (icon) {
      case 'Moon': return <Moon className="w-5 h-5" />;
      case 'Sun': return <Sun className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#0F0F18] border border-mecura-neon/40 rounded-3xl shadow-[0_0_60px_rgba(166,255,0,0.18)] z-10 flex flex-col max-h-[94vh] overflow-hidden"
        >
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-mecura-neon/20 via-purple-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-[#12121D]/90 backdrop-blur-md relative z-10 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-mecura-neon to-emerald-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(166,255,0,0.35)] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon">
                    Agilidade Clínica
                  </span>
                  <span className="text-xs text-[#8A8A9E]">• {profiles.length} protocolos salvos</span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Receitas Programadas (Perfis Clínicos)
                </h3>
              </div>
            </div>

            {/* Top Action Buttons: Restaurar Modelo + Novo Protocolo + Importar + Fechar */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Botão Restaurar Modelo Salvo Principal do Médico */}
              <button
                type="button"
                onClick={handleRestoreDoctorModel}
                className="px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                title="Restaurar seu Modelo Salvo Padrão (Óleo Predominante CBD + Broad Spectrum CBD/CBN)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">⭐ Restaurar Meu Modelo</span>
                <span className="sm:hidden">⭐ Modelo</span>
              </button>

              {/* Botão Adicionar Novos Protocolos */}
              <button
                type="button"
                onClick={handleOpenNewProtocolModal}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer active:scale-95"
                title="Cadastrar um novo perfil de receita padronizada do zero"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Novo Protocolo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportForm(!showImportForm)}
                className="hidden sm:flex px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-all items-center gap-1.5 cursor-pointer"
                title="Importar ou colar código JSON de receitas"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Patient Integration Banner */}
          <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-950/70 via-[#18152E] to-indigo-950/70 border-b border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                    Paciente Vinculado:
                  </span>
                  <span className="font-bold text-white text-sm truncate">
                    {selectedPatient?.name || 'Nenhum paciente selecionado'}
                  </span>
                  {selectedPatient && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Integrado ao Perfil
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#A2A2BC] flex items-center gap-3 mt-0.5 flex-wrap">
                  {selectedPatient?.cpf && (
                    <span>CPF: <strong className="text-white font-mono">{selectedPatient.cpf}</strong></span>
                  )}
                  {selectedPatient?.birthDate && (
                    <span>• Nasc: <strong className="text-white">{selectedPatient.birthDate}</strong></span>
                  )}
                  {selectedPatient?.phone && (
                    <span>• Tel: <strong className="text-white">{selectedPatient.phone}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {allPatients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPatientSelector(!showPatientSelector)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
                  title="Alterar paciente da receita"
                >
                  <Search className="w-3.5 h-3.5 text-purple-300" />
                  <span>{selectedPatient ? 'Alterar Paciente' : 'Selecionar Paciente'}</span>
                  <ChevronDown className="w-3 h-3 text-[#A2A2BC]" />
                </button>
              )}
            </div>
          </div>

          {/* Expandable Patient Selector */}
          {showPatientSelector && (
            <div className="p-3.5 bg-[#141224] border-b border-purple-500/30 shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Selecione o paciente para vincular a esta receita
                </span>
                <button 
                  onClick={() => setShowPatientSelector(false)}
                  className="text-xs text-[#8A8A9E] hover:text-white"
                >
                  Fechar
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8A8A9E] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  placeholder="Buscar paciente por nome ou CPF..."
                  className="w-full bg-[#0A0A12] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666680] focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredPatients.map((p, idx) => {
                  const pName = p.patientName || p.name || 'Paciente';
                  const pCpf = p.cpf || p.answers?.cpf || '';
                  const pBirth = p.birthDate || p.answers?.birthDate || '';
                  const pPhone = p.phone || p.answers?.phone || '';
                  const isCur = selectedPatient?.name === pName || (selectedPatient?.id && selectedPatient.id === p.id);
                  return (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => {
                        setSelectedPatient({
                          id: p.id,
                          name: pName,
                          cpf: pCpf,
                          birthDate: pBirth,
                          phone: pPhone
                        });
                        setShowPatientSelector(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                        isCur
                          ? 'bg-purple-600/30 border border-purple-400 text-white font-bold'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent text-[#C5C5D8]'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold">{pName}</span>
                        {pCpf && <span className="text-[10px] text-[#8A8A9E] ml-2 font-mono">CPF: {pCpf}</span>}
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Tags Filter + Restaurar Padrões */}
          <div className="px-4 sm:px-5 py-2.5 border-b border-white/5 bg-[#0B0B12] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-mecura-neon" /> Filtro:
            </span>
            {[
              { id: 'all', label: `Todos (${profiles.length})` },
              { id: 'importado', label: `🌐 Medicamentos Importados (${importedProfilesCount})` },
              { id: 'nacional', label: `🇧🇷 Medicamentos Nacionais (${nationalProfilesCount})` },
              { id: 'ansiedade', label: '🧠 Ansiedade' },
              { id: 'insonia', label: '🌙 Insônia' },
              { id: 'depressao', label: '☀️ Depressão' },
              { id: 'combinado', label: '✨ Ansiedade + Sono / Flores' },
              { id: 'dor', label: '🩸 Dor Crônica' }
            ].map((tag, tagIdx) => (
              <button
                key={`prog-tag-${tag.id}-${tagIdx}`}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTag === tag.id
                    ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.3)]'
                    : tag.id === 'importado'
                      ? 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-400/30'
                      : tag.id === 'nacional'
                        ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/30'
                        : 'bg-white/5 text-[#8A8A9E] hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tag.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="ml-auto text-[11px] text-[#8A8A9E] hover:text-amber-400 flex items-center gap-1 shrink-0 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Restaurar protocolos originais de fábrica"
            >
              <RotateCcw className="w-3 h-3" /> Restaurar Originais
            </button>
          </div>

          {/* Import / Custom Profile Collapsible Form */}
          {showImportForm && (
            <div className="p-4 bg-[#141422] border-b border-purple-500/30 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Importar Protocolo em Formato JSON</span>
                </h4>
                <span className="text-[10px] text-[#8A8A9E]">Cole o JSON ou estrutura com os medicamentos</span>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Exemplo:&#10;{&#10;  "name": "Ansiedade Severa e Pânico",&#10;  "conditionTag": "ansiedade",&#10;  "badge": "Ansiedade",&#10;  "description": "Protocolo com titulação rápida para crises de pânico.",&#10;  "items": [ ... medicamentos ... ]&#10;}'
                rows={3}
                className="w-full bg-[#0A0A10] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-[#55556A] focus:outline-none focus:border-purple-400"
              />
              {importError && (
                <div className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {importError}
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Salvar Perfil
                </button>
              </div>
            </div>
          )}

          {/* Main Body: Sidebar with Profiles list + Active Profile Details */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Left list of profiles (md:col-span-5) */}
            <div className="md:col-span-5 overflow-y-auto p-3.5 space-y-2 max-h-[35vh] md:max-h-full">
              {/* Botão Superior para Criar Novo Protocolo na Lista */}
              <button
                type="button"
                onClick={handleOpenNewProtocolModal}
                className="w-full p-2.5 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Adicionar Novo Protocolo</span>
              </button>

              {filteredProfiles.map((profile, profIdx) => {
                const isSelected = profile.id === activeProfile?.id;
                return (
                  <div
                    key={`rx-profile-${profile.id || profIdx}-${profIdx}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveProfileId(profile.id);
                      }
                    }}
                    onClick={() => setActiveProfileId(profile.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-mecura-neon/15 via-[#181828] to-purple-500/10 border-mecura-neon/60 shadow-[0_0_20px_rgba(166,255,0,0.15)] ring-1 ring-mecura-neon/30'
                        : 'bg-[#12121C] border-white/5 hover:border-white/20 hover:bg-[#161624]'
                    }`}
                  >
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected 
                          ? 'bg-mecura-neon text-black border-mecura-neon font-black' 
                          : 'bg-white/5 text-[#8A8A9E] border-white/10 group-hover:text-white'
                      }`}
                    >
                      {getProfileIcon(profile.icon)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                          isSelected
                            ? 'bg-mecura-neon/20 text-mecura-neon border-mecura-neon/40'
                            : 'bg-white/5 text-[#8A8A9E] border-white/10'
                        }`}>
                          {profile.badge}
                        </span>
                        <span className="text-[10px] text-[#6A6A80] font-medium ml-auto">
                          {profile.items.length} medicamento(s)
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-white' : 'text-[#C5C5D8]'
                      }`}>
                        {profile.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7A90] line-clamp-1 mt-0.5">
                        {profile.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mt-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProfile(profile.id, e)}
                        className="p-1 rounded-lg text-[#6A6A80] hover:text-red-400 hover:bg-red-500/15 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                        title={`Excluir o protocolo "${profile.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-mecura-neon translate-x-0.5' : 'text-[#505068]'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Profile Full Preview & Action Buttons (md:col-span-7) */}
            <div className="md:col-span-7 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between max-h-[58vh] md:max-h-full bg-[#0D0D15]">
              {activeProfile ? (
                <div className="space-y-4">
                  {/* Profile Header with Circled Actions (Adicionar Medicamento, Excluir Protocolo, Salvar Protocolo) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon">
                          {activeProfile.badge}
                        </span>
                        <span className="text-xs text-[#8A8A9E] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-mecura-neon" /> Prescrição Rápida Pronta
                        </span>
                      </div>

                      {/* AREA CIRCULADA EM AZUL: BOTOES ADICIONAR, EXCLUIR E SALVAR O PROTOCOLO */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Botão 1: Adicionar Medicamento */}
                        <button
                          type="button"
                          onClick={handleOpenAddMedicationModal}
                          className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-400/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="Adicionar um novo medicamento a este protocolo"
                        >
                          <Plus className="w-3.5 h-3.5 text-purple-300" />
                          <span>+ Medicamento</span>
                        </button>

                        {/* Botão 2: Salvar Protocolo */}
                        <button
                          type="button"
                          onClick={() => handleSaveAllProfiles(profiles, activeProfile.name)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/45 text-emerald-300 hover:text-white border border-emerald-400/50 text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95"
                          title="Salvar todas as alterações feitas neste protocolo para mantê-lo programado"
                        >
                          <Save className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Salvar Protocolo</span>
                        </button>

                        {/* Botão: Salvar como Meu Modelo Padrão */}
                        <button
                          type="button"
                          onClick={handleSaveActiveAsDoctorModel}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="Salvar este protocolo como seu Modelo Salvo Padrão Permanente"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>⭐ Meu Modelo</span>
                        </button>

                        {/* Botão 3: Excluir Protocolo */}
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(activeProfile.id)}
                          className="px-2 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                          title="Excluir este protocolo programado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>

                        {/* Botão Editar Detalhes */}
                        <button
                          type="button"
                          onClick={handleOpenEditProtocolModal}
                          className="p-1 rounded-lg text-[#8A8A9E] hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar nome ou orientações do protocolo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-between">
                      <span>{activeProfile.name}</span>
                    </h3>
                    <p className="text-xs text-[#9E9EB5] leading-relaxed mt-1">
                      {activeProfile.description}
                    </p>
                  </div>

                  {/* Target patient destination indicator */}
                  {selectedPatient && (
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200">
                          Destinatário da Prescrição: <strong className="text-white">{selectedPatient.name}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                        Pronto para Emissão
                      </span>
                    </div>
                  )}

                  {/* Medicines List Preview with Edit & Delete for each medicine */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-mecura-neon" /> Medicamentos Programados ({activeProfile.items.length})
                      </h5>
                      
                      {/* Botão Adicionar Medicamento Inline */}
                      <button
                        type="button"
                        onClick={handleOpenAddMedicationModal}
                        className="text-xs text-mecura-neon hover:text-[#b5ff33] font-bold flex items-center gap-1 transition-all cursor-pointer hover:underline"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Adicionar Medicamento</span>
                      </button>
                    </div>

                    {activeProfile.items.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-white/15 text-center space-y-2">
                        <p className="text-xs text-[#8A8A9E]">Nenhum medicamento adicionado a este protocolo ainda.</p>
                        <button
                          type="button"
                          onClick={handleOpenAddMedicationModal}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Medicamento Agora
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {activeProfile.items.map((item, idx) => {
                          const enrichedItem = enrichMedicationDetails(item.name || '', item.brand, item.origin, item.type);
                          const displayActivePrinciple = item.activeIngredients || enrichedItem.activeIngredients || 'Canabidiol (CBD) Full Spectrum';
                          const displayConcentration = item.concentration || enrichedItem.concentration || '100 mg/mL (3.000 mg)';
                          const displayForm = item.pharmaceuticalForm || enrichedItem.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)';
                          const displayRoute = item.administrationRoute || enrichedItem.administrationRoute || 'Via Sublingual / Oral';
                          const displayQuantity = item.quantity || enrichedItem.quantity || '01 Frasco de 30 mL';

                          return (
                            <div 
                              key={`item-${idx}`}
                              className="p-3.5 rounded-2xl bg-[#131320] border border-white/10 hover:border-mecura-neon/30 transition-all space-y-2.5 group relative"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                      item.origin === 'Importado'
                                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    }`}>
                                      {item.origin === 'Importado' ? '🌐 Importado' : '🇧🇷 Nacional'}
                                    </span>
                                    <span className="text-[10px] text-[#A2A2BC] font-semibold">
                                      {item.brand || enrichedItem.brand || 'Associação'}
                                    </span>
                                  </div>
                                  <h6 className="text-xs sm:text-sm font-bold text-white mt-1">
                                    {item.name}
                                  </h6>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[11px] font-bold text-purple-200 bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 rounded-lg">
                                    Qtd: {displayQuantity}
                                  </span>

                                  {/* BOTAO EDITAR MEDICAMENTO INDIVIDUAL */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditMedicationModal(idx, e)}
                                    className="p-1.5 rounded-lg text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 transition-colors cursor-pointer"
                                    title="Editar Princípio Ativo, Via, Forma Farmacêutica, Quantidade e Posologia"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* BOTAO EXCLUIR MEDICAMENTO INDIVIDUAL */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMedication(idx, e)}
                                    className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                                    title="Remover este medicamento do protocolo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-[11px] text-[#B8B8CC] bg-black/40 p-3 rounded-xl border border-white/10 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                                      Princípio Ativo
                                    </span>
                                    <span className="text-white font-semibold">{displayActivePrinciple}</span>
                                  </div>
                                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 block">
                                      Concentração
                                    </span>
                                    <span className="text-white font-semibold">{displayConcentration}</span>
                                  </div>
                                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 block">
                                      Forma Farmacêutica
                                    </span>
                                    <span className="text-white font-semibold">{displayForm}</span>
                                  </div>
                                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                                      Via de Administração & Quantidade
                                    </span>
                                    <span className="text-white font-semibold">{displayRoute} • {displayQuantity}</span>
                                  </div>
                                </div>

                                <div className="pt-1.5 border-t border-white/10">
                                  <span className="font-bold text-mecura-neon block mb-0.5">Posologia Recomendada:</span>
                                  {Array.isArray(item.dosage) ? (
                                    <ul className="list-disc pl-4 space-y-0.5 text-[#D0D0E5]">
                                      {item.dosage.map((step, sIdx) => (
                                        <li key={`step-${sIdx}`}>{step}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-[#D0D0E5]">{item.dosage}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {activeProfile.defaultNotes && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-[#8A8A9E] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-blue-400" /> Orientações Farmacológicas Inclusas:
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenEditProtocolModal}
                          className="text-[10px] text-purple-300 hover:underline"
                        >
                          Editar Orientações
                        </button>
                      </div>
                      <p className="whitespace-pre-line text-[#9A9AB0] font-sans">
                        {activeProfile.defaultNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Bottom Actions with Direct 1-Click Issuance & Editor Application */}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {onDirectEmitPDF && (
                    <button
                      type="button"
                      disabled={isEmittingDirect}
                      onClick={handleDirectEmit}
                      className="w-full sm:w-1/2 py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95 disabled:opacity-50"
                      title="Emite a receita oficial diretamente para o perfil do paciente e faz download do PDF"
                    >
                      <Download className={`w-4 h-4 ${isEmittingDirect ? 'animate-bounce' : ''}`} />
                      <span>{isEmittingDirect ? 'Emitindo Receita...' : `⚡ Emitir Receita Direto (${selectedPatient?.name ? selectedPatient.name.split(' ')[0] : 'PDF'})`}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleApply('replace')}
                    className={`w-full ${onDirectEmitPDF ? 'sm:w-1/2' : 'sm:w-full'} py-3 px-3 rounded-xl bg-gradient-to-r from-mecura-neon to-emerald-400 hover:brightness-110 text-black text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(166,255,0,0.35)] active:scale-95`}
                    title="Substitui os medicamentos da receita por este protocolo programado e abre o editor para ajustes"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Aplicar & Abrir no Editor</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-xs font-semibold text-[#8A8A9E] hover:text-white transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApply('append')}
                    className="px-3 py-2 text-xs font-semibold text-mecura-neon hover:underline transition-all flex items-center gap-1 cursor-pointer"
                    title="Mantém os medicamentos atuais da receita e adiciona estes do perfil"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar à receita existente sem substituir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal / Popup: Adicionar ou Editar Medicamento ao Protocolo */}
          {showAddMedicationModal && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
              <div className="w-full max-w-2xl bg-[#12121E] border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {editingMedIndex !== null ? 'Editar Medicamento do Protocolo' : 'Adicionar Medicamento ao Protocolo'}
                      </h4>
                      <p className="text-xs text-purple-300 font-medium">Vinculando a: {activeProfile?.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAddMedicationModal(false);
                      setEditingMedIndex(null);
                    }}
                    className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs: Escolher do Catálogo vs Digitar Manualmente */}
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 gap-1">
                  <button
                    type="button"
                    onClick={() => setMedAddTab('catalog')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      medAddTab === 'catalog'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-[#8A8A9E] hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar no Catálogo MeCura (Associações & Importados)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedAddTab('manual')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      medAddTab === 'manual'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-[#8A8A9E] hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Personalizado / Manual (Dados Completos)</span>
                  </button>
                </div>

                {medAddTab === 'catalog' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#8A8A9E] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={catalogSearchTerm}
                        onChange={(e) => setCatalogSearchTerm(e.target.value)}
                        placeholder="Buscar por nome, princípio ativo, via ou forma (ex: Óleo CBD, Pangaia, Flowermed, Flores 14g, SouCannabis, ABRACE, CBN)..."
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#666680] focus:outline-none focus:border-purple-400"
                        autoFocus
                      />
                    </div>

                    {/* Filter Pills: Importados vs Nacionais vs Marcas */}
                    <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5 scrollbar-none">
                      {[
                        { id: 'all', label: `Todos (${allCatalogProducts.length})` },
                        { id: 'importados', label: `🌐 Medicamentos Importados (${importedCatalogCount})` },
                        { id: 'nacionais', label: `🇧🇷 Medicamentos Nacionais (${nationalCatalogCount})` },
                        { id: 'pangaia', label: '🌐 Pangaia Biopharma (EUA)' },
                        { id: 'flowermed', label: '🌐 Flowermed EUA' },
                        { id: 'greenbudz', label: '🌿 GreenBudz CBD (EUA)' },
                        { id: 'flores', label: '🌿 Flores In Natura (14g)' },
                        { id: 'soucannabis', label: '🌱 SouCannabis Nacional' },
                        { id: 'abrace', label: '🌿 ABRACE Esperança' },
                        { id: 'abecmed', label: '🟠 ABECMED Nacional' },
                        ...productCategories
                          .filter(c => c.id.startsWith('brand_'))
                          .map(c => ({
                            id: c.id,
                            label: `🏷️ ${(((c as any).name || c.title || '') as string).split('(')[0].trim()} (${(c.products || []).length})`
                          }))
                      ].map((f, fIdx) => (
                        <button
                          key={`cat-filter-${f.id}-${fIdx}`}
                          type="button"
                          onClick={() => setCatalogOriginFilter(f.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            catalogOriginFilter === f.id
                              ? f.id === 'importados' || f.id === 'pangaia' || f.id === 'flowermed' || f.id === 'greenbudz' || f.id === 'flores'
                                ? 'bg-sky-500 text-black shadow-md shadow-sky-500/30'
                                : f.id === 'nacionais' || f.id === 'soucannabis' || f.id === 'abrace' || f.id === 'abecmed' || f.id.startsWith('brand_')
                                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                                  : 'bg-purple-600 text-white shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-[#8A8A9E] hover:text-white border border-white/5'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredCatalogProducts.length === 0 ? (
                        <div className="text-center py-8 text-[#8A8A9E] text-xs">
                          Nenhum medicamento encontrado para esta busca ou filtro.
                        </div>
                      ) : (
                        filteredCatalogProducts.map((prod, idx) => {
                          const isImported = prod.origin === 'Importado';
                          return (
                            <div
                              key={`cat-${idx}`}
                              onClick={() => handleSelectCatalogProduct(prod)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 group ${
                                isImported
                                  ? 'bg-sky-950/20 hover:bg-sky-900/30 border-sky-500/20 hover:border-sky-400/50'
                                  : 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-500/20 hover:border-emerald-400/50'
                              }`}
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                    isImported 
                                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' 
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                  }`}>
                                    {isImported ? '🌐 IMPORTADO (EUA • RDC 660)' : '🇧🇷 NACIONAL (Associação)'}
                                  </span>
                                  <span className="text-[10px] text-[#A2A2BC] font-medium">
                                    {prod.manufacturer || prod.brand || 'Associação'}
                                  </span>
                                  {prod.priceBRL ? (
                                    <span className="text-[10px] text-amber-300/80 font-mono">
                                      • R$ {prod.priceBRL}
                                    </span>
                                  ) : prod.priceUSD ? (
                                    <span className="text-[10px] text-emerald-300/80 font-mono">
                                      • US$ {prod.priceUSD}
                                    </span>
                                  ) : null}
                                </div>
                                <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors mt-0.5">
                                  {prod.name}
                                </h5>
                                <div className="text-[11px] text-[#B8B8CE] space-y-0.5">
                                  <p className="truncate">
                                    <strong className="text-emerald-300">Princípio Ativo:</strong> {prod.activeIngredients}
                                  </p>
                                  <p className="truncate">
                                    <strong className="text-purple-300">Concentração:</strong> {prod.concentration}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-sky-300 font-semibold">
                                    Forma: {prod.pharmaceuticalForm}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-semibold">
                                    Via: {prod.administrationRoute}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-200 font-semibold">
                                    Qtd: {prod.quantity}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm self-center ${
                                  isImported
                                    ? 'bg-sky-500 text-black hover:bg-sky-400'
                                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Selecionar
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {medAddTab === 'manual' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-[#A2A2BC]">Nome do Medicamento *</label>
                          <button
                            type="button"
                            onClick={() => handleAutoFillFromMedicationName()}
                            className="text-[10px] font-bold text-mecura-neon hover:underline flex items-center gap-1 cursor-pointer"
                            title="Preencher Princípio Ativo, Concentração, Forma, Via e Quantidade automaticamente com base no nome"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-preencher dados
                          </button>
                        </div>
                        <input
                          type="text"
                          value={medName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMedName(val);
                            const exactMatch = allCatalogProducts.find(
                              p => p.name.trim().toLowerCase() === val.trim().toLowerCase()
                            );
                            if (exactMatch) {
                              handleAutoFillFromMedicationName(exactMatch.name);
                            }
                          }}
                          placeholder="Ex: Broad SPECTRUM CBD, CBN 1065mg"
                          className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Marca ou Associação *</label>
                        <input
                          type="text"
                          list="protocol-med-brands"
                          value={medBrand}
                          onChange={(e) => setMedBrand(e.target.value)}
                          placeholder="Ex: Associação Nacional / SouCannabis / ABRACE / Pangaia / Flowermed"
                          className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-purple-400"
                        />
                        <datalist id="protocol-med-brands">
                          <option value="Associação Nacional (Brasil)" />
                          <option value="Associação Brasileira (Nacional)" />
                          <option value="SouCannabis (Associação Nacional)" />
                          <option value="ABRACE Esperança (Associação Nacional)" />
                          <option value="ABECMED (Associação Brasileira)" />
                          <option value="Pangaia Biopharma (EUA)" />
                          <option value="Flowermed (EUA)" />
                          <option value="GreenBudzCBD (EUA)" />
                        </datalist>
                      </div>
                    </div>

                    {/* Princípio Ativo (Destaque Completo) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <span>Princípio Ativo (Composição / Fitocanabinoides) *</span>
                        </label>
                        <span className="text-[10px] text-[#8A8A9E]">Exibido na receita e no protocolo</span>
                      </div>
                      <input
                        type="text"
                        list="protocol-med-active-principles"
                        value={medActiveIngredients}
                        onChange={(e) => setMedActiveIngredients(e.target.value)}
                        placeholder="Ex: Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg (0% THC)"
                        className="w-full bg-[#0A0A12] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-emerald-400"
                      />
                      <datalist id="protocol-med-active-principles">
                        <option value="Canabidiol (CBD) Full Spectrum + Fitocanabinoides Menores (< 0,3% THC)" />
                        <option value="Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) — Total 1.065 mg (0% THC)" />
                        <option value="Canabidiol (CBD) Broad Spectrum (0,0% THC) enriquecido com Terpenos" />
                        <option value="Canabidiol (CBD) Isolado Puro (>99,8% de pureza — 0,0% THC)" />
                        <option value="Extrato Equilibrado de Cannabis Sativa: Canabidiol (CBD) + Delta-9-THC (Proporção 1:1)" />
                        <option value="Canabidiol (CBD) + Canabinol (CBN) Full Spectrum (Proporção 2:1)" />
                        <option value="Canabidiol (CBD) + Canabigerol (CBG) Full Spectrum (Proporção 2:1)" />
                        <option value="Canabidiol (CBD) + Canabigerol (CBG) + Canabinol (CBN) Full Spectrum (4:1:1)" />
                        <option value="Tetrahidrocanabinol (Delta-9-THC) Full Spectrum + Canabidiol (CBD) (10:1)" />
                        <option value="Inflorescências de Cannabis Sativa L. ricas em Canabidiol (CBD) + Terpenos" />
                        <option value="Canabinoides Totais em Base Dermatológica Transdérmica com Arnica e Copaíba" />
                      </datalist>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Origem *</label>
                        <select
                          value={medOrigin}
                          onChange={(e) => setMedOrigin(e.target.value as any)}
                          className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="Nacional">🇧🇷 Nacional (Associação)</option>
                          <option value="Importado">🌐 Importado (RDC 660)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-purple-300 block mb-1">Concentração *</label>
                        <input
                          type="text"
                          list="protocol-med-concentrations"
                          value={medConcentration}
                          onChange={(e) => setMedConcentration(e.target.value)}
                          placeholder="Ex: 100 mg/mL (3.000 mg) • Frasco 30 mL"
                          className="w-full bg-[#0A0A12] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-purple-400"
                        />
                        <datalist id="protocol-med-concentrations">
                          <option value="100 mg/mL (Total 3.000 mg de CBD) • Frasco de 30 mL" />
                          <option value="60 mg/mL (Total 1.800 mg) • Frasco de 30 mL" />
                          <option value="50 mg/mL (Total 1.500 mg) • Frasco de 30 mL" />
                          <option value="30 mg/mL (Total 900 mg) • Frasco de 30 mL" />
                          <option value="200 mg/mL (Total 6.000 mg de CBD) • Frasco de 30 mL" />
                          <option value="CBD + CBN 1.065 mg (71 mg/mL) • Frasco de 15 mL" />
                          <option value="25 mg de CBD Full Spectrum por goma (Pote com 28 a 30 gomas)" />
                          <option value="50 mg de CBD por cápsula (Frasco com 30 cápsulas — 1.500 mg)" />
                          <option value="500 mg de Fitocanabinoides em 50 g" />
                        </datalist>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-amber-300 block mb-1">Quantidade *</label>
                        <input
                          type="text"
                          list="protocol-med-quantities"
                          value={medQuantity}
                          onChange={(e) => setMedQuantity(e.target.value)}
                          placeholder="Ex: 01 Frasco de 30 mL"
                          className="w-full bg-[#0A0A12] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-amber-400"
                        />
                        <datalist id="protocol-med-quantities">
                          <option value="01 Frasco de 30 mL" />
                          <option value="02 Frascos de 30 mL" />
                          <option value="03 Frascos de 30 mL" />
                          <option value="01 Frasco de 15 mL" />
                          <option value="02 Frascos de 15 mL" />
                          <option value="01 Pote com 30 Gomas" />
                          <option value="01 Frasco com 28 Gomas" />
                          <option value="01 Frasco com 30 Cápsulas" />
                          <option value="01 Pote de 50 g" />
                          <option value="01 Frasco de 100 mL com bomba dosadora" />
                          <option value="01 Pacote Selado de 14 gramas" />
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-sky-300 block mb-1">Forma Farmacêutica *</label>
                        <input
                          type="text"
                          list="protocol-med-forms"
                          value={medForm}
                          onChange={(e) => setMedForm(e.target.value)}
                          placeholder="Ex: Solução Oleosa Sublingual (Gotas)"
                          className="w-full bg-[#0A0A12] border border-sky-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-sky-400"
                        />
                        <datalist id="protocol-med-forms">
                          <option value="Solução Oleosa Sublingual (Gotas)" />
                          <option value="Gomas Mastigáveis Veganas (Gummies)" />
                          <option value="Cápsulas Gelatinosas Orais (Softgels)" />
                          <option value="Pomada Dérmica Tópica" />
                          <option value="Creme Dérmico Tópico Analgésico" />
                          <option value="Spray Sublingual / Nasal Transmucoso" />
                          <option value="Flores in natura secas para inalação vaporizada" />
                          <option value="Adesivo Transdérmico de Liberação Lenta (Patch)" />
                          <option value="Extrato Concentrado em Seringa Dosadora" />
                        </datalist>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-sky-300 block mb-1">Via de Administração *</label>
                        <input
                          type="text"
                          list="protocol-med-routes"
                          value={medRoute}
                          onChange={(e) => setMedRoute(e.target.value)}
                          placeholder="Ex: Via Sublingual / Oral"
                          className="w-full bg-[#0A0A12] border border-sky-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-sky-400"
                        />
                        <datalist id="protocol-med-routes">
                          <option value="Via Sublingual / Oral" />
                          <option value="Via Sublingual" />
                          <option value="Via Sublingual Diurna" />
                          <option value="Via Sublingual Noturna" />
                          <option value="Via Sublingual de 12 em 12 horas" />
                          <option value="Via Oral Mastigável" />
                          <option value="Via Oral" />
                          <option value="Uso Tópico / Dermatológico" />
                          <option value="Via Inalatória (Vaporização Medicinal)" />
                          <option value="Via Transdérmica (Cutânea)" />
                          <option value="Via Nasal Transmucosa" />
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">
                        Posologia Recomendada / Modo de Uso (uma instrução por linha) *
                      </label>
                      <textarea
                        value={medDosageLines}
                        onChange={(e) => setMedDosageLines(e.target.value)}
                        rows={4}
                        placeholder="1º ao 5º dia: Iniciar com 03 gotas pela manhã e 03 gotas à noite.&#10;Manutenção: Titular gradativamente até controle dos sintomas."
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMedicationModal(false);
                      setEditingMedIndex(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddMedication}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingMedIndex !== null ? 'Atualizar no Protocolo' : 'Salvar no Protocolo'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Criar Novo Protocolo */}
          {showNewProtocolModal && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
              <div className="w-full max-w-xl bg-[#12121E] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Criar Novo Protocolo de Receita</h4>
                      <p className="text-xs text-emerald-300 font-medium">Cadastre um perfil padronizado personalizado</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowNewProtocolModal(false)}
                    className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Nome do Protocolo *</label>
                    <input
                      type="text"
                      value={newProtocolName}
                      onChange={(e) => setNewProtocolName(e.target.value)}
                      placeholder="Ex: Autismo / Foco & Calma, Epilepsia, Fibromialgia Intensa..."
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-emerald-400"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Categoria / Tag</label>
                      <select
                        value={newProtocolTag}
                        onChange={(e) => setNewProtocolTag(e.target.value as any)}
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="ansiedade">🧠 Ansiedade</option>
                        <option value="insonia">🌙 Insônia</option>
                        <option value="depressao">☀️ Depressão</option>
                        <option value="combinado">✨ Ansiedade + Insônia</option>
                        <option value="dor">🩸 Dor Crônica</option>
                        <option value="custom">⚡ Personalizado / Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Etiqueta (Badge)</label>
                      <input
                        type="text"
                        value={newProtocolBadge}
                        onChange={(e) => setNewProtocolBadge(e.target.value)}
                        placeholder="Ex: Autismo / TEA"
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Descrição Clínica</label>
                    <textarea
                      value={newProtocolDescription}
                      onChange={(e) => setNewProtocolDescription(e.target.value)}
                      rows={2}
                      placeholder="Ex: Protocolo direcionado para modulação comportamental, melhora da atenção e redução de estereotipias."
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#55556A] focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Orientações Farmacológicas Iniciais (Notas da Receita)</label>
                    <textarea
                      value={newProtocolNotes}
                      onChange={(e) => setNewProtocolNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-xs text-white font-sans focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowNewProtocolModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCreateProtocol}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Criar e Salvar Protocolo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Editar Detalhes do Protocolo */}
          {showEditProtocolModal && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
              <div className="w-full max-w-xl bg-[#12121E] border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Editar Dados do Protocolo</h4>
                      <p className="text-xs text-purple-300 font-medium">Modifique o título, descrição ou orientações</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEditProtocolModal(false)}
                    className="p-1.5 rounded-lg text-[#8A8A9E] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Nome do Protocolo</label>
                    <input
                      type="text"
                      value={newProtocolName}
                      onChange={(e) => setNewProtocolName(e.target.value)}
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Categoria / Tag</label>
                      <select
                        value={newProtocolTag}
                        onChange={(e) => setNewProtocolTag(e.target.value as any)}
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="ansiedade">🧠 Ansiedade</option>
                        <option value="insonia">🌙 Insônia</option>
                        <option value="depressao">☀️ Depressão</option>
                        <option value="combinado">✨ Ansiedade + Insônia</option>
                        <option value="dor">🩸 Dor Crônica</option>
                        <option value="custom">⚡ Personalizado / Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Etiqueta (Badge)</label>
                      <input
                        type="text"
                        value={newProtocolBadge}
                        onChange={(e) => setNewProtocolBadge(e.target.value)}
                        className="w-full bg-[#0A0A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Descrição Clínica</label>
                    <textarea
                      value={newProtocolDescription}
                      onChange={(e) => setNewProtocolDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A2A2BC] block mb-1">Orientações Farmacológicas (Notas da Receita)</label>
                    <textarea
                      value={newProtocolNotes}
                      onChange={(e) => setNewProtocolNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-xs text-white font-sans focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowEditProtocolModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEditProtocol}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom In-App Confirmation Modal (100% reliable, never blocked by iframe) */}
          {confirmDialog && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-md bg-[#161426] border border-red-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{confirmDialog.title}</h4>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Confirmação de Exclusão</span>
                  </div>
                </div>

                <p className="text-xs text-[#A2A2BC] leading-relaxed">
                  {confirmDialog.message}
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDialog.onConfirm}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmDialog.confirmLabel || 'Confirmar Exclusão'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A28] border border-mecura-neon/50 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}
