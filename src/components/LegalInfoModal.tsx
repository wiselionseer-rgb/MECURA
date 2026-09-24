import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Building2, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Scale, 
  BookOpen, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Search,
  Sparkles
} from 'lucide-react';
import { 
  INSTITUTIONAL_INFO, 
  LEGAL_OPINION_DATA, 
  PRIVACY_POLICY_LGPD_DATA, 
  TERMS_OF_USE_DATA 
} from '../data/legalAndPrivacy';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'parecer' | 'privacidade' | 'termos' | 'empresa';
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'parecer'
}) => {
  const [activeTab, setActiveTab] = useState<'parecer' | 'privacidade' | 'termos' | 'empresa'>(initialTab);
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleCopyCnpj = () => {
    navigator.clipboard.writeText(INSTITUTIONAL_INFO.cnpj);
    setCopiedCnpj(true);
    setTimeout(() => setCopiedCnpj(false), 2000);
  };

  const filteredPillars = LEGAL_OPINION_DATA.pillars.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPrivacySections = PRIVACY_POLICY_LGPD_DATA.sections.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.content.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTermsSections = TERMS_OF_USE_DATA.sections.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.content.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className="relative bg-[#12121A] border border-white/10 rounded-[28px] max-w-[560px] w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden flex flex-col max-h-[88vh] my-auto"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#A6FF00]/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center shadow-[0_0_15px_rgba(166,255,0,0.2)]">
                <Scale className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-white tracking-tight leading-tight">
                    Central Jurídica & LGPD
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20">
                    Oficial
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A9E] mt-0.5">
                  {INSTITUTIONAL_INFO.companyName} • CNPJ {INSTITUTIONAL_INFO.cnpj}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#8A8A9E] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Copy CNPJ Banner */}
          <div className="bg-[#181824] rounded-xl px-3 py-2 border border-white/5 flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-2 text-[#8A8A9E]">
              <Building2 className="w-3.5 h-3.5 text-mecura-neon" />
              <span>CNPJ: <strong className="text-white font-mono">{INSTITUTIONAL_INFO.cnpj}</strong></span>
            </div>
            <button
              onClick={handleCopyCnpj}
              className="flex items-center gap-1 text-[11px] font-medium text-mecura-neon hover:text-white transition-colors cursor-pointer bg-white/5 px-2 py-1 rounded-md border border-white/10"
            >
              {copiedCnpj ? (
                <>
                  <Check className="w-3 h-3 text-mecura-neon" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar CNPJ</span>
                </>
              )}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#161622] rounded-xl border border-white/5 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('parecer')}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                activeTab === 'parecer' 
                  ? 'bg-mecura-neon text-black font-bold shadow-md' 
                  : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              Parecer
            </button>
            <button
              onClick={() => setActiveTab('privacidade')}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                activeTab === 'privacidade' 
                  ? 'bg-mecura-neon text-black font-bold shadow-md' 
                  : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              LGPD
            </button>
            <button
              onClick={() => setActiveTab('termos')}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                activeTab === 'termos' 
                  ? 'bg-mecura-neon text-black font-bold shadow-md' 
                  : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              Termos
            </button>
            <button
              onClick={() => setActiveTab('empresa')}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                activeTab === 'empresa' 
                  ? 'bg-mecura-neon text-black font-bold shadow-md' 
                  : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              Empresa
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-5 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8A9E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em normas, artigos ou termos..."
              className="w-full bg-[#161622] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon transition-colors"
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1 custom-scrollbar text-xs leading-relaxed text-[#B0B0C0] relative z-10">
          
          {/* TAB 1: PARECER JURÍDICO */}
          {activeTab === 'parecer' && (
            <div className="space-y-4">
              {/* Lawyer Signature Box */}
              <div className="p-3.5 rounded-2xl bg-[#181826] border border-mecura-neon/20 shadow-[0_0_20px_rgba(166,255,0,0.06)] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white leading-tight">
                    {LEGAL_OPINION_DATA.author}
                  </h4>
                  <p className="text-[11px] text-mecura-neon font-medium mt-0.5">
                    {INSTITUTIONAL_INFO.lawyerRole}
                  </p>
                  <p className="text-[10px] text-[#8A8A9E] mt-1 leading-relaxed">
                    Parecer Jurídico de Resguardo elaborado para amparo das operações, telemedicina e autocultivo medicinal de pacientes associados.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] leading-relaxed text-[#A0A0B0]">
                {LEGAL_OPINION_DATA.summary}
              </div>

              {/* Pillars list */}
              <div className="space-y-3">
                {filteredPillars.map((pillar) => (
                  <div 
                    key={pillar.id}
                    className="p-3.5 rounded-2xl bg-[#161622] border border-white/5 hover:border-mecura-neon/20 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-[12px] font-bold text-white tracking-tight">
                        {pillar.title}
                      </h5>
                      {pillar.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-md border border-mecura-neon/20 shrink-0">
                          {pillar.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-white/90">
                      {pillar.summary}
                    </p>
                    <div className="space-y-1.5 pt-1 border-t border-white/5 text-[11px] text-[#9A9AB0]">
                      {pillar.details.map((detail, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredPillars.length === 0 && (
                  <p className="text-center py-6 text-[#8A8A9E]">
                    Nenhum tópico encontrado para "{searchTerm}".
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDADE (LGPD) */}
          {activeTab === 'privacidade' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#181826] border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white leading-tight">
                    {PRIVACY_POLICY_LGPD_DATA.title}
                  </h4>
                  <p className="text-[11px] text-blue-400 font-medium mt-0.5">
                    {PRIVACY_POLICY_LGPD_DATA.law}
                  </p>
                  <p className="text-[10px] text-[#8A8A9E] mt-1 leading-relaxed">
                    Controlador: <strong className="text-white">{PRIVACY_POLICY_LGPD_DATA.controller}</strong>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] leading-relaxed text-[#A0A0B0]">
                {PRIVACY_POLICY_LGPD_DATA.summary}
              </div>

              <div className="space-y-3">
                {filteredPrivacySections.map((section) => (
                  <div 
                    key={section.id}
                    className="p-3.5 rounded-2xl bg-[#161622] border border-white/5 hover:border-white/10 transition-all space-y-2"
                  >
                    <h5 className="text-[12px] font-bold text-white tracking-tight">
                      {section.title}
                    </h5>
                    <div className="space-y-1.5 text-[11px] text-[#9A9AB0]">
                      {section.content.map((item, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredPrivacySections.length === 0 && (
                  <p className="text-center py-6 text-[#8A8A9E]">
                    Nenhum item encontrado para "{searchTerm}".
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TERMOS DE USO */}
          {activeTab === 'termos' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#181826] border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white leading-tight">
                    {TERMS_OF_USE_DATA.title}
                  </h4>
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                    {TERMS_OF_USE_DATA.target}
                  </p>
                  <p className="text-[10px] text-[#8A8A9E] mt-1 leading-relaxed">
                    Diretrizes gerais de navegação, telemedicina e conformidade mútua.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] leading-relaxed text-[#A0A0B0]">
                {TERMS_OF_USE_DATA.summary}
              </div>

              <div className="space-y-3">
                {filteredTermsSections.map((section) => (
                  <div 
                    key={section.id}
                    className="p-3.5 rounded-2xl bg-[#161622] border border-white/5 hover:border-white/10 transition-all space-y-2"
                  >
                    <h5 className="text-[12px] font-bold text-white tracking-tight">
                      {section.title}
                    </h5>
                    <div className="space-y-1.5 text-[11px] text-[#9A9AB0]">
                      {section.content.map((item, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredTermsSections.length === 0 && (
                  <p className="text-center py-6 text-[#8A8A9E]">
                    Nenhum termo encontrado para "{searchTerm}".
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DADOS DA EMPRESA & DPO */}
          {activeTab === 'empresa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181828] to-[#12121A] border border-mecura-neon/20 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-mecura-neon" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white">
                      {INSTITUTIONAL_INFO.companyName}
                    </h4>
                    <p className="text-[11px] text-[#8A8A9E]">
                      {INSTITUTIONAL_INFO.tradingName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[#8A8A9E] block text-[10px]">Cadastro Nacional (CNPJ)</span>
                    <strong className="text-white font-mono text-xs">{INSTITUTIONAL_INFO.cnpj}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[#8A8A9E] block text-[10px]">Responsável Jurídico</span>
                    <strong className="text-white text-xs">{INSTITUTIONAL_INFO.lawyerName}</strong>
                    <span className="text-mecura-neon block text-[10px]">{INSTITUTIONAL_INFO.lawyerOab}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[#8A8A9E] block text-[10px]">Encarregado LGPD (DPO)</span>
                    <strong className="text-white text-xs">{INSTITUTIONAL_INFO.dpoName}</strong>
                    <span className="text-[#8A8A9E] block text-[10px]">{INSTITUTIONAL_INFO.dpoEmail}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[#8A8A9E] block text-[10px]">Canal de Atendimento</span>
                    <strong className="text-white text-xs">{INSTITUTIONAL_INFO.supportPhone}</strong>
                    <span className="text-emerald-400 block text-[10px]">WhatsApp Oficial</span>
                  </div>
                </div>
              </div>

              {/* Security Seals */}
              <div className="p-3.5 rounded-2xl bg-[#161622] border border-white/5 space-y-2.5">
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Garantias & Conformidade
                </h5>
                <div className="space-y-2 text-[11px] text-[#A0A0B0]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0" />
                    <span>Prontuário e telemedicina em consonância com o CFM nº 2.314/2022.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0" />
                    <span>Assinatura médica digital qualificada padrão ICP-Brasil.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0" />
                    <span>Tratamento de dados estritamente amparado pela Lei nº 13.709/2018 (LGPD).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0" />
                    <span>Dimensionamento técnico-agronômico conforme precedentes do STJ.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#0F0F16]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const text = `Olá! Gostaria de falar com o DPO / Encarregado de Privacidade do Instituto Mecura referente à LGPD e meus dados.`;
                window.open(`https://wa.me/${INSTITUTIONAL_INFO.supportWhatsapp}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex-1 sm:flex-none h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Falar com o DPO</span>
            </button>
            
            <button
              onClick={handleCopyCnpj}
              className="flex-1 sm:flex-none h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCnpj ? <Check className="w-3.5 h-3.5 text-mecura-neon" /> : <Copy className="w-3.5 h-3.5 text-[#8A8A9E]" />}
              <span>{copiedCnpj ? 'Copiado!' : 'Copiar CNPJ'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-5 rounded-xl bg-mecura-neon hover:bg-[#8ee000] text-black font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
