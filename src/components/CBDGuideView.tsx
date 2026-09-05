import { useAdminStore } from '../store/useAdminStore';
import React, { useState, useEffect } from 'react';
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
, Users, Activity, Stethoscope, TrendingUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cbdGuideData, CBDCategory, CBDProduct, enrichMedicationDetails, getDiseaseClinicalDetails } from '../data/cbdGuide';
import { useStore } from '../store/useStore';

export function CBDGuideView() {
  const { productCategories: storeCategories } = useAdminStore();
  const productCategories = cbdGuideData;
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Open the first category by default
    if (productCategories.length > 0) {
      return { [productCategories[0].id]: true };
    }
    return {};
  });
  const [showWarning, setShowWarning] = useState(true);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const { exchangeRate } = useStore();
  const [viewMode, setViewMode] = useState<'categories' | 'diseases'>('categories');
  const [selectedDisease, setSelectedDisease] = useState<{name: string, category: CBDCategory} | null>(null);

  const allDiseases = React.useMemo(() => {
    const diseases = [];
    productCategories.forEach(cat => {
      if (cat.indicationsList) {
        cat.indicationsList.forEach(ind => {
          diseases.push({ name: ind, category: cat });
        });
      }
    });
    return diseases.sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);

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
    const allExpanded = productCategories.every(cat => expandedCategories[cat.id]);
    const newState: Record<string, boolean> = {};
    productCategories.forEach(cat => {
      newState[cat.id] = !allExpanded;
    });
    setExpandedCategories(newState);
  };

  const filteredData = productCategories
    .filter(category => selectedCategoryFilter === 'all' || category.id === selectedCategoryFilter)
    .map(category => {
      const filteredProducts = category.products.filter(product => 
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.details && product.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (!diseaseFilter || 
          (product.indications && product.indications.toLowerCase().includes(diseaseFilter.toLowerCase())) ||
          category.title.toLowerCase().includes(diseaseFilter.toLowerCase()) ||
          category.description.toLowerCase().includes(diseaseFilter.toLowerCase()))
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

          {/* View Mode Toggle */}
          <div className="flex bg-mecura-surface border border-mecura-elevated p-1 rounded-xl w-full md:w-auto mb-2 md:mb-0">
            <button
              onClick={() => setViewMode('categories')}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors ${
                viewMode === 'categories' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'
              }`}
            >
              Visualizar por Categorias
            </button>
            <button
              onClick={() => setViewMode('diseases')}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors ${
                viewMode === 'diseases' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'
              }`}
            >
              Visualizar por Doenças
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 w-full md:w-64">
              <Search className="w-4 h-4 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                id="input-cbd-search"
                type="text" 
                placeholder="Buscar produto..." 
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
            <div className="relative flex-1 w-full md:w-64">
              <Search className="w-4 h-4 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Filtrar por patologia/doença..." 
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                className="w-full bg-mecura-surface border border-mecura-elevated rounded-xl py-2 pl-9 pr-8 text-xs md:text-sm text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
              />
              {diseaseFilter && (
                <button 
                  onClick={() => setDiseaseFilter('')}
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
          {productCategories.map(cat => (
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
        
        {viewMode === 'diseases' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Protocolos por Patologia</h2>
              <p className="text-mecura-silver text-sm">Selecione uma doença para ver orientações profundas e os medicamentos indicados correspondentes da categoria de tratamento.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDiseases
                .filter(d => d.name.toLowerCase().includes(diseaseFilter.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((disease, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDisease(disease)}
                  className="bg-mecura-surface hover:bg-mecura-surface-light border border-mecura-elevated hover:border-mecura-neon/50 rounded-xl p-4 text-left transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-mecura-neon transition-colors">{disease.name}</h3>
                    <ChevronDown className="w-4 h-4 text-mecura-silver opacity-0 group-hover:opacity-100 transition-opacity rotate-[-90deg]" />
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <span className="text-[10px] text-mecura-silver uppercase tracking-wider block mb-1">Categoria de Tratamento</span>
                    <span className="text-xs text-mecura-pearl line-clamp-1">{disease.category.title}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {allDiseases.filter(d => d.name.toLowerCase().includes(diseaseFilter.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
                <p className="text-white font-bold">Nenhuma patologia encontrada</p>
                <p className="text-sm text-mecura-silver">Tente ajustar seus filtros de busca.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
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
                    <p className="text-xs md:text-sm text-mecura-silver mt-2 leading-relaxed">
                      {category.description}
                    </p>
                    {category.indicationsList && category.indicationsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {category.indicationsList.map((indication, iIdx) => (
                          <span 
                            key={iIdx} 
                            className="bg-mecura-neon/10 text-mecura-neon text-[10px] md:text-[11px] px-2.5 py-1 rounded-md border border-mecura-neon/20 font-semibold"
                          >
                            {indication}
                          </span>
                        ))}
                      </div>
                    )}
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
                    {category.products.some(p => p.type.includes('Concentrado')) && (
                      <div className="p-4 md:p-5 bg-black/40 border border-mecura-neon/30 rounded-xl mb-4">
                        <h4 className="font-bold text-mecura-neon mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" /> Guia de Apoio à Prescrição Médica: Qual Extração Escolher?
                        </h4>
                        <p className="text-[11px] md:text-xs text-mecura-silver leading-relaxed mb-4">
                          As extrações concentradas possuem <strong>Cepas (Strains)</strong> específicas com perfis de terpenos desenhados para diferentes patologias. Escolha o formato da extração com base na preferência de manuseio e a <strong>Cepa</strong> com base no objetivo clínico:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Dor Aguda e Insônia Profunda</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> LC (Stirred) e BM (Granulated, Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Mirceno + Cariofileno (Sedativo e Analgésico)</div>
                          </div>
                          
                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Ansiedade Severa e Inflamação</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> ICC (Stirred, Crystalized) e AH (Stirred)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Mirceno + Limoneno + Linalol (Relaxante e Anti-inflamatório)</div>
                          </div>

                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Foco, TDAH, Depressão e Fadiga</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> TW (Stirred, Granulated) e PR (Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Terpinoleno + Limoneno + Pineno (Estimulante e Focado)</div>
                          </div>

                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Flexibilidade Analgésica (Sem sedar)</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> CD (Granulated) e DS (Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Cariofileno + Limoneno (Relaxante, Analgésico sem sedação pesada)</div>
                          </div>
                        </div>
                      </div>
                    )}

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
                              {product.indications && (
                                <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                  <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                </p>
                              )}
                              
                          {/* Rich Details */}
                          {(() => {
                            const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                            return (
                              <div className="mt-2 space-y-1 p-2.5 bg-black/20 border border-white/5 rounded-lg">
                                <p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients} - {enriched.concentration} - {enriched.concentration}
                                </p>
                                <p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                                </p>
                                {enriched.usageInstructions && (
                                  <div className="pt-1.5 mt-1.5 border-t border-white/5">
                                    <p className="text-[10px] leading-relaxed text-mecura-silver">
                                      <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                      {enriched.usageInstructions}
                                    </p>
                                  </div>
                                )}
                                
                              </div>
                            );
                          })()}

                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-black text-mecura-neon block">
                                {product.priceBRL ? `R$ ${product.priceBRL.toFixed(2)}` : (product.priceUSD ? `R$ ${(product.priceUSD * exchangeRate).toFixed(2)}` : 'Consulte')}
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
                            <th className="py-3 px-4 font-semibold w-[40%]">Produto & Descrição</th>
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
                                {product.indications && (
                                  <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                    <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                  </p>
                                )}
                                
                                {/* Rich Details Desktop */}
                                {(() => {
                                  const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                                  return (
                                    <div className="mt-3 space-y-1 p-3 bg-black/20 border border-white/5 rounded-lg">
                                      <p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients}
                                      </p>
                                      <p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                                      </p>
                                      {enriched.usageInstructions && (
                                        <div className="pt-2 mt-2 border-t border-white/5">
                                          <p className="text-[11px] leading-relaxed text-mecura-silver">
                                            <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                            {enriched.usageInstructions}
                                          </p>
                                        </div>
                                      )}
                                      
                                    </div>
                                  );
                                })()}

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
        )}
        </div>
      </div>

      {/* Disease Detail Modal */}
      <AnimatePresence>
        {selectedDisease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-mecura-surface border border-mecura-elevated rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-mecura-elevated flex items-start justify-between bg-gradient-to-r from-mecura-surface to-mecura-surface-light">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-mecura-neon font-bold mb-1 block">Protocolo Clínico Sugerido</span>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{selectedDisease.name}</h2>
                  <p className="text-sm text-mecura-silver mt-1">
                    Tratamento classificado em: <strong className="text-mecura-pearl">{selectedDisease.category.title}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="p-2 hover:bg-white/5 rounded-xl text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 overflow-y-auto space-y-6">
                
                
                {/* Clinical Context / Scientific Overview */}
                
                    

                    {/* Rich Clinical Document */}
                    <div className="bg-[#1A1D24] border border-white/5 rounded-xl overflow-hidden mb-8 shadow-xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-mecura-neon/10 to-transparent p-5 border-b border-white/5">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          <Layers className="w-5 h-5 text-mecura-neon" /> 
                          Fundamentação clínica e endocanabinoide
                        </h3>
                      </div>
                      
                      {(() => {
                        const clinical = getDiseaseClinicalDetails(selectedDisease.name);
                        return (
                          <div className="p-0">
                            
                            {/* Mecanismo & Estratégia */}
                            <div className="p-6 space-y-5 border-b border-white/5 bg-black/20">
                              <div>
                                <p className="text-sm text-mecura-silver leading-relaxed">
                                  <strong className="text-white">Mecanismo de ação —</strong> {clinical.mechanism}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-mecura-silver leading-relaxed">
                                  <strong className="text-white">Estratégia terapêutica —</strong> {clinical.strategy}
                                </p>
                              </div>
                            </div>

                            {/* Perfil de Paciente */}
                            <div className="p-6 border-b border-white/5">
                              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-mecura-neon" /> Perfil de paciente elegível
                              </h4>
                              <ul className="space-y-3">
                                {clinical.eligiblePatientProfile.map((item, i) => (
                                  <li key={i} className="text-sm text-mecura-silver flex items-start gap-3">
                                    <span className="text-mecura-neon mt-1 text-lg leading-none">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Protocolo de Titulação */}
                            <div className="p-6 border-b border-mecura-neon/10 bg-mecura-neon/5">
                              <h4 className="text-sm font-bold text-mecura-neon mb-5 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Protocolo de titulação sugerido (referência de literatura)
                              </h4>
                              
                              <div className="space-y-4 mb-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Início (CBD)</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.start}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Titulação</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.titration}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Faixa usada em ensaios</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.range}</div>
                                </div>
                                {clinical.titrationProtocol.thc && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                    <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">THC (se indicado)</div>
                                    <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.thc}</div>
                                  </div>
                                )}
                              </div>
                              
                              {clinical.titrationProtocol.note && (
                                <div className="text-[13px] text-mecura-silver bg-black/40 p-4 rounded-lg border border-white/5 italic">
                                  {clinical.titrationProtocol.note}
                                </div>
                              )}
                            </div>

                            {/* Precauções */}
                            <div className="p-6 border-b border-amber-500/10 bg-amber-500/5">
                              <h4 className="text-sm font-bold text-amber-500 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Precauções, contraindicações e interações
                              </h4>
                              <ul className="space-y-3">
                                {clinical.precautions.map((item, i) => {
                                  const parts = item.split(': ');
                                  return (
                                    <li key={i} className="text-sm text-mecura-silver flex items-start gap-3">
                                      <span className="text-amber-500 mt-1 text-lg leading-none">•</span>
                                      <span>
                                        {parts.length > 1 ? (
                                          <>
                                            <strong className="text-white">{parts[0]}: </strong>
                                            {parts.slice(1).join(': ')}
                                          </>
                                        ) : (
                                          item
                                        )}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>

                            {/* Monitoramento & Resultados */}
                            <div className="p-6 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                  <Stethoscope className="w-4 h-4 text-mecura-neon" /> Monitoramento clínico
                                </h4>
                                <ul className="space-y-3">
                                  {clinical.monitoring.map((item, i) => (
                                    <li key={i} className="text-[13px] text-mecura-silver flex items-start gap-2">
                                      <span className="text-mecura-silver mt-1 leading-none">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-mecura-neon" /> Resultados esperados
                                </h4>
                                <div className="space-y-3">
                                  {clinical.expectedOutcomes.map((item, i) => (
                                    <p key={i} className="text-[13px] text-mecura-silver leading-relaxed">
                                      {item}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Evidências */}
                            <div className="p-6">
                              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-mecura-neon" /> Evidências e base literária
                              </h4>
                              <ul className="space-y-2">
                                {clinical.evidences.map((item, i) => {
                                  const parts = item.split(' — ');
                                  return (
                                    <li key={i} className="text-[12px] text-mecura-silver flex items-start gap-2">
                                      <span className="text-mecura-silver mt-1 leading-none">•</span>
                                      <span>
                                        {parts.length > 1 ? (
                                          <>
                                            <span className="text-white">{parts[0]}</span> — {parts.slice(1).join(' — ')}
                                          </>
                                        ) : (
                                          item
                                        )}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                            
                            {/* Aviso */}
                            <div className="bg-red-500/10 border-t border-red-500/20 p-5 mt-2">
                              <p className="text-xs text-red-200/80 leading-relaxed text-justify">
                                <strong className="text-red-400">Aviso:</strong> este protocolo é uma ferramenta de apoio informativo à decisão clínica, gerada a partir de literatura científica e documentação referenciada. A responsabilidade final pelo diagnóstico, pela prescrição e pela titulação de doses é exclusiva do médico assistente, que deve considerar o histórico individual do paciente, contraindicações específicas e interações medicamentosas.
                              </p>
                            </div>

                          </div>
                        );
                      })()}
                    </div>

                {/* Orientations Card */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-5">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-mecura-neon" />
                    Orientações e Perfil de Tratamento
                  </h3>
                  <p className="text-sm text-mecura-silver leading-relaxed mb-4">
                    {selectedDisease.category.description}
                  </p>
                  
                  <div className="bg-mecura-neon/5 border border-mecura-neon/20 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-mecura-neon uppercase tracking-wider mb-2">Posologia e Titulação Recomendada</h4>
                    <p className="text-sm text-mecura-pearl font-medium leading-relaxed">
                      {selectedDisease.category.dosageGuidance}
                    </p>
                  </div>
                </div>

                {/* Specific Category Tips (like we have for category extracts) */}
                {selectedDisease.category.products.some(p => p.type.includes('Concentrado')) && (
                  <div className="p-4 md:p-5 bg-[#0A0A0F] border border-white/10 rounded-xl">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> Guia de Cepas (Strains) e Terpenos
                    </h4>
                    <p className="text-xs text-mecura-silver leading-relaxed mb-3">
                      Ao prescrever extrações (Stirred, Dried, Granulated) para {selectedDisease.name}, leve em consideração o perfil de terpenos:
                    </p>
                    <ul className="text-xs text-mecura-silver space-y-2 list-disc list-inside">
                      <li><strong>Para relaxamento e analgesia:</strong> Cepas ricas em Mirceno e Linalol (ex: LC, ICC, BM)</li>
                      <li><strong>Para foco e disposição:</strong> Cepas ricas em Limoneno, Pineno e Terpinoleno (ex: TW, PR)</li>
                      <li><strong>Para analgesia sem sedação severa:</strong> Cepas ricas em Cariofileno (ex: CD, DS)</li>
                    </ul>
                  </div>
                )}

                {/* Recommended Products */}
                <div>
                  <h3 className="font-bold text-white mb-3">Medicamentos e Produtos Recomendados ({selectedDisease.category.products.length})</h3>
                  <div className="space-y-3">
                    {selectedDisease.category.products.map((product, idx) => {
                      const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                      return (
                        <div key={idx} className="bg-mecura-surface-light/30 border border-mecura-elevated rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-white text-sm">{product.name}</h4>
                              <span className="text-[10px] text-mecura-silver uppercase tracking-wide">{product.manufacturer} • {product.type}</span>
                            </div>
                            {product.priceUSD && (
                              <span className="text-sm font-bold text-mecura-neon whitespace-nowrap bg-mecura-neon/10 px-2 py-1 rounded-lg">
                                R$ {(product.priceUSD * exchangeRate).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-mecura-silver">
                            <div className="bg-black/20 p-2 rounded">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Princípio Ativo:</span>
                              {enriched.activeIngredients}
                            </div>
                            <div className="bg-black/20 p-2 rounded">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Apresentação:</span>
                              {enriched.pharmaceuticalForm} • {enriched.quantity}
                              {enriched.administrationRoute && <span className="block mt-0.5"><span className="font-bold">Via:</span> {enriched.administrationRoute}</span>}
                            </div>
                          </div>
                          
                          {enriched.usageInstructions && (
                            <div className="mt-2 bg-black/20 p-2 rounded text-[11px] text-mecura-silver border border-white/5">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Sugestão de Posologia Bula:</span>
                              {enriched.usageInstructions}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-mecura-elevated bg-[#0A0A0F] flex justify-end">
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="px-6 py-2 bg-mecura-neon text-black font-bold rounded-xl hover:bg-mecura-neon/90 transition-colors"
                >
                  Fechar Protocolo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
