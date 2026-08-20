import React, { useState } from 'react';
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
import { enrichMedicationDetails } from '../data/cbdGuide';

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
  onDownloadPDF
}: PrescriptionEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = (type: 'cbd' | 'balanced' | 'thc' | 'pomada' | 'custom') => {
    let newItem: PrescriptionItemData;
    if (type === 'cbd') {
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
          'Tomar 03 gotas pela manhã e 03 gotas no final da tarde (sublingual).',
          'Aumentar 01 gota a cada 05 dias até atingir a dose de controle homeostático.'
        ],
        description: 'Extrato integral rico em CBD com alto rendimento terapêutico.'
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
          'Tomar 03 gotas de 12 em 12 horas (sublingual).',
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
          'Tomar 08 a 10 gotas sublinguais de 12 em 12 horas. Reter sob a língua por 60 segundos antes de deglutir.'
        ],
        description: 'Canabidiol Full Spectrum importado de alta pureza.'
      };
    }
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
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
                className="p-2 text-mecura-silver hover:text-white hover:bg-mecura-surface rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
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
                        const activeIng = item.activeIngredients || enriched.activeIngredients;
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

                            {/* Active Ingredients & Concentration */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Princípio(s) Ativo(s) & Concentração
                                </label>
                                <input
                                  type="text"
                                  value={activeIng}
                                  onChange={(e) => handleUpdateItem(itemIdx, 'activeIngredients', e.target.value)}
                                  placeholder="Ex: Canabidiol (CBD) Full Spectrum 100mg/ml, Delta-9-THC < 0,2%"
                                  className="w-full bg-[#0A0A0F] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-medium"
                                />
                              </div>

                              <div className="sm:col-span-3">
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

                              <div className="sm:col-span-3">
                                <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                                  Qtd / Frasco & Via
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
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    Orientações Gerais & Observações Farmacológicas
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instruções de titulação, conservação do frasco, retorno em 30 dias..."
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />
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
                          <p>Validade: 30 dias a partir da data de emissão</p>
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

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Gerando Documento...' : 'Gerar e Baixar Receita (PDF)'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
