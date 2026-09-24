import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Eye, Edit3, User, Sprout, Send, Copy, Check } from 'lucide-react';

interface AgronomicReportEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  setPatientName: (val: string) => void;
  cpf: string;
  setCpf: (val: string) => void;
  emissionDate: string;
  setEmissionDate: (val: string) => void;
  agronomistName: string;
  setAgronomistName: (val: string) => void;
  agronomistCrea: string;
  setAgronomistCrea: (val: string) => void;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  dailyDoseMg: number;
  setDailyDoseMg: (val: number) => void;
  targetPlants: number;
  setTargetPlants: (val: number) => void;
  agronomicText: string;
  setAgronomicText: (val: string) => void;
  onDownloadPDF: () => void;
  onSendToChat?: () => void;
}

export function AgronomicReportEditorModal({
  isOpen,
  onClose,
  patientName,
  setPatientName,
  cpf,
  setCpf,
  emissionDate,
  setEmissionDate,
  agronomistName,
  setAgronomistName,
  agronomistCrea,
  setAgronomistCrea,
  diagnosis,
  setDiagnosis,
  dailyDoseMg,
  setDailyDoseMg,
  targetPlants,
  setTargetPlants,
  agronomicText,
  setAgronomicText,
  onDownloadPDF,
  onSendToChat
}: AgronomicReportEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Math metrics
  const annualMg = dailyDoseMg * 365;
  const annualGramsActive = (annualMg / 1000).toFixed(1);
  const dryFlowerKg = ((annualMg / 1000) / 0.10 / 1000).toFixed(2);
  const dryFlowerMarginKg = (Number(dryFlowerKg) * 1.30).toFixed(2);
  const plantsPerCycle = Math.ceil(targetPlants / 3);
  const seedsNeeded = Math.ceil(targetPlants * 1.30);

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      onDownloadPDF();
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handleCopy = () => {
    const plainText = `PARECER TÉCNICO AGRONÔMICO — DIMENSIONAMENTO DE CULTIVO DE CANNABIS MEDICINAL
Paciente: ${patientName} | CPF: ${cpf}
Responsável Técnico: ${agronomistName} (${agronomistCrea})
Data de Emissão: ${emissionDate}
Indicação Clínica: ${diagnosis}

MEMÓRIA DE CÁLCULO E DIMENSIONAMENTO:
- Demanda Diária: ${dailyDoseMg} mg/dia
- Consumo Anual: ${annualGramsActive}g de canabinoides/ano
- Biomassa Seca Anual com Margem (30%): ${dryFlowerMarginKg} kg de flores secas
- Total de Plantas Autorizadas: ${targetPlants} espécimes
- Plantas em Floração por Ciclo: ${plantsPerCycle} plantas/ciclo (3 ciclos anuais)
- Sementes Necessárias: ${seedsNeeded} unidades

Parecer conclusivo: O cultivo individual é compatível com a necessidade terapêutica prescrita para 12 meses e instrui a ação de Habeas Corpus Preventivo para salvo-conduto.`;
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">Laudo Agronômico (Cálculo de Plantas / HC)</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                    Pacote Premium & HC
                  </span>
                </div>
                <p className="text-xs text-mecura-silver">
                  Parecer técnico pericial de autocultivo e dimensionamento agronômico de biomassa
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
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Parâmetros & Cálculo
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'preview'
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Prévia Oficial A4
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
            {activeTab === 'edit' ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Identification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Paciente */}
                  <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-mecura-elevated/50 pb-2">
                      <User className="w-4 h-4" /> Paciente Requerente
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Nome do Paciente</label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">CPF</label>
                          <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Data de Emissão</label>
                          <input
                            type="text"
                            value={emissionDate}
                            onChange={(e) => setEmissionDate(e.target.value)}
                            className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Diagnóstico / Patologias</label>
                        <input
                          type="text"
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Eng. Agrônomo */}
                  <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-mecura-elevated/50 pb-2">
                      <Sprout className="w-4 h-4" /> Engenheiro Agrônomo Responsável
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Nome do Agrônomo Perito</label>
                        <input
                          type="text"
                          value={agronomistName}
                          onChange={(e) => setAgronomistName(e.target.value)}
                          className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">Registro Profissional (CREA)</label>
                        <input
                          type="text"
                          value={agronomistCrea}
                          onChange={(e) => setAgronomistCrea(e.target.value)}
                          className="w-full bg-[#0D0D12] text-sm text-white font-semibold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Controls */}
                <div className="bg-[#0A0A0F]/70 rounded-xl border border-emerald-500/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      Dimensionamento Matemático de Plantas & Biomassa (Salvo-Conduto)
                    </h4>
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold">
                      GACP & RDC ANVISA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">
                        Demanda Diária do Paciente (mg de canabinoides/dia)
                      </label>
                      <input
                        type="number"
                        min="10"
                        step="10"
                        value={dailyDoseMg}
                        onChange={(e) => setDailyDoseMg(Number(e.target.value) || 0)}
                        className="w-full bg-[#12121A] text-sm text-emerald-400 font-bold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-mecura-silver mt-1">
                        Equivale a {(dailyDoseMg * 30 / 1000).toFixed(1)}g / mês e {annualGramsActive}g / ano.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-mecura-silver uppercase mb-1">
                        Meta de Plantas no Laudo (Espécimes Totais Recomendadas)
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="120"
                        value={targetPlants}
                        onChange={(e) => setTargetPlants(Number(e.target.value) || 0)}
                        className="w-full bg-[#12121A] text-sm text-emerald-400 font-bold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-mecura-silver mt-1">
                        Divididas em 3 ciclos anuais: {plantsPerCycle} plantas por colheita (+ vegetativo e matrizes).
                      </p>
                    </div>
                  </div>

                  {/* Summary metric cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-mecura-silver block font-semibold uppercase">Flor Seca Anual</span>
                      <span className="text-white font-mono font-bold text-sm">{dryFlowerMarginKg} kg</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-mecura-silver block font-semibold uppercase">Plantas Totais</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">{targetPlants} espécimes</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-mecura-silver block font-semibold uppercase">Por Ciclo (Floração)</span>
                      <span className="text-white font-mono font-bold text-sm">{plantsPerCycle} plantas</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-mecura-silver block font-semibold uppercase">Sementes Estimadas</span>
                      <span className="text-white font-mono font-bold text-sm">{seedsNeeded} unidades</span>
                    </div>
                  </div>
                </div>

                {/* Justificativa Técnica Editável */}
                <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Texto Conclusivo do Parecer Técnico</span>
                    <button
                      onClick={handleCopy}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiado!' : 'Copiar Resumo'}
                    </button>
                  </h4>
                  <textarea
                    rows={6}
                    value={agronomicText}
                    onChange={(e) => setAgronomicText(e.target.value)}
                    className="w-full bg-[#0D0D12] text-xs text-mecura-silver border border-mecura-elevated rounded-lg p-3 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono"
                  />
                </div>
              </div>
            ) : (
              /* PREVIEW A4 */
              <div className="max-w-3xl mx-auto bg-white text-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl font-sans text-xs leading-relaxed">
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-emerald-600 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-800 tracking-tight">MECURA</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        PARECER AGRONÔMICO
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Assessoria Pericial Técnica para Instrução de Habeas Corpus Preventivo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-900">LAUDO TÉCNICO DE AUTOCULTIVO</p>
                    <p className="text-[10px] text-slate-500">Salvo-Conduto de Cultivo Medicinal</p>
                    <p className="text-[9px] text-emerald-700 font-semibold">Emissão: {emissionDate}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h1 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wide">
                    PARECER TÉCNICO AGRONÔMICO DE DIMENSIONAMENTO DE CULTIVO
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Indicações técnicas para cultivo individualizado de <em>Cannabis sativa L.</em> com finalidade medicinal
                  </p>
                </div>

                {/* Box Paciente / Agrônomo */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 text-[11px]">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Paciente Requerente</p>
                    <p className="text-sm font-bold text-slate-900">{patientName}</p>
                    <p className="text-slate-600">CPF: <strong>{cpf}</strong></p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Patologia: {diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Responsável Técnico</p>
                    <p className="text-sm font-bold text-slate-900">{agronomistName}</p>
                    <p className="text-slate-600">CREA: <strong>{agronomistCrea}</strong></p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Engenharia Agronômica & Fitoterapia</p>
                  </div>
                </div>

                {/* Table */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2">
                    Quadro 1 — Memória de Cálculo & Dimensionamento Agronômico
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-300 p-2 text-left">Parâmetro de Dimensionamento</th>
                        <th className="border border-slate-300 p-2 text-center">Referência Técnica</th>
                        <th className="border border-slate-300 p-2 text-right">Quantitativo Calculado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">Consumo Diário Prescrito</td>
                        <td className="border border-slate-300 p-2 text-center">Posologia Médica</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{dailyDoseMg} mg/dia</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border border-slate-300 p-2">Demanda Anual de Ativos (365 dias)</td>
                        <td className="border border-slate-300 p-2 text-center">Uso contínuo ininterrupto</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{annualGramsActive} g de canabinoides</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Biomassa Seca Anual c/ Margem (30%)</td>
                        <td className="border border-slate-300 p-2 text-center">Segurança contra pragas e clima</td>
                        <td className="border border-slate-300 p-2 text-right font-bold text-emerald-800">{dryFlowerMarginKg} kg flores secas/ano</td>
                      </tr>
                      <tr className="bg-emerald-50/80 font-bold">
                        <td className="border border-slate-300 p-2 text-emerald-900">Total de Plantas Recomendadas</td>
                        <td className="border border-slate-300 p-2 text-center text-emerald-900">3 colheitas anuais</td>
                        <td className="border border-slate-300 p-2 text-right text-emerald-900 text-xs">{targetPlants} espécimes</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Plantas em Floração por Ciclo</td>
                        <td className="border border-slate-300 p-2 text-center">Garantia de fluxo terapêutico</td>
                        <td className="border border-slate-300 p-2 text-right">{plantsPerCycle} plantas / ciclo</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border border-slate-300 p-2">Sementes / Propágulos Estimados</td>
                        <td className="border border-slate-300 p-2 text-center">30% taxa de germinação</td>
                        <td className="border border-slate-300 p-2 text-right">{seedsNeeded} unidades anuais</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Conclusion */}
                <div className="bg-slate-50 border-l-4 border-emerald-600 p-3 mb-6 text-[10.5px] leading-relaxed text-slate-700">
                  <p>
                    <strong>Conclusão Técnica:</strong> A quantidade dimensionada de <strong>{targetPlants} espécimes de Cannabis sativa L.</strong> ({plantsPerCycle} plantas por ciclo em floração mais estágio vegetativo) é estritamente proporcional à demanda médica do paciente para o período de 12 meses, garantindo sua soberania em saúde e instruindo a concessão do salvo-conduto nos termos constitucionais.
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-center text-[10px]">
                  <div>
                    <p className="font-bold text-slate-900">{agronomistName}</p>
                    <p className="text-slate-600">Engenheiro Agrônomo — {agronomistCrea}</p>
                    <p className="text-slate-400 text-[9px]">Perícia & Dimensionamento de Cultivo</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Mecura Saúde & Bem-Estar</p>
                    <p className="text-slate-600">Protocolo de Apoio Jurídico & Terapêutico</p>
                    <p className="text-emerald-700 font-semibold text-[9px]">Assinatura com Certificação Digital</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-mecura-elevated bg-[#0A0A0F] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-[#12121A] text-mecura-silver hover:text-white rounded-xl text-xs font-semibold border border-mecura-elevated flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {onSendToChat && (
                <button
                  onClick={onSendToChat}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Laudo no Chat</span>
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Gerando PDF...' : 'Baixar Parecer Técnico (PDF)'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
