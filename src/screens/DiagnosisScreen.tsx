import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare, ShieldCheck, ChevronRight, HelpCircle, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export function DiagnosisScreen() {
  const navigate = useNavigate();
  const { userName, answers, setSelectedOffer } = useStore();

  const handleNext = () => {
    setSelectedOffer('basic');
    navigate('/checkout');
  };

  // Dynamic Clinical Logic
  const objectives = answers.objectives || [];
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
    };
    return insights[objective] || 'Os sintomas descritos indicam uma desregulação neuroquímica que pode ser equilibrada com a introdução de fitocanabinoides específicos.';
  };

  // Calculate a "Compatibility Score" based on intensity and number of objectives
  const intensity = parseInt(answers.intensity || '5');
  const baseScore = 82;
  const dynamicBonus = Math.min(15, (objectives.length * 2) + (intensity / 2));
  const compatibilityScore = Math.min(99, baseScore + dynamicBonus + Math.floor(Math.random() * 3));

  return (
    <div className="flex flex-col min-h-full bg-[#050508] text-mecura-pearl font-sans relative overflow-y-auto pb-12">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <span className="text-mecura-neon font-bold tracking-widest text-sm uppercase">Mecura</span>
        <button className="text-mecura-silver text-sm font-medium flex items-center gap-1">
          Ajuda <HelpCircle className="w-4 h-4" />
        </button>
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
          className="text-center mb-8"
        >
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

            {/* Doctor Status Banner */}
            <div className="bg-mecura-neon/10 rounded-2xl p-4 border border-mecura-neon/20 mt-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)]">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop" alt="Médico" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mecura-neon rounded-full border-2 border-[#161622] animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Dr. Guilherme T. Dias</p>
                  <p className="text-mecura-neon text-[10px] font-bold uppercase tracking-widest">Disponível Agora</p>
                </div>
              </div>
              <p className="text-[11px] text-mecura-silver mt-3 leading-relaxed">
                O médico já recebeu o alerta do seu perfil e está aguardando para validar sua prescrição digital.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10 w-full">
          <div className="p-4 rounded-2xl bg-[#161622]/40 border border-[#262636] flex flex-col gap-2">
            <MessageSquare className="w-5 h-5 text-mecura-neon" />
            <h4 className="text-white font-bold text-xs">Chat Seguro</h4>
            <p className="text-[#8A8A9E] text-[10px]">Sem vídeo, 100% discreto.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#161622]/40 border border-[#262636] flex flex-col gap-2">
            <Activity className="w-5 h-5 text-mecura-neon" />
            <h4 className="text-white font-bold text-xs">Receita Digital</h4>
            <p className="text-[#8A8A9E] text-[10px]">Válida em todo o Brasil.</p>
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
            Falar com o Médico Agora
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex items-center justify-center gap-2 mt-5 opacity-40">
            <ShieldCheck className="w-3 h-3 text-mecura-neon" />
            <p className="text-[9px] text-mecura-silver uppercase tracking-[0.3em] font-bold">
              Conselho Federal de Medicina
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
