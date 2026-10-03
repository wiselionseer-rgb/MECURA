import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Droplets, Clock, AlertCircle, FileText, Download, 
  CheckCircle2, ShieldCheck, Calendar, User, Stethoscope, Sparkles, 
  ShoppingCart, MessageCircle, ExternalLink, QrCode, FileCheck, ArrowRight,
  Sun, Moon, Sunset, Info, Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore, Message } from '../store/useStore';
import { 
  generatePrescriptionPDF, 
  generateMedicalReportPDF, 
  generatePsychomotorReportPDF, 
  generateAgronomicReportPDF 
} from '../utils/pdfGenerator';
import { deliverPdfBlob, downloadOrGenerateAttachment } from '../utils/downloadHelper';
import { enrichMedicationDetails } from '../data/cbdGuide';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProtocolScreen() {
  const navigate = useNavigate();
  const { 
    userName, userCpf, userBirthDate, answers, messages, 
    consultationHistory, isConsultationFinished 
  } = useStore();

  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [downloadAllProgress, setDownloadAllProgress] = useState(false);

  // Verified if doctor actually conducted consultation and issued documents
  const hasDoctorPrescription = useMemo(() => {
    return messages.some(m => 
      m.type === 'prescription' || 
      m.type === 'receita_previa' || 
      (m.type === 'product' && m.productData) ||
      (m.attachment && (m.attachment.docType === 'receita' || m.attachment.name?.toLowerCase().includes('receita')))
    );
  }, [messages]);

  // Extract prescribed items from messages, falling back to empty if consultation not done yet
  const prescriptionItems = useMemo(() => {
    if (!hasDoctorPrescription) {
      return [];
    }

    // Check for receita_previa messages first
    const previaMsg = messages.find(m => m.type === 'receita_previa' && m.receitaPreviaData?.items?.length);
    if (previaMsg && previaMsg.receitaPreviaData?.items && previaMsg.receitaPreviaData.items.length > 0) {
      return previaMsg.receitaPreviaData.items.map(item => {
        const enriched = enrichMedicationDetails(
          item.name,
          item.brand || 'GreenBudz',
          item.origin || 'Importado',
          item.type
        );
        const dosageNormalized: string[] = Array.isArray(item.dosage)
          ? item.dosage
          : typeof item.dosage === 'string'
          ? (item.dosage as string).split('\n').filter(Boolean)
          : [];

        return {
          ...enriched,
          ...item,
          dosage: dosageNormalized.length > 0 ? dosageNormalized : [
            '☀️ Manhã: 5 gotas sob a língua após o café',
            '🌙 Noite: 10 gotas sob a língua 30min antes de deitar'
          ],
          details: item.details && item.details.length > 0 ? item.details : [enriched.usageInstructions || 'Uso sublingual conforme orientação médica.']
        };
      });
    }

    const rawItems = messages
      .filter(msg => msg.type === 'product' && msg.productData)
      .map(msg => msg.productData!);

    if (rawItems.length > 0) {
      return rawItems.map(item => {
        const enriched = enrichMedicationDetails(
          item.name,
          item.brand || 'GreenBudz',
          item.origin || 'Importado',
          item.type
        );
        const dosageNormalized: string[] = Array.isArray(item.dosage)
          ? item.dosage
          : typeof item.dosage === 'string'
          ? (item.dosage as string).split('\n').filter(Boolean)
          : [];

        return {
          ...enriched,
          ...item,
          dosage: dosageNormalized.length > 0 ? dosageNormalized : [
            '☀️ Manhã: 5 gotas sob a língua após o café',
            '🌙 Noite: 10 gotas sob a língua 30min antes de deitar'
          ],
          details: item.details && item.details.length > 0 ? item.details : [enriched.usageInstructions || 'Uso sublingual conforme orientação médica.']
        };
      });
    }

    const docMsg = messages.find(m => m.type === 'prescription');
    if (docMsg) {
      return [
        {
          name: 'GreenBudz Calm Vibe CBD 6000mg',
          brand: 'GreenBudz',
          origin: 'Importado',
          type: 'Óleo Sublingual',
          activeIngredients: 'CBD Full Spectrum 6000mg (200mg/ml) + Terpenos',
          concentration: '200mg/ml (6000mg total)',
          pharmaceuticalForm: 'Frasco Conta-gotas 30ml',
          quantity: '1 frasco',
          administrationRoute: 'Sublingual',
          dosage: [
            '☀️ Manhã: 5 gotas (25mg CBD) sob a língua após o café',
            '🌙 Noite: 10 gotas (50mg CBD) sob a língua 30min antes de deitar'
          ],
          details: [
            'Pingar diretamente sob a língua e aguardar 60 segundos antes de engolir.',
            'Uso contínuo para controle de ansiedade, regulação do sono e bem-estar geral.'
          ],
          image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60'
        }
      ];
    }

    // Patient has not been prescribed yet
    return [];
  }, [messages, hasDoctorPrescription]);

  // Find prescription/medical report messages with attachments
  const prescriptionMsg = useMemo(() => {
    return messages.find(m => m.type === 'prescription');
  }, [messages]);

  const medicalReportMsg = useMemo(() => {
    return messages.find(m => m.type === 'medical_report');
  }, [messages]);

  const psychomotorReportMsg = useMemo(() => {
    return messages.find(m => m.type === 'psychomotor_report');
  }, [messages]);

  const agronomicReportMsg = useMemo(() => {
    return messages.find(m => m.type === 'agronomic_report');
  }, [messages]);

  // Patient metadata
  const displayName = userName || 'Paciente';
  const displayCpf = userCpf || answers?.cpf || 'Não informado';
  const displayBirthDate = userBirthDate || answers?.birthDate || 'Não informada';
  
  // Date of start
  const startDate = useMemo(() => {
    const firstDocMsg = messages.find(m => m.type === 'prescription' || m.type === 'product' || m.sender === 'doctor');
    if (firstDocMsg?.timestamp) {
      try {
        const d = new Date(firstDocMsg.timestamp);
        if (!isNaN(d.getTime())) return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      } catch (e) {
        // ignore
      }
    }
    return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [messages]);

  const objectives = answers?.objectives && answers.objectives.length > 0 
    ? answers.objectives.join(', ') 
    : 'Equilíbrio do Sistema Endocanabinoide, Ansiedade e Qualidade do Sono';

  // Handler for downloading Prescription
  const handleDownloadPrescription = async () => {
    if (!hasDoctorPrescription) {
      alert("A receita médica oficial estará disponível para download assim que o Dr. Guilherme finalizar a sua consulta médica.");
      return;
    }
    setDownloadingDoc('prescription');
    try {
      if (prescriptionMsg?.attachment) {
        await downloadOrGenerateAttachment(
          prescriptionMsg.attachment,
          async () => {
            const blob = await generatePrescriptionPDF(displayName, messages, {
              birthDate: displayBirthDate,
              cpf: displayCpf,
              returnBlob: true
            } as any);
            return blob as Blob;
          },
          `Receita_Medica_${displayName.replace(/\s+/g, '_')}.pdf`
        );
      } else {
        const blob = await generatePrescriptionPDF(displayName, messages, {
          birthDate: displayBirthDate,
          cpf: displayCpf,
          returnBlob: true
        } as any);
        if (blob instanceof Blob) {
          await deliverPdfBlob(blob, `Receita_Medica_${displayName.replace(/\s+/g, '_')}.pdf`);
        }
      }
    } catch (err) {
      console.error('Erro ao baixar receita:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Handler for downloading Medical Report
  const handleDownloadMedicalReport = async () => {
    if (!hasDoctorPrescription) {
      alert("O laudo médico oficial estará disponível para download após o Dr. Guilherme realizar o seu atendimento.");
      return;
    }
    setDownloadingDoc('medical_report');
    try {
      if (medicalReportMsg?.attachment) {
        await downloadOrGenerateAttachment(
          medicalReportMsg.attachment,
          async () => {
            const blob = await generateMedicalReportPDF(displayName, messages, {
              birthDate: displayBirthDate,
              cpf: displayCpf,
              returnBlob: true
            } as any);
            return blob as Blob;
          },
          `Laudo_Medico_${displayName.replace(/\s+/g, '_')}.pdf`
        );
      } else {
        const blob = await generateMedicalReportPDF(displayName, messages, {
          birthDate: displayBirthDate,
          cpf: displayCpf,
          returnBlob: true
        } as any);
        if (blob instanceof Blob) {
          await deliverPdfBlob(blob, `Laudo_Medico_${displayName.replace(/\s+/g, '_')}.pdf`);
        }
      }
    } catch (err) {
      console.error('Erro ao baixar laudo médico:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Handler for downloading Psychomotor Report
  const handleDownloadPsychomotorReport = async () => {
    if (!hasDoctorPrescription) {
      alert("O laudo de aptidão estará disponível após a sua consulta médica.");
      return;
    }
    setDownloadingDoc('psychomotor');
    try {
      const blob = await generatePsychomotorReportPDF(displayName, {
        birthDate: displayBirthDate,
        cpf: displayCpf,
        returnBlob: true
      } as any);
      if (blob instanceof Blob) {
        await deliverPdfBlob(blob, `Laudo_Aptidao_Psicomotora_${displayName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error('Erro ao baixar laudo psicomotor:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Handler for downloading Agronomic Report
  const handleDownloadAgronomicReport = async () => {
    if (!hasDoctorPrescription) {
      alert("O parecer agronômico estará disponível após a sua consulta médica.");
      return;
    }
    setDownloadingDoc('agronomic');
    try {
      const blob = await generateAgronomicReportPDF(displayName, {
        birthDate: displayBirthDate,
        cpf: displayCpf,
        returnBlob: true
      } as any);
      if (blob instanceof Blob) {
        await deliverPdfBlob(blob, `Parecer_Tecnico_Agronomico_${displayName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error('Erro ao baixar laudo agronômico:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Download all official documents in batch
  const handleDownloadAll = async () => {
    if (!hasDoctorPrescription) {
      alert("Os documentos médicos oficiais só podem ser baixados após o médico realizar o atendimento.");
      return;
    }
    setDownloadAllProgress(true);
    try {
      await handleDownloadPrescription();
      await new Promise(r => setTimeout(r, 600));
      await handleDownloadMedicalReport();
      if (psychomotorReportMsg) {
        await new Promise(r => setTimeout(r, 600));
        await handleDownloadPsychomotorReport();
      }
      if (agronomicReportMsg) {
        await new Promise(r => setTimeout(r, 600));
        await handleDownloadAgronomicReport();
      }
    } catch (err) {
      console.error('Erro ao baixar todos os documentos:', err);
    } finally {
      setDownloadAllProgress(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-[#E8E8EE] relative overflow-y-auto pb-36 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 sm:p-5 pt-6 border-b border-white/5 bg-[#0A0A0F]/90 backdrop-blur-xl sticky top-0 z-30">
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#161622] border border-white/10 text-xs font-bold text-white hover:bg-[#1F1F30] transition-colors"
          title="Voltar ao Painel"
        >
          <ChevronLeft className="w-4 h-4 pr-0.5 text-mecura-neon" />
          <span>Meu Painel</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Protocolo Terapêutico</h1>
          <p className="text-[10px] sm:text-[11px] text-mecura-neon font-medium">
            {hasDoctorPrescription ? 'Prescrição Médica Validada' : 'Aguardando Avaliação Médica'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/20 transition-colors"
            title="Acessar Área do Paciente"
          >
            <User className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (hasDoctorPrescription || isConsultationFinished) {
                navigate('/chat');
              } else {
                navigate('/queue');
              }
            }}
            className="w-9 h-9 rounded-full bg-[#161622] border border-white/10 flex items-center justify-center text-mecura-silver hover:text-white transition-colors"
            title={hasDoctorPrescription ? "Ver Conversa da Consulta" : "Acompanhar Fila"}
          >
            {hasDoctorPrescription ? <MessageCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 text-mecura-neon" />}
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-5 space-y-6 max-w-2xl mx-auto w-full">
        {/* Banner de Aviso caso o paciente AINDA NÃO TENHA SIDO ATENDIDO */}
        {!hasDoctorPrescription && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-[28px] bg-gradient-to-br from-amber-500/15 via-[#1E170A] to-[#121008] border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-1.5">
                  Consulta Médica Pendente
                </span>
                <h3 className="text-white font-bold text-base leading-snug mb-1">
                  Seus documentos estão sendo preparados
                </h3>
                <p className="text-amber-100/80 text-xs leading-relaxed mb-4">
                  A receita médica digital e o laudo oficial com assinatura eletrônica ICP-Brasil são emitidos pelo <strong>Dr. Guilherme</strong> durante ou após a sua consulta médica. Assim que o atendimento for concluído, os arquivos serão liberados para download nesta página.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate('/queue')}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Ir para Fila de Espera
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-mecura-neon" />
                    Sala de Atendimento
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Treatment Overview Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-mecura-neon/30 rounded-[32px] p-6 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-mecura-neon/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-mecura-neon/10 border border-mecura-neon/20 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${hasDoctorPrescription ? 'bg-mecura-neon animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider">
                  {hasDoctorPrescription ? 'TRATAMENTO EM CURSO' : 'EM PREPARAÇÃO MÉDICA'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#8A8A9E] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                {hasDoctorPrescription ? 'Renovação em 90 dias' : 'Aguardando Consulta'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
                Protocolo de {displayName.split(' ')[0]}
              </h2>
              <p className="text-[13px] text-[#8A8A9E] mt-1 leading-relaxed">
                {hasDoctorPrescription 
                  ? 'Plano clínico individualizado para modulação do sistema endocanabinoide.'
                  : 'Seu plano personalizado será prescrito individualmente pelo Dr. Guilherme durante a consulta.'}
              </p>
            </div>

            {/* Key Treatment Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#161622] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#8A8A9E] text-[11px] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-mecura-neon" />
                  <span>Dia de Início</span>
                </div>
                <p className="text-[13px] font-bold text-white capitalize">{startDate}</p>
              </div>

              <div className="bg-[#161622] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#8A8A9E] text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-mecura-neon" />
                  <span>Duração Prevista</span>
                </div>
                <p className="text-[13px] font-bold text-white">90 Dias (Uso Contínuo)</p>
              </div>

              <div className="bg-[#161622] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#8A8A9E] text-[11px] mb-1">
                  <Stethoscope className="w-3.5 h-3.5 text-mecura-neon" />
                  <span>Médico Responsável</span>
                </div>
                <p className="text-[13px] font-bold text-white">Dr. Guilherme Taveira</p>
                <p className="text-[10px] text-[#8A8A9E]">CRM: 12345/SP</p>
              </div>

              <div className="bg-[#161622] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#8A8A9E] text-[11px] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" />
                  <span>Indicação Clínica</span>
                </div>
                <p className="text-[12px] font-bold text-white truncate">{objectives}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Official Documents Downloads Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-mecura-neon" />
              Documentos Médicos Oficiais (PDF)
            </h3>
            {hasDoctorPrescription ? (
              <button
                onClick={handleDownloadAll}
                disabled={downloadAllProgress}
                className="text-[11px] font-bold text-mecura-neon hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadAllProgress ? 'Baixando...' : 'Baixar Todos'}
              </button>
            ) : (
              <span className="text-[10px] text-amber-400/80 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado até consulta
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Prescription PDF Card */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between transition-colors ${
              hasDoctorPrescription 
                ? 'bg-[#12121A] border-white/5 hover:border-mecura-neon/30' 
                : 'bg-[#0E0E14] border-white/5 opacity-80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  hasDoctorPrescription 
                    ? 'bg-mecura-neon/10 border-mecura-neon/20 text-mecura-neon' 
                    : 'bg-white/5 border-white/10 text-[#8A8A9E]'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                    Receita Médica Digital
                    {!hasDoctorPrescription && <Lock className="w-3 h-3 text-amber-400" />}
                  </h4>
                  <p className="text-[11px] text-[#8A8A9E]">
                    {hasDoctorPrescription ? 'Assinatura ICP-Brasil & QR Code' : 'Emitida pelo Dr. Guilherme'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadPrescription}
                disabled={downloadingDoc === 'prescription' || !hasDoctorPrescription}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                  hasDoctorPrescription 
                    ? 'bg-[#1A1A28] hover:bg-mecura-neon hover:text-[#0A0A0F] text-white border-white/10 cursor-pointer' 
                    : 'bg-white/5 text-[#8A8A9E] border-white/5 cursor-not-allowed'
                }`}
                title={hasDoctorPrescription ? "Baixar Receita Médica" : "Disponível após o atendimento médico"}
              >
                {hasDoctorPrescription ? <Download className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Medical Report PDF Card */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between transition-colors ${
              hasDoctorPrescription 
                ? 'bg-[#12121A] border-white/5 hover:border-blue-500/30' 
                : 'bg-[#0E0E14] border-white/5 opacity-80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  hasDoctorPrescription 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                    : 'bg-white/5 border-white/10 text-[#8A8A9E]'
                }`}>
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                    Laudo Médico Oficial
                    {!hasDoctorPrescription && <Lock className="w-3 h-3 text-amber-400" />}
                  </h4>
                  <p className="text-[11px] text-[#8A8A9E]">
                    {hasDoctorPrescription ? 'ANVISA, Planos & Jurídico' : 'Emitido após a consulta'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadMedicalReport}
                disabled={downloadingDoc === 'medical_report' || !hasDoctorPrescription}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                  hasDoctorPrescription 
                    ? 'bg-[#1A1A28] hover:bg-blue-400 hover:text-[#0A0A0F] text-white border-white/10 cursor-pointer' 
                    : 'bg-white/5 text-[#8A8A9E] border-white/5 cursor-not-allowed'
                }`}
                title={hasDoctorPrescription ? "Baixar Laudo Médico" : "Disponível após o atendimento médico"}
              >
                {hasDoctorPrescription ? <Download className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Psychomotor Report (if available) */}
            {psychomotorReportMsg && (
              <div className="bg-[#12121A] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-mecura-neon/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Laudo de Aptidão</h4>
                    <p className="text-[11px] text-[#8A8A9E]">Aptidão Psicomotora</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPsychomotorReport}
                  disabled={downloadingDoc === 'psychomotor'}
                  className="w-9 h-9 rounded-full bg-[#1A1A28] hover:bg-purple-400 hover:text-[#0A0A0F] text-white flex items-center justify-center border border-white/10 transition-all shrink-0 cursor-pointer"
                  title="Baixar Laudo Psicomotor"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Agronomic Report (if available) */}
            {agronomicReportMsg && (
              <div className="bg-[#12121A] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-mecura-neon/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Parecer Agronômico</h4>
                    <p className="text-[11px] text-[#8A8A9E]">Cultivo & Suporte Técnico</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadAgronomicReport}
                  disabled={downloadingDoc === 'agronomic'}
                  className="w-9 h-9 rounded-full bg-[#1A1A28] hover:bg-emerald-400 hover:text-[#0A0A0F] text-white flex items-center justify-center border border-white/10 transition-all shrink-0 cursor-pointer"
                  title="Baixar Parecer Agronômico"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prescribed Medications & Detailed Posology */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-mecura-neon" />
              Medicamentos do Protocolo & Posologia
            </h3>
            <span className="text-[11px] text-[#8A8A9E]">
              {prescriptionItems.length} {prescriptionItems.length === 1 ? 'medicamento' : 'medicamentos'}
            </span>
          </div>

          {prescriptionItems.length === 0 ? (
            <div className="bg-[#12121A] border border-white/5 rounded-[24px] p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#8A8A9E]">
                <Droplets className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-sm">Medicamentos aguardando prescrição médica</h4>
              <p className="text-xs text-[#8A8A9E] max-w-sm mx-auto leading-relaxed">
                As formulações fitocanabinoides, concentrações e posologia diária serão definidas pelo médico durante a sua consulta.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {prescriptionItems.map((item, index) => {
              const isImported = item.origin === 'Importado' || (item.brand || '').toLowerCase().includes('greenbudz') || (item.brand || '').toLowerCase().includes('flowermed');

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-[#12121A] border border-white/10 rounded-[28px] p-5 shadow-lg space-y-4"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#1A1A26] border border-white/5 flex items-center justify-center text-mecura-neon shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Droplets className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isImported 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isImported ? '🇺🇸 Importado EUA' : '🇧🇷 Associação Nacional'}
                          </span>
                          <span className="text-[11px] text-[#8A8A9E] font-medium">{item.brand || 'GreenBudz'}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1 leading-snug">{item.name}</h4>
                        <p className="text-[11px] text-[#8A8A9E] mt-0.5">{item.concentration || item.activeIngredients}</p>
                      </div>
                    </div>
                  </div>

                  {/* Posology / Daily Schedule Schedule */}
                  <div className="bg-[#0D0D14] rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[11px] font-bold text-mecura-neon uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Horários & Dosagem Diária
                      </span>
                      <span className="text-[10px] text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-md">
                        {item.administrationRoute || 'Via Sublingual'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {Array.isArray(item.dosage) && item.dosage.length > 0 ? (
                        item.dosage.map((dose, dIdx) => {
                          const isMorning = /manh[ãa]|desjejum|café/i.test(dose);
                          const isAfternoon = /tarde|almo[çc]o|14h|15h/i.test(dose);
                          const isNight = /noite|deitar|dormir|20h|21h|22h/i.test(dose);

                          return (
                            <div key={dIdx} className="flex items-start gap-2.5 text-[12px] text-white/90">
                              {isMorning ? (
                                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : isAfternoon ? (
                                <Sunset className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              ) : isNight ? (
                                <Moon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                              )}
                              <span className="leading-relaxed">{dose}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[12px] text-[#8A8A9E]">Seguir posologia indicada na receita médica oficial.</p>
                      )}
                    </div>
                  </div>

                  {/* Mode of administration instructions */}
                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 flex items-start gap-3 text-[12px] text-[#8A8A9E]">
                    <Info className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {item.details && item.details[0] 
                        ? item.details[0] 
                        : 'Pingar sob a língua e reter por 60 segundos antes de engolir. Evitar ingerir líquidos ou alimentos nos 15 minutos seguintes.'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>

        {/* Titration & Best Practices Guide */}
        <div className="bg-gradient-to-br from-[#121E12] to-[#0E160E] border border-emerald-500/20 rounded-[28px] p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            Orientações de Titulação Gradual
          </div>
          <ul className="space-y-2 text-[12px] text-[#A1B8A1] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Semana 1 (Adaptação):</strong> Inicie com 50% das gotas recomendadas para que seus receptores CB1 e CB2 se acostumem gradualmente.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Semana 2 em diante (Dose Terapêutica):</strong> Atinja a dose plena prescrita e mantenha a regularidade nos mesmos horários todos os dias.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Suporte Contínuo:</strong> Você pode tirar dúvidas sobre efeitos e ajuste de posologia diretamente pelo chat com o médico.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent z-40 border-t border-white/5 backdrop-blur-md">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/pharmacy')}
            className="h-13 rounded-2xl bg-gradient-to-r from-mecura-neon to-[#8EE000] text-[#0A0A0F] font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Comprar Medicamentos
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="h-13 rounded-2xl bg-[#161622] hover:bg-[#1C1C2C] border border-white/10 text-white font-bold text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-mecura-neon" />
            Histórico da Consulta
          </button>
        </div>
      </div>
    </div>
  );
}
