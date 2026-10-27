import React, { useState, useEffect } from 'react';
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
  Clock,
  Activity,
  CheckCircle2,
  ListFilter,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { generatePsychologicalReportPDF, PsychologicalReportData } from '../utils/pdfGenerator';
import { 
  PHQ9_TEST, 
  GAD7_TEST, 
  ASRS18_TEST, 
  AQ10_TEST, 
  buildDefaultSelectedTests, 
  SelectedPsychologicalTest,
  PsychologicalTestDefinition
} from '../data/psychologicalTests';

interface PsychologicalReportEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: 'inicial' | 'evolutivo';
  setReportType?: (val: 'inicial' | 'evolutivo') => void;
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
  selectedTests?: SelectedPsychologicalTest[];
  setSelectedTests?: (tests: SelectedPsychologicalTest[]) => void;
  patientAnswers?: any;
  onDownloadPDF: (overrideData?: any) => void;
  onSendToChat?: (overrideData?: any) => Promise<void> | void;
  onResetFromTriage?: () => void;
  onSave?: (savedData: any) => void;
}

export function buildPsychologicalReportFromTriage(
  patientName: string, 
  rawAnswers?: any, 
  reportType: 'inicial' | 'evolutivo' = 'inicial',
  activeTests?: SelectedPsychologicalTest[]
) {
  const ans = rawAnswers || {};
  const pName = patientName || 'Paciente';
  const isEvolutivo = reportType === 'evolutivo';

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
  if (isEvolutivo) {
    demandParts.push(
      `O(A) paciente ${pName} encontra-se em processo contínuo de acompanhamento psicológico clínico na modalidade de cuidado continuado.`
    );
    if (objectivesList.length > 0) {
      demandParts.push(
        `O plano de acompanhamento tem como foco terapêutico primordial a evolução dos sintomas de ${objectivesList.join(', ')} e a consolidação de recursos adaptativos de autorregulação emocional.`
      );
    }
    demandParts.push(
      `No decorrer das sessões psicoterápicas, observou-se engajamento ativo, com desenvolvimento progressivo de estratégias cognitivo-comportamentais frente aos estressores do cotidiano.`
    );
  } else {
    if (objectivesList.length > 0) {
      demandParts.push(
        `O(A) paciente ${pName} buscou acolhimento e acompanhamento psicológico clínico relatando como queixa(s) principal(is) na triagem: ${objectivesList.join(', ')}` +
        (ans.intensity ? ` (intensidade referida: ${ans.intensity}/10` : '') +
        (ans.duration ? `${ans.intensity ? `, tempo de evolução: ${ans.duration})` : ` (tempo de evolução: ${ans.duration})`}` : ans.intensity ? ')' : '') +
        '.'
      );
    } else {
      demandParts.push(
        `O(A) paciente ${pName} comparece para acolhimento inicial e acompanhamento psicológico clínico para investigação e manejo de sobrecarga emocional e sofrimento psíquico.`
      );
    }

    if (ans.diseaseOrigin && String(ans.diseaseOrigin).trim()) {
      demandParts.push(`Histórico e origem do quadro relatados pelo(a) paciente na triagem: "${String(ans.diseaseOrigin).trim()}".`);
    }
    if (ans.description && String(ans.description).trim()) {
      demandParts.push(`Relato complementar do(a) paciente sobre os sintomas: "${String(ans.description).trim()}".`);
    }
  }

  const emotionalFlags: string[] = [];
  if (ans.tristeza) emotionalFlags.push('humor entristecido ou rebaixamento afetivo frequente');
  if (ans.estresse) emotionalFlags.push('sobrecarga de estresse emocional');
  if (ans.irritado) emotionalFlags.push('irritabilidade acentuada');
  if (ans.foco) emotionalFlags.push('dificuldade de concentração e sustentação do foco');
  if (ans.memoria) emotionalFlags.push('queixas mnêmicas no cotidiano');
  if (ans.cansado) emotionalFlags.push('fadiga e esgotamento psicofísico diurno');
  if (ans.dor_cabeca) {
    emotionalFlags.push(ans.dor_cabeca_details ? `cefaleia/enxaqueca associada (${String(ans.dor_cabeca_details).trim()})` : 'cefaleia tensional/enxaqueca associada');
  }
  if (ans.panico) {
    emotionalFlags.push(ans.panico_details ? `episódios de pânico (${String(ans.panico_details).trim()})` : 'episódios compatíveis com crises de pânico');
  }
  if (ans.ansiedade_diag) {
    emotionalFlags.push(ans.ansiedade_diag_details ? `histórico prévio de ansiedade/depressão (${String(ans.ansiedade_diag_details).trim()})` : 'diagnóstico prévio de ansiedade/depressão');
  }
  if (emotionalFlags.length > 0 && !isEvolutivo) {
    demandParts.push(`No rastreio emocional e psicossomático da triagem inicial, assinalou: ${emotionalFlags.join('; ')}.`);
  }

  const clinicalContextFlags: string[] = [];
  if (ans.tratamento_atual && ans.tratamento_atual_details) {
    clinicalContextFlags.push(`tratamento em curso: ${String(ans.tratamento_atual_details).trim()}`);
  }
  if (ans.remedios && ans.remedios_details) {
    clinicalContextFlags.push(`medicações de uso contínuo: ${String(ans.remedios_details).trim()}`);
  }
  if (ans.doenca_cronica && ans.doenca_cronica_details) {
    clinicalContextFlags.push(`condições crônicas associadas: ${String(ans.doenca_cronica_details).trim()}`);
  }
  if (ans.cannabis) {
    clinicalContextFlags.push(ans.cannabis_details ? `experiência prévia com terapia canabinoide (${String(ans.cannabis_details).trim()})` : 'experiência prévia com terapia canabinoide');
  }
  if (clinicalContextFlags.length > 0) {
    demandParts.push(`Contexto clínico e terapêutico informado na triagem: ${clinicalContextFlags.join('; ')}.`);
  }

  if (ans.adhdTestResult && ans.adhdTestResult.scorePercent !== undefined) {
    const adhd = ans.adhdTestResult;
    demandParts.push(
      `No rastreio individual de TDAH (ASRS-18 OMS + Matriz GAD-7/PHQ-9), obteve ${adhd.scorePercent}% de compatibilidade (${adhd.classification || 'Avaliado'}${adhd.asrs18EquivalentScore !== undefined ? ` • ASRS-18 Eq.: ${adhd.asrs18EquivalentScore}/72 pts` : ''}${adhd.gad7ComplementScore !== undefined ? ` • GAD-7: ${adhd.gad7ComplementScore}/21 pts` : ''}${adhd.phq9ComplementScore !== undefined ? ` • PHQ-9: ${adhd.phq9ComplementScore}/27 pts` : ''}).`
    );
  }
  if (ans.autismTestResult && ans.autismTestResult.scorePercent !== undefined) {
    const tea = ans.autismTestResult;
    demandParts.push(
      `No mapeamento individual para TEA / Autismo (${tea.targetProfile || 'Adulto'} — AQ-10 Cambridge + Matriz GAD-7/PHQ-9), obteve ${tea.scorePercent}% de compatibilidade (${tea.classification || 'Avaliado'}${tea.aq10EquivalentScore !== undefined ? ` • AQ-10 Eq.: ${tea.aq10EquivalentScore}/10 pts` : ''}${tea.gad7ComplementScore !== undefined ? ` • GAD-7: ${tea.gad7ComplementScore}/21 pts` : ''}${tea.phq9ComplementScore !== undefined ? ` • PHQ-9: ${tea.phq9ComplementScore}/27 pts` : ''}).`
    );
  }

  // Active tests description
  const appliedList = (activeTests || []).filter(t => t.applied);
  const testNames: string[] = [];
  if (appliedList.length > 0) {
    appliedList.forEach(t => {
      testNames.push(`${t.name} (Escore: ${t.score}/${t.maxScore} pts - ${t.classification})`);
    });
    demandParts.push(`Instrumentos psicométricos padronizados avaliados neste relatório: ${testNames.join('; ')}.`);
  }

  // Build procedures with citations
  const appliedCitations: string[] = [];
  if (appliedList.some(t => t.id === 'phq9')) appliedCitations.push('Questionário sobre a Saúde do Paciente (PHQ-9 - Kroenke et al.)');
  if (appliedList.some(t => t.id === 'gad7')) appliedCitations.push('Escala de Ansiedade Generalizada (GAD-7 - Spitzer et al.)');
  if (appliedList.some(t => t.id === 'asrs18')) appliedCitations.push('Escala de Auto-relato de TDAH em Adultos (ASRS-18 OMS / Kessler et al.)');
  if (appliedList.some(t => t.id === 'aq10')) appliedCitations.push('Teste de Rastreio de Autismo Adulto (AQ-10 Cambridge Validado - Allison et al.)');

  const procString = isEvolutivo
    ? `Foram realizadas sessões clínicas de acompanhamento psicológico continuado, intervenções psicoterapêuticas focadas na história clínica e no exame das funções psíquicas superiores, bem como reavaliação sistemática por meio de instrumentos psicométricos padronizados (${appliedCitations.length > 0 ? appliedCitations.join(', ') : 'anamnese psicológica e escalas clínicas'}), em estrita consonância com a Resolução CFP nº 06/2019 do Conselho Federal de Psicologia.`
    : `Foram realizadas entrevistas clínicas psicológicas semiestruturadas com foco em anamnese biopsicossocial, escuta qualificada da demanda trazida na triagem, exame do estado mental atual e aplicação de instrumentos psicométricos padronizados de rastreio (${appliedCitations.length > 0 ? appliedCitations.join(', ') : 'escalas de humor, ansiedade e foco cognitivo'}), em estrita consonância com a Resolução CFP nº 06/2019 do Conselho Federal de Psicologia.`;

  // Build CID hypothesis
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

  const purposeString = isEvolutivo
    ? "Relatório de Acompanhamento Psicológico Evolutivo para Registro da Evolução Clínica, Resposta Psicoterapêutica e Manejo Continuado em Saúde Mental."
    : "Relatório de Acompanhamento Psicológico Inicial para Acolhimento, Investigação Clínica, Rastreio Psicométrico e Planejamento Psicoterapêutico.";

  const analysisString = isEvolutivo
    ? `Ao exame do estado mental na etapa evolutiva atual, o(a) paciente ${pName} apresenta-se lúcido(a) e orientado(a) alo e autopsiquicamente. Demonstra discurso coerente e articulado, com evolução favorável no reconhecimento de gatilhos ansiogênicos e no manejo das oscilações de humor. A reaplicação dos instrumentos psicométricos evidencia modulação gradual dos sintomas basais, com preservação do juízo crítico e melhora da adesão às práticas de autocuidado e higiene mental.`
    : `Ao exame psíquico inicial, o(a) paciente ${pName} apresenta-se lúcido(a) e orientado(a) alo e autopsiquicamente. Discurso coerente e estruturado, com tonalidade afetiva congruente às queixas relatadas na triagem (${objectivesList.length > 0 ? objectivesList.join(', ') : 'sobrecarga emocional'}). ` +
      (emotionalFlags.length > 0 ? `Observa-se repercussão clínica de ${emotionalFlags.join(', ')}, ` : 'Nota-se reatividade emocional frente aos estressores cotidianos, ') +
      "sem alterações de sensopercepção ou juízo crítico da realidade. Evidencia-se impacto funcional na qualidade de vida e necessidade de suporte psicoterápico continuado.";

  const conclusionString = isEvolutivo
    ? `Com base na evolução do acompanhamento psicológico, atesta-se que o(a) paciente ${pName} apresenta resposta clínica positiva ao processo psicoterápico. Recomenda-se a continuidade das sessões regulares de acompanhamento psicológico com frequência quinzenal ou mensal para consolidação dos ganhos terapêuticos e prevenção de recaídas em articulação multidisciplinar.`
    : `Com base nos dados colhidos na triagem e na avaliação inicial, atesta-se que o(a) paciente ${pName} apresenta quadro compatível com ${cids.join(', ')}, demandando acompanhamento psicológico contínuo e abordagem multidisciplinar para estabilização emocional, fortalecimento de recursos adaptativos e promoção de sua qualidade de vida.`;

  return {
    purpose: purposeString,
    demandDescription: demandParts.join(' '),
    technicalProcedures: procString,
    clinicalAnalysis: analysisString,
    diagnosticHypothesis: cids.join(' / '),
    conclusion: conclusionString
  };
}

export function PsychologicalReportEditorModal({
  isOpen,
  onClose,
  reportType = 'inicial',
  setReportType,
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
  selectedTests: propSelectedTests,
  setSelectedTests: propSetSelectedTests,
  patientAnswers,
  onDownloadPDF,
  onSendToChat,
  onResetFromTriage,
  onSave
}: PsychologicalReportEditorModalProps) {
  const [internalReportType, setInternalReportType] = useState<'inicial' | 'evolutivo'>(reportType);
  const currentReportType = reportType || internalReportType;

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected tests state
  const [tests, setTests] = useState<SelectedPsychologicalTest[]>(() => {
    return propSelectedTests && propSelectedTests.length > 0 
      ? propSelectedTests 
      : buildDefaultSelectedTests(patientAnswers);
  });

  // Test quiz runner modal
  const [activeQuizTestId, setActiveQuizTestId] = useState<'phq9' | 'gad7' | 'asrs18' | 'aq10' | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (propSelectedTests && propSelectedTests.length > 0) {
      setTests(propSelectedTests);
    }
  }, [propSelectedTests]);

  const updateTestsState = (newTests: SelectedPsychologicalTest[]) => {
    setTests(newTests);
    if (propSetSelectedTests) {
      propSetSelectedTests(newTests);
    }
  };

  const handleToggleTest = (testId: string) => {
    const updated = tests.map(t => {
      if (t.id === testId) {
        return { ...t, applied: !t.applied };
      }
      return t;
    });
    updateTestsState(updated);
    showToast(updated.find(t => t.id === testId)?.applied 
      ? `✓ ${testId.toUpperCase()} ativado no relatório!` 
      : `✕ ${testId.toUpperCase()} desativado do relatório.`
    );
  };

  const handleUpdateTestScore = (testId: string, newScore: number) => {
    const updated = tests.map(t => {
      if (t.id === testId) {
        let interp = { classification: t.classification, interpretation: t.clinicalInterpretation };
        if (testId === 'phq9') interp = PHQ9_TEST.interpret(newScore);
        if (testId === 'gad7') interp = GAD7_TEST.interpret(newScore);
        if (testId === 'asrs18') interp = ASRS18_TEST.interpret(newScore);
        if (testId === 'aq10') interp = AQ10_TEST.interpret(newScore);
        return {
          ...t,
          score: newScore,
          classification: interp.classification,
          clinicalInterpretation: interp.interpretation
        };
      }
      return t;
    });
    updateTestsState(updated);
  };

  const handleUpdateTestField = (testId: string, field: 'classification' | 'clinicalInterpretation', value: string) => {
    const updated = tests.map(t => {
      if (t.id === testId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    updateTestsState(updated);
  };

  const handleSwitchReportType = (type: 'inicial' | 'evolutivo') => {
    if (setReportType) {
      setReportType(type);
    }
    setInternalReportType(type);
    const built = buildPsychologicalReportFromTriage(patientName, patientAnswers, type, tests);
    setPurpose(built.purpose);
    setDemandDescription(built.demandDescription);
    setTechnicalProcedures(built.technicalProcedures);
    setClinicalAnalysis(built.clinicalAnalysis);
    setDiagnosticHypothesis(built.diagnosticHypothesis);
    setConclusion(built.conclusion);
    showToast(type === 'evolutivo' 
      ? "📈 Modelo alterado para Relatório de Acompanhamento Evolutivo!" 
      : "📋 Modelo alterado para Relatório de Acompanhamento Inicial!"
    );
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePullFromTriage = () => {
    if (onResetFromTriage) {
      onResetFromTriage();
    }
    const freshTests = buildDefaultSelectedTests(patientAnswers);
    updateTestsState(freshTests);
    const built = buildPsychologicalReportFromTriage(patientName, patientAnswers, currentReportType, freshTests);
    setPurpose(built.purpose);
    setDemandDescription(built.demandDescription);
    setTechnicalProcedures(built.technicalProcedures);
    setClinicalAnalysis(built.clinicalAnalysis);
    setDiagnosticHypothesis(built.diagnosticHypothesis);
    setConclusion(built.conclusion);
    showToast("✓ Dados recarregados exatamente da triagem e testes do paciente!");
  };

  const handleSyncTestsIntoProcedures = () => {
    const appliedList = tests.filter(t => t.applied);
    if (appliedList.length === 0) {
      showToast("Nenhum teste selecionado no momento.");
      return;
    }
    const built = buildPsychologicalReportFromTriage(patientName, patientAnswers, currentReportType, tests);
    setTechnicalProcedures(built.technicalProcedures);
    showToast(`✓ Procedimentos técnicos atualizados com ${appliedList.length} escala(s) selecionada(s)!`);
  };

  const handleSave = () => {
    const payload = {
      reportType: currentReportType,
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
      psychologistCrp,
      selectedTests: tests
    };

    if (onSave) {
      onSave(payload);
    }
    setIsSavingFeedback(true);
    showToast("✓ Relatório de Acompanhamento Psicológico salvo com sucesso!");
    setTimeout(() => setIsSavingFeedback(false), 2000);
  };

  const handleAiGenerate = async () => {
    setIsGeneratingAi(true);
    showToast("🤖 IA analisando queixas e escalas do paciente...");

    try {
      const activeTestSummaries = tests.filter(t => t.applied).map(t => `${t.name}: ${t.score}/${t.maxScore} pts (${t.classification})`).join(', ');
      const prompt = `Você é o psicólogo clínico Marco Antônio Boastik (CRP 08/49215).
Com base EXCLUSIVAMENTE nas queixas e histórico informados pelo paciente atual (${patientName}, CPF: ${cpf}, respostas da triagem: ${JSON.stringify(patientAnswers || {})}) e os testes psicológicos selecionados (${activeTestSummaries || 'nenhum teste pontuado'}), elabore o conteúdo técnico de um Relatório de Acompanhamento Psicológico (${currentReportType === 'evolutivo' ? 'Evolutivo' : 'Inicial'}) em conformidade com a Resolução CFP nº 06/2019. Lembre-se: psicólogos NÃO emitem receitas médicas ou laudos psiquiátricos, este é um Relatório Técnico de Acompanhamento Psicológico.
Responda em formato JSON estruturado com os seguintes campos:
{
  "purpose": "Identificação formal do documento e finalidade de acompanhamento",
  "demandDescription": "Descrição fiel da demanda, histórico clínico e queixas emocionais",
  "technicalProcedures": "Procedimentos técnico-científicos adotados citando entrevistas, exame mental e escalas selecionadas",
  "clinicalAnalysis": "Exame psíquico das funções mentais superiores coerente com as respostas do paciente",
  "diagnosticHypothesis": "Hipótese diagnóstica CID-10 / CID-11",
  "conclusion": "Parecer conclusivo com orientações e encaminhamentos para psicoterapia continuada"
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
        console.warn("Gemini call warning, using psychological report generator:", apiErr);
      }

      if (aiResult && aiResult.demandDescription) {
        if (aiResult.purpose) setPurpose(aiResult.purpose);
        if (aiResult.demandDescription) setDemandDescription(aiResult.demandDescription);
        if (aiResult.technicalProcedures) setTechnicalProcedures(aiResult.technicalProcedures);
        if (aiResult.clinicalAnalysis) setClinicalAnalysis(aiResult.clinicalAnalysis);
        if (aiResult.diagnosticHypothesis) setDiagnosticHypothesis(aiResult.diagnosticHypothesis);
        if (aiResult.conclusion) setConclusion(aiResult.conclusion);
      } else {
        const built = buildPsychologicalReportFromTriage(patientName, patientAnswers, currentReportType, tests);
        setPurpose(built.purpose);
        setDemandDescription(built.demandDescription);
        setTechnicalProcedures(built.technicalProcedures);
        setClinicalAnalysis(built.clinicalAnalysis);
        setDiagnosticHypothesis(built.diagnosticHypothesis);
        setConclusion(built.conclusion);
      }

      showToast(`✨ Relatório de Acompanhamento (${currentReportType === 'evolutivo' ? 'Evolutivo' : 'Inicial'}) gerado com IA!`);
    } catch (e: any) {
      console.error("Falha ao gerar com IA:", e);
      const built = buildPsychologicalReportFromTriage(patientName, patientAnswers, currentReportType, tests);
      setPurpose(built.purpose);
      setDemandDescription(built.demandDescription);
      setTechnicalProcedures(built.technicalProcedures);
      setClinicalAnalysis(built.clinicalAnalysis);
      setDiagnosticHypothesis(built.diagnosticHypothesis);
      setConclusion(built.conclusion);
      showToast("✓ Relatório preenchido diretamente com os dados da triagem do paciente.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSendToChatWithFeedback = async () => {
    if (!onSendToChat) return;
    setIsSendingFeedback(true);
    try {
      await onSendToChat({
        reportType: currentReportType,
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
        psychologistCrp,
        selectedTests: tests
      });
      showToast(`✓ Relatório de Acompanhamento (${currentReportType === 'evolutivo' ? 'Evolutivo' : 'Inicial'}) enviado no chat!`);
    } catch (e) {
      console.error(e);
      showToast("Erro ao enviar relatório para o chat.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleDownloadPDFWithTests = () => {
    onDownloadPDF({
      reportType: currentReportType,
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
      psychologistCrp,
      selectedTests: tests
    });
  };

  const handleQuickCid = (cidText: string) => {
    setDiagnosticHypothesis(cidText);
    showToast(`CID selecionado: ${cidText}`);
  };

  // Helper for live test modal
  const activeQuizDef = activeQuizTestId === 'phq9' 
    ? PHQ9_TEST 
    : activeQuizTestId === 'gad7' 
    ? GAD7_TEST 
    : activeQuizTestId === 'asrs18' 
    ? ASRS18_TEST 
    : activeQuizTestId === 'aq10' 
    ? AQ10_TEST 
    : null;

  const handleFinishQuiz = () => {
    if (!activeQuizTestId || !activeQuizDef) return;
    const total = Object.values(quizAnswers).reduce((a, b) => a + b, 0);
    handleUpdateTestScore(activeQuizTestId, total);
    // Mark as applied
    const updated = tests.map(t => t.id === activeQuizTestId ? { ...t, applied: true } : t);
    updateTestsState(updated);
    setActiveQuizTestId(null);
    setQuizAnswers({});
    showToast(`✓ ${activeQuizDef.shortName} pontuado com sucesso: ${total} pts!`);
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
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#12121F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Relatório de Acompanhamento Psicológico</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    Resolução CFP nº 06/2019
                  </span>
                </h3>
                <p className="text-xs text-mecura-silver">
                  Documento técnico de acompanhamento psicológico (Inicial ou Evolutivo) com seleção de testes psicométricos
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
                  <span>Editar Relatório</span>
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
                {/* 1. SELETOR DE ESTILO DO LAUDO / ACOMPANHAMENTO: INICIAL vs EVOLUTIVO */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#18182B] to-indigo-950/40 border border-purple-500/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      {currentReportType === 'evolutivo' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5 text-purple-300" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-mecura-silver tracking-wider">Estilo do Documento:</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          currentReportType === 'evolutivo'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {currentReportType === 'evolutivo' ? 'Acompanhamento Evolutivo' : 'Acompanhamento Inicial'}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium mt-0.5">
                        {currentReportType === 'evolutivo' 
                          ? 'Registro de sessões continuadas, resposta terapêutica e evolução de sintomas'
                          : 'Acolhimento de entrada, anamnese clínica e rastreio psicométrico basal'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Buttons */}
                  <div className="flex items-center bg-[#0D0D17] p-1 rounded-xl border border-white/10 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSwitchReportType('inicial')}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentReportType === 'inicial'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-mecura-silver hover:text-white'
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Acompanhamento Inicial</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchReportType('evolutivo')}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentReportType === 'evolutivo'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-mecura-silver hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Acompanhamento Evolutivo</span>
                    </button>
                  </div>
                </div>

                {/* 2. SELETOR DE TESTES PSICOLÓGICOS UTILIZADOS */}
                <div className="bg-[#12121A] p-4 rounded-2xl border border-white/10 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                        Testes & Escalas Psicológicas Aplicadas neste Paciente
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-mecura-silver">
                        {tests.filter(t => t.applied).length} de {tests.length} aplicados
                      </span>
                      <button
                        type="button"
                        onClick={handleSyncTestsIntoProcedures}
                        className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                        title="Incorporar citações formais dos testes marcados na seção de procedimentos"
                      >
                        + Injetar nos Procedimentos
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-mecura-silver leading-relaxed">
                    Selecione quais testes foram aplicados neste paciente. Os testes marcados com <span className="text-emerald-400 font-bold">✓ Utilizado</span> serão inseridos automaticamente na tabela técnica oficial do documento em PDF.
                  </p>

                  {/* Cards dos 4 Testes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tests.map((test) => {
                      const isApplied = test.applied;
                      return (
                        <div
                          key={test.id}
                          className={`p-3.5 rounded-xl border transition-all text-left relative ${
                            isApplied
                              ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                              : 'bg-[#0A0A10] border-white/5 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isApplied}
                                onChange={() => handleToggleTest(test.id)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-[#161622] border-white/20 cursor-pointer"
                              />
                              <div>
                                <span className={`text-xs font-bold block ${isApplied ? 'text-purple-200' : 'text-mecura-silver'}`}>
                                  {test.name}
                                </span>
                                <span className="text-[10px] text-mecura-silver/70 block">
                                  {test.id === 'phq9' && 'Rastreio e Gravidade de Sintomas Depressivos'}
                                  {test.id === 'gad7' && 'Rastreio de Ansiedade Generalizada'}
                                  {test.id === 'asrs18' && 'Auto-relato de TDAH em Adultos (18 itens)'}
                                  {test.id === 'aq10' && 'Rastreio de Autismo TEA Adulto (Cambridge)'}
                                </span>
                              </div>
                            </label>

                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                              isApplied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 text-mecura-silver border border-white/10'
                            }`}>
                              {isApplied ? '✓ Utilizado' : 'Não Aplicado'}
                            </span>
                          </div>

                          {/* Seletor e inputs quando aplicado */}
                          {isApplied && (
                            <div className="mt-3 pt-2.5 border-t border-purple-500/20 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-purple-300 mb-0.5">
                                    Escore ({test.maxScore ? `0-${test.maxScore}` : 'pontos'}):
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={test.maxScore || 100}
                                      value={test.score}
                                      onChange={(e) => handleUpdateTestScore(test.id, Number(e.target.value))}
                                      className="w-full bg-[#0E0E17] border border-purple-500/30 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-purple-400 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveQuizTestId(test.id as any);
                                        setQuizAnswers({});
                                      }}
                                      className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                                      title="Abrir perguntas do teste para pontuar ao vivo"
                                    >
                                      Pontuar
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-purple-300 mb-0.5">
                                    Classificação Clínica:
                                  </label>
                                  <input
                                    type="text"
                                    value={test.classification}
                                    onChange={(e) => handleUpdateTestField(test.id, 'classification', e.target.value)}
                                    className="w-full bg-[#0E0E17] border border-purple-500/30 rounded-lg px-2.5 py-1 text-[11px] text-white focus:border-purple-400 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-purple-300 mb-0.5">
                                  Interpretação Clínica / Ponto de Corte:
                                </label>
                                <textarea
                                  rows={2}
                                  value={test.clinicalInterpretation}
                                  onChange={(e) => handleUpdateTestField(test.id, 'clinicalInterpretation', e.target.value)}
                                  className="w-full bg-[#0E0E17] border border-purple-500/30 rounded-lg p-2 text-[10px] text-purple-100 focus:border-purple-400 focus:outline-none custom-scrollbar"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ASSISTENTE DE REDAÇÃO & PUXAR TRIAGEM */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#161626] to-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-purple-300 fill-current shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Assistente de Redação Clínica & Triagem</h4>
                      <p className="text-[11px] text-mecura-silver">
                        Puxa as queixas clínicas da triagem e formata o relatório conforme a Resolução CFP nº 06/2019.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePullFromTriage}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Recarregar relatório com dados da triagem do paciente"
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
                      <span>{isGeneratingAi ? 'Redigindo Relatório...' : 'Gerar Texto com IA'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. IDENTIFICAÇÃO DO PACIENTE E PROFISSIONAL */}
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

                {/* 5. SEÇÕES DO DOCUMENTO CONFORME CFP 06/2019 */}
                <div className="space-y-4">
                  {/* 1. Finalidade */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      1. Identificação do Solicitante e Finalidade do Acompanhamento
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
                      {currentReportType === 'evolutivo' 
                        ? '2. Histórico do Atendimento & Demanda Terapêutica'
                        : '2. Descrição da Demanda e Histórico Clínico-Psicológico'}
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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-purple-300">
                        3. Procedimentos e Instrumentos Técnico-Científicos Adotados
                      </label>
                      <span className="text-[10px] text-mecura-silver">Resolução CFP nº 06/2019</span>
                    </div>
                    <textarea
                      rows={3}
                      value={technicalProcedures}
                      onChange={(e) => setTechnicalProcedures(e.target.value)}
                      className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3 text-xs text-white focus:border-purple-400 focus:outline-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* 4. Análise Psicológica e Exame do Estado Mental */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      {currentReportType === 'evolutivo'
                        ? '4. Evolução Clínica, Resposta Psicoterapêutica e Exame Psíquico'
                        : '4. Análise Psicológica e Exame do Estado Mental'}
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
                        5. Hipótese Diagnóstica Nosológica (CID-10 / CID-11)
                      </label>
                      <span className="text-[10px] text-mecura-silver">CIDs Frequentes em Saúde Mental:</span>
                    </div>

                    {/* Quick CIDs Pill Bar */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        'F41.1 - Transtorno de Ansiedade Generalizada (TAG)',
                        'F32.1 - Episódio Depressivo Moderado',
                        'F51.0 - Insônia Não-Orgânica Reativa',
                        'F90.0 - Transtorno de Déficit de Atenção e Hiperatividade (TDAH)',
                        'F84.0 - Transtorno do Espectro Autista (TEA)',
                        'F43.2 - Transtorno de Adaptação / Estresse'
                      ].map((cidItem, cidIdx) => (
                        <button
                          key={`cid-quick-${cidItem.split(' ')[0]}-${cidIdx}`}
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

                  {/* 6. Conclusão e Parecer Psicológico */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-300">
                      {currentReportType === 'evolutivo'
                        ? '6. Parecer Conclusivo e Diretrizes de Evolução Terapêutica'
                        : '6. Conclusão Técnica e Encaminhamento Terapêutico'}
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
                    <span>Pré-visualização do Relatório de Acompanhamento Psicológico Oficial (CFP)</span>
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
                        DEPARTAMENTO DE PSICOLOGIA CLÍNICA & SAÚDE MENTAL
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-purple-950 text-xs">{psychologistName}</h4>
                      <p className="text-[10px] text-purple-700 font-semibold">{psychologistCrp}</p>
                    </div>
                  </div>

                  <div className="text-center my-3">
                    <h3 className="font-black text-sm text-purple-950 tracking-widest uppercase">
                      {currentReportType === 'evolutivo' 
                        ? 'RELATÓRIO DE ACOMPANHAMENTO PSICOLÓGICO (EVOLUTIVO)' 
                        : 'RELATÓRIO DE ACOMPANHAMENTO PSICOLÓGICO (INICIAL)'}
                    </h3>
                    <p className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">
                      DOCUMENTO TÉCNICO DE ACOMPANHAMENTO • RESOLUÇÃO CFP Nº 06/2019
                    </p>
                  </div>

                  {/* Patient Info Box */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-[11px] grid grid-cols-2 gap-2">
                    <p><strong>Paciente:</strong> {patientName}</p>
                    <p><strong>CPF:</strong> {cpf || 'Não informado'}</p>
                    <p><strong>Nascimento:</strong> {birthDate || 'Não informada'}</p>
                    <p><strong>Emissão:</strong> {emissionDate}</p>
                  </div>

                  {/* Seções com Escalas Psicométricas */}
                  <div className="space-y-3 text-[11px] leading-relaxed text-gray-800">
                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">1. Identificação do Solicitante e Finalidade:</h5>
                      <p>{purpose}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">
                        {currentReportType === 'evolutivo' ? '2. Histórico do Atendimento & Demanda:' : '2. Descrição da Demanda:'}
                      </h5>
                      <p>{demandDescription}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">3. Procedimentos Técnico-Científicos:</h5>
                      <p>{technicalProcedures}</p>
                    </div>

                    {/* Tabela de Escalas Aplicadas */}
                    {tests.filter(t => t.applied).length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-purple-200 pb-1">
                          <span className="font-bold text-purple-950 text-[10px] uppercase">
                            Instrumentos e Escalas Psicométricas Aplicadas
                          </span>
                          <span className="text-[9px] font-bold text-purple-700">
                            {tests.filter(t => t.applied).length} escala(s)
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {tests.filter(t => t.applied).map((test) => (
                            <div key={test.id} className="bg-white p-2 rounded border border-purple-100 text-[10px]">
                              <div className="flex justify-between font-bold text-purple-900">
                                <span>{test.name}</span>
                                <span>{test.score}/{test.maxScore} pts ({test.classification})</span>
                              </div>
                              {test.clinicalInterpretation && (
                                <p className="text-gray-600 text-[9px] mt-0.5">{test.clinicalInterpretation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">
                        {currentReportType === 'evolutivo' ? '4. Evolução Clínica e Exame Psíquico:' : '4. Análise Psicológica e Exame do Estado Mental:'}
                      </h5>
                      <p>{clinicalAnalysis}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">5. Hipótese Diagnóstica (CID):</h5>
                      <p className="font-semibold text-purple-950">{diagnosticHypothesis}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-purple-900 uppercase text-[10px]">
                        {currentReportType === 'evolutivo' ? '6. Parecer Conclusivo e Diretrizes de Evolução:' : '6. Conclusão Técnica:'}
                      </h5>
                      <p>{conclusion}</p>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="border-t border-purple-200 pt-4 mt-6 text-center">
                    <div className="w-48 border-b border-purple-900 mx-auto mb-1" />
                    <p className="font-bold text-xs text-purple-950">{psychologistName}</p>
                    <p className="text-[10px] text-purple-700 font-semibold">{psychologistCrp}</p>
                    <p className="text-[9px] text-gray-500 mt-1">
                      Documento técnico de acompanhamento psicológico emitido sob sigilo ético (Resolução CFP nº 06/2019)
                    </p>
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
                  <span>{isSendingFeedback ? 'Enviando...' : `Anexar Relatório (${currentReportType === 'evolutivo' ? 'Evolutivo' : 'Inicial'}) no Chat`}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadPDFWithTests}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF ({currentReportType === 'evolutivo' ? 'Evolutivo' : 'Inicial'})</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL INTERATIVO PARA PONTUAR TESTE AO VIVO */}
      {activeQuizDef && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121E] border border-purple-500/40 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-white/10 bg-[#161625] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-purple-200">{activeQuizDef.name}</h4>
                <p className="text-[10px] text-mecura-silver">{activeQuizDef.cutoffText}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuizTestId(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-mecura-silver hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
              <p className="text-xs text-purple-300 font-medium">
                Selecione as respostas do paciente para calcular automaticamente o escore:
              </p>

              {activeQuizDef.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-[#0A0A10] p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-purple-400 shrink-0">{qIdx + 1}.</span>
                    <div>
                      <p className="text-xs text-white leading-snug">{q.question}</p>
                      <span className="text-[9px] text-mecura-silver/70">{q.domain}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {activeQuizDef.frequencyOptions.map((opt) => {
                      const isSelected = quizAnswers[q.id] === opt.points;
                      return (
                        <button
                          key={`${q.id}-opt-${opt.points}`}
                          type="button"
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.points }))}
                          className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                              : 'bg-white/5 border-white/10 text-mecura-silver hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {opt.label} ({opt.points})
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#161625] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-200">
                  Pontuação Atual: {Object.values(quizAnswers).reduce((a, b) => a + b, 0)} pts
                </span>
                <span className="text-[10px] text-mecura-silver block">
                  {Object.keys(quizAnswers).length} de {activeQuizDef.questions.length} respondidas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveQuizTestId(null)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFinishQuiz}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Salvar Escore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
