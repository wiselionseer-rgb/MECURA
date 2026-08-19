import React, { useState } from 'react';
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
  HeartHandshake
} from 'lucide-react';

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
  onDownloadPDF
}: MedicalReportEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

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
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">Laudo Médico Pericial & Clínico</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    Visualizar & Editar
                  </span>
                </div>
                <p className="text-xs text-mecura-silver">
                  Documento detalhado com diagnóstico, fisiopatologia do SEC e fundamentação terapêutica
                </p>
              </div>
            </div>

            {/* Tab Switcher & Close */}
            <div className="flex items-center gap-3">
              <div className="bg-mecura-surface border border-mecura-elevated rounded-xl p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
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
                  onClick={() => setActiveTab('preview')}
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
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-mecura-silver hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
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
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CPF</label>
                          <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data Nasc.</label>
                          <input
                            type="text"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
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
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">CRM / UF</label>
                          <input
                            type="text"
                            value={doctorCrm}
                            onChange={(e) => setDoctorCrm(e.target.value)}
                            className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-mecura-silver font-medium block mb-1">Data Emissão</label>
                          <input
                            type="text"
                            value={emissionDate}
                            onChange={(e) => setEmissionDate(e.target.value)}
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
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
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
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    placeholder="Fundamentação técnico-científica sobre a indicação de fitocanabinoides..."
                  />
                </div>

                {/* Section 4: Conduta Proposta & Medicamentos */}
                <div className="p-4 bg-mecura-surface/40 border border-mecura-elevated rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      4. Conduta Terapêutica Proposta & Medicamentos
                    </label>
                    <span className="text-[10px] text-mecura-silver">Formulação recomendada, posologia e via</span>
                  </div>
                  <textarea
                    rows={4}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
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
                    value={monitoring}
                    onChange={(e) => setMonitoring(e.target.value)}
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
                        <h3 className="text-sm font-bold text-[#1E1B4B]">{doctorName}</h3>
                        <p className="text-xs text-slate-600 font-semibold">{doctorCrm}</p>
                        <p className="text-[10px] text-slate-500">{doctorSpecialty}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-3">
                      <h1 className="text-base font-bold text-[#1E1B4B] uppercase tracking-widest">
                        Laudo Médico Pericial e Justificativa Terapêutica
                      </h1>
                      <div className="w-20 h-0.5 bg-[#059669] mx-auto mt-1" />
                    </div>

                    {/* Patient Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-4 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">1. Paciente</span>
                        <span className="font-bold text-slate-900 text-sm">{patientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">CPF / Nasc.</span>
                        <span className="font-semibold text-slate-700">{cpf} • {birthDate}</span>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        2. Diagnóstico e Quadro Clínico
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {diagnosis}
                      </p>
                    </div>

                    {/* Section 3 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        3. Justificativa & Fisiopatologia do Sistema Endocanabinoide (SEC)
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {rationale}
                      </p>
                    </div>

                    {/* Section 4 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        4. Conduta Proposta & Medicamentos
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {treatmentPlan}
                      </p>
                    </div>

                    {/* Section 5 */}
                    <div className="my-4">
                      <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                        5. Monitoramento Clínico & Recomendações
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-100">
                        {monitoring}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Signature */}
                  <div className="pt-6 border-t border-slate-200 mt-6 flex justify-between items-end">
                    <div className="text-[10px] text-slate-500">
                      <p>Data de Emissão: {emissionDate}</p>
                      <p>Documento com validade pericial e assistencial</p>
                      <p className="text-[9px] text-slate-400 mt-1">Conforme Resoluções CFM e Diretrizes ANVISA</p>
                    </div>

                    <div className="text-center w-52">
                      <div className="border-b border-slate-400 pb-1 mb-1" />
                      <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                      <p className="text-[10px] text-slate-600 font-semibold">{doctorCrm}</p>
                      <p className="text-[9px] text-slate-500">Assinatura Digital / Médico Prescritor</p>
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
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Gerando Laudo...' : 'Gerar e Baixar Laudo Clínico (PDF)'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
