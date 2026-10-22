import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileCheck, 
  Download, 
  Eye, 
  Edit3, 
  RotateCcw, 
  User, 
  Calendar, 
  Brain, 
  ShieldCheck, 
  Sparkles,
  ClipboardList,
  Send,
  Save,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import { generatePsychologicalReportPDF, PsychologicalReportData } from '../utils/pdfGenerator';

interface PsychologicalReportEditorModalProps {
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
  psychologistName: string;
  setPsychologistName: (val: string) => void;
  psychologistCrp: string;
  setPsychologistCrp: (val: string) => void;
  purpose: string;
  setPurpose: (val: string) => void;
  demandDescription: string;
  setDemandDescription: (val: string) => void;
  technicalProcedures: string;
  setTechnicalProcedures: (val: string) => void;
  clinicalAnalysis: string;
  setClinicalAnalysis: (val: string) => void;
  diagnosticHypothesis: string;
  setDiagnosticHypothesis: (val: string) => void;
  conclusion: string;
  setConclusion: (val: string) => void;
  patientAnswers?: any;
  onDownloadPDF: () => void;
  onSendToChat?: () => Promise<void> | void;
  onResetFromTriage?: () => void;
  onSave?: (savedData: {
    purpose: string;
    demandDescription: string;
    technicalProcedures: string;
    clinicalAnalysis: string;
    diagnosticHypothesis: string;
    conclusion: string;
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    psychologistName: string;
    psychologistCrp: string;
  }) => void;
}

export function buildPsychologicalReportFromTriage(patientName: string, rawAnswers?: any) {
  const ans = rawAnswers || {};
  const pName = patientName || 'Paciente';
  const objectivesList: string[] = Array.isArray(ans.objectives)
    ? ans.objectives.filter(Boolean)
    : ans.objective
      ? [String(ans.objective)]
      : ans.symptoms
        ? [String(ans.symptoms)]
        : [];

  const objLower = objectivesList.join(' ').toLowerCase();
  const isAnxiety = objLower.includes('ansiedade') || !!ans.ansiedade_diag || !!ans.panico || !!ans.estresse;
  const isInsomnia = objLower.includes('sono') || objLower.includes('insônia') || objLower.includes('insonia');
  const isPain = objLower.includes('dor');
  const isDepression = objLower.includes('depress') || !!ans.tristeza;
  const isFocus = objLower.includes('foco') || !!ans.foco || !!ans.memoria || !!ans.adhdTestResult;

  // Build exact demand description from patient's triage
  const demandParts: string[] = [];
  if (objectivesList.length > 0) {
    demandParts.push(
      `O(A) paciente ${pName} buscou acolhimento e avaliação psicológica relatando como queixa(s) principal(is) na triagem: ${objectivesList.join(', ')}` +
      (ans.intensity ? ` (intensidade referida: ${ans.intensity}/10` : '') +
      (ans.duration ? `${ans.intensity ? `, tempo de evolução: ${ans.duration})` : ` (tempo de evolução: ${ans.duration})`}` : ans.intensity ? ')' : '') +
      '.'
    );
  } else {
    demandParts.push(
      `O(A) paciente ${pName} buscou acolhimento e avaliação psicológica clínica para investigação e manejo de sofrimento emocional e sobrecarga psíquica.`
    );
  }

  if (ans.diseaseOrigin && String(ans.diseaseOrigin).trim()) {
    demandParts.push(`Histórico e origem do quadro relatados pelo(a) paciente na triagem: "${String(ans.diseaseOrigin).trim()}".`);
  }
  if (ans.description && String(ans.description).trim()) {
    demandParts.push(`Relato complementar do(a) paciente sobre os sintomas: "${String(ans.description).trim()}".`);
  }

  const emotionalFlags: string[] = [];
  if (ans.tristeza) emotionalFlags.push('humor entristecido ou rebaixamento afetivo frequente');
  if (ans.estresse) emotionalFlags.push('sobrecarga de estresse emocional');
  if (ans.irritado) emotionalFlags.push('irritabilidade acentuada');
  if (ans.foco) emotionalFlags.push('dificuldade de concentração e sustentação do foco');
  if (ans.memoria) emotionalFlags.push('queixas mnêmicas no cotidiano');
  if (ans.panico) {
    emotionalFlags.push(ans.panico_details ? `episódios de pânico (${String(ans.panico_details).trim()})` : 'episódios compatíveis com crises de pânico');
  }
  if (ans.ansiedade_diag) {
    emotionalFlags.push(ans.ansiedade_diag_details ? `histórico prévio de ansiedade/depressão (${String(ans.ansiedade_diag_details).trim()})` : 'diagnóstico prévio de ansiedade/depressão');
  }
  if (emotionalFlags.length > 0) {
    demandParts.push(`No rastreio emocional da triagem, assinalou: ${emotionalFlags.join('; ')}.`);
  }

  const treatmentDetails: string[] = [];
  if (ans.tratamento_atual && ans.tratamento_atual_details) {
    treatmentDetails.push(`tratamentos atuais: ${String(ans.tratamento_atual_details).trim()}`);
  }
  if (ans.remedios && ans.remedios_details) {
    treatmentDetails.push(`medicações em uso: ${String(ans.remedios_details).trim()}`);
  }
  if (ans.cannabis && ans.cannabis_details) {
    treatmentDetails.push(`experiência prévia com derivados canabinoides: ${String(ans.cannabis_details).trim()}`);
  }
  if (treatmentDetails.length > 0) {
    demandParts.push(`Contexto terapêutico informado na triagem: ${treatmentDetails.join(' | ')}.`);
  }

  const neuroTests: string[] = [];
  if (ans.adhdTestResult && typeof ans.adhdTestResult === 'object') {
    neuroTests.push(`Escala ASRS-18 (TDAH): ${ans.adhdTestResult.classification || 'Realizado'} (${ans.adhdTestResult.scorePercent ?? 0}% — ${ans.adhdTestResult.totalPoints ?? 0}/${ans.adhdTestResult.maxPoints ?? 36} pts)`);
  }
  if (ans.autismTestResult && typeof ans.autismTestResult === 'object') {
    neuroTests.push(`Rastreio TEA (${ans.autismTestResult.targetProfile || 'Adulto'}): ${ans.autismTestResult.classification || 'Realizado'} (${ans.autismTestResult.scorePercent ?? 0}% — ${ans.autismTestResult.totalPoints ?? 0}/${ans.autismTestResult.maxPoints ?? 36} pts)`);
  }
  if (neuroTests.length > 0) {
    demandParts.push(`Instrumentos psicométricos de rastreio respondidos pelo(a) paciente: ${neuroTests.join('; ')}.`);
  }

  // Build CID-10 / CID-11 hypothesis from patient's actual triage
  const cids: string[] = [];
  if (isAnxiety) cids.push('F41.1 (Transtorno de Ansiedade Generalizada)');
  if (ans.panico) cids.push('F41.0 (Transtorno de Pânico)');
  if (isDepression) cids.push('F32.1 (Episódio Depressivo Moderado)');
  if (isInsomnia) cids.push('F51.0 (Insônia Não-Orgânica)');
  if (isFocus || ans.adhdTestResult) cids.push('F90.0 (Distúrbios da Atividade e da Atenção / TDAH)');
  if (ans.autismTestResult) cids.push('F84.0 (Transtorno do Espectro Autista)');
  if (isPain) cids.push('F45.4 (Transtorno Doloroso Somatoforme Persistente)');
  if (cids.length === 0) {
    cids.push('F41.1 (Transtorno de Ansiedade Generalizada)', 'F43.2 (Transtorno de Adaptação / Estresse)');
  }

  return {
    purpose: "Avaliação Psicológica Clínica para Fins de Tratamento em Saúde Mental, Documentação Clínica e Acompanhamento Psicoterápico.",
    demandDescription: demandParts.join(' '),
    technicalProcedures:
      "Foram realizadas entrevistas clínicas psicológicas semiestruturadas com foco em anamnese biopsicossocial, escuta qualificada da história clínica informada pelo(a) paciente na triagem e exame detalhado das funções psíquicas superiores, em estrita consonância com a Resolução CFP nº 06/2019.",
    clinicalAnalysis:
      `Ao exame psíquico atual, o(a) paciente ${pName} apresenta-se lúcido(a) e orientado(a) alo e autopsiquicamente. Discurso coerente e estruturado, com tonalidade afetiva congruente às queixas relatadas na triagem (${objectivesList.length > 0 ? objectivesList.join(', ') : 'sobrecarga emocional'}). ` +
      (emotionalFlags.length > 0 ? `Observa-se repercussão clínica de ${emotionalFlags.join(', ')}, ` : 'Nota-se reatividade emocional frente aos estressores cotidianos, ') +
      "sem alterações de sensopercepção ou juízo crítico da realidade. Evidencia-se impacto funcional na qualidade de vida e necessidade de suporte psicoterápico e regulação biopsicossocial.",
    diagnosticHypothesis: cids.join(' / '),
    conclusion:
      `Com base nos dados colhidos na triagem e na avaliação clínica psicológica, atesta-se que o(a) paciente ${pName} apresenta quadro compatível com ${cids.join(', ')}, demandando acompanhamento multidisciplinar e psicoterápico contínuo para estabilização emocional, redução de danos psíquicos e promoção de sua qualidade de vida.`
  };
}

export function PsychologicalReportEditorModal({
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
  psychologistName,
  setPsychologistName,
  psychologistCrp,
  setPsychologistCrp,
  purpose,
  setPurpose,
  demandDescription,
  setDemandDescription,
  technicalProcedures,
  setTechnicalProcedures,
  clinicalAnalysis,
  setClinicalAnalysis,
  diagnosticHypothesis,
  setDiagnosticHypothesis,
  conclusion,
  setConclusion,
  patientAnswers,
  onDownloadPDF,
  onSendToChat,
  onResetFromTriage,
  onSave
}: PsychologicalReportEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePullFromTriage = () => {
    if (onResetFromTriage) {
      onResetFromTriage();
      showToast("✓ Dados recarregados exatamente da triagem do paciente!");
      return;
    }
    const built = buildPsychologicalReportFromTriage(patientName, patientAnswers);
    setPurpose(built.purpose);
    setDemandDescription(built.demandDescription);
    setTechnicalProcedures(built.technicalProcedures);
    setClinicalAnalysis(built.clinicalAnalysis);
    setDiagnosticHypothesis(built.diagnosticHypothesis);
    setConclusion(built.conclusion);
    showToast("✓ Dados recarregados exatamente da triagem do paciente!");
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        purpose,
        demandDescription,
        technicalProcedures,
        clinicalAnalysis,
        diagnosticHypothesis,
        conclusion,
        patientName,
        birthDate,
        cpf,
        emissionDate,
        psychologistName,
        psychologistCrp
      });
    }
    setIsSavingFeedback(true);
    showToast("✓ Laudo psicológico salvo e sincronizado com sucesso!");
    setTimeout(() => setIsSavingFeedback(false), 2000);
  };

  const handleAiGenerate = async () => {
    setIsGeneratingAi(true);
    showToast("🤖 IA analisando queixas clínicas da triagem do paciente...");

    try {
      const prompt = `Você é o psicólogo clínico Marco Antônio Boastik (CRP 08/49215).
Com base EXCLUSIVAMENTE nas queixas e histórico informados pelo paciente atual (${patientName}, CPF: ${cpf}, respostas da triagem: ${JSON.stringify(patientAnswers || {})}), elabore o conteúdo técnico de um Laudo Psicológico em conformidade com a Resolução CFP nº 06/2019. Não invente dados de outros pacientes.
Responda em formato JSON estruturado com os seguintes campos:
{
  "purpose": "Identificação e finalidade formal do documento",
  "demandDescription": "Descrição fiel da demanda, queixas emocionais, origem do quadro e histórico clínico relatados pelo paciente na triagem",
  "technicalProcedures": "Procedimentos técnico-científicos adotados (entrevistas, anamnese, exames de estado mental)",
  "clinicalAnalysis": "Exame pormenorizado das funções psíquicas congruente com a triagem do paciente",
  "diagnosticHypothesis": "CID-10 / CID-11 correspondentes com código e descrição",
  "conclusion": "Parecer conclusivo do psicólogo para este paciente"
}`;

      let aiResult: any = null;
      try {
        const res = await fetch('/api/analyze-clinical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(cleanJson);
          }
        }
      } catch (apiErr) {
        console.warn("Gemini direct call warning, using triage psychology generator:", apiErr);
      }

      if (aiResult && aiResult.demandDescription) {
        if (aiResult.purpose) setPurpose(aiResult.purpose);
        if (aiResult.demandDescription) setDemandDescription(aiResult.demandDescription);
        if (aiResult.technicalProcedures) setTechnicalProcedures(aiResult.technicalProcedures);
        if (aiResult.clinicalAnalysis) setClinicalAnalysis(aiResult.clinicalAnalysis);
        if (aiResult.diagnosticHypothesis) setDiagnosticHypothesis(aiResult.diagnosticHypothesis);
        if (aiResult.conclusion) setConclusion(aiResult.conclusion);
      } else {
        const built = buildPsychologicalReportFromTriage(patientName, patientAnswers);
        setPurpose(built.purpose);
        setDemandDescription(built.demandDescription);
        setTechnicalProcedures(built.technicalProcedures);
        setClinicalAnalysis(built.clinicalAnalysis);
        setDiagnosticHypothesis(built.diagnosticHypothesis);
        setConclusion(built.conclusion);
      }

      showToast("✨ Laudo psicológico gerado com base na triagem do paciente!");
    } catch (e: any) {
      console.error("Falha ao gerar com IA:", e);
      const built = buildPsychologicalReportFromTriage(patientName, patientAnswers);
      setPurpose(built.purpose);
      setDemandDescription(built.demandDescription);
      setTechnicalProcedures(built.technicalProcedures);
      setClinicalAnalysis(built.clinicalAnalysis);
      setDiagnosticHypothesis(built.diagnosticHypothesis);
      setConclusion(built.conclusion);
      showToast("✓ Laudo preenchido diretamente com os dados da triagem do paciente.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSendToChatWithFeedback = async () => {
    if (!onSendToChat) return;
    setIsSendingFeedback(true);
    try {
      await onSendToChat();
      showToast("✓ Laudo psicológico anexado e enviado no chat do paciente!");
    } catch (e) {
      console.error(e);
      showToast("Erro ao enviar laudo para o chat.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleQuickCid = (cidText: string) => {
    setDiagnosticHypothesis(cidText);
    showToast(`CID selecionado: ${cidText}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0E0E17] border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden text-white"
        >
          {/* Toast Inside Modal */}
          {toastMessage && (
            <div className="absolute top-3 right-3 z-50 bg-purple-900 border border-purple-400 text-purple-100 text-xs px-3.5 py-2 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-purple-300" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#12121F] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Gerador de Laudo Psicológico</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    CFP Resolução 06/2019
                  </span>
                </h3>
                <p className="text-xs text-mecura-silver">
                  Elabore e edite pareceres técnicos com auxílio de IA (Sem Medicamentos)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="flex items-center bg-[#0A0A0F] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Laudo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-mecura-silver hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizar PDF</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
            {activeTab === 'edit' ? (
              <>
                {/* Top Action Ribbon */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#161626] to-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-purple-300 fill-current shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Assistente de Redação Clínica & Triagem</h4>
                      <p className="text-[11px] text-mecura-silver">
                        Puxa automaticamente todas as respostas da triagem do paciente selecionado para ajustes finais.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePullFromTriage}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Recarregar laudo exatamente com o que o paciente preencheu na triagem"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Puxar Dados da Triagem</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isGeneratingAi}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>{isGeneratingAi ? 'Redigindo Laudo...' : 'Gerar Texto com IA'}</span>
                    </button>
                  </div>
                </div>

                {/* Grid Identificação do Paciente e Profissional */}
                <div className="bg-[#12121A] p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Identificação das Partes</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        Nome do Paciente
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        CPF do Paciente
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        Data de Nascimento
                      </label>
                      <input
                        type="text"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        Data da Emissão
                      </label>
                      <input
                        type="text"
                        value={emissionDate}
                        onChange={(e) => setEmissionDate(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        Psicólogo Responsável
                      </label>
                      <input
                        type="text"
                        value={psychologistName}
                        onChange={(e) => setPsychologistName(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mecura-silver mb-1">
                        Registro CRP
                      </label>
                      <input
                        type="text"
                        value={psychologistCrp}
                        onChange={(e) => setPsychologistCrp(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos Estruturados do Laudo */}
                <div className="space-y-4">
                  {/* 1. Finalidade */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      1. Identificação do Solicitante e Finalidade do Laudo
                    </label>
                    <textarea
                      rows={2}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* 2. Descrição da Demanda */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      2. Descrição da Demanda e Histórico Clínico Emocional
                    </label>
                    <textarea
                      rows={4}
                      value={demandDescription}
                      onChange={(e) => setDemandDescription(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* 3. Procedimentos Técnico-Científicos */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      3. Procedimentos Técnico-Científicos Adotados
                    </label>
                    <textarea
                      rows={3}
                      value={technicalProcedures}
                      onChange={(e) => setTechnicalProcedures(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* 4. Análise Psicológica */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      4. Análise Psicológica e Exame do Estado Mental
                    </label>
                    <textarea
                      rows={4}
                      value={clinicalAnalysis}
                      onChange={(e) => setClinicalAnalysis(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* 5. Hipótese Diagnóstica CID */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-purple-300">
                        5. Hipótese Diagnóstica (CID-10 / CID-11)
                      </label>
                      <span className="text-[10px] text-mecura-silver">CIDs Frequentes:</span>
                    </div>

                    {/* Quick CIDs Pill Bar */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        'F41.1 - Transtorno de Ansiedade Generalizada (TAG)',
                        'F32.1 - Episódio Depressivo Moderado',
                        'F51.0 - Insônia Não-Orgânica Reativa',
                        'F43.2 - Transtorno de Adaptação / Estresse'
                      ].map((cidItem) => (
                        <button
                          key={cidItem}
                          type="button"
                          onClick={() => handleQuickCid(cidItem)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all cursor-pointer"
                        >
                          + {cidItem.split(' - ')[0]}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={diagnosticHypothesis}
                      onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none font-medium"
                    />
                  </div>

                  {/* 6. Conclusão */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      6. Conclusão e Parecer Psicológico
                    </label>
                    <textarea
                      rows={4}
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* TAB PREVIEW: Visualização do Documento Impresso */
              <div className="space-y-4">
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-xs text-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-300" />
                    <span>Pré-visualização do Laudo Psicológico Oficial (CFP)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-500/20 px-2 py-0.5 rounded-full">
                    A4 Pronto para Impressão
                  </span>
                </div>

                <div className="bg-white text-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto space-y-4 text-xs font-sans border border-gray-200">
                  {/* Header PDF Preview */}
                  <div className="border-b-2 border-purple-900 pb-3 flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black text-purple-950 tracking-tight m-0">MECURA</h2>
                      <p className="text-[9px] font-bold text-purple-700 uppercase">
                        DEPARTAMENTO DE PSICOLOGIA CLÍNICA
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-purple-950 text-xs">{psychologistName}</h4>
                      <p className="text-[10px] text-purple-700 font-semibold">{psychologistCrp}</p>
                    </div>
                  </div>

                  <div className="text-center my-3">
                    <h3 className="font-black text-sm text-purple-950 tracking-widest uppercase">LAUDO PSICOLÓGICO</h3>
                    <p className="text-[9px] text-gray-500">RESOLUÇÃO CFP Nº 06/2019</p>
                  </div>

                  {/* Patient Info Box */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-[11px] grid grid-cols-2 gap-2">
                    <p><strong>Paciente:</strong> {patientName}</p>
                    <p><strong>CPF:</strong> {cpf || 'Não informado'}</p>
                    <p><strong>Nascimento:</strong> {birthDate || 'Não informada'}</p>
                    <p><strong>Emissão:</strong> {emissionDate}</p>
                  </div>

                  {/* Text Sections */}
                  <div className="space-y-3 text-[11px] leading-relaxed text-gray-800">
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">1. Finalidade:</h5>
                      <p>{purpose}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">2. Descrição da Demanda:</h5>
                      <p>{demandDescription}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">3. Procedimentos:</h5>
                      <p>{technicalProcedures}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">4. Análise do Estado Mental:</h5>
                      <p>{clinicalAnalysis}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">5. Hipótese Diagnóstica:</h5>
                      <p className="font-semibold text-purple-950">{diagnosticHypothesis}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">6. Conclusão:</h5>
                      <p>{conclusion}</p>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="border-t border-purple-200 pt-4 mt-6 text-center">
                    <div className="w-48 border-b border-purple-900 mx-auto mb-1" />
                    <p className="font-bold text-xs text-purple-950">{psychologistName}</p>
                    <p className="text-[10px] text-purple-700 font-semibold">{psychologistCrp}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Bar Actions */}
          <div className="p-4 border-t border-white/10 bg-[#12121F] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-purple-300" />
              <span>{isSavingFeedback ? 'Salvo!' : 'Salvar Alterações'}</span>
            </button>

            <div className="flex items-center gap-2">
              {onSendToChat && (
                <button
                  type="button"
                  onClick={handleSendToChatWithFeedback}
                  disabled={isSendingFeedback}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingFeedback ? 'Enviando...' : 'Anexar Laudo no Chat'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onDownloadPDF}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF Laudo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
