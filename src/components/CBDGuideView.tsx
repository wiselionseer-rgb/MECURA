import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  AlertTriangle, 
  X, 
  Check, 
  Sparkles, 
  Tag, 
  Building2, 
  DollarSign,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { useStore } from '../store/useStore';

export function CBDGuideView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Open the first category by default
    if (cbdGuideData.length > 0) {
      return { [cbdGuideData[0].id]: true };
    }
    return {};
  });
  const [showWarning, setShowWarning] = useState(true);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const { exchangeRate } = useStore();

  // Auto-dismiss warning after 8 seconds if not manually interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissWarning = () => {
    setShowWarning(false);
    setWarningDismissed(true);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Expand all / Collapse all helper
  const toggleAllCategories = () => {
    const allExpanded = cbdGuideData.every(cat => expandedCategories[cat.id]);
    const newState: Record<string, boolean> = {};
    cbdGuideData.forEach(cat => {
      newState[cat.id] = !allExpanded;
    });
    setExpandedCategories(newState);
  };

  const filteredData = cbdGuideData
    .filter(category => selectedCategoryFilter === 'all' || category.id === selectedCategoryFilter)
    .map(category => {
      const filteredProducts = category.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.details && product.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return { ...category, products: filteredProducts };
    })
    .filter(category => category.products.length > 0 || (searchTerm === '' && selectedCategoryFilter === category.id));

  const totalProductsCount = filteredData.reduce((acc, cat) => acc + cat.products.length, 0);

  return (
    <div id="cbd-guide-view" className="flex-1 flex flex-col bg-[#0A0A0F] h-full overflow-hidden relative">
      {/* Header */}
      <div id="cbd-guide-header" className="border-b border-mecura-elevated px-4 md:px-8 py-4 bg-[#0A0A0F]/90 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Guia Completo de Produtos CBD
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-mecura-neon/10 text-mecura-neon text-[10px] md:text-xs font-bold border border-mecura-neon/20">
                  {totalProductsCount} itens
                </span>
              </div>
              <p className="text-xs text-mecura-silver mt-0.5">
                Referência para Uso Médico, Terapêutico e Prescrição
              </p>
            </div>

            {/* Toggle Warning Banner Pill on Mobile/Desktop if closed */}
            {!showWarning && (
              <button
                id="btn-reopen-warning"
                onClick={() => setShowWarning(true)}
                className="md:hidden flex items-center gap-1 text-[11px] font-semibold text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Aviso</span>
              </button>
            )}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                id="input-cbd-search"
                type="text" 
                placeholder="Buscar produto, marca, tipo ou detalhe..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-mecura-surface border border-mecura-elevated rounded-xl py-2 pl-9 pr-8 text-xs md:text-sm text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mecura-silver hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!showWarning && (
              <button
                id="btn-reopen-warning-desktop"
                onClick={() => setShowWarning(true)}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                title="Visualizar aviso regulatório e legal"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Aviso Regulatório</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div id="cbd-category-filters" className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-mecura-neon text-black font-bold shadow-[0_0_10px_rgba(166,255,0,0.2)]'
                : 'bg-mecura-surface text-mecura-silver hover:text-white border border-mecura-elevated'
            }`}
          >
            Todas Categorias
          </button>
          {cbdGuideData.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategoryFilter === cat.id
                  ? 'bg-mecura-neon text-black font-bold shadow-[0_0_10px_rgba(166,255,0,0.2)]'
                  : 'bg-mecura-surface text-mecura-silver hover:text-white border border-mecura-elevated'
              }`}
            >
              {cat.title} ({cat.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* Animated Dismissible Warning Banner */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            id="cbd-warning-banner"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-yellow-500/10 border-b border-yellow-500/25 px-4 md:px-8 py-3 flex-shrink-0 z-10"
          >
            <div className="max-w-5xl mx-auto flex items-start gap-3 justify-between">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 mt-0.5 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="text-xs md:text-sm text-yellow-200/90 leading-relaxed">
                  <div className="flex items-center gap-2 mb-0.5">
                    <strong className="text-yellow-400 font-bold tracking-wide">AVISO IMPORTANTE & LEGAL</strong>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-500/30">
                      Médico / Informativo
                    </span>
                  </div>
                  <p className="text-yellow-100/80 leading-normal">
                    Este guia é exclusivamente informativo. Consulte sempre um profissional de saúde habilitado antes de iniciar qualquer tratamento com fitocanabinoides. As dosagens indicadas são orientativas e podem variar conforme a condição clínica individual.
                  </p>
                </div>
              </div>

              {/* Close / Dismiss Action */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button
                  id="btn-dismiss-warning"
                  onClick={handleDismissWarning}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-500/40 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Entendi</span>
                </button>
                <button
                  onClick={handleDismissWarning}
                  className="p-1.5 rounded-lg text-yellow-400/80 hover:text-yellow-200 hover:bg-yellow-500/20 transition-colors"
                  aria-label="Fechar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div id="cbd-guide-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar min-h-0">
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
          {filteredData.map((category) => {
            const isExpanded = expandedCategories[category.id] ?? false;

            return (
              <div 
                key={category.id} 
                id={`cbd-category-${category.id}`}
                className="bg-mecura-surface border border-mecura-elevated rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Category Header Bar */}
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 md:p-5 flex items-center justify-between bg-gradient-to-r from-mecura-surface via-mecura-surface to-mecura-surface-light hover:from-mecura-surface-light hover:to-mecura-surface transition-all text-left"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                        {category.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-mecura-surface-light text-mecura-silver text-xs border border-white/5 font-semibold">
                        {category.products.length} {category.products.length === 1 ? 'produto' : 'produtos'}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-mecura-silver mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 p-2 rounded-xl bg-mecura-surface-light/80 border border-mecura-elevated text-mecura-silver">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-mecura-neon" />
                    ) : (
                      <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-mecura-silver" />
                    )}
                  </div>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className="p-4 md:p-6 border-t border-mecura-elevated space-y-4">
                    {/* Dosage Guidance Card */}
                    <div className="p-3.5 md:p-4 bg-mecura-neon/5 border border-mecura-neon/20 rounded-xl flex gap-3 items-start">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-mecura-neon flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs md:text-sm">
                        <h4 className="font-bold text-mecura-neon mb-1 flex items-center gap-1.5">
                          <span>Orientação de Dosagem</span>
                        </h4>
                        <p className="text-mecura-silver leading-relaxed">{category.dosageGuidance}</p>
                      </div>
                    </div>

                    {/* MOBILE CARD VIEW: Completely solves clipping and squished tables */}
                    <div className="block md:hidden space-y-3">
                      {category.products.map((product, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-xl bg-[#0E0E14] border border-mecura-elevated hover:border-mecura-neon/40 transition-all space-y-2.5"
                        >
                          {/* Top: Name & Price */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-white leading-snug break-words">
                                {product.name}
                              </h4>
                              {product.description && (
                                <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-black text-mecura-neon block">
                                {product.priceUSD ? `R$ ${(product.priceUSD * exchangeRate).toFixed(2)}` : 'Consulte'}
                              </span>
                              {product.origin && (
                                <span className="text-[10px] text-mecura-silver/70 block mt-0.5">
                                  {product.origin}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Middle: Badges Row */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="px-2.5 py-1 bg-mecura-neon/10 text-mecura-neon rounded-lg text-xs font-semibold border border-mecura-neon/25 inline-flex items-center gap-1 leading-none">
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="break-words">{product.type}</span>
                            </span>

                            <span className="px-2.5 py-1 bg-white/5 text-mecura-pearl rounded-lg text-xs border border-mecura-elevated inline-flex items-center gap-1 leading-none">
                              <Building2 className="w-3 h-3 text-mecura-silver flex-shrink-0" />
                              <span className="break-words">{product.manufacturer}</span>
                            </span>
                          </div>

                          {/* Bottom: Details Tags */}
                          {product.details && product.details.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-white/5">
                              {product.details.map((detail, dIdx) => (
                                <span 
                                  key={dIdx} 
                                  className="text-[11px] bg-mecura-surface-light px-2 py-0.5 rounded text-mecura-silver border border-white/5 leading-normal"
                                >
                                  {detail}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* DESKTOP TABLE VIEW: Ample width, clean wrapping, no clipping */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-mecura-elevated">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-mecura-elevated bg-mecura-surface-light/40 text-mecura-silver text-xs uppercase tracking-wider">
                            <th className="py-3 px-4 font-semibold w-1/3">Produto & Descrição</th>
                            <th className="py-3 px-4 font-semibold w-1/5">Fabricante</th>
                            <th className="py-3 px-4 font-semibold w-1/6">Tipo</th>
                            <th className="py-3 px-4 font-semibold">Especificações</th>
                            <th className="py-3 px-4 font-semibold text-right w-28">Preço Est.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-mecura-elevated bg-[#0A0A0F]/60">
                          {category.products.map((product, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                              <td className="py-3.5 px-4 font-medium text-white align-top">
                                <div className="font-bold text-white text-sm group-hover:text-mecura-neon transition-colors leading-snug break-words">
                                  {product.name}
                                </div>
                                {product.description && (
                                  <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                    {product.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-mecura-silver text-xs align-top">
                                <span className="font-semibold text-mecura-pearl block">{product.manufacturer}</span>
                                {product.origin && (
                                  <span className="text-[11px] text-mecura-silver/70 block mt-0.5">{product.origin}</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <span className="inline-block px-2.5 py-1 bg-mecura-neon/10 text-mecura-neon rounded-lg text-xs font-semibold border border-mecura-neon/20 whitespace-normal">
                                  {product.type}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-mecura-silver text-xs align-top">
                                {product.details && product.details.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {product.details.map((d, dIdx) => (
                                      <span key={dIdx} className="bg-white/5 px-2 py-0.5 rounded text-[11px] text-mecura-silver border border-white/5">
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right align-top">
                                <span className="text-sm font-bold text-mecura-neon whitespace-nowrap">
                                  {product.priceUSD ? `R$ ${(product.priceUSD * exchangeRate).toFixed(2)}` : '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div className="text-center py-16 px-4 bg-mecura-surface border border-mecura-elevated rounded-2xl">
              <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
              <p className="text-white font-bold text-base">Nenhum produto encontrado</p>
              <p className="text-xs text-mecura-silver mt-1">
                Não encontramos produtos correspondentes a "{searchTerm}".
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); }}
                className="mt-4 px-4 py-2 bg-mecura-surface-light hover:bg-mecura-surface text-mecura-neon rounded-xl text-xs font-bold border border-mecura-elevated transition-colors"
              >
                Limpar Busca e Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
