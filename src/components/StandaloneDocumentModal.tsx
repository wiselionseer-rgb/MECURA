import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  FilePlus2, 
  FileCheck2, 
  User, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Download, 
  Send, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Stethoscope, 
  Sprout, 
  BrainCircuit, 
  History, 
  AlertCircle, 
  Plus,
  Pill,
  Clock,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { PrescriptionItemData, generatePrescriptionPDF, generateMedicalReportPDF, generatePsychomotorReportPDF, generateAgronomicReportPDF } from '../utils/pdfGenerator';
import { enrichMedicationDetails, ABECMED_PRODUCTS, NATIONAL_ASSOCIATION_PRODUCTS } from '../data/cbdGuide';

export interface StandalonePatientData {
  id?: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  email?: string;
  emissionDate: string;
  doctorName: string;
  doctorCrm: string;
  doctorSpecialty: string;
  diagnosis?: string;
  treatmentPlan?: string;
  rationale?: string;
  monitoring?: string;
  prescribedItems?: PrescriptionItemData[];
  notes?: string;
}

interface StandaloneDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPatient?: any;
  onOpenPrescriptionEditor: (patientData: StandalonePatientData, prefillItems?: PrescriptionItemData[]) => void;
  onOpenMedicalReportEditor: (patientData: StandalonePatientData, reportType: 'inicial' | 'evolutivo') => void;
  onOpenPsychomotorReportEditor: (patientData: StandalonePatientData) => void;
  onOpenAgronomicReportEditor: (patientData: StandalonePatientData) => void;
}

export function StandaloneDocumentModal({
  isOpen,
  onClose,
  currentPatient,
  onOpenPrescriptionEditor,
  onOpenMedicalReportEditor,
  onOpenPsychomotorReportEditor,
  onOpenAgronomicReportEditor
}: StandaloneDocumentModalProps) {
  const { queue } = useStore();

  const [mode, setMode] = useState<'existing' | 'manual'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emissionDate, setEmissionDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [doctorName, setDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [doctorCrm, setDoctorCrm] = useState('CRM/MT 17259');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Especialista em Medicina Canabinoide');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [autoAttachToChat, setAutoAttachToChat] = useState(true);

  // Quick Action feedback
  const [isGeneratingDirect, setIsGeneratingDirect] = useState(false);
  const [directSuccessMessage, setDirectSuccessMessage] = useState<string | null>(null);

  // Filtered queue of patients
  const filteredPatients = useMemo(() => {
    if (!queue || !Array.isArray(queue)) return [];
    if (!searchTerm.trim()) return queue;
    const q = searchTerm.toLowerCase().trim();
    return queue.filter(p => 
      (p.patientName && p.patientName.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.answers?.cpf && p.answers.cpf.includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  }, [queue, searchTerm]);

  // Pre-fill when selecting a patient from the queue
  const handleSelectPatient = (patient: any) => {
    if (!patient) return;
    setSelectedPatientId(patient.id);
    setPatientName(patient.patientName || '');
    setCpf(patient.answers?.cpf || patient.cpf || '');
    setBirthDate(patient.birthDate || patient.answers?.birthDate || '');
    setPhone(patient.phone || patient.answers?.phone || '');
    setEmail(patient.email || patient.answers?.email || '');

    // Diagnosis suggestion from answers
    const symptoms = [
      patient.answers?.ansiedade_diag || patient.answers?.panico ? 'Transtorno de Ansiedade Generalizada (CID-10 F41.1)' : '',
      patient.answers?.dor_tipo || patient.answers?.dor ? 'Dor Crônica e Tensão Muscular (CID-10 M79.7 / M25.5)' : '',
      patient.answers?.sono_qualidade === 'Ruim' || patient.answers?.sono_acorda ? 'Distúrbio do Sono / Insônia Crônica (CID-10 G47.0)' : '',
      patient.answers?.diagnostico_previo || patient.answers?.principais_sintomas || ''
    ].filter(Boolean).join(' • ');

    setPrimaryDiagnosis(symptoms || 'Acompanhamento e Modulação do Sistema Endocanabinoide');
  };

  // Preload current patient if already open in dashboard
  useEffect(() => {
    if (isOpen && currentPatient) {
      handleSelectPatient(currentPatient);
    } else if (isOpen && queue.length > 0 && !selectedPatientId) {
      handleSelectPatient(queue[0]);
    }
  }, [isOpen, currentPatient]);

  if (!isOpen) return null;

  const currentPatientData: StandalonePatientData = {
    id: selectedPatientId,
    name: patientName.trim() || 'Paciente',
    cpf: cpf.trim() || 'Não informado',
    birthDate: birthDate.trim() || 'Não informada',
    phone: phone.trim(),
    email: email.trim(),
    emissionDate: emissionDate.trim() || format(new Date(), 'dd/MM/yyyy'),
    doctorName,
    doctorCrm,
    doctorSpecialty,
    diagnosis: primaryDiagnosis
  };

  const handleLaunchPrescription = () => {
    onOpenPrescriptionEditor(currentPatientData);
    onClose();
  };

  const handleLaunchMedicalReport = (type: 'inicial' | 'evolutivo') => {
    onOpenMedicalReportEditor(currentPatientData, type);
    onClose();
  };

  const handleLaunchPsychomotor = () => {
    onOpenPsychomotorReportEditor(currentPatientData);
    onClose();
  };

  const handleLaunchAgronomic = () => {
    onOpenAgronomicReportEditor(currentPatientData);
    onClose();
  };

  // Direct fast PDF generation without opening the secondary modal
  const handleFastDirectDownload = async (docType: 'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'psicomotor' | 'agronomico') => {
    setIsGeneratingDirect(true);
    try {
      if (docType === 'receita') {
        const defaultItems: PrescriptionItemData[] = [
          {
            name: "Óleo ABEC CBD Full Spectrum 5% (50 mg/mL — 1.500 mg)",
            brand: "ABECMED (Associação Nacional)",
            origin: "Nacional",
            activeIngredients: "Fitocanabinoides Full Spectrum com predomínio de Canabidiol (CBD)",
            concentration: "50 mg/mL de CBD (Total: 1.500 mg no frasco)",
            pharmaceuticalForm: "Solução Oleosa Sublingual / Oral (Frasco 30 mL)",
            quantity: "01 Frasco de 30 mL",
            administrationRoute: "Via Sublingual / Oral",
            dosage: [
              "Tomar 05 gotas por via sublingual de 12 em 12 horas.",
              "Reter sob a língua por 60 segundos antes de engolir para máxima absorção."
            ],
            description: "Óleo Full Spectrum nacional da ABECMED em extração RSO diluído em MCT puro."
          }
        ];

        await generatePrescriptionPDF(currentPatientData.name, [], {
          customPatientName: currentPatientData.name,
          cpf: currentPatientData.cpf,
          birthDate: currentPatientData.birthDate,
          emissionDate: currentPatientData.emissionDate,
          customDoctorName: currentPatientData.doctorName,
          customDoctorCrm: currentPatientData.doctorCrm,
          customDoctorSpecialty: currentPatientData.doctorSpecialty,
          customItems: defaultItems,
          customNotes: "Medicamento de uso contínuo individualizado. Receita válida por 6 meses."
        });
        setDirectSuccessMessage("Receita Médica Digital baixada com sucesso!");
      } else if (docType === 'laudo_inicial' || docType === 'laudo_evolutivo') {
        await generateMedicalReportPDF(currentPatientData.name, [], {
          customPatientName: currentPatientData.name,
          cpf: currentPatientData.cpf,
          birthDate: currentPatientData.birthDate,
          emissionDate: currentPatientData.emissionDate,
          customDoctorName: currentPatientData.doctorName,
          customDoctorCrm: currentPatientData.doctorCrm,
          customDoctorSpecialty: currentPatientData.doctorSpecialty,
          reportType: docType === 'laudo_evolutivo' ? 'evolutivo' : 'inicial',
          customDiagnosis: currentPatientData.diagnosis || "Quadro clínico crônico com indicação de fitocanabinoides",
          customRationale: "Modulação homeostática de receptores CB1 e CB2 do Sistema Endocanabinoide.",
          customTreatmentPlan: "Fitocanabinoides orais de espectro integral com titulação progressiva.",
          customMonitoring: "Retorno agendado em 30 dias para avaliação de tolerabilidade e desfecho."
        });
        setDirectSuccessMessage(docType === 'laudo_evolutivo' ? "Laudo Evolutivo baixado com sucesso!" : "Laudo Médico Inicial baixado com sucesso!");
      } else if (docType === 'psicomotor') {
        await generatePsychomotorReportPDF(currentPatientData.name, {
          customPatientName: currentPatientData.name,
          cpf: currentPatientData.cpf,
          birthDate: currentPatientData.birthDate,
          emissionDate: currentPatientData.emissionDate,
          customDoctorName: currentPatientData.doctorName,
          customDoctorCrm: currentPatientData.doctorCrm,
          customDoctorSpecialty: currentPatientData.doctorSpecialty
        });
        setDirectSuccessMessage("Laudo de Aptidão Psicomotora baixado com sucesso!");
      } else if (docType === 'agronomico') {
        await generateAgronomicReportPDF(currentPatientData.name, {
          customPatientName: currentPatientData.name,
          cpf: currentPatientData.cpf,
          emissionDate: currentPatientData.emissionDate,
          diagnosis: currentPatientData.diagnosis || "Finalidade Medicinal para Auto-cultivo",
          dailyDoseMg: 5000,
          targetPlants: 18,
          agronomistName: "Wilian Dalenogare Pereira",
          agronomistCrea: "CREA-PR 172.458/D"
        });
        setDirectSuccessMessage("Laudo Agronômico baixado com sucesso!");
      }

      setTimeout(() => setDirectSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Erro na emissão direta:", err);
    } finally {
      setIsGeneratingDirect(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-[#0D0D15] border border-mecura-elevated rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#141420] via-[#10101A] to-[#141420] border-b border-mecura-elevated flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <FilePlus2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Central de Emissão Avulsa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CRM/CFM Oficial
                </span>
              </div>
              <p className="text-xs text-mecura-silver">
                Emita ou retifique receitas e laudos a qualquer momento, sem precisar consultar ou alterar o status do paciente.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        <AnimatePresence>
          {directSuccessMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 flex items-center gap-2 text-emerald-300 text-xs font-bold"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{directSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: Escolha do Paciente */}
          <div className="bg-[#12121D] border border-mecura-elevated rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <User className="w-4 h-4" />
                <span>1. Dados do Paciente & Identificação</span>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-[#09090F] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'existing' 
                      ? 'bg-emerald-500 text-black shadow-sm font-black' 
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <History className="w-3 h-3" /> Pacientes do Sistema ({queue.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('manual');
                    setSelectedPatientId('');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'manual' 
                      ? 'bg-emerald-500 text-black shadow-sm font-black' 
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3 h-3" /> Paciente Avulso / Manual
                  </span>
                </button>
              </div>
            </div>

            {/* Existing patient search & selector */}
            {mode === 'existing' && (
              <div className="space-y-3 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mecura-silver" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar paciente da fila ou histórico por nome, CPF ou WhatsApp..."
                    className="w-full bg-[#07070C] border border-mecura-elevated rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-500"
                  />
                </div>

                {/* Patient quick chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 max-h-32 flex-wrap">
                  {filteredPatients.map((p, pIdx) => {
                    const isSelected = selectedPatientId === p.id;
                    return (
                      <button
                        key={`${p.id || 'patient'}-${pIdx}`}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                            : 'bg-[#09090F] border-white/5 text-mecura-silver hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-mecura-surface flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/10">
                          {p.patientName ? p.patientName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{p.patientName}</p>
                          <p className="text-[10px] text-mecura-silver/80">{p.answers?.cpf || p.cpf || 'Sem CPF'} • {p.status || 'Cadastrado'}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Editable Patient Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Nome Completo do Paciente *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do Paciente"
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">CPF do Paciente *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Data de Nascimento</label>
                <input
                  type="text"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Data da Emissão</label>
                <input
                  type="text"
                  value={emissionDate}
                  onChange={(e) => setEmissionDate(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Doctor Info (Standardized) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Médico Prescritor Responsável</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Registro Profissional (CRM/UF)</label>
                <input
                  type="text"
                  value={doctorCrm}
                  onChange={(e) => setDoctorCrm(e.target.value)}
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-mecura-silver block mb-1">Especialidade / Titulação</label>
                <input
                  type="text"
                  value={doctorSpecialty}
                  onChange={(e) => setDoctorSpecialty(e.target.value)}
                  className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Diagnosis field */}
            <div>
              <label className="text-[11px] font-bold text-mecura-silver block mb-1">Diagnóstico Clínico / CID-10 (Utilizado nos Laudos e Prescrições)</label>
              <input
                type="text"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="Ex: Transtorno de Ansiedade Generalizada (CID-10 F41.1) e Dor Crônica (CID-10 M79.7)"
                className="w-full bg-[#08080E] border border-mecura-elevated rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* STEP 2: Seleção do Documento a Emitir */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
                <span>2. Selecione o Documento para Edição & Emissão</span>
              </div>
              <span className="text-[11px] text-mecura-silver">
                Todos os PDFs são gerados no padrão oficial Mecura com carimbo, QR code e assinatura digital
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* CARD 1: Receita Médica Digital */}
              <div className="bg-[#12121D] hover:bg-[#151522] border border-emerald-500/30 hover:border-emerald-500 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
                        <Pill className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                        Receita Médica Digital (Avulsa)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Mais Usado
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver leading-relaxed mb-4">
                    Prescreva medicamentos de todas as linhas (ABECMED Nacional, Associações Brasileiras, Flowermed EUA e Flores/Extrações). Edite formas, vias, doses e posologias personalizadas.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLaunchPrescription}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <span>Editar Receita Completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingDirect}
                    onClick={() => handleFastDirectDownload('receita')}
                    title="Baixar PDF rápido com medicamento padrão"
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD 2: Laudo Médico Inicial */}
              <div className="bg-[#12121D] hover:bg-[#151522] border border-blue-500/30 hover:border-blue-500 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/40">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                        Laudo Médico Inicial (Parecer)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
                      Parecer Clínico
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver leading-relaxed mb-4">
                    Parecer técnico inicial com fundamentação fisiopatológica do Sistema Endocanabinoide, justificativa de indicação, CID-10 e plano terapêutico inicial.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleLaunchMedicalReport('inicial')}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    <span>Editar Laudo Inicial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingDirect}
                    onClick={() => handleFastDirectDownload('laudo_inicial')}
                    title="Baixar PDF do Laudo Inicial"
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD 3: Laudo Médico Evolutivo */}
              <div className="bg-[#12121D] hover:bg-[#151522] border border-purple-500/30 hover:border-purple-500 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                        Laudo Médico Evolutivo
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40">
                      Continuidade
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver leading-relaxed mb-4">
                    Laudo de acompanhamento periódico para comprovar resposta clínica favorável, melhora na qualidade de vida, ajuste posológico e necessidade de manutenção do tratamento.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleLaunchMedicalReport('evolutivo')}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    <span>Editar Laudo Evolutivo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingDirect}
                    onClick={() => handleFastDirectDownload('laudo_evolutivo')}
                    title="Baixar PDF do Laudo Evolutivo"
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD 4: Laudo Psicomotor */}
              <div className="bg-[#12121D] hover:bg-[#151522] border border-amber-500/30 hover:border-amber-500 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        Laudo de Aptidão Psicomotora
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      CTB & Direção
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver leading-relaxed mb-4">
                    Atestado específico comprovando que as doses prescritas não causam alteração cognitiva ou comprometimento psicomotor, resguardando o paciente para atividades rotineiras e trânsito (CTB / Art. 165).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLaunchPsychomotor}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <span>Editar Laudo Psicomotor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingDirect}
                    onClick={() => handleFastDirectDownload('psicomotor')}
                    title="Baixar PDF Psicomotor"
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD 5: Laudo Agronômico (Auto-cultivo / HC) */}
              <div className="md:col-span-2 bg-[#12121D] hover:bg-[#151522] border border-green-500/30 hover:border-green-500 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-300 flex items-center justify-center border border-green-500/40">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-green-300 transition-colors">
                        Laudo Agronômico de Auto-cultivo (Instrução de Habeas Corpus)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-500/20 text-green-400 border border-green-500/40">
                      Habeas Corpus & Cultivo
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver leading-relaxed mb-4">
                    Parecer técnico agronômico assinado por Engenheiro Agrônomo habilitado (CREA). Calcula gramatura anual necessária, rendimento por planta, ciclos de cultivo e número de plantas/sementes para instrução jurídica de HC.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLaunchAgronomic}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    <span>Editar Laudo Agronômico</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingDirect}
                    onClick={() => handleFastDirectDownload('agronomico')}
                    title="Baixar PDF Agronômico"
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#09090F] border-t border-mecura-elevated flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-mecura-silver">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documentos gerados em conformidade com RDC ANVISA e resoluções do CFM.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
