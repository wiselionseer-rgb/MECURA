import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Scale, 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  Building2, 
  Copy, 
  Check, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowLeft,
  ExternalLink,
  Printer
} from 'lucide-react';
import { 
  INSTITUTIONAL_INFO, 
  LEGAL_OPINION_DATA, 
  PRIVACY_POLICY_LGPD_DATA, 
  TERMS_OF_USE_DATA 
} from '../data/legalAndPrivacy';

export const LegalScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from pathname or query
  const getInitialTab = (): 'parecer' | 'privacidade' | 'termos' | 'empresa' => {
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy') || path.includes('privacidade')) return 'privacidade';
    if (path.includes('termos') || path.includes('terms')) return 'termos';
    if (path.includes('empresa') || path.includes('cnpj')) return 'empresa';
    return 'parecer';
  };

  const [activeTab, setActiveTab] = useState<'parecer' | 'privacidade' | 'termos' | 'empresa'>(getInitialTab());
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6 pt-6 border-b border-[#1A1A26] bg-[#0A0A0F]/90 backdrop-blur-md sticky top-0 z-30">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#1A1A26] transition-colors border border-[#262636]"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Transparência & Jurídico
          </h1>
          <p className="text-[11px] text-[#8A8A9E]">
            {INSTITUTIONAL_INFO.companyName}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="w-10 h-10 rounded-full bg-[#161622] flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#1A1A26] transition-colors border border-[#262636]"
          title="Imprimir / Salvar PDF"
        >
          <Printer className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-5">
        
        {/* CNPJ Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14141E] via-[#161624] to-[#12121A] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mecura-neon/10 blur-[30px] rounded-full pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A8A9E] uppercase tracking-wider block">
                  Pessoa Jurídica Registrada
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {INSTITUTIONAL_INFO.companyName}
                </h3>
                <p className="text-xs text-[#8A8A9E] font-mono mt-0.5">
                  CNPJ: <strong className="text-white">{INSTITUTIONAL_INFO.cnpj}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCnpj}
              className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCnpj ? (
                <>
                  <Check className="w-3.5 h-3.5 text-mecura-neon" />
                  <span className="text-mecura-neon">CNPJ Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8A8A9E]" />
                  <span>Copiar CNPJ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12121A] rounded-2xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('parecer')}
            className={`py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'parecer' 
                ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
            }`}
          >
            Parecer Jurídico
          </button>
          <button
            onClick={() => setActiveTab('privacidade')}
            className={`py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'privacidade' 
                ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
            }`}
          >
            Privacidade LGPD
          </button>
          <button
            onClick={() => setActiveTab('termos')}
            className={`py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'termos' 
                ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
            }`}
          >
            Termos de Uso
          </button>
          <button
            onClick={() => setActiveTab('empresa')}
            className={`py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'empresa' 
                ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
            }`}
          >
            Dados & DPO
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A8A9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar leis, artigos, normas ou direitos..."
            className="w-full bg-[#14141E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon transition-colors"
          />
        </div>

        {/* TAB 1: PARECER JURÍDICO */}
        {activeTab === 'parecer' && (
          <div className="space-y-4">
            {/* Lawyer Header */}
            <div className="p-4 rounded-2xl bg-[#14141E] border border-mecura-neon/25 shadow-[0_0_20px_rgba(166,255,0,0.05)] space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {LEGAL_OPINION_DATA.author}
                  </h3>
                  <p className="text-xs text-mecura-neon font-medium">
                    {INSTITUTIONAL_INFO.lawyerRole}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#9A9AB0] leading-relaxed pt-1">
                {LEGAL_OPINION_DATA.summary}
              </p>
            </div>

            {/* Pillars */}
            <div className="space-y-3">
              {filteredPillars.map((pillar) => (
                <div 
                  key={pillar.id}
                  className="p-4 rounded-2xl bg-[#12121A] border border-white/5 hover:border-mecura-neon/30 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {pillar.title}
                    </h4>
                    {pillar.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20 w-fit shrink-0">
                        {pillar.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white/90">
                    {pillar.summary}
                  </p>
                  <div className="space-y-2 pt-1 border-t border-white/5 text-xs text-[#8A8A9E] leading-relaxed">
                    {pillar.details.map((detail, idx) => (
                      <p key={idx}>{detail}</p>
                    ))}
                  </div>
                </div>
              ))}

              {filteredPillars.length === 0 && (
                <p className="text-center py-8 text-[#8A8A9E] text-xs">
                  Nenhum resultado para "{searchTerm}".
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRIVACIDADE LGPD */}
        {activeTab === 'privacidade' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#14141E] border border-blue-500/25 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {PRIVACY_POLICY_LGPD_DATA.title}
                  </h3>
                  <p className="text-xs text-blue-400 font-medium">
                    {PRIVACY_POLICY_LGPD_DATA.law}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#9A9AB0] leading-relaxed pt-1">
                {PRIVACY_POLICY_LGPD_DATA.summary}
              </p>
            </div>

            <div className="space-y-3">
              {filteredPrivacySections.map((section) => (
                <div 
                  key={section.id}
                  className="p-4 rounded-2xl bg-[#12121A] border border-white/5 hover:border-white/10 transition-all space-y-2.5"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {section.title}
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#8A8A9E] leading-relaxed">
                    {section.content.map((item, idx) => (
                      <p key={idx}>{item}</p>
                    ))}
                  </div>
                </div>
              ))}

              {filteredPrivacySections.length === 0 && (
                <p className="text-center py-8 text-[#8A8A9E] text-xs">
                  Nenhum resultado para "{searchTerm}".
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TERMOS DE USO */}
        {activeTab === 'termos' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#14141E] border border-emerald-500/25 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {TERMS_OF_USE_DATA.title}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {TERMS_OF_USE_DATA.target}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#9A9AB0] leading-relaxed pt-1">
                {TERMS_OF_USE_DATA.summary}
              </p>
            </div>

            <div className="space-y-3">
              {filteredTermsSections.map((section) => (
                <div 
                  key={section.id}
                  className="p-4 rounded-2xl bg-[#12121A] border border-white/5 hover:border-white/10 transition-all space-y-2.5"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {section.title}
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#8A8A9E] leading-relaxed">
                    {section.content.map((item, idx) => (
                      <p key={idx}>{item}</p>
                    ))}
                  </div>
                </div>
              ))}

              {filteredTermsSections.length === 0 && (
                <p className="text-center py-8 text-[#8A8A9E] text-xs">
                  Nenhum resultado para "{searchTerm}".
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DADOS EMPRESA & DPO */}
        {activeTab === 'empresa' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161624] to-[#101018] border border-mecura-neon/20 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-mecura-neon" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {INSTITUTIONAL_INFO.companyName}
                  </h3>
                  <p className="text-xs text-[#8A8A9E]">
                    {INSTITUTIONAL_INFO.tradingName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px]">CNPJ</span>
                  <strong className="text-white font-mono text-sm">{INSTITUTIONAL_INFO.cnpj}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px]">Consultor Jurídico</span>
                  <strong className="text-white text-xs">{INSTITUTIONAL_INFO.lawyerName}</strong>
                  <span className="text-mecura-neon block text-[11px] font-semibold">{INSTITUTIONAL_INFO.lawyerOab}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px]">Encarregado LGPD (DPO)</span>
                  <strong className="text-white text-xs">{INSTITUTIONAL_INFO.dpoName}</strong>
                  <span className="text-[#8A8A9E] block text-[11px]">{INSTITUTIONAL_INFO.dpoEmail}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px]">Canal de Atendimento Oficial</span>
                  <strong className="text-white text-xs">{INSTITUTIONAL_INFO.supportPhone}</strong>
                  <span className="text-emerald-400 block text-[11px]">WhatsApp Oficial</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => {
                    const text = `Olá! Gostaria de falar com o DPO / Encarregado de Privacidade do Instituto Mecura referente à LGPD e meus dados.`;
                    window.open(`https://wa.me/${INSTITUTIONAL_INFO.supportWhatsapp}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>Falar com o DPO no WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${INSTITUTIONAL_INFO.dpoEmail}?subject=${encodeURIComponent('Solicitação LGPD - Instituto Mecura')}`;
                  }}
                  className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#8A8A9E]" />
                  <span>Enviar E-mail ao DPO</span>
                </button>
              </div>
            </div>

            {/* Certifications and Compliance */}
            <div className="p-4 rounded-2xl bg-[#12121A] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Garantias Legais & Diretrizes
              </h4>
              <div className="space-y-2.5 text-xs text-[#A0A0B0]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                  <span><strong>CFM nº 2.314/2022:</strong> Atendimento por telemedicina respaldado eticamente, garantindo autonomia clínica e sigilo médico.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                  <span><strong>ICP-Brasil:</strong> Prescrições e laudos assinados com certificado digital qualificado, dotados de validade e fé pública nacional.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                  <span><strong>LGPD (Lei 13.709/2018):</strong> Proteção rigorosa de dados pessoais sensíveis de saúde sob a tutela do Art. 11, II, "f".</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                  <span><strong>STJ (REsp 1.972.092/SP):</strong> Dimensionamento técnico-agronômico fundamentado para salvo-conduto de cultivo medicinal.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
