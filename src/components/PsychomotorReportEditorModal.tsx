import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Download, Eye, Edit3, User, Calendar, ClipboardList } from 'lucide-react';

interface PsychomotorReportEditorModalProps {
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
  psychomotorText: string;
  setPsychomotorText: (val: string) => void;
  onDownloadPDF: () => void;
}

export function PsychomotorReportEditorModal({
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
  psychomotorText,
  setPsychomotorText,
  onDownloadPDF
}: PsychomotorReportEditorModalProps) {
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">Laudo Psicomotor (Lei do Drogômetro)</h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/30">
                    Visualizar & Editar
                  </span>
                </div>
                <p className="text-xs text-mecura-silver">
                  Documento de aptidão e avaliação de capacidade psicomotora
                </p>
              </div>
            </div>

            {/* Tab Switcher & Close */}
            <div className="flex items-center gap-3">
              <div className="bg-mecura-surface border border-mecura-elevated rounded-xl p-1 flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'edit'
                      ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar Seções
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'preview'
                      ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Prévia Laudo A4
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-mecura-surface border border-mecura-elevated flex items-center justify-center text-mecura-silver hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
            {activeTab === 'edit' ? (
              <div className="max-w-4xl mx-auto space-y-6">
                  {/* SECTION 1 - IDENTIFICAÇÃO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paciente */}
                    <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                      <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-mecura-elevated/50 pb-2">
                        <User className="w-4 h-4" /> IDENTIFICAÇÃO DO PACIENTE
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Nome do Paciente</label>
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">CPF</label>
                            <input
                              type="text"
                              value={cpf}
                              onChange={(e) => setCpf(e.target.value)}
                              className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Data Nasc.</label>
                            <input
                              type="text"
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Médico */}
                    <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                      <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-mecura-elevated/50 pb-2">
                        <ShieldCheck className="w-4 h-4" /> IDENTIFICAÇÃO DO MÉDICO
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Médico Emitente</label>
                          <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">CRM / UF</label>
                            <input
                              type="text"
                              value={doctorCrm}
                              onChange={(e) => setDoctorCrm(e.target.value)}
                              className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Data Emissão</label>
                            <input
                              type="text"
                              value={emissionDate}
                              onChange={(e) => setEmissionDate(e.target.value)}
                              className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2 - TEXTO DO LAUDO */}
                  <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-mecura-elevated/50 pb-3">
                      <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> 2. CORPO DO LAUDO PSICOMOTOR
                      </h4>
                    </div>
                    <textarea
                      value={psychomotorText}
                      onChange={(e) => setPsychomotorText(e.target.value)}
                      className="w-full bg-[#0D0D12] text-sm text-gray-300 border border-mecura-elevated rounded-xl px-4 py-3 min-h-[400px] resize-y focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
            ) : (
              <div className="bg-white rounded-lg mx-auto w-full max-w-[794px] p-6 md:p-10 shadow-lg">
                <div className="max-w-[794px] mx-auto bg-white relative">
                  <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                      <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                        CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{doctorName}</h3>
                      <p className="text-xs text-[#475569] font-semibold m-0">{doctorCrm}</p>
                      <p className="text-[10px] text-[#64748B] m-0">{doctorSpecialty}</p>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO PSICOMOTOR</h1>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] mb-4">AVALIAÇÃO DA LEI DO DROGÔMETRO / APTIDÃO</p>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                        <span className="font-semibold">{patientName}</span>
                      </div>
                      <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                        {birthDate !== 'Não informada' && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDate}
                          </span>
                        )}
                        {cpf !== 'Não informado' && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-[#475569]">CPF:</span> {cpf}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-sm text-[#334155] leading-relaxed text-justify">
                    <div className="flex flex-col gap-2">
                      {psychomotorText.split('\n').map((p, i) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : <div key={i} className="h-2" />)}
                    </div>
                  </div>
                  
                  <div className="mt-20 pt-8 border-t border-[#E2E8F0]">
                    <div className="flex flex-col items-center">
                      <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
                      <p className="text-sm font-bold text-[#1E1B4B]">{doctorName}</p>
                      <p className="text-xs text-[#64748B] mb-4">{doctorCrm}</p>
                      <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                        <span>{emissionDate}</span>
                        <span>Válido em todo o território nacional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-mecura-elevated bg-[#0A0A0F]/90 flex flex-wrap-reverse justify-between gap-4 items-center rounded-b-2xl md:rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-transparent border border-mecura-elevated text-gray-300 rounded-xl text-sm font-semibold hover:bg-mecura-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Gerar e Baixar Laudo Psicomotor (PDF)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
