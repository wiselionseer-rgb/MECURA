import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';
import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { useStore } from '../store/useStore';

export function CBDGuideView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { exchangeRate } = useStore();

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredData = cbdGuideData.map(category => {
    const filteredProducts = category.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...category, products: filteredProducts };
  }).filter(category => category.products.length > 0 || category.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0F] h-full overflow-hidden">
      {/* Header */}
      <div className="h-20 border-b border-mecura-elevated flex items-center justify-between px-8 bg-[#0A0A0F]/80 backdrop-blur-md z-10 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Guia Completo de Produtos CBD</h2>
          <p className="text-xs text-mecura-silver mt-1">Referência para Uso Médico e Terapêutico</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar produto, marca ou tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-mecura-surface border border-mecura-elevated rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
          />
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-4 flex-shrink-0">
        <div className="flex gap-3 max-w-5xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div className="text-sm text-yellow-200/80">
            <strong className="text-yellow-500 block mb-1">AVISO IMPORTANTE</strong>
            Este guia é exclusivamente informativo. Consulte sempre um profissional de saúde habilitado antes de iniciar qualquer tratamento com produtos à base de cannabis. As dosagens indicadas são orientativas e podem variar conforme a condição clínica individual. O único medicamento CBD aprovado pela FDA é o Epidiolex (GW Pharmaceuticals). Os produtos registrados na ANVISA (Brasil) estão devidamente identificados.
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          {filteredData.map((category) => (
            <div key={category.id} className="bg-mecura-surface border border-mecura-elevated rounded-2xl overflow-hidden">
              {/* Category Header */}
              <button 
                onClick={() => toggleCategory(category.id)}
                className="w-full p-5 flex items-center justify-between bg-gradient-to-r from-mecura-surface to-mecura-surface-light hover:from-mecura-surface-light hover:to-mecura-surface transition-colors text-left"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  <p className="text-sm text-mecura-silver mt-1">{category.description}</p>
                </div>
                {expandedCategories[category.id] ? (
                  <ChevronUp className="w-5 h-5 text-mecura-silver flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-mecura-silver flex-shrink-0 ml-4" />
                )}
              </button>

              {/* Category Content */}
              {expandedCategories[category.id] && (
                <div className="p-5 border-t border-mecura-elevated">
                  <div className="mb-6 p-4 bg-mecura-neon/5 border border-mecura-neon/20 rounded-xl flex gap-3">
                    <Info className="w-5 h-5 text-mecura-neon flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-mecura-neon mb-1">Orientação de Dosagem</h4>
                      <p className="text-sm text-mecura-silver">{category.dosageGuidance}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-mecura-elevated text-mecura-silver">
                          <th className="pb-3 font-medium">Produto</th>
                          <th className="pb-3 font-medium">Fabricante</th>
                          <th className="pb-3 font-medium">Tipo</th>
                          <th className="pb-3 font-medium">Detalhes</th>
                          <th className="pb-3 font-medium">Preço (BRL)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mecura-elevated">
                        {category.products.map((product, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-3 pr-4 font-medium text-white">
                              {product.name}
                              {product.description && (
                                <p className="text-xs text-mecura-silver mt-1">{product.description}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-mecura-silver">{product.manufacturer}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 bg-mecura-neon/10 text-mecura-neon rounded-md text-xs border border-mecura-neon/20">
                                {product.type}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-mecura-silver text-xs">
                              {product.details?.join(' • ')}
                            </td>
                            <td className="py-3 text-mecura-neon font-bold">
                              {product.priceUSD ? `R$ ${(product.priceUSD * exchangeRate).toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-mecura-silver">Nenhum produto encontrado para "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
