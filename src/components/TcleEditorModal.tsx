import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileCheck,
  Download,
  Send,
  Edit3,
  Eye,
  User,
  ShieldCheck,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText
} from 'lucide-react';

interface TcleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  setPatientName: (v: string) => void;
  cpf: string;
  setCpf: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  emissionDate: string;
  setEmissionDate: (v: string) => void;
  diagnosis: string;
  setDiagnosis: (v: string) => void;
  doctorName: string;
  setDoctorName: (v: string) => void;
  doctorCrm: string;
  setDoctorCrm: (v: string) => void;
  legalRepresentativeName: string;
  setLegalRepresentativeName: (v: string) => void;
  legalRepresentativeCpf: string;
  setLegalRepresentativeCpf: (v: string) => void;
  patientSignature: string;
  setPatientSignature: (v: string) => void;
  consentStatus: 'pending_signature' | 'accepted';
  acceptedAt?: string;
  onSendConsentRequestToChat: () => void;
  onDownloadPDF: () => void;
  onSendFilledPdfToChat: () => void;
  onResetFromTriage?: () => void;
  isSendingPdf?: boolean;
}

export const TcleEditorModal: React.FC<TcleEditorModalProps> = ({
  isOpen,
  onClose,
  patientName,
  setPatientName,
  cpf,
  setCpf,
  birthDate,
  setBirthDate,
  emissionDate,
  setEmissionDate,
  diagnosis,
  setDiagnosis,
  doctorName,
  setDoctorName,
  doctorCrm,
  setDoctorCrm,
  legalRepresentativeName,
  setLegalRepresentativeName,
  legalRepresentativeCpf,
  setLegalRepresentativeCpf,
  patientSignature,
  setPatientSignature,
  consentStatus,
  acceptedAt,
  onSendConsentRequestToChat,
  onDownloadPDF,
  onSendFilledPdfToChat,
  onResetFromTriage,
  isSendingPdf = false
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  if (!isOpen) return null;

  const effectiveSignature = (patientSignature || patientName || 'Paciente').trim();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-[#0E1118] border border-cyan-500/30 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.18)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#131722] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Termo de Consentimento Livre e Esclarecido (TCLE)
                  </h2>
                  {consentStatus === 'accepted' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Lido e Aceito pelo Paciente {acceptedAt ? `(${acceptedAt})` : ''}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Aguardando Leitura / De Acordo no Chat
                    </span>
                  )}
                </div>
                <p className="text-xs text-mecura-silver mt-0.5">
                  Utilização dos derivados da Cannabis para fins exclusivamente medicinais / terapêuticos (3 Páginas A4)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Dados
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Prévia A4 (3 Págs)
                </button>
              </div>

              {onResetFromTriage && (
                <button
                  type="button"
                  onClick={onResetFromTriage}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Recarregar diagnóstico e dados da triagem do paciente"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recarregar da Triagem
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                Fechar
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
            {activeTab === 'edit' ? (
              <>
                {/* Workflow Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/5 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Fluxo de Assinatura e Consentimento no Chat
                    </h4>
                    <p className="text-xs text-mecura-silver leading-relaxed">
                      <strong>1º Passo:</strong> Envie o Termo para leitura no Chat. <strong>2º Passo:</strong> Assim que o paciente clicar em <em>"Marcar como Lido e Estou de Acordo"</em>, gere e envie o <strong>Termo Preenchido (PDF)</strong> para a Área do Paciente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onSendConsentRequestToChat}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-300" />
                    1. Enviar Termo p/ Leitura no Chat
                  </button>
                </div>

                {/* Patient & Doctor Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Identificação do Paciente
                    </h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                        Paciente (Nome Completo)
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="text"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Médico Assistente & Assinatura
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          Médico Responsável
                        </label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          CRM / UF
                        </label>
                        <input
                          type="text"
                          value={doctorCrm}
                          onChange={(e) => setDoctorCrm(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          Data do Termo
                        </label>
                        <input
                          type="text"
                          value={emissionDate}
                          onChange={(e) => setEmissionDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                          Assinatura / Ciente no Rodapé
                        </label>
                        <input
                          type="text"
                          value={patientSignature}
                          onChange={(e) => setPatientSignature(e.target.value)}
                          placeholder={patientName || 'Assinatura do Paciente'}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 1: Enfermidade / Condição verificada */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-cyan-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Item 1 do Termo — Enfermidade / Condição Verificada no Paciente
                    </label>
                    <span className="text-[11px] text-mecura-silver">
                      Preenchido automaticamente no item 1 do PDF
                    </span>
                  </div>
                  <p className="text-xs text-mecura-silver italic">
                    "1. Durante as consultas, foi-se verificado a seguinte enfermidade/condição em minha pessoa:"
                  </p>
                  <textarea
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Ex: Ansiedade Generalizada (CID F41.1), Insônia Crônica (CID G47.0) e Dor Crônica..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Representante Legal (Menor de idade ou incapaz) */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-mecura-silver">
                      Para o Caso de Menor de Idade ou Incapaz (Opcional)
                    </h4>
                    <span className="text-[11px] text-mecura-silver">
                      Deixe em branco caso o paciente seja maior e capaz
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                        Nome do Representante Legal
                      </label>
                      <input
                        type="text"
                        value={legalRepresentativeName}
                        onChange={(e) => setLegalRepresentativeName(e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-mecura-silver mb-1">
                        RG ou CPF do Representante Legal
                      </label>
                      <input
                        type="text"
                        value={legalRepresentativeCpf}
                        onChange={(e) => setLegalRepresentativeCpf(e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Preview Tab showing the Mecura corporate standard and 3-page content */
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl space-y-4 font-sans text-xs leading-relaxed border border-slate-200">
                {/* Top Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-100 pb-1.5">
                  <span>Documento Médico Oficial MECURA • Termo de Consentimento Informado (TCLE)</span>
                  <span>Prévia Oficial A4 (3 Páginas)</span>
                </div>

                {/* Institutional Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b-2 border-[#1E1B4B] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black tracking-tight text-[#1E1B4B]">MECURA</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase tracking-wider rounded border border-emerald-200">
                        Consentimento Informado • TCLE
                      </span>
                    </div>
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                      Centro Integrado de Medicina Canabinoide
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Telemedicina Especializada & Prescrição Médica Assistida (RDC Anvisa nº 660/2022 e 327/2019)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900">Dr. Guilherme Taveira Dias</p>
                    <p className="text-[10px] font-bold text-[#1E1B4B]">
                      {doctorCrm} • Clínico Geral • Medicina Canabinoide
                    </p>
                    <p className="text-[10px] text-slate-500">
                      +55 65 3190-0629 • guilhermetaveiradias@hotmail.com
                    </p>
                    <p className="text-[10px] text-slate-500">Primavera do Leste - MT (CEP 78850-000)</p>
                  </div>
                </div>

                {/* Title Banner */}
                <div className="text-center bg-slate-50 p-3 rounded-lg border border-slate-300 border-t-4 border-t-[#1E1B4B]">
                  <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-wide">
                    Termo de Consentimento Livre e Esclarecido
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                    Utilização dos derivados da Cannabis para fins exclusivamente medicinais / terapêuticos
                  </p>
                </div>

                {/* Patient Table */}
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 w-3/5">
                        <span className="block text-[9px] font-extrabold text-slate-500 uppercase">Paciente:</span>
                        <strong className="text-slate-900">{patientName}</strong>
                      </td>
                      <td className="border border-slate-300 p-2 w-2/5">
                        <span className="block text-[9px] font-extrabold text-slate-500 uppercase">Data:</span>
                        <strong className="text-slate-900">{emissionDate}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">
                        <span className="block text-[9px] font-extrabold text-slate-500 uppercase">CPF:</span>
                        <strong>{cpf}</strong>
                      </td>
                      <td className="border border-slate-300 p-2">
                        <span className="block text-[9px] font-extrabold text-slate-500 uppercase">Data de Nascimento:</span>
                        <strong>{birthDate}</strong>
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={2} className="border border-slate-300 p-2 text-[11px]">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span>
                            <strong className="text-[#1E1B4B]">Médico Assistente:</strong> {doctorName.toUpperCase()}, {doctorCrm} • E-mail: guilhermetaveiradias@hotmail.com
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              consentStatus === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {consentStatus === 'accepted'
                              ? `Lido e Aceito pelo Paciente (${acceptedAt || emissionDate})`
                              : `Termo Emitido em Consulta (${emissionDate})`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-justify">
                  Após detalhada avaliação e investigação diagnóstica realizada em seu paciente, o mesmo foi devidamente informado sobre as possíveis opções de tratar sua enfermidade (doença), e aceitou, através de sua liberdade de escolha, o plano terapêutico à base de Cannabis, concordando com seu médico, <strong className="text-[#1E1B4B]">{doctorName.toUpperCase()}, {doctorCrm}</strong>.
                </div>

                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 border-l-4 border-l-[#1E1B4B] text-[#1E1B4B] text-justify">
                  <strong>VOCÊ SABE O QUE É O CONSENTIMENTO INFORMADO?</strong> É o processo pelo qual você dá permissão ou recusa a participar como paciente em um procedimento.
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-600 text-justify">
                  <strong className="text-emerald-800 mr-2">1.</strong>
                  Durante as consultas, foi-se verificado a seguinte enfermidade/condição em minha pessoa:{' '}
                  <strong className="text-slate-900 font-extrabold">{diagnosis}</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-justify">
                  <strong className="text-[#1E1B4B] mr-2">2.</strong>
                  O médico assistente esclareceu e me informou sobre os pontos positivos e negativos e sobre as consequências em interromper o tratamento sem comunicar a médico.
                </div>

                <div className="p-2 rounded-lg bg-[#1E1B4B] text-white font-extrabold uppercase tracking-wide text-[11px]">
                  <span className="text-emerald-400 mr-2">3.</span>
                  O médico assistente tirou todas as dúvidas sobre os seguintes pontos:
                </div>

                <ul className="space-y-2 text-justify text-xs">
                  {[
                    'As possibilidades terapêuticas adequadas foram adotadas anteriormente e, esta proposta de tratamento que estou escolhendo, que consiste na utilização de produtos derivados da Cannabis com fins medicinais, é viável por estarem esgotadas ou por serem ineficazes as opções terapêuticas disponíveis no mercado brasileiro, bem como, a possibilidade de benefícios a minha saúde sem a ocorrência de efeitos colaterais agressivos.',
                    'Alguns estudos científicos sugerem que este produto a base de Cannabis pode vir a melhorar os sintomas que venho apresentando, sendo necessário e indispensável o cumprimento efetivo do plano terapêutico devidamente esclarecido durante a consulta médica.',
                    'Fui igualmente informado(a) e devidamente esclarecido(a) de que, a exemplo de quaisquer outros procedimentos / medicamentos / terapias médicas que podem agravar minha saúde, o produto de Cannabis também não tem esta isenção.',
                    'Podem existir efeitos colaterais indesejáveis, os mais conhecidos, até o momento, são: sonolência, tontura, boca seca, diminuição da pressão arterial, euforia, visão turva, cefaleia (dor de cabeça), sensação de fadiga ou fraqueza, distúrbios do sono, náusea, diarreia, vômito em excesso, taquicardia, no entanto, efeitos em prazo mais longo ainda não foram adequadamente estudados.',
                    'Além disso, o produto de Cannabis pode interferir com certas medicações, o que pode diminuir a eficiência dos mesmos ou aumentar seus possíveis efeitos adversos e me responsabilizo por descrever as medicações em uso e comunicar a médica caso haja alteração. Comprometo-me também a não me automedicar durante meu tratamento.',
                    'Estou ciente que devo agir com a máxima cautela nas orientações médicas caso eu possua histórico de AVC hemorrágico ou isquêmico, seja idoso ou debilitado, arritmias (fibrilação atrial), faça uso de hipotensores, anticoagulantes, antiplaquetários, benzodiazepinicos, opióides, antidepressivos e barbitúricos.',
                    'Estou ciente que durante o tratamento podem surgir complicações de diferentes naturezas, como possíveis efeitos adversos ainda não descritos na literatura médica ou reações alérgicas inesperadas.',
                    'Estou ciente de que o THC, um dos canabinóides presentes em alguns produtos à base de Cannabis, pode ser detectado em exames toxicológicos ou exames antidoping, podendo esta presença gerar repercussões negativas frente aos órgãos responsáveis, tanto em questões laborais, questões de direção de veículos automotivos, quanto em questões esportivas.',
                    'Quanto a viagens internacionais, estou ciente também de que existem países que não autorizam a entrada com os produtos derivados de Cannabis e devo informar a médica meus planos de viagens e não sair do país sem orientação da mesma.',
                    'Fui informado (a) que o produto de Cannabis ainda não é registrado como medicamento, mas que segue o estabelecido pela ANVISA através da autorização de importação (RDC nº 660/2022) e que seu uso está sendo feito em caráter excepcional, devido à ausência de resposta satisfatória de minha doença às outras medicações disponíveis no mercado nacional.',
                    'Estou ciente que o presente termo não é suficiente para esclarecer todas as possibilidades acerca do tratamento proposto podendo ser feitas complementações posteriores.',
                    'Estou ciente que a utilização do produto indicado tem caráter personalíssimo e intransferível, devendo ser utilizado exclusivamente conforme a prescrição e orientação da médica.',
                    'A equipe médica não se responsabiliza pelo mau uso do produto.',
                    'Também fui informado que o médico responsável poderá responder as minhas dúvidas, pelo site ou Whatsapp, quando necessário, em dias e horários úteis/comerciais, enquanto estiver em acompanhamento, ou através do agendamento de uma nova consulta médica.',
                    'Sou igualmente sabedor que, apesar do empenho do meu médico, não existe garantia absoluta no resultado dos derivados da Cannabis com relação à melhora dos sintomas da minha doença.',
                    'Por fim, estou ciente que, em caso de Urgência/Emergência, devo imediatamente suspender a medicação, procurar a unidade de pronto atendimento mais próxima e avisar a equipe médica.'
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-md bg-slate-50 border border-slate-200 border-l-4 border-l-emerald-600 flex gap-2"
                    >
                      <span className="font-black text-emerald-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 border-l-4 border-l-amber-600 space-y-1.5">
                  <p className="font-black text-amber-900 text-xs uppercase tracking-wider">EM CASOS DE GESTAÇÃO:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-justify text-xs text-amber-950">
                    <li>Estou ciente também, se for sexo biológico feminino, que no momento não desejo gestar e não amamento, e que tomarei as medidas necessárias para prevenção de gestação durante meu tratamento uma vez que estou ciente de que não há segurança dos produtos derivados de cannabis na gestação e amamentação.</li>
                    <li>É de responsabilidade minha comunicar a equipe médica em caso de gestação inesperada (ficar grávida), devendo o uso do medicamento ser interrompido, caso o médico ache necessário.</li>
                    <li>As medicações à base de Cannabis atravessam a barreira placentária, gerando repercussões no feto, e aumentam risco de desfechos desfavoráveis na gestação (os mais comuns: parto prematuro, restrição de crescimento e malformações fetais).</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold text-justify">
                  Sendo assim, mais uma vez declaro que li, compreendi e aceito livremente todas as colocações do presente Termo de Consentimento Livre e Esclarecido e, através de decisão conjunta, estou disposto (a) a iniciar sem qualquer sujeição/constrangimento o uso compassivo do plano terapêutico proposto pela médica.
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <strong className="text-[#1E1B4B]">Assinatura:</strong>
                      <span className="px-3 py-1 rounded bg-white border border-slate-300 font-bold italic text-slate-900">
                        {effectiveSignature}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#1E1B4B]">Data:</strong>
                      <span className="px-3 py-1 rounded bg-white border border-slate-300 font-bold text-slate-900">
                        {emissionDate}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <p className="italic font-bold text-slate-700">Para o caso de menor de idade ou incapaz:</p>
                    <p>
                      Nome do representante legal:{' '}
                      <strong className="px-2 py-0.5 rounded bg-white border border-slate-200">
                        {legalRepresentativeName || '—'}
                      </strong>
                    </p>
                    <p>
                      RG ou CPF:{' '}
                      <strong className="px-2 py-0.5 rounded bg-white border border-slate-200">
                        {legalRepresentativeCpf || '—'}
                      </strong>{' '}
                      | Assinatura:{' '}
                      <strong className="px-2 py-0.5 rounded bg-white border border-slate-200 italic">
                        {legalRepresentativeName || '—'}
                      </strong>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <strong className="text-[#1E1B4B] uppercase">Ciente:</strong>
                      <span className="px-3 py-1 rounded bg-white border border-slate-300 font-bold italic text-slate-900">
                        {effectiveSignature}
                        {acceptedAt && (
                          <span className="ml-2 text-[11px] not-italic text-emerald-700 font-semibold">
                            (Aceito digitalmente em {acceptedAt})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#1E1B4B]">{doctorName.toUpperCase()} • {doctorCrm}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#131722] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-mecura-silver hover:text-white transition-all cursor-pointer"
            >
              Fechar
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onSendConsentRequestToChat}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Envia o termo interativo no chat para o paciente ler e clicar em 'Marcar como Lido e Estou de Acordo'"
              >
                <FileText className="w-4 h-4" />
                Enviar Termo p/ Leitura no Chat
              </button>

              <button
                type="button"
                onClick={onDownloadPDF}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                Baixar Termo Preenchido (PDF)
              </button>

              <button
                type="button"
                onClick={onSendFilledPdfToChat}
                disabled={isSendingPdf}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSendingPdf
                  ? 'Gerando e Enviando PDF...'
                  : 'Gerar e Enviar Termo Preenchido (Área do Paciente)'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
