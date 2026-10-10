import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileCheck, 
  Download, 
  Eye, 
  Edit3, 
  RotateCcw, 
  User, 
  Calendar, 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles,
  ClipboardList,
  Activity,
  HeartHandshake,
  Send,
  Plus,
  Pill,
  RefreshCw
} from 'lucide-react';
import { PrescriptionItemData } from '../utils/pdfGenerator';
import { NATIONAL_ASSOCIATION_PRODUCTS, ABECMED_PRODUCTS, ABRACE_PRODUCTS, enrichMedicationDetails } from '../data/cbdGuide';

interface MedicalReportEditorModalProps {
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
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  rationale: string;
  setRationale: (val: string) => void;
  treatmentPlan: string;
  setTreatmentPlan: (val: string) => void;
  monitoring: string;
  setMonitoring: (val: string) => void;
  onDownloadPDF: () => void;
  onSendToChat?: () => Promise<void> | void;
  isSendingToChat?: boolean;
  reportType?: 'inicial' | 'evolutivo';
  prescribedItems?: PrescriptionItemData[];
}

export function MedicalReportEditorModal({
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
  diagnosis,
  setDiagnosis,
  rationale,
  setRationale,
  treatmentPlan,
  setTreatmentPlan,
  monitoring,
  setMonitoring,
  onDownloadPDF,
  onSendToChat,
  isSendingToChat = false,
  reportType = 'inicial',
  prescribedItems = []
}: MedicalReportEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);

  // Local state for blazing fast editing without re-rendering parent Dashboard on every keystroke
  const [localPatientName, setLocalPatientName] = useState(patientName);
  const [localBirthDate, setLocalBirthDate] = useState(birthDate);
  const [localCpf, setLocalCpf] = useState(cpf);
  const [localEmissionDate, setLocalEmissionDate] = useState(emissionDate);
  const [localDoctorName, setLocalDoctorName] = useState(doctorName);
  const [localDoctorCrm, setLocalDoctorCrm] = useState(doctorCrm);
  const [localDoctorSpecialty, setLocalDoctorSpecialty] = useState(doctorSpecialty);
  const [localDiagnosis, setLocalDiagnosis] = useState(diagnosis);
  const [localRationale, setLocalRationale] = useState(rationale);
  const [localTreatmentPlan, setLocalTreatmentPlan] = useState(treatmentPlan);
  const [localMonitoring, setLocalMonitoring] = useState(monitoring);

  // Keep local state in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalPatientName(patientName);
      setLocalBirthDate(birthDate);
      setLocalCpf(cpf);
      setLocalEmissionDate(emissionDate);
      setLocalDoctorName(doctorName);
      setLocalDoctorCrm(doctorCrm);
      setLocalDoctorSpecialty(doctorSpecialty);
      setLocalDiagnosis(diagnosis);
      setLocalRationale(rationale);
      setLocalTreatmentPlan(treatmentPlan);
      setLocalMonitoring(monitoring);
    }
  }, [isOpen]);

  // Synchronize all edited fields back to parent
  const syncToParent = () => {
    setPatientName(localPatientName);
    setBirthDate(localBirthDate);
    setCpf(localCpf);
    setEmissionDate(localEmissionDate);
    setDoctorName(localDoctorName);
    setDoctorCrm(localDoctorCrm);
    setDoctorSpecialty(localDoctorSpecialty);
    setDiagnosis(localDiagnosis);
    setRationale(localRationale);
    setTreatmentPlan(localTreatmentPlan);
    setMonitoring(localMonitoring);
  };

  // Debounced background sync so parent state stays up to date without blocking keystrokes
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      syncToParent();
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    isOpen, localPatientName, localBirthDate, localCpf, localEmissionDate,
    localDoctorName, localDoctorCrm, localDoctorSpecialty,
    localDiagnosis, localRationale, localTreatmentPlan, localMonitoring
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        syncToParent();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    syncToParent();
    onClose();
  };

  const handleDownload = () => {
    syncToParent();
    setIsGenerating(true);
    try {
      onDownloadPDF();
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handleSendToChatAction = async () => {
    if (!onSendToChat) return;
    syncToParent();
    await onSendToChat();
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                reportType === 'evolutivo'
                  ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              }`}>
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">
                    {reportType === 'evolutivo' ? 'Laudo Médico Evolutivo' : 'Laudo Médico Inicial'}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    reportType === 'evolutivo'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {reportType === 'evolutivo' ? 'Acompanhamento & Evolução' : 'Comprovação de Início'}
                  </span>
                </div>
                <p className="text-xs text-mecura-silver">
                  {reportType === 'evolutivo'
                    ? 'Acompanhamento clínico, resposta terapêutica com canabinoides e justificativa de continuidade'
                    : 'Documento pericial e clínico comprovando o início do tratamento supervisionado com Cannabis medicinal'}
                </p>
              </div>
            </div>

            {/* Tab Switcher & Close */}
            <div className="flex items-center gap-3">
              <div className="bg-mecura-surface border border-mecura-elevated rounded-xl p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    syncToParent();
                    setActiveTab('edit');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'edit'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Seções
                </button>
                <button
                  type="button"
                  onClick={() => {
                    syncToParent();
                    setActiveTab('preview');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Prévia Laudo A4
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all shadow-sm group"
                title="Fechar e sair sem enviar o laudo"
                aria-label="Fechar laudo"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Fechar (Sair)</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
            {activeTab === 'edit' ? (
              <div className="space-y-6">
                {/* Section 1: Patient & Doctor Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient Info */}
                  <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-mecura-elevated">
                      <User className="w-4 h-4 text-mecura-neon" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identificação do Paciente</h4>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-mecura-silver font-medium block mb-1">Nome do Paciente</label>
                        <input
                          type="text"
                          value={localPatientName}
                          onChange={(e) => setLocalPatientName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CPF</label>
                          <input
                            type="text"
                            value={localCpf}
                            onChange={(e) => setLocalCpf(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data Nasc.</label>
                          <input
                            type="text"
                            value={localBirthDate}
                            onChange={(e) => setLocalBirthDate(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-mecura-elevated">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identificação do Médico</h4>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-mecura-silver font-medium block mb-1">Médico Emitente</label>
                        <input
                          type="text"
                          value={localDoctorName}
                          onChange={(e) => setLocalDoctorName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CRM / UF</label>
                          <input
                            type="text"
                            value={localDoctorCrm}
                            onChange={(e) => setLocalDoctorCrm(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data Emissão</label>
                          <input
                            type="text"
                            value={localEmissionDate}
                            onChange={(e) => setLocalEmissionDate(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Diagnóstico e Quadro Clínico */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      2. Diagnóstico & Histórico do Quadro Clínico
                    </label>
                    <span className="text-[10px] text-mecura-silver">Anamnese, sintomas, refratariedade</span>
                  </div>
                  <textarea
                    rows={5}
                    value={localDiagnosis}
                    onChange={(e) => setLocalDiagnosis(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    placeholder="Descreva o quadro do paciente, tempo de evolução, intensidade e tratamentos prévios..."
                  />
                </div>

                {/* Section 3: Justificativa Terapêutica & SEC */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" />
                      3. Justificativa Terapêutica & Modulação do Sistema Endocanabinoide (SEC)
                    </label>
                    <span className="text-[10px] text-mecura-silver">Mecanismo de ação, receptores CB1/CB2, efeito comitiva</span>
                  </div>
                  <textarea
                    rows={6}
                    value={localRationale}
                    onChange={(e) => setLocalRationale(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    placeholder="Fundamentação técnico-científica sobre a indicação de fitocanabinoides..."
                  />
                </div>

                {/* Section 4: Conduta Proposta & Medicamentos */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      4. Conduta Terapêutica Proposta & Medicamentos
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {prescribedItems && prescribedItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const formatted = prescribedItems.map((item, idx) => {
                              const ing = item.activeIngredients ? `\n   Princípio Ativo: ${item.activeIngredients}` : '';
                              const form = item.pharmaceuticalForm ? `\n   Apresentação / Via: ${item.pharmaceuticalForm} • ${item.quantity || '01 frasco'} • ${item.administrationRoute || 'Via Sublingual'}` : '';
                              const isGummy = /goma|gumm|comest[íi]vel/i.test(item.name || item.pharmaceuticalForm || '');
                              const isFlower = /flor|in natura/i.test(item.name || item.pharmaceuticalForm || '');
                              const posologyHeader = (isGummy || isFlower) ? 'Posologia' : 'Posologia (Aproximadamente 25 gotas por mL)';
                              const cleanDosage = item.dosage.filter(d => {
                                const t = d.trim();
                                return t && !/^Aproximadamente 25 gotas por mL\.?$/i.test(t) && !/^Posologia e Modo de Uso:\s*Aproximadamente 25 gotas por mL\.?$/i.test(t);
                              });
                              const doseStr = (cleanDosage.length > 0 ? cleanDosage : item.dosage).join(' | ');
                              return `${idx + 1}. ${item.name} (${item.brand} - ${item.origin})${ing}${form}\n   ${posologyHeader}: ${doseStr}\n   Finalidade: ${item.description || 'Modulação fitocanabinoide contínua.'}`;
                            }).join('\n\n');
                            setLocalTreatmentPlan(formatted);
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Sincronizar medicamentos da receita atual para este laudo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sincronizar da Receita ({prescribedItems.length})</span>
                        </button>
                      )}

                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const found = NATIONAL_ASSOCIATION_PRODUCTS.find(p => p.name === val || p.name.includes(val)) ||
                                        ABECMED_PRODUCTS.find(p => p.name === val) ||
                                        ABRACE_PRODUCTS.find(p => p.name === val);
                          if (found) {
                            const enriched = enrichMedicationDetails(found.name, found.manufacturer || 'Associação Nacional', found.origin || 'Nacional', found.type, found);
                            const ing = found.activeIngredients || enriched.activeIngredients;
                            const form = found.pharmaceuticalForm || enriched.pharmaceuticalForm;
                            const qty = found.quantity || enriched.quantity;
                            const route = found.administrationRoute || enriched.administrationRoute;
                            const isGummy = /goma/i.test(found.name || form);
                            const isFlower = /flor|in natura/i.test(found.name || form);
                            const posHeader = (isGummy || isFlower) ? 'Posologia' : 'Posologia (Aproximadamente 25 gotas por mL)';
                            const dose = (found.usageInstructions || 'Tomar 03 a 05 gotas por via sublingual de 12/12 horas.')
                              .replace(/Aproximadamente 25 gotas por mL\.?/gi, '')
                              .trim();
                            const newBlock = `• ${found.name} (${found.manufacturer || 'Associação Nacional'} - ${found.origin || 'Nacional'})\n   Princípio Ativo: ${ing}\n   Apresentação / Via: ${form} • ${qty} • ${route}\n   ${posHeader}: ${dose}\n   Finalidade: ${found.description || 'Modulação canabinoide.'}`;
                            setLocalTreatmentPlan(localTreatmentPlan ? `${localTreatmentPlan}\n\n${newBlock}` : newBlock);
                          }
                          e.target.value = '';
                        }}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-mecura-silver hover:text-white rounded-lg text-xs font-medium cursor-pointer focus:outline-none"
                      >
                        <option value="" disabled className="bg-[#0A0A0F] text-amber-300 font-bold">
                          + Inserir Medicamento do Catálogo...
                        </option>
                        <optgroup label="🌿 Linha ABRACE Esperança (Nacional)" className="bg-[#0A0A0F] text-emerald-400 font-bold">
                          <option value="Óleo Laranja CBD 20 mg/mL — ABRACE (30 mL)">Óleo Laranja CBD 20 mg/mL (30 mL)</option>
                          <option value="Óleo Laranja CBD 30 mg/mL — ABRACE (30 mL)">Óleo Laranja CBD 30 mg/mL (30 mL)</option>
                          <option value="Óleo Vermelho CBD 100 mg/mL — ABRACE (30 mL)">Óleo Vermelho CBD 100 mg/mL (30 mL)</option>
                          <option value="Óleo Cinza/Prata CBD 200 mg/mL — ABRACE (30 mL)">Óleo Cinza/Prata CBD 200 mg/mL (30 mL)</option>
                          <option value="Óleo Preto THC 30 mg/mL — ABRACE (30 mL)">Óleo Preto THC 30 mg/mL (30 mL)</option>
                          <option value="Óleo Azul CBD + THC 15 mg/mL + 15 mg/mL (1:1) — ABRACE (30 mL)">Óleo Azul CBD+THC 15+15 mg/mL (1:1) (30 mL)</option>
                          <option value="Óleo Roxo CBD + THC 30 mg/mL + 30 mg/mL (1:1) — ABRACE (30 mL)">Óleo Roxo CBD+THC 30+30 mg/mL (1:1) (30 mL)</option>
                          <option value="Flores In Natura Ricas em CBD — ABRACE (10 g)">Flores In Natura Ricas em CBD (10 g)</option>
                          <option value="Flores In Natura Ricas em THC — ABRACE (10 g)">Flores In Natura Ricas em THC (10 g)</option>
                          <option value="Flores In Natura Ricas em CBD + THC — ABRACE (10 g)">Flores In Natura Ricas em CBD + THC (10 g)</option>
                          <option value="Gomas de CBD 10 mg/goma — ABRACE (30 un)">Gomas de CBD 10 mg/goma (30 un)</option>
                          <option value="Gomas de THC 10 mg/goma — ABRACE (30 un)">Gomas de THC 10 mg/goma (30 un)</option>
                          <option value="Gomas de CBD + THC 10 mg/goma (1:1) — ABRACE (30 un)">Gomas de CBD + THC 10 mg/goma (1:1) (30 un)</option>
                          <option value="Pomada Full Rica em CBD 30 mg/g — ABRACE (100 g)">Pomada Full Rica em CBD 30 mg/g (100 g)</option>
                          <option value="Pomada Full Rica em THC 20 mg/g — ABRACE (100 g)">Pomada Full Rica em THC 20 mg/g (100 g)</option>
                          <option value="Spray Resgate THC 5 mg/mL — ABRACE (25 mL)">Spray Resgate THC 5 mg/mL (25 mL)</option>
                        </optgroup>
                        <optgroup label="Linha ALTO CBD Full Spectrum" className="bg-[#0A0A0F] text-white">
                          <option value="ALTO CBD Full SPECTRUM CBD 5:1 THC - 30ml (30 mg/mL — 900mg)">Alto CBD 5:1 THC (30 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 5:1 THC - 30ml (60 mg/mL — 1800mg)">Alto CBD 5:1 THC (60 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (30 mg/mL — 900mg)">Alto CBD 10:1 THC (30 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (60 mg/mL — 1800mg)">Alto CBD 10:1 THC (60 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 10:1 THC - 30ml (100 mg/mL — 3000mg)">Alto CBD 10:1 THC (100 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (30 mg/mL — 900mg)">Alto CBD 20:1 THC (30 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (60 mg/mL — 1800mg)">Alto CBD 20:1 THC (60 mg/mL)</option>
                          <option value="ALTO CBD Full SPECTRUM CBD 20:1 THC - 30ml (100 mg/mL — 3000mg)">Alto CBD 20:1 THC (100 mg/mL)</option>
                        </optgroup>
                        <optgroup label="Linhas CBD + CBN / CBG" className="bg-[#0A0A0F] text-white">
                          <option value="CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (30 mg/mL — 900mg)">CBD + CBN (2:1 CBN) 30 mg/mL</option>
                          <option value="CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (60 mg/mL — 1800mg)">CBD + CBN (2:1 CBN) 60 mg/mL</option>
                          <option value="CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (30 mg/mL — 900mg)">CBD + CBG (2:1 CBG) 30 mg/mL</option>
                          <option value="CBD + CBG Full Spectrum (CBD 2:1 CBG) - 30ml (60 mg/mL — 1800mg)">CBD + CBG (2:1 CBG) 60 mg/mL</option>
                          <option value="CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml (30 mg/mL — 900mg)">4:1:1 (CBD:CBG:CBN) 30 mg/mL</option>
                          <option value="CBD + CBG + CBN Full Spectrum (4 CBD : 1 CBG : 1 CBN) - 30ml (60 mg/mL — 1800mg)">4:1:1 (CBD:CBG:CBN) 60 mg/mL</option>
                        </optgroup>
                        <optgroup label="Linhas EQUILIBRADO & ALTO THC" className="bg-[#0A0A0F] text-white">
                          <option value="EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (30 mg/mL — 900mg)">Equilibrado 1:1 (30 mg/mL)</option>
                          <option value="EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (60 mg/mL — 1800mg)">Equilibrado 1:1 (60 mg/mL)</option>
                          <option value="EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (100 mg/mL — 3000mg)">Equilibrado 1:1 (100 mg/mL)</option>
                          <option value="ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (30 mg/mL — 900mg)">Alto THC 10:1 (30 mg/mL)</option>
                          <option value="ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (60 mg/mL — 1800mg)">Alto THC 10:1 (60 mg/mL)</option>
                          <option value="ALTO THC Full Spectrum (THC 10:1 CBD) - 30ml (100 mg/mL — 3000mg)">Alto THC 10:1 (100 mg/mL)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={localTreatmentPlan}
                    onChange={(e) => setLocalTreatmentPlan(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed font-mono text-[11px] sm:text-xs"
                    placeholder="Formulação canabinoide, posologia inicial, frequência de administração..."
                  />
                </div>

                {/* Section 5: Monitoramento & Segurança */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      5. Monitoramento Clínico, Titulação & Recomendações
                    </label>
                    <span className="text-[10px] text-mecura-silver">Titulação progressiva, interações farmacológicas, retorno</span>
                  </div>
                  <textarea
                    rows={4}
                    value={localMonitoring}
                    onChange={(e) => setLocalMonitoring(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    placeholder="Recomendações de titulação lenta, acompanhamento de segurança e reavaliação..."
                  />
                </div>
              </div>
            ) : (
              /* A4 Sheet Preview */
              <div className="flex justify-center">
                <div className="w-full max-w-2xl bg-white text-[#111827] rounded-xl shadow-2xl p-8 sm:p-12 border border-slate-200 font-sans min-h-[850px] flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-5">
                      <div>
                        <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight">MECURA</h2>
                        <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase">
                          CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                        </p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-sm font-bold text-[#1E1B4B]">{localDoctorName}</h3>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{localDoctorCrm}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{localDoctorSpecialty}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase border ${
                          reportType === 'evolutivo'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {reportType === 'evolutivo' ? 'Acompanhamento Clínico & Evolução' : 'Comprovação de Início de Tratamento'}
                        </span>
                      </div>
                      <h1 className="text-base font-bold text-[#1E1B4B] uppercase tracking-widest">
                        {reportType === 'evolutivo' ? 'LAUDO MÉDICO EVOLUTIVO' : 'LAUDO MÉDICO INICIAL'}
                      </h1>
                      <div className="w-20 h-0.5 bg-[#059669] mx-auto mt-1" />
                    </div>

                    {/* Patient Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-4 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">1. Paciente</span>
                        <span className="font-bold text-slate-900 text-sm">{localPatientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">CPF / Nasc.</span>
                        <span className="font-semibold text-slate-700">{localCpf} • {localBirthDate}</span>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        {reportType === 'evolutivo' ? '2. Diagnóstico Clínico & Evolução Terapêutica' : '2. Diagnóstico Clínico & Comprovação de Início de Tratamento'}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {localDiagnosis}
                      </p>
                    </div>

                    {/* Section 3 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        {reportType === 'evolutivo' ? '3. Fundamentação Terapêutica & Continuidade' : '3. Raciocínio Clínico & Indicação de Tratamento'}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {localRationale}
                      </p>
                    </div>

                    {/* Section 4 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        4. Conduta Proposta & Medicamentos
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {localTreatmentPlan}
                      </p>
                    </div>

                    {/* Section 5 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        5. Monitoramento Clínico & Recomendações
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {localMonitoring}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Signature */}
                  <div className="pt-6 border-t border-slate-200 mt-6 flex justify-between items-end">
                    <div className="text-[10px] text-slate-500">
                      <p>Data de Emissão: {localEmissionDate}</p>
                      <p>Documento com validade pericial e assistencial</p>
                      <p className="text-[9px] text-slate-400 mt-1">Conforme Resoluções CFM e Diretrizes ANVISA</p>
                    </div>

                    <div className="text-center w-52">
                      <div className="border-b border-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-900">{localDoctorName}</p>
                      <p className="text-[10px] text-slate-600 font-semibold mt-0.5">{localDoctorCrm}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Assinatura Digital / Médico Prescritor</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-mecura-elevated bg-[#0A0A0F]/90 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-red-500/15 border border-mecura-elevated hover:border-red-500/30 rounded-xl text-xs md:text-sm font-bold text-mecura-silver hover:text-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Sair desta tela sem enviar o laudo para o paciente"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>Sair sem Enviar</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating || isSendingToChat}
                className="w-full sm:w-auto px-5 py-2.5 bg-mecura-surface border border-mecura-elevated hover:bg-white/5 text-white font-bold text-xs md:text-sm rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Baixando PDF...' : 'Baixar Cópia (PDF)'}
              </button>

              {onSendToChat && (
                <button
                  type="button"
                  onClick={handleSendToChatAction}
                  disabled={isGenerating || isSendingToChat}
                  className={`w-full sm:w-auto px-6 py-3 font-extrabold text-xs md:text-sm rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer ${
                    reportType === 'evolutivo'
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)]'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                  }`}
                >
                  {isSendingToChat ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Enviando Laudo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{reportType === 'evolutivo' ? 'Enviar Laudo Evolutivo ao Paciente' : 'Enviar Laudo Inicial ao Paciente'}</span>
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
