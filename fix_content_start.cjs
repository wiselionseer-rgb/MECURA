const fs = require('fs');

let viewPath = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(viewPath, 'utf8');

const target = `<div id="cbd-guide-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar min-h-0">
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">`;

const replacement = `<div id="cbd-guide-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar min-h-0">
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
          <div className="space-y-6">`;

code = code.replace(target, replacement);
fs.writeFileSync(viewPath, code);
console.log('Fixed content start');
