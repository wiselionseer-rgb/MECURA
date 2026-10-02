import React, { useState, useEffect } from 'react';
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
  Globe
} from 'lucide-react';
import { PrescriptionItemData, isNationalProduct } from '../utils/pdfGenerator';
import { enrichMedicationDetails, NATIONAL_ASSOCIATION_PRODUCTS } from '../data/cbdGuide';
import { FLOWERMED_PRODUCTS, FlowermedProduct } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS, FlowerExtractionProduct } from '../data/flowerExtractionsCatalog';

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
  onSendToChat?: () => Promise<void>;
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
      await onSendToChat();
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
                        onClick={() => handleAddItem('blank')}
                        className="px-3 py-1.5 bg-mecura-neon text-black rounded-lg text-xs font-bold hover:bg-[#b5ff33] transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(166,255,0,0.25)]"
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
                        const pharmForm = item.pharmaceuticalForm || enriched.pharmaceuticalForm;
                        const quantity = item.quantity || enriched.quantity;
                        const admRoute = item.administrationRoute || enriched.administrationRoute;

                        return (
                          <div
                            key={itemIdx}
                            className="p-4 bg-mecura-surface/30 border border-mecura-elevated rounded-2xl space-y-3 relative group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                {/* Product Name */}
                                <div className="sm:col-span-6">
                                  <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                    Nome Comercial / Formulação
                                  </label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem(itemIdx, 'name', e.target.value)}
                                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 font-bold"
                                  />
                                </div>

                                {/* Brand */}
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                    Fabricante / Associação
                                  </label>
                                  <input
                                    type="text"
                                    value={item.brand || enriched.brand}
                                    onChange={(e) => handleUpdateItem(itemIdx, 'brand', e.target.value)}
                                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                {/* Origin */}
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                    Origem
                                  </label>
                                  <select
                                    value={item.origin || enriched.origin}
                                    onChange={(e) => handleUpdateItem(itemIdx, 'origin', e.target.value)}
                                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                  >
                                    <option value="Nacional">Associação Nacional (Brasil)</option>
                                    <option value="Importado">Importado (EUA/Europa)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Delete Item */}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(itemIdx)}
                                className="p-1.5 text-mecura-silver hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remover Medicamento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Active Ingredients & Concentration (Composição) */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Composição / Concentração
                                </label>
                                <input
                                  type="text"
                                  value={concentration}
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
                                  value={activeIng}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'activeIngredients', e.target.value)}
                                  placeholder="Ex: Canabidiol (CBD) Broad Spectrum + Terpenos"
                                  className="w-full bg-[#0A0A0F] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-medium"
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Forma & Apresentação
                                </label>
                                <input
                                  type="text"
                                  value={pharmForm}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'pharmaceuticalForm', e.target.value)}
                                  placeholder="Ex: Solução Oleosa Sublingual"
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Qtd / Frasco & Via de Administração
                                </label>
                                <input
                                  type="text"
                                  value={`${quantity} | ${admRoute}`}
                                  onChange={(e) => {
                                    const parts = e.target.value.split('|');
                                    handleUpdateItem(itemIdx, 'quantity', parts[0]?.trim() || quantity);
                                    if (parts[1]) handleUpdateItem(itemIdx, 'administrationRoute', parts[1]?.trim());
                                  }}
                                  placeholder="01 Frasco 30ml | Via Sublingual"
                                  className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                              </div>
                            </div>

                            {/* Posology / Dosage Lines */}
                            <div className="pt-2 border-t border-mecura-elevated/40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                                  Posologia & Modo de Uso
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddDosageLine(itemIdx)}
                                  className="text-[10px] text-mecura-silver hover:text-white flex items-center gap-1"
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
                                    placeholder="Ex: Tomar 05 gotas sublinguais pela manhã..."
                                    className="flex-1 bg-[#0A0A0F] border border-mecura-elevated rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                  />
                                  {item.dosage.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDosageLine(itemIdx, lineIdx)}
                                      className="text-mecura-silver hover:text-red-400 p-1"
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
                    <div key={gIdx} className="w-full max-w-2xl bg-white text-[#111827] rounded-xl shadow-2xl p-8 sm:p-12 border border-slate-200 font-sans min-h-[650px] flex flex-col justify-between relative">
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
                              const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
                              const activeIng = item.activeIngredients || enriched.activeIngredients;
                              const pharmForm = item.pharmaceuticalForm || enriched.pharmaceuticalForm;
                              const quantity = item.quantity || enriched.quantity;
                              const admRoute = item.administrationRoute || enriched.administrationRoute;

                              return (
                                <div key={idx} className="border-b border-slate-100 pb-4">
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
                                    {item.dosage.map((d, dIdx) => (
                                      <p key={dIdx} className="leading-relaxed">• {d}</p>
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
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
