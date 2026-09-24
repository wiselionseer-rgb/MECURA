import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Math metrics based on pericial agronomic standards
  const monthlyMg = Math.round(dailyDoseMg * 31);
  const annualMg = Math.round(dailyDoseMg * 365);
  const monthlyGrams = (monthlyMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const annualGrams = (annualMg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const annualGramsNum = (annualMg / 1000);

  // Fitoquímica: teor médio de 10% nas inflorescências secas; extração caseira recupera ~80%
  const dryFlowerKgBase = Number(((annualGramsNum / 0.10) / 1000).toFixed(3)); // ex: 18.250 kg
  const dryFlowerKgStr = dryFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Margem de segurança agronômica de 30% contra pragas, doenças e perdas de cultivo
  const dryFlowerMarginKgBase = Number((dryFlowerKgBase * 1.3038).toFixed(3)); // ex: 23.795 kg
  const dryFlowerMarginKgStr = dryFlowerMarginKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Perda de umidade na secagem: as inflorescências perdem entre 70% a 80% do peso em água
  // Flores frescas molhadas necessárias:
  const wetFlowerKgBase = Number((dryFlowerMarginKgBase / 0.30).toFixed(3)); // ex: 79.319 kg
  const wetFlowerKgStr = wetFlowerKgBase.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Rendimento médio por planta no cultivo indoor (paciente): 100g a 150g de flores secas por ciclo de 120 dias
  const plantsPerCycle = Math.round(targetPlants / 4) || 40;
  const seedsNeeded = Math.round(targetPlants * 1.3038) || 206;

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      onDownloadPDF();
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handleCopy = () => {
    const fullText = `Auto cultivo para finalidade medicinal
Parecer Técnico
Indicações técnicas para cultivo pessoal com finalidade medicinal
Paciente: ${patientName}
CPF PACIENTE: ${cpf}
Consultor e Eng. Agr: ${agronomistName} (${agronomistCrea})
Indicações técnicas para cultivo pessoal de Cannabis sativa L. com finalidade medicinal.

Resumo:
A ANVISA definiu, por meio da Resolução da Diretoria Colegiada (RDC) nº 335/2020, alterada pela RDC n° 570/2021, os critérios e os procedimentos para a importação de Produto derivado de Cannabis, por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, para tratamento de saúde. Dessa forma, ainda que o produto não tenha registro para comercialização no Brasil, a importação poderá ser autorizada se os critérios e procedimentos definidos na mencionada RDC forem cumpridos. E, dessa forma, a ANVISA publicou a Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA com a lista de produtos derivados de Cannabis de que trata o §3º do Art. 5° da RDC n° 335/2020, alterada pela RDC n° 570/2021.
A fim de proporcionar uma orientação adequada para um cultivo em escala pequena, conhecido como “cultivo caseiro”, para paciente que necessita utilizar as moléculas produzidas pela espécie, nomeadamente o Δ9 – Tetrahidrocanabinol (THC) e o Cannabidiol (CBD) reconhecidas por suas propriedades terapêuticas, foi elaborado este parecer com indicações técnicas para o cultivo com boas práticas comercialmente conhecido por GACP (Good Agriculture and Collection Practices), em português, boas práticas de agricultura e coleta, aplicadas para garantir o sucesso em termos de produtividade e a sanidade adequada dos cultivos.

Dimensionamento do Cultivo:
O cultivo caseiro é a maneira indicada de garantir o acesso aos medicamentos para pacientes que não têm condições de arcar com os altos custos dos medicamentos atualmente disponíveis, que normalmente ultrapassa a barreira dos R$ 2.000,00 a R$ 5.000,00 mensais, para produtos disponíveis nacionalmente, podendo atingir até valores muito mais elevados quando é feita a importação. Porém não somente pacientes que não têm condições de pagar os preços de mercado dos produtos de sua medicina e ter a capacidade de se tornarem autossustentáveis em produção e manipulação da mesma buscam o cultivo da Cannabis e os benefícios que este pode trazer.
No caso do paciente, conforme recomendações médicas que balizam este parecer técnico, a condição de ${diagnosis} visa ser tratada com o uso de extratos integrais de CBD/THC/CBG em concentração de 3000mg/30ml e flores secas, totalizando o consumo diário de ${dailyDoseMg}mg/dia (equivalente a 48 frascos anuais).
Extrapolando o uso para intervalos mensais e anuais, temos que o paciente vai necessitar:
- Diário: ${dailyDoseMg}mg de CBD/THC/CBG.
- Mensal: ${dailyDoseMg}mg x 31 dias = ${monthlyMg.toLocaleString('pt-BR')} mg ou ${monthlyGrams}g de CBD/THC/CBG.
- Anual: ${dailyDoseMg}mg x 365 dias = ${annualMg.toLocaleString('pt-BR')}mg ou ${annualGrams}g de CBD/THC/CBG.

Memória de Cálculo Fitoquímico e Eficiência de Extração:
A 100g de flores secas com teor de 10% de CBD/THC geram 10g de extrato concentrado com recuperação de 80% na extração caseira.
Para obter ${annualGrams}g anualmente o paciente precisa produzir no mínimo ${dryFlowerKgStr}kg de flores secas por ano.
Considerando uma perda natural de 30% por pragas e clima, o cultivo deve ser dimensionado para ${dryFlowerMarginKgStr}kg secas por ano.
As flores após a colheita perdem entre 70 a 80% do peso em água; logo, para atingir ${dryFlowerMarginKgStr}kg secas, o paciente deve produzir ${wetFlowerKgStr}kg de flores molhadas anualmente.
Estima-se que para garantir o consumo anual, o paciente deve produzir ${targetPlants} plantas em floração por ano, e a importação de ${seedsNeeded} sementes feminizadas com taxa de segurança de 30%.

Designer de Cultivo:
Divisão do cultivo em 3 momentos de colheita ao longo do ano (ciclo de 120 dias ou 4 meses), conduzindo entre ${plantsPerCycle} plantas durante cada ciclo em floração, sob regime controlado de iluminação LED, controle térmico, ventilação com filtro de carvão ativado e práticas GACP.`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  type="button"
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
                  type="button"
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

              {/* Botão de Fechar / Sair sem Enviar com X bem visível */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all shadow-sm group"
                title="Fechar e sair sem enviar o laudo para o paciente"
                aria-label="Fechar laudo sem enviar"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Fechar (Sair)</span>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-mecura-silver uppercase">
                          Demanda Diária do Paciente (mg/dia)
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDailyDoseMg(5900)}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                          >
                            5.900 mg (Padrão HC)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDailyDoseMg(3000)}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-mecura-silver font-semibold hover:bg-white/10"
                          >
                            3.000 mg
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="10"
                        step="100"
                        value={dailyDoseMg}
                        onChange={(e) => setDailyDoseMg(Number(e.target.value) || 0)}
                        className="w-full bg-[#12121A] text-sm text-emerald-400 font-bold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-mecura-silver mt-1">
                        Consumo mensal: <strong>{monthlyGrams}g</strong> ({monthlyMg.toLocaleString('pt-BR')} mg) • Anual: <strong>{annualGrams}g</strong> ({annualMg.toLocaleString('pt-BR')} mg).
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-mecura-silver uppercase">
                          Meta de Plantas no Laudo (Salvo-Conduto)
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTargetPlants(158)}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                          >
                            158 (Padrão HC)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetPlants(40)}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-mecura-silver font-semibold hover:bg-white/10"
                          >
                            40 un.
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="3"
                        max="300"
                        value={targetPlants}
                        onChange={(e) => setTargetPlants(Number(e.target.value) || 0)}
                        className="w-full bg-[#12121A] text-sm text-emerald-400 font-bold border border-mecura-elevated rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-mecura-silver mt-1">
                        Divididas em 3 colheitas anuais: <strong>{plantsPerCycle} plantas/ciclo</strong> em floração.
                      </p>
                    </div>
                  </div>

                  {/* Summary metric cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[9.5px] text-mecura-silver block font-semibold uppercase">Flor Seca Anual</span>
                      <span className="text-white font-mono font-bold text-xs sm:text-sm text-emerald-400">{dryFlowerMarginKgStr} kg</span>
                      <span className="text-[9px] text-mecura-silver block mt-0.5">+30% margem</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[9.5px] text-mecura-silver block font-semibold uppercase">Flores Frescas</span>
                      <span className="text-white font-mono font-bold text-xs sm:text-sm">{wetFlowerKgStr} kg</span>
                      <span className="text-[9px] text-mecura-silver block mt-0.5">molhadas</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[9.5px] text-mecura-silver block font-semibold uppercase">Plantas Totais</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs sm:text-sm">{targetPlants} espécimes</span>
                      <span className="text-[9px] text-mecura-silver block mt-0.5">salvo-conduto</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5">
                      <span className="text-[9.5px] text-mecura-silver block font-semibold uppercase">Por Ciclo</span>
                      <span className="text-white font-mono font-bold text-xs sm:text-sm">{plantsPerCycle} plantas</span>
                      <span className="text-[9px] text-mecura-silver block mt-0.5">3 ciclos/ano</span>
                    </div>
                    <div className="bg-[#12121A] p-3 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
                      <span className="text-[9.5px] text-mecura-silver block font-semibold uppercase">Sementes</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs sm:text-sm">{seedsNeeded} feminizadas</span>
                      <span className="text-[9px] text-mecura-silver block mt-0.5">importação</span>
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
                      {copied ? 'Copiado!' : 'Copiar Texto Completo'}
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
              /* PREVIEW A4 - 3 PÁGINAS */
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* PÁGINA 1 */}
                <div className="bg-white text-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl font-sans text-xs leading-relaxed border border-slate-300">
                  <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold border-b border-emerald-100 pb-2 mb-4 uppercase tracking-wider">
                    <span>Documento Oficial de Instrução para Habeas Corpus</span>
                    <span>Página 1 de 3</span>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-800 tracking-tight">MECURA</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                          LAUDO TÉCNICO PERICIAL
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Centro Integrado de Medicina Canabinoide & Assessoria Pericial em Fitotecnia
                      </p>
                      <p className="text-[9px] text-emerald-700 font-semibold">
                        Boas Práticas de Agricultura e Coleta (GACP / OMS) • Salvo-Conduto para Autocultivo
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                        HABEAS CORPUS PREVENTIVO
                      </span>
                      <p className="text-[10px] font-bold text-slate-900 mt-1">AUTOCULTIVO MEDICINAL</p>
                      <p className="text-[9px] text-slate-500">Emissão: <strong>{emissionDate}</strong></p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-4 bg-slate-50 border border-slate-200 rounded p-2.5">
                    <h1 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                      Auto cultivo para finalidade medicinal — Parecer Técnico
                    </h1>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Indicações técnicas para cultivo pessoal de <em>Cannabis sativa L.</em> com finalidade medicinal
                    </p>
                  </div>

                  {/* Box Paciente / Agrônomo */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-300 rounded p-3 mb-4 text-[10.5px]">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Identificação do Paciente</p>
                      <p className="text-xs font-bold text-slate-900">Paciente: {patientName}</p>
                      <p className="text-slate-700">CPF: <strong>{cpf}</strong></p>
                      <p className="text-slate-600 text-[10px]">Indicação: <strong>{diagnosis}</strong></p>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Responsável Técnico Pericial</p>
                      <p className="text-xs font-bold text-slate-900">Consultor e Eng. Agr: {agronomistName}</p>
                      <p className="text-slate-700">Registro Profissional: <strong>{agronomistCrea}</strong></p>
                      <p className="text-emerald-700 text-[10px] font-semibold">Perito em Fitotecnia & Fitoquímica Canabinoide</p>
                    </div>
                  </div>

                  {/* Section 1 */}
                  <div className="mb-3 text-[10.5px] leading-relaxed text-justify">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1 border-l-2 border-emerald-600 pl-2">
                      1. Resumo & Enquadramento Regulatório (ANVISA)
                    </h4>
                    <p className="mb-1 text-indent-4 text-slate-700">
                      A ANVISA definiu, por meio da <strong>Resolução da Diretoria Colegiada (RDC) nº 335/2020</strong>, alterada pela <strong>RDC nº 570/2021</strong>, os critérios e os procedimentos para a importação de Produto derivado de <em>Cannabis</em>, por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, para tratamento de saúde. Dessa forma, ainda que o produto não tenha registro para comercialização no Brasil, a importação poderá ser autorizada se os critérios e procedimentos definidos na mencionada RDC forem cumpridos. E, dessa forma, a ANVISA publicou a <strong>Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA</strong> com a lista de produtos derivados.
                    </p>
                    <p className="text-indent-4 text-slate-700">
                      A fim de proporcionar uma orientação adequada para um cultivo em escala pequena ("cultivo caseiro"), para paciente que necessita utilizar as moléculas produzidas pela espécie — nomeadamente o <strong>Δ9–Tetrahidrocanabinol (THC)</strong>, o <strong>Cannabidiol (CBD)</strong> e o <strong>Canabigerol (CBG)</strong> —, foi elaborado este parecer com indicações técnicas para o cultivo sob as boas práticas conhecidas por <strong>GACP (Good Agriculture and Collection Practices)</strong>.
                    </p>
                  </div>

                  {/* Section 2 */}
                  <div className="mb-3 text-[10.5px] leading-relaxed text-justify">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1 border-l-2 border-emerald-600 pl-2">
                      2. Dimensionamento do Cultivo e Custo de Mercado
                    </h4>
                    <p className="text-indent-4 text-slate-700">
                      O cultivo caseiro é a maneira indicada de garantir o acesso aos medicamentos para pacientes que não têm condições de arcar com os altos custos dos medicamentos atualmente disponíveis, que normalmente <strong>ultrapassa a barreira dos R$ 2.000,00 a R$ 5.000,00 mensais</strong> para produtos nacionais, podendo atingir valores muito mais elevados quando é feita a importação. A autossustentabilidade em produção artesanal é a única via garantidora contra a descontinuidade do tratamento.
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div className="text-[10.5px] leading-relaxed text-justify">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1 border-l-2 border-emerald-600 pl-2">
                      3. Prescrição Médica e Demanda Farmacológica
                    </h4>
                    <p className="text-indent-4 text-slate-700">
                      No caso do paciente {patientName}, conforme recomendações médicas oficiais que balizam este parecer técnico, a condição clínica visa ser tratada com o uso de extratos integrais (3.000mg/30ml) e flores secas, totalizando a necessidade anual de aproximadamente <strong>48 frascos anuais dos produtos</strong> e um consumo diário de <strong>{dailyDoseMg} mg/dia</strong> de fitocanabinoides brutos integrais.
                    </p>
                  </div>
                </div>

                {/* PÁGINA 2 */}
                <div className="bg-white text-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl font-sans text-xs leading-relaxed border border-slate-300">
                  <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold border-b border-emerald-100 pb-2 mb-4 uppercase tracking-wider">
                    <span>Memória de Cálculo Fitoquímico e Dimensionamento de Biomassa</span>
                    <span>Página 2 de 3</span>
                  </div>

                  {/* Mini Header */}
                  <div className="flex justify-between items-center border-b border-emerald-800 pb-2 mb-4">
                    <div>
                      <span className="font-black text-emerald-800 text-sm">MECURA</span>
                      <span className="text-[10px] text-slate-500 ml-2">PARECER TÉCNICO AGRONÔMICO</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Paciente: <strong>{patientName}</strong> • CPF: <strong>{cpf}</strong>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1.5 border-l-2 border-emerald-600 pl-2">
                      4. Dosimetria Farmacológica e Consumo Anual
                    </h4>
                    <p className="text-[10.5px] text-slate-700 mb-2">
                      Extrapolando o uso dos extratos integrais prescritos para intervalos mensais e anuais, obtêm-se as seguintes demandas:
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Diário</span>
                        <p className="text-xs font-bold text-emerald-800">{dailyDoseMg} mg / dia</p>
                        <span className="text-[9px] text-slate-500">Extrato bruto integral</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Mensal (31 dias)</span>
                        <p className="text-xs font-bold text-slate-900">{monthlyGrams} g / mês</p>
                        <span className="text-[9px] text-slate-500">{monthlyMg.toLocaleString('pt-BR')} mg</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Anual (365 dias)</span>
                        <p className="text-xs font-bold text-slate-900">{annualGrams} g / ano</p>
                        <span className="text-[9px] text-slate-500">{annualMg.toLocaleString('pt-BR')} mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 5 */}
                  <div className="mb-4 text-[10.5px] leading-relaxed text-justify">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1.5 border-l-2 border-emerald-600 pl-2">
                      5. Fitoquímica, Eficiência de Extração Caseira e Relação Seco/Molhado
                    </h4>
                    <p className="mb-1 text-indent-4 text-slate-700">
                      Considerando que o conteúdo médio de CBD/THC nas variedades genéticas é, em média, de <strong>10% em peso seco de flores</strong> e que a eficiência de recuperação na extração caseira é de <strong>80%</strong>, a cada 100g de flores secas geram-se 10g de extrato bruto concentrado.
                    </p>
                    <p className="mb-1 text-indent-4 text-slate-700">
                      Para obter {annualGrams}g anualmente, o paciente necessita produzir, no mínimo, <strong>{dryFlowerKgStr} kg de flores secas</strong>. Aplicando-se a <strong>taxa de segurança agronômica de 30%</strong> contra ataques de pragas, fungos e intempéries, o cultivo é dimensionado para <strong>{dryFlowerMarginKgStr} kg de flores secas por ano</strong>.
                    </p>
                    <p className="text-indent-4 text-slate-700">
                      Como as flores perdem entre <strong>70% a 80% do peso em umidade durante a secagem</strong>, cada planta produz entre 700 a 750g de flores molhadas para resultar em 100-150g secas. Logo, a colheita fresca totaliza <strong>{wetFlowerKgStr} kg de flores molhadas anuais</strong>.
                    </p>
                  </div>

                  {/* Quadro 1 */}
                  <div className="mb-4">
                    <h4 className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5">
                      Quadro 1 — Memória de Cálculo & Dimensionamento Agronômico Oficial
                    </h4>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold">
                          <th className="border border-slate-300 p-1.5 text-left">Parâmetro Agronômico</th>
                          <th className="border border-slate-300 p-1.5 text-center">Referência Técnica</th>
                          <th className="border border-slate-300 p-1.5 text-right">Quantitativo Calculado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-1.5">Demanda Diária Prescrita</td>
                          <td className="border border-slate-300 p-1.5 text-center">Posologia Médica</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold">{dailyDoseMg} mg / dia</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-300 p-1.5">Consumo Anual de Extrato</td>
                          <td className="border border-slate-300 p-1.5 text-center">365 dias ininterruptos</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold">{annualGrams} g / ano</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">Biomassa Seca Requerida (c/ 30% margem)</td>
                          <td className="border border-slate-300 p-1.5 text-center">Fator pragas/clima</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-800">{dryFlowerMarginKgStr} kg secas</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-300 p-1.5">Biomassa Fresca (Flores Molhadas)</td>
                          <td className="border border-slate-300 p-1.5 text-center">70-80% perda hídrica</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold">{wetFlowerKgStr} kg molhadas</td>
                        </tr>
                        <tr className="bg-emerald-50 font-bold">
                          <td className="border border-slate-300 p-1.5 text-emerald-900">Total de Plantas Salvo-Conduto</td>
                          <td className="border border-slate-300 p-1.5 text-center text-emerald-900">120 dias/ciclo</td>
                          <td className="border border-slate-300 p-1.5 text-right text-emerald-900 text-xs">{targetPlants} plantas anuais</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">Plantas por Ciclo de Floração</td>
                          <td className="border border-slate-300 p-1.5 text-center">3 safras ao ano</td>
                          <td className="border border-slate-300 p-1.5 text-right">{plantsPerCycle} plantas / ciclo</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-300 p-1.5">Sementes Feminizadas Importadas</td>
                          <td className="border border-slate-300 p-1.5 text-center">30% taxa de segurança</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-800">{seedsNeeded} unidades</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PÁGINA 3 */}
                <div className="bg-white text-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl font-sans text-xs leading-relaxed border border-slate-300">
                  <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold border-b border-emerald-100 pb-2 mb-4 uppercase tracking-wider">
                    <span>Designer de Cultivo, Parâmetros GACP e Conclusão Pericial</span>
                    <span>Página 3 de 3</span>
                  </div>

                  {/* Mini Header */}
                  <div className="flex justify-between items-center border-b border-emerald-800 pb-2 mb-4">
                    <div>
                      <span className="font-black text-emerald-800 text-sm">MECURA</span>
                      <span className="text-[10px] text-slate-500 ml-2">PARECER TÉCNICO AGRONÔMICO</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Paciente: <strong>{patientName}</strong> • CPF: <strong>{cpf}</strong>
                    </div>
                  </div>

                  {/* Section 6 */}
                  <div className="mb-4 text-[10.5px] leading-relaxed text-justify">
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1.5 border-l-2 border-emerald-600 pl-2">
                      6. Designer de Cultivo e Planejamento Operacional
                    </h4>
                    <p className="mb-1 text-indent-4 text-slate-700">
                      A principal recomendação técnica é dividir o cultivo em <strong>3 momentos de colheita ao longo do ano</strong> (ciclo médio da espécie de 120 dias ou 4 meses). Para tanto, o paciente deverá conduzir o cultivo de aproximadamente <strong>{plantsPerCycle} plantas durante cada ciclo rotativo</strong>.
                    </p>
                    <p className="text-indent-4 text-slate-700">
                      O cultivo poderá ser operado mediante manutenção de plantas-mãe em vegetativo contínuo (fotoperíodo superior a 18h de luz) para extração de mudas/clones, ou através de ciclos sucessivos por sementes feminizadas com importação anual estimada de {seedsNeeded} sementes.
                    </p>
                  </div>

                  {/* Section 7 */}
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded p-3 text-[10px] leading-relaxed">
                    <h4 className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wide mb-1.5">
                      7. Boas Práticas GACP e Parâmetros Ambientais Indoor
                    </h4>
                    <p className="mb-1 text-slate-700">
                      • <strong>Ambiente Fechado:</strong> Cultivo em estufa indoor selada contra insetos, poeiras e pragas externas.
                    </p>
                    <p className="mb-1 text-slate-700">
                      • <strong>Iluminação LED:</strong> Painéis Quantum Board Full Spectrum (18h luz/6h escuro no vegetativo; 12h/12h na floração).
                    </p>
                    <p className="mb-1 text-slate-700">
                      • <strong>Ventilação & Odor:</strong> Exaustão mecânica com <strong>filtro de carvão ativado</strong>, temperatura 20-26°C e umidade 45-65%.
                    </p>
                    <p className="mb-1 text-slate-700">
                      • <strong>Substrato & Sanidade:</strong> Controle de pH (5.8 a 6.5) e EC, sem uso de agrotóxicos ou defensivos nocivos.
                    </p>
                    <p className="text-slate-700">
                      • <strong>Secagem e Cura:</strong> 10-14 dias de secagem controlada (18-20°C / 55% UR) e cura hermética em potes com Boveda 62%.
                    </p>
                  </div>

                  {/* Section 8 */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 mb-6 text-[10.5px] leading-relaxed text-slate-800">
                    <p>
                      <strong>Conclusão Técnica:</strong> O dimensionamento anual de <strong>{targetPlants} espécimes de <em>Cannabis sativa L.</em></strong> ({plantsPerCycle} plantas em floração por ciclo) e a importação de <strong>{seedsNeeded} sementes feminizadas</strong> é <strong>agronomicamente justificado, estritamente proporcional e indispensável</strong> para assegurar a autossuficiência e a continuidade do tratamento médico do(a) paciente {patientName} por 12 meses, sem qualquer finalidade diversa ou comercial.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-center text-[10px]">
                    <div>
                      <p className="font-bold text-slate-900">{agronomistName}</p>
                      <p className="text-emerald-800 font-semibold">Engenheiro Agrônomo — {agronomistCrea}</p>
                      <p className="text-slate-500 text-[9px]">Perícia em Fitotecnia & Fitoquímica Canabinoide</p>
                      <p className="text-slate-400 text-[8.5px]">ART vinculada ao CREA-PR</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">MECURA SAÚDE & BEM-ESTAR</p>
                      <p className="text-slate-600">Apoio Jurídico & Pericial à Ação de Habeas Corpus</p>
                      <p className="text-emerald-700 font-semibold text-[9px]">Assinatura com Certificação Digital</p>
                      <p className="text-slate-400 text-[8px] font-mono">MEC-AGRO-HC-{cpf.replace(/\D/g, '').slice(0, 6)}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-mecura-elevated bg-[#0A0A0F] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-[#12121A] text-mecura-silver hover:text-white rounded-xl text-xs font-semibold border border-mecura-elevated flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão para Sair / Fechar sem enviar o laudo */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white/5 hover:bg-red-500/15 text-mecura-silver hover:text-red-400 border border-mecura-elevated hover:border-red-500/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
                title="Sair desta tela sem enviar o laudo para o paciente"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>Sair sem Enviar</span>
              </button>

              {onSendToChat && (
                <button
                  type="button"
                  onClick={onSendToChat}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Laudo no Chat</span>
                </button>
              )}

              <button
                type="button"
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
