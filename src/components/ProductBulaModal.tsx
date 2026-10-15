import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Info, 
  ShieldCheck, 
  Activity, 
  Pill, 
  Beaker, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Edit3, 
  Copy, 
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';
import { CBDProduct, enrichMedicationDetails } from '../data/cbdGuide';
import { markProductAsDeleted } from '../utils/productCatalog';
import { useAdminStore } from '../store/useAdminStore';

interface ExtendedCBDProduct extends CBDProduct {
  categoryId?: string;
  categoryName?: string;
  categoryIndications?: string[];
}

interface ProductBulaModalProps {
  product: ExtendedCBDProduct | null;
  onClose: () => void;
  exchangeRate: number;
  onSave?: (savedData: any) => void;
  onDelete?: (productName: string, categoryId?: string) => void;
}

interface BulaFormData {
  name: string;
  type: string;
  origin: string;
  manufacturer: string;
  activeIngredients: string;
  ratio: string;
  anvisaRdc: string;
  gmpCertified: boolean;
  hplcStandardized: boolean;
  categoryName: string;

  pharmaceuticalForm: string;
  administrationRoute: string;
  quantity: string;
  carrierVehicle: string;
  dropsPerMl: string;
  mgPerDropCBD: string;
  mgPerDropTHC: string;
  mgPerDropDelta8: string;
  priceBRL: string;
  priceUSD: string;

  description: string;
  indications: string;
  mechanismOfAction: string;
  technicalDetails: string;

  posologyDetails: string;
  titrationRule: string;

  prescriptionExample: string;

  contraindications: string;
  adverseEffects: string;
  generalContraindications: string;
  drugInteractions: string;

  conservationNotes: string;
  doctorNotes: string;
}

export function ProductBulaModal({ product, onClose, exchangeRate, onSave, onDelete }: ProductBulaModalProps) {
  if (!product) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const getStorageKey = (prod: any) => {
    const rawId = prod?.id || prod?.name || 'unknown_product';
    return `mecura_bula_custom_${String(rawId).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  };

  const currentStorageKey = getStorageKey(product);

  const getInitialDefaults = (): BulaFormData => {
    const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type, product);
    const anyProd = product as any;

    let defaultRatio = anyProd.ratio || '';
    if (!defaultRatio && (product.name.toLowerCase().includes('pangaia') || (product.manufacturer || '').toLowerCase().includes('pangaia'))) {
      defaultRatio = 'CBD Rico / THC < 0,2%';
    }

    return {
      name: product.name || '',
      type: product.type || '',
      origin: product.origin || 'Importado',
      manufacturer: product.manufacturer || '',
      activeIngredients: product.activeIngredients || enriched.activeIngredients || '',
      ratio: defaultRatio || 'CBD Rico / THC < 0,2%',
      anvisaRdc: anyProd.anvisaRdc || 'RDC 660/2022',
      gmpCertified: !!anyProd.gmpCertified,
      hplcStandardized: !!anyProd.hplcStandardized,
      categoryName: product.categoryName || '',

      pharmaceuticalForm: enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual',
      administrationRoute: enriched.administrationRoute || 'Sublingual / Oral',
      quantity: enriched.quantity || '30 mL (~600 gotas)',
      carrierVehicle: anyProd.carrierVehicle || 'Óleo MCT (Triglicerídeos de Cadeia Média de Coco)',
      dropsPerMl: anyProd.dropsPerMl !== undefined ? String(anyProd.dropsPerMl) : '20',
      mgPerDropCBD: anyProd.mgPerDropCBD !== undefined ? String(anyProd.mgPerDropCBD) : '',
      mgPerDropTHC: anyProd.mgPerDropTHC !== undefined ? String(anyProd.mgPerDropTHC) : '',
      mgPerDropDelta8: anyProd.mgPerDropDelta8 !== undefined ? String(anyProd.mgPerDropDelta8) : '',
      priceBRL: product.priceBRL !== undefined ? String(product.priceBRL) : '',
      priceUSD: product.priceUSD !== undefined ? String(product.priceUSD) : '',

      description: product.description || '',
      indications: product.indications || (product.categoryIndications ? product.categoryIndications.join(', ') : ''),
      mechanismOfAction: anyProd.mechanismOfAction || 'Ativação e modulação dos receptores canabinoides CB1 e CB2 no Sistema Endocanabinoide (SEC), modulação alostérica de receptores serotoninérgicos (5-HT1A) e dessensibilização de canais TRPV1.',
      technicalDetails: Array.isArray(product.details) ? product.details.join('\n') : '',

      posologyDetails: anyProd.posologyDetails || anyProd.usageInstructions || enriched.usageInstructions || 'Iniciar com 2 a 3 gotas por via sublingual a cada 12 horas. Manter sob a língua por 60 a 90 segundos antes da deglutição. Titular conforme orientação médica a cada 3-5 dias.',
      titrationRule: '"Start Low, Go Slow" (titulação gradual a cada 3 a 5 dias conforme resposta clínica e tolerabilidade)',

      prescriptionExample: anyProd.prescriptionExample || `${product.name} — ${enriched.quantity || '01 Frasco'}\nUso: ${anyProd.posologyDetails || anyProd.usageInstructions || enriched.usageInstructions || 'Uso contínuo conforme protocolo médico.'}`,

      contraindications: anyProd.contraindications || 'Hipersensibilidade conhecida aos canabinoides ou ao veículo carreador.',
      adverseEffects: anyProd.adverseEffects || 'Sonolência leve, xerostomia (boca seca), alterações no apetite ou fadiga inicial (efeitos transitórios e dose-dependentes).',
      generalContraindications: 'Hipersensibilidade aos componentes da fórmula.\nCautela em pacientes com histórico pessoal de psicose ou esquizofrenia (especialmente formulações com THC).\nAvaliação criteriosa de risco-benefício em gestantes e lactantes.',
      drugInteractions: 'Os canabinoides podem inibir ou induzir isoenzimas do Citocromo P450 (CYP3A4, CYP2C19). Recomenda-se cautela e monitoramento em pacientes em uso concomitante de clobazam, varfarina, antiepilépticos ou imunossupressores.',

      conservationNotes: 'Conservar em temperatura ambiente (15°C a 30°C), protegido da luz solar direta, calor e umidade excessiva. Manter o frasco bem fechado na embalagem original.',
      doctorNotes: ''
    };
  };

  const [formData, setFormData] = React.useState<BulaFormData>(() => {
    try {
      const saved = localStorage.getItem(currentStorageKey);
      if (saved) {
        return { ...getInitialDefaults(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados salvos da bula:', e);
    }
    return getInitialDefaults();
  });

  const [hasSavedCustom, setHasSavedCustom] = React.useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(currentStorageKey));
    } catch {
      return false;
    }
  });

  const [isDirty, setIsDirty] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [copiedPrescription, setCopiedPrescription] = React.useState(false);

  // Sync state whenever selected product changes
  React.useEffect(() => {
    const key = getStorageKey(product);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setFormData({ ...getInitialDefaults(), ...JSON.parse(saved) });
        setHasSavedCustom(true);
      } else {
        setFormData(getInitialDefaults());
        setHasSavedCustom(false);
      }
    } catch {
      setFormData(getInitialDefaults());
      setHasSavedCustom(false);
    }
    setIsDirty(false);
    setToastMessage(null);
  }, [product.name, (product as any).id]);

  const handleChange = (field: keyof BulaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(formData));
      if (formData.name && formData.name.trim() !== product.name.trim()) {
        const newKey = getStorageKey({ name: formData.name.trim() });
        localStorage.setItem(newKey, JSON.stringify(formData));
      }
      setHasSavedCustom(true);
      setIsDirty(false);

      // Persist directly into useAdminStore
      const catId = (product as any)?.categoryId || 'all';
      try {
        useAdminStore.getState().updateProduct(catId, product.name, {
          name: formData.name.trim(),
          manufacturer: formData.manufacturer.trim(),
          origin: formData.origin,
          type: formData.type,
          concentration: formData.activeIngredients,
          activeIngredients: formData.activeIngredients,
          pharmaceuticalForm: formData.pharmaceuticalForm,
          quantity: formData.quantity,
          administrationRoute: formData.administrationRoute,
          indications: formData.indications,
          usageInstructions: formData.posologyDetails,
          description: formData.description,
          priceBRL: formData.priceBRL ? Number(String(formData.priceBRL).replace(/[^0-9.]/g, '')) : undefined,
          priceUSD: formData.priceUSD ? Number(String(formData.priceUSD).replace(/[^0-9.]/g, '')) : undefined,
          details: [
            formData.activeIngredients,
            formData.pharmaceuticalForm,
            formData.quantity,
            formData.administrationRoute,
            formData.carrierVehicle
          ].filter(Boolean)
        });
      } catch (storeErr) {
        console.warn("Could not direct update product in admin store:", storeErr);
      }

      showToast('Alterações da Bula e Doses salvas com sucesso! Ao sair e voltar, os dados permanecerão gravados.');
      if (onSave) {
        onSave(formData);
      }
    } catch (e) {
      console.error('Falha ao salvar bula:', e);
      showToast('Erro ao salvar no armazenamento local.');
    }
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem(currentStorageKey);
      const defaults = getInitialDefaults();
      setFormData(defaults);
      setHasSavedCustom(false);
      setIsDirty(false);
      showToast('Bula restaurada para as especificações originais de catálogo.');
    } catch (e) {
      console.error('Falha ao resetar bula:', e);
    }
  };

  const handleConfirmDelete = () => {
    try {
      const prodName = formData.name || product.name;
      markProductAsDeleted(prodName);
      const catId = (product as any)?.categoryId;
      try {
        useAdminStore.getState().deleteProduct(catId || 'all', prodName);
      } catch (err) {
        console.warn("Could not delete from admin store:", err);
      }
      if (onDelete) {
        onDelete(prodName, catId);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch (e) {
      console.error('Falha ao excluir produto:', e);
      showToast('Erro ao excluir medicamento.');
    }
  };

  const handleCopyPrescription = () => {
    const textToCopy = formData.prescriptionExample.trim() || `${formData.name} — ${formData.quantity || '01 Frasco'}\nUso: ${formData.posologyDetails}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrescription(true);
    setTimeout(() => setCopiedPrescription(false), 2500);
  };

  const handleSyncPrescriptionFromPosology = () => {
    const updated = `${formData.name} — ${formData.quantity || '01 Frasco'}\nUso: ${formData.posologyDetails}`;
    setFormData(prev => ({ ...prev, prescriptionExample: updated }));
    setIsDirty(true);
    showToast('Modelo de receita atualizado com a posologia editada.');
  };

  const handleAppendPosology = (snippet: string) => {
    setFormData(prev => ({
      ...prev,
      posologyDetails: prev.posologyDetails ? `${prev.posologyDetails}\n${snippet}` : snippet
    }));
    setIsDirty(true);
  };

  const isImportado = (formData.origin || '').toLowerCase().includes('importado');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="bg-mecura-surface border border-mecura-elevated w-full max-w-5xl rounded-2xl shadow-2xl relative my-auto max-h-[94vh] flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-[#0A0A0F]/95 backdrop-blur-md rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 shrink-0">
                <FileText className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                    Bula do Medicamento & Guia Clínico
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Edit3 className="w-3 h-3" />
                    Edição Liberada
                  </span>
                </div>
                <p className="text-xs text-mecura-silver flex items-center gap-2 mt-0.5">
                  <span>Ficha Farmacêutica para Prescrição Médica</span>
                  {hasSavedCustom && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      • <CheckCircle2 className="w-3 h-3 inline" /> Salvo no Navegador
                    </span>
                  )}
                  {isDirty && (
                    <span className="text-amber-400 font-semibold">• Alterações não salvas</span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPrescription}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  copiedPrescription 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
                title="Copiar texto atual da receita"
              >
                <Sparkles className="w-3.5 h-3.5 text-mecura-neon" />
                <span className="hidden sm:inline">{copiedPrescription ? 'Receita Copiada!' : 'Copiar Prescrição'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Excluir este medicamento do catálogo"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Excluir Medicamento</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                title="Salvar alterações no banco local do médico"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                aria-label="Fechar bula"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-white/10 rounded text-emerald-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Helper Banner for Doctor Editing */}
          <div className="px-4 sm:px-6 pt-3">
            <div className="p-3 bg-[#0D0E15] border border-mecura-neon/20 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-mecura-neon shrink-0" />
                <span className="text-mecura-pearl">
                  <strong>Área do Médico:</strong> Todos os campos abaixo são editáveis. Ajuste dosagens, adicione orientações personalizadas e clique em <strong>Salvar Alterações</strong> para que fiquem gravadas mesmo ao fechar e reabrir.
                </span>
              </div>
              {hasSavedCustom && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1 text-[11px] font-semibold text-mecura-silver hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-white/10 shrink-0 flex items-center gap-1"
                  title="Descartar personalizações e voltar à bula padrão de fábrica"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restaurar Padrão
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            
            {/* 1. Identificação do Medicamento */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-mecura-neon" />
                1. Identificação & Especificações Farmacológicas
              </h3>

              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
                {/* Product Name, Type, and Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                        Nome Comercial do Medicamento
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2.5 text-xs sm:text-sm font-bold transition-colors"
                        placeholder="Nome do produto"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Tipo / Espectro Canabinoide
                        </label>
                        <input
                          type="text"
                          value={formData.type}
                          onChange={(e) => handleChange('type', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-mecura-neon rounded-lg p-2 text-xs font-semibold"
                          placeholder="Ex: Óleo Full Spectrum"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Origem (Nacional / Importado)
                        </label>
                        <input
                          type="text"
                          value={formData.origin}
                          onChange={(e) => handleChange('origin', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2 text-xs font-semibold"
                          placeholder="Ex: Importado ou Nacional"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                        Princípio Ativo & Fitocomplexo
                      </label>
                      <input
                        type="text"
                        value={formData.activeIngredients}
                        onChange={(e) => handleChange('activeIngredients', e.target.value)}
                        className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2.5 text-xs font-medium"
                        placeholder="Ex: CBD 1500mg (50mg/mL) + Fitocomplexo"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Fabricante / Laboratório
                        </label>
                        <input
                          type="text"
                          value={formData.manufacturer}
                          onChange={(e) => handleChange('manufacturer', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                          placeholder="Fabricante"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Proporção / Ratio (ex: THC &lt; 0,2%)
                        </label>
                        <input
                          type="text"
                          value={formData.ratio}
                          onChange={(e) => handleChange('ratio', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-mecura-neon rounded-lg p-2 text-xs font-bold"
                          placeholder="Ex: CBD Rico / THC < 0,2%"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Regulamentação Anvisa
                        </label>
                        <input
                          type="text"
                          value={formData.anvisaRdc}
                          onChange={(e) => handleChange('anvisaRdc', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                          placeholder="Ex: RDC 660/2022"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                          Categoria Clínica do Guia
                        </label>
                        <input
                          type="text"
                          value={formData.categoryName}
                          onChange={(e) => handleChange('categoryName', e.target.value)}
                          className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 focus:ring-1 focus:ring-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                          placeholder="Ex: Ansiedade, Dor, etc."
                        />
                      </div>
                    </div>

                    {/* Certifications toggles */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-mecura-silver hover:text-white">
                        <input
                          type="checkbox"
                          checked={formData.gmpCertified}
                          onChange={(e) => handleChange('gmpCertified', e.target.checked)}
                          className="rounded bg-black border-white/20 text-mecura-neon focus:ring-mecura-neon"
                        />
                        <span>Certificação cGMP Farmacêutica</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-mecura-silver hover:text-white">
                        <input
                          type="checkbox"
                          checked={formData.hplcStandardized}
                          onChange={(e) => handleChange('hplcStandardized', e.target.checked)}
                          className="rounded bg-black border-white/20 text-mecura-neon focus:ring-mecura-neon"
                        />
                        <span>Laudo HPLC Padronizado</span>
                      </label>
                    </div>
                  </div>

                  {/* Presentation & Vehicle Box */}
                  <div className="bg-[#050508] rounded-xl p-4 border border-white/10 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-mecura-neon font-bold uppercase tracking-wider pb-1 border-b border-white/10">
                        <Beaker className="w-4 h-4" />
                        <span>Apresentação, Veículo & Calibração</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                            Forma Farmacêutica
                          </label>
                          <input
                            type="text"
                            value={formData.pharmaceuticalForm}
                            onChange={(e) => handleChange('pharmaceuticalForm', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                            placeholder="Ex: Solução Oleosa Gotas"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                            Via de Administração
                          </label>
                          <input
                            type="text"
                            value={formData.administrationRoute}
                            onChange={(e) => handleChange('administrationRoute', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2 text-xs font-semibold"
                            placeholder="Ex: Sublingual / Oral"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                            Volume / Quantidade Frasco
                          </label>
                          <input
                            type="text"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                            placeholder="Ex: 30 mL (~600 gotas)"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                            Veículo Carreador
                          </label>
                          <input
                            type="text"
                            value={formData.carrierVehicle}
                            onChange={(e) => handleChange('carrierVehicle', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                            placeholder="Ex: Óleo MCT (Coco)"
                          />
                        </div>
                      </div>

                      {/* Drop Calibration */}
                      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2">
                        <span className="text-[11px] text-mecura-neon font-bold uppercase block">
                          Calibração de Gotas & Miligramas
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-mecura-silver block">Gotas / mL</label>
                            <input
                              type="text"
                              value={formData.dropsPerMl}
                              onChange={(e) => handleChange('dropsPerMl', e.target.value)}
                              className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs text-center"
                              placeholder="20"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-mecura-silver block">mg CBD / gota</label>
                            <input
                              type="text"
                              value={formData.mgPerDropCBD}
                              onChange={(e) => handleChange('mgPerDropCBD', e.target.value)}
                              className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs text-center font-bold text-mecura-neon"
                              placeholder="2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-mecura-silver block">mg THC / gota</label>
                            <input
                              type="text"
                              value={formData.mgPerDropTHC}
                              onChange={(e) => handleChange('mgPerDropTHC', e.target.value)}
                              className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs text-center text-amber-400"
                              placeholder="0.05"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-mecura-silver block">mg Delta-8 / gota</label>
                            <input
                              type="text"
                              value={formData.mgPerDropDelta8}
                              onChange={(e) => handleChange('mgPerDropDelta8', e.target.value)}
                              className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs text-center text-purple-400"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price in BRL and USD */}
                    <div className="pt-3 border-t border-white/10">
                      <span className="text-[11px] text-mecura-silver block mb-1 font-semibold">
                        Valores Comerciais Estimados (BRL / USD)
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-mecura-silver block">Preço em Reais (R$)</label>
                          <input
                            type="text"
                            value={formData.priceBRL}
                            onChange={(e) => handleChange('priceBRL', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 text-mecura-neon font-bold rounded p-2 text-xs"
                            placeholder="Ex: 380.00"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-mecura-silver block">Preço em Dólares (US$)</label>
                          <input
                            type="text"
                            value={formData.priceUSD}
                            onChange={(e) => handleChange('priceUSD', e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-2 text-xs"
                            placeholder="Ex: 70.00"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* 2. Indicações Clínicas e Patologias */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-mecura-neon" />
                2. Indicações Clínicas & Patologias Alvo
              </h3>

              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
                <div>
                  <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                    Descrição Farmacológica Detalhada
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2.5 text-xs sm:text-sm leading-relaxed"
                    placeholder="Descrição da fórmula, extração e características terapêuticas..."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                    Patologias Indicadas (separadas por vírgula)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.indications}
                    onChange={(e) => handleChange('indications', e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 text-white rounded-lg p-2 text-xs"
                    placeholder="Ex: Dor crônica, Ansiedade generalizada, Insônia severa, TEA, Espasticidade..."
                  />
                  {formData.indications && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.indications.split(/[,;•\n]/).filter(s => s.trim().length > 0).map((ind, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-mecura-neon/10 border border-mecura-neon/20 text-mecura-neon text-[11px] font-medium rounded-lg">
                          {ind.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-indigo-300 block font-semibold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Mecanismo de Ação Farmacodinâmico
                  </label>
                  <textarea
                    rows={2}
                    value={formData.mechanismOfAction}
                    onChange={(e) => handleChange('mechanismOfAction', e.target.value)}
                    className="w-full bg-[#050508] border border-indigo-500/20 focus:border-indigo-400 text-mecura-pearl rounded-lg p-2.5 text-xs leading-relaxed"
                    placeholder="Interações com receptores CB1, CB2, TRPV1, 5-HT1A..."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-mecura-silver block font-semibold mb-1">
                    Especificações Técnicas Laboratoriais (uma por linha)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.technicalDetails}
                    onChange={(e) => handleChange('technicalDetails', e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon/60 text-mecura-silver rounded-lg p-2 text-xs font-mono"
                    placeholder="Ex: Extração por CO2 Supercrítico&#10;Teor de terpenos &gt; 2.5%&#10;Livre de metais pesados e pesticidas"
                  />
                </div>
              </div>
            </section>

            {/* 3. Posologia, Dosagem e Modo de Uso (Alta prioridade do médico) */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Pill className="w-4 h-4 text-mecura-neon" />
                  3. Posologia, Titulação e Modo de Uso
                </h3>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Ajuste Livre de Dosagens
                </span>
              </div>

              <div className="bg-mecura-neon/5 border border-mecura-neon/20 rounded-xl p-4 sm:p-5 space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <strong className="text-mecura-neon">Protocolo Sugerido de Administração & Doses:</strong>
                    </label>
                    
                    {/* Quick Add Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleAppendPosology('Titulação: Iniciar com 2 gotas a cada 12h, aumentando 1 gota a cada 3 a 5 dias até a dose-alvo.')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white rounded border border-white/10 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-mecura-neon" /> + Titulação Gradual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendPosology('Dose Noturna: Tomar 30 a 60 minutos antes de dormir, preferencialmente após refeição leve com lipídios.')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white rounded border border-white/10 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-mecura-neon" /> + Dose Noturna
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendPosology('Via Sublingual: Manter sob a língua durante 60 a 90 segundos antes da deglutição para absorção transmucosa.')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white rounded border border-white/10 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-mecura-neon" /> + Alerta Sublingual
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={formData.posologyDetails}
                    onChange={(e) => handleChange('posologyDetails', e.target.value)}
                    className="w-full bg-[#050508] border border-mecura-neon/30 focus:border-mecura-neon text-white rounded-lg p-3 text-xs sm:text-sm leading-relaxed font-medium"
                    placeholder="Descreva as instruções de uso, posologia inicial, titulação e horários de administração..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <label className="text-[10px] text-mecura-silver uppercase block mb-1 font-semibold">
                      Via de Administração
                    </label>
                    <input
                      type="text"
                      value={formData.administrationRoute}
                      onChange={(e) => handleChange('administrationRoute', e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <label className="text-[10px] text-mecura-silver uppercase block mb-1 font-semibold">
                      Regra Geral de Titulação
                    </label>
                    <input
                      type="text"
                      value={formData.titrationRule}
                      onChange={(e) => handleChange('titrationRule', e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-white/10 text-white rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Modelo de Prescrição Médica para Receituário */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  4. Modelo de Prescrição Médica para Receituário
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncPrescriptionFromPosology}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
                    title="Atualizar texto da receita a partir da posologia editada acima"
                  >
                    <Sparkles className="w-3 h-3" />
                    Gerar Modelo das Doses
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrescription}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      copiedPrescription 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPrescription ? 'Copiado!' : 'Copiar Texto da Receita'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#0A0A0F] border border-emerald-500/30 rounded-xl space-y-2">
                <label className="text-[11px] text-emerald-400 block font-semibold">
                  Texto do Receituário (editável para cópia direta):
                </label>
                <textarea
                  rows={4}
                  value={formData.prescriptionExample}
                  onChange={(e) => handleChange('prescriptionExample', e.target.value)}
                  className="w-full bg-[#050508] border border-emerald-500/30 focus:border-emerald-400 font-mono text-xs sm:text-sm text-emerald-200 rounded-lg p-3 leading-relaxed"
                  placeholder="Nome do produto — Quantidade&#10;Uso: Posologia e modo de administração..."
                />
                <p className="text-[10px] text-mecura-silver">
                  Dica: Este texto atualizado pode ser copiado e colado diretamente no Receituário Especial ou Laudo Médico Evolutivo.
                </p>
              </div>
            </section>

            {/* 5. Precauções e Contraindicações */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                5. Contraindicações, Reações Adversas e Interações
              </h3>

              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-amber-400 uppercase font-bold block mb-1">
                      Contraindicações Específicas
                    </label>
                    <textarea
                      rows={2}
                      value={formData.contraindications}
                      onChange={(e) => handleChange('contraindications', e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 focus:border-amber-500/50 text-mecura-silver rounded-lg p-2 text-xs"
                      placeholder="Contraindicações clínicas específicas..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-amber-400 uppercase font-bold block mb-1">
                      Reações Adversas Potenciais
                    </label>
                    <textarea
                      rows={2}
                      value={formData.adverseEffects}
                      onChange={(e) => handleChange('adverseEffects', e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 focus:border-amber-500/50 text-mecura-silver rounded-lg p-2 text-xs"
                      placeholder="Reações e efeitos colaterais observáveis..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-white uppercase font-bold block mb-1">
                    Contraindicações Gerais
                  </label>
                  <textarea
                    rows={3}
                    value={formData.generalContraindications}
                    onChange={(e) => handleChange('generalContraindications', e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 text-mecura-silver rounded-lg p-2.5 text-xs leading-relaxed"
                    placeholder="Contraindicações gerais de canabinoides..."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white uppercase font-bold block mb-1">
                    Interações com o Citocromo P450 (Farmacocinética)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.drugInteractions}
                    onChange={(e) => handleChange('drugInteractions', e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 text-mecura-silver rounded-lg p-2 text-xs leading-relaxed"
                    placeholder="Interações CYP3A4, CYP2C19, anticoagulantes e anticonvulsivantes..."
                  />
                </div>
              </div>
            </section>

            {/* 6. Conservação */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mecura-neon" />
                6. Cuidados de Conservação & Armazenamento
              </h3>
              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 sm:p-5">
                <textarea
                  rows={2}
                  value={formData.conservationNotes}
                  onChange={(e) => handleChange('conservationNotes', e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 text-mecura-silver rounded-lg p-2 text-xs leading-relaxed"
                  placeholder="Orientações de temperatura, luz e umidade..."
                />
              </div>
            </section>

            {/* 7. Anotações Médicas Privadas / Protocolo Clínico do Especialista */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-mecura-neon" />
                7. Observações Médicas Internas / Protocolo Clínico Pessoal
              </h3>
              <div className="bg-[#0A0A0F] border border-mecura-neon/20 rounded-xl p-4 sm:p-5">
                <label className="text-[11px] text-mecura-silver block mb-1">
                  Espaço para o médico registrar observações de acompanhamento, critérios de titulação rápida ou combinações com fitoterápicos:
                </label>
                <textarea
                  rows={3}
                  value={formData.doctorNotes}
                  onChange={(e) => handleChange('doctorNotes', e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 focus:border-mecura-neon text-white rounded-lg p-2.5 text-xs leading-relaxed"
                  placeholder="Ex: 'Utilizar preferencialmente em pacientes idosos com dor crônica refratária. Retorno obrigatório em 30 dias para avaliar enzimas hepáticas.'"
                />
              </div>
            </section>

          </div>
          
          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0A0F] rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-mecura-silver max-w-xl text-center sm:text-left">
                <strong>Garantia de Persistência:</strong> As alterações salvas pelo médico nesta bula ficam registradas no navegador local e serão automaticamente recuperadas nas próximas consultas.
              </p>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {hasSavedCustom && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-2 bg-white/5 hover:bg-amber-500/10 text-mecura-silver hover:text-amber-400 border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Restaurar dados originais de catálogo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Original</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                  title="Excluir este medicamento do catálogo e salvar"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Excluir Medicamento & Salvar</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações da Bula</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-mecura-surface-light hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10 text-xs sm:text-sm"
                >
                  Fechar Bula
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#12121A] border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-white">Excluir Medicamento do Catálogo?</h4>
                <p className="text-xs text-mecura-silver">
                  Tem certeza que deseja excluir o medicamento <strong className="text-white font-semibold">"{formData.name || product.name}"</strong>? Ele será excluído do catálogo e as alterações serão salvas imediatamente.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir & Salvar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
