import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare, ShieldCheck, ChevronRight, HelpCircle, Activity, LayoutDashboard, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export function DiagnosisScreen() {
  const navigate = useNavigate();
  const { userName, answers, setSelectedOffer, pagamento_consulta, inQueue, consultationActive } = useStore();

  const handleNext = () => {
    if (pagamento_consulta && consultationActive) {
      navigate('/chat');
      return;
    }
    setSelectedOffer('basic');
    navigate('/checkout');
  };

  // Dynamic Clinical Logic
  const objectives = (answers && answers.objectives) || [];
  const primaryObjective = objectives[0] || 'Bem-estar Geral';
  
  const getClinicalInsight = (objective: string) => {
    const insights: Record<string, string> = {
      'Melhora do Sono': 'A latência do sono e os despertares noturnos relatados sugerem uma baixa produção endógena de melatonina, onde o CBD pode atuar como regulador do ciclo circadiano.',
      'Controle da Ansiedade': 'Os picos de cortisol descritos indicam uma hiperatividade da amígdala. A modulação dos receptores 5-HT1A via fitocanabinoides é altamente indicada para este perfil.',
      'Dor Crônica': 'O histórico de dor persistente aponta para uma sensibilização central. O efeito analgésico e anti-inflamatório sistêmico é o foco principal para sua recuperação.',
      'Equilíbrio emocional': 'A instabilidade relatada sugere um desequilíbrio no tônus endocanabinoide, afetando a homeostase emocional e a resposta ao estresse.',
      'Menos Estresse': 'O estado de exaustão descrito é compatível com fadiga adrenal. O tratamento visa reduzir a carga alostática e restaurar o equilíbrio do sistema nervoso.',
      'Aumento do Foco': 'A dispersão cognitiva mencionada pode estar ligada a processos inflamatórios de baixo grau no SNC, onde canabinoides podem atuar como neuroprotetores.',
      'Enxaqueca': 'A recorrência das crises sugere uma deficiência clínica de endocanabinoides, uma teoria sólida para explicar a fisiopatologia da sua enxaqueca.',
      'Fibromialgia': 'O quadro de dor generalizada e fadiga é um dos perfis com maior taxa de sucesso na modulação canabinoide para melhora da qualidade de vida.',
      'Depressão': 'A baixa vitalidade relatada pode ser beneficiada pela estimulação indireta de receptores de dopamina e serotonina através do sistema endocanabinoide.',
      'TDAH': 'A desregulação da dopamina no córtex pré-frontal pode ser modulada pelo sistema endocanabinoide, auxiliando no controle da impulsividade e foco.',
      'Burnout': 'O esgotamento neuroendócrino identificado requer uma abordagem que restaure o eixo HPA, onde o CBD atua como um adaptógeno potente.',
      'Aumento da Libido': 'A redução do desejo muitas vezes está ligada à ansiedade de desempenho ou desequilíbrio hormonal, áreas onde a terapia canabinoide apresenta resultados promissores.',
      'Controle da TPM': 'As flutuações de humor e dores físicas do ciclo menstrual podem ser atenuadas pela ação miorrelaxante e estabilizadora de humor dos fitocanabinoides.',
      'Síndrome de Epilepsia': 'A estabilização da excitabilidade neuronal é o principal benefício. O CBD atua diretamente na redução da frequência e intensidade das crises convulsivas através da modulação da homeostase biónica.',
      'Autismo (TEA)': 'A melhora na interação social e redução de comportamentos disruptivos ou autoagressivos é amplamente documentada na modulação do sistema endocanabinoide em pacientes dentro do espectro.',
      'Artrite / Artrose': 'A ação anti-inflamatória profunda nos tecidos sinoviais ajuda a reduzir o edema e a dor articular, preservando a mobilidade sem os efeitos colaterais dos AINEs.',
      'Endometriose': 'A modulação de receptores CB1 e CB2 no tecido endometrial ajuda a controlar a dor pélvica crônica e a inflamação sistêmica associada ao ciclo.',
      'Doença de Crohn / Colite': 'Canabinoides auxiliam na redução da hiperpermeabilidade intestinal e no controle da resposta imune exagerada no trato digestivo.',
      'Psoríase / Dermatite': 'O efeito imunomodulador tópico e sistêmico ajuda a controlar a proliferação acelerada de queratinócitos e a inflamação cutânea.',
      'Hérnia de Disco / Coluna': 'O foco é o alívio da dor radicular e a redução do espasmo muscular protetor, permitindo uma melhor reabilitação física.',
      'Dores Neuropáticas': 'A estabilização da transmissão do sinal de dor nos nervos periféricos e centrais é o principal mecanismo para tratar o formigamento e a queimação crônica.',
      'Síndrome das Pernas Inquietas': 'A modulação dopaminérgica indireta e o efeito relaxante muscular ajudam a cessar o impulso involuntário de movimento durante o repouso.',
    };
    return insights[objective] || 'Os sintomas descritos indicam uma desregulação neuroquímica que pode ser equilibrada com a introdução de fitocanabinoides específicos.';
  };

  // Calculate a "Compatibility Score" based on intensity and number of objectives
  const intensity = parseInt((answers && answers.intensity) || '5');
  const baseScore = 82;
  const dynamicBonus = Math.min(15, (objectives.length * 2) + (intensity / 2));
  const compatibilityScore = Math.min(99, baseScore + dynamicBonus + Math.floor(Math.random() * 3));

  return (
    <div className="flex flex-col min-h-full bg-[#000000] text-mecura-pearl font-sans relative overflow-y-auto pb-12">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white" title="Voltar">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <span className="text-mecura-neon font-bold tracking-widest text-sm uppercase">Mecura</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-mecura-neon bg-mecura-neon/10 hover:bg-mecura-neon/20 border border-mecura-neon/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ir para Área do Paciente"
          >
            <User className="w-3.5 h-3.5" />
            <span>Meu Painel</span>
          </button>
          <button 
            onClick={() => window.open('https://wa.me/5566996280883?text=' + encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre o meu resultado de compatibilidade e a consulta na Mecura.'), '_blank')}
            className="text-mecura-silver hover:text-mecura-neon text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="px-6 flex flex-col items-center">
        {/* Compatibility Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 relative"
        >
          <div className="w-32 h-32 rounded-full border-2 border-mecura-neon/30 flex flex-col items-center justify-center bg-mecura-neon/5 relative z-10">
            <span className="text-xs text-mecura-neon font-bold uppercase tracking-tighter opacity-70">Compatibilidade</span>
            <span className="text-4xl font-black text-white">{compatibilityScore}%</span>
          </div>
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border border-mecura-neon/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border border-mecura-neon/10 animate-[pulse_3s_infinite]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-[#161622] px-3 py-1 rounded-full border border-mecura-neon/20 mb-3">
             <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
             <span className="text-[10px] text-mecura-neon font-bold uppercase tracking-widest">+ {Math.floor(Math.random() * (1450 - 800 + 1)) + 800} pessoas com perfil similar em tratamento</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-3 leading-tight">
            Resultado da Triagem:<br />
            <span className="text-mecura-neon">Perfil Altamente Elegível</span>
          </h1>
          <p className="text-mecura-silver text-sm px-4">
            Identificamos indicadores críticos no seu mapeamento que sugerem uma resposta terapêutica positiva.
          </p>
        </motion.div>

        {/* Clinical Report Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-gradient-to-b from-[#161622] to-[#0A0A0F] border border-mecura-neon/30 rounded-[32px] p-7 mb-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Activity className="w-12 h-12 text-mecura-neon" />
          </div>
          
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-mecura-neon" />
            Relatório de Viabilidade
          </h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-mecura-neon rounded-full" />
              <div>
                <p className="text-[11px] text-mecura-neon font-bold uppercase tracking-widest mb-1">Foco do Tratamento</p>
                <p className="text-white text-sm font-medium leading-relaxed">
                  A modulação do seu Sistema Endocanabinoide apresenta alto potencial para o alívio de <span className="text-mecura-neon">{(answers.objectives || []).join(', ')}</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 h-auto bg-mecura-silver/30 rounded-full" />
              <div>
                <p className="text-[11px] text-mecura-silver font-bold uppercase tracking-widest mb-1">Observação Clínica</p>
                <p className="text-mecura-pearl text-sm italic leading-relaxed">
                  "{getClinicalInsight(primaryObjective)}"
                </p>
              </div>
            </div>

            {/* Clinical Team Section Header */}
            <div className="mt-5 mb-2 flex items-center justify-between">
              <span className="text-[11px] text-mecura-silver font-bold uppercase tracking-widest">
                Corpo Clínico Especializado
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-mecura-neon font-black uppercase tracking-wider bg-mecura-neon/10 border border-mecura-neon/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
                2 Especialistas On-line
              </span>
            </div>

            {/* Clinical Team Cards Grid */}
            <div className="space-y-3">
              {/* Doctor Status Banner */}
              <div className="bg-gradient-to-r from-mecura-neon/10 via-[#161622] to-[#12121A] rounded-2xl p-4 border border-mecura-neon/25 shadow-lg relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.25)] bg-[#0A0A0F]">
                      <img src="/doctor-avatar.png" alt="Dr. Guilherme T. Dias" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mecura-neon rounded-full border-2 border-[#161622] animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-white font-bold text-sm tracking-tight truncate">Dr. Guilherme T. Dias</p>
                      <span className="text-[9px] bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                        Médico • CRM/MT 17259
                      </span>
                    </div>
                    <p className="text-mecura-neon text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon inline-block" />
                      Disponível Agora
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-1.5 leading-relaxed">
                      Especialista em medicina canabinoide. Responsável pela prescrição digital oficial ICP-Brasil, dosagem terapêutica e laudos periciais médicos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Psychologist Status Banner */}
              <div className="bg-gradient-to-r from-purple-500/10 via-[#161622] to-[#12121A] rounded-2xl p-4 border border-purple-500/25 shadow-lg relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-[#0A0A0F]">
                      <img src="/pscologo.jpeg" alt="Marco Antônio Boastik" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-[#161622] animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-white font-bold text-sm tracking-tight truncate">Marco Antônio Boastik</p>
                      <span className="text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                        Psicólogo • CRP 08/49215
                      </span>
                    </div>
                    <p className="text-purple-300 text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                      Disponível Agora
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-1.5 leading-relaxed">
                      Psicólogo clínico e pericial. Avaliação de saúde mental, suporte emocional e emissão de laudo psicológico completo para tratamento e Habeas Corpus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 w-full">
          <div className="p-3.5 rounded-2xl bg-[#161622]/60 border border-[#262636] flex flex-col gap-1.5">
            <MessageSquare className="w-5 h-5 text-mecura-neon" />
            <h4 className="text-white font-bold text-xs">Chat & Vídeo Seguro</h4>
            <p className="text-[#8A8A9E] text-[10px] leading-snug">Atendimento humanizado e sigiloso.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#161622]/60 border border-[#262636] flex flex-col gap-1.5">
            <Activity className="w-5 h-5 text-mecura-neon" />
            <h4 className="text-white font-bold text-xs">Receita Digital</h4>
            <p className="text-[#8A8A9E] text-[10px] leading-snug">ICP-Brasil válida em todo o país.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#161622]/60 border border-purple-500/20 flex flex-col gap-1.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-bold text-xs">Laudo Psicológico</h4>
            <p className="text-[#8A8A9E] text-[10px] leading-snug">Avaliação com Marco Antônio (CRP 08/49215).</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#161622]/60 border border-mecura-neon/20 flex flex-col gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-mecura-neon" />
            <h4 className="text-white font-bold text-xs">Dossiê Habeas Corpus</h4>
            <p className="text-[#8A8A9E] text-[10px] leading-snug">Laudos periciais fundamentados.</p>
          </div>
        </div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <Button 
            onClick={handleNext}
            className="w-full h-16 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.25)] hover:shadow-[0_0_40px_rgba(166,255,0,0.4)] transition-all group"
          >
            Escolher Plano e Iniciar Atendimento
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex items-center justify-center gap-3 mt-4 opacity-50 text-center">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" />
              <p className="text-[9px] text-mecura-silver uppercase tracking-[0.2em] font-bold">
                CFM (Medicina)
              </p>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[9px] text-mecura-silver uppercase tracking-[0.2em] font-bold">
                CFP (Psicologia)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
