const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('const [deepSearchTerm, setDeepSearchTerm]')) {
  code = code.replace(
    "const [originFilter, setOriginFilter] = useState<'all' | 'nacional' | 'importado'>('all');",
    "const [originFilter, setOriginFilter] = useState<'all' | 'nacional' | 'importado'>('all');\n  const [deepSearchTerm, setDeepSearchTerm] = useState('');"
  );
}

const targetStr = `<div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setOriginFilter('all')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'all' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setOriginFilter('nacional')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'nacional' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Nacionais
                </button>
                <button
                  onClick={() => setOriginFilter('importado')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'importado' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Importados
                </button>
              </div>`;

const replacementStr = `<div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-mecura-surface border border-mecura-elevated p-1 rounded-xl">
                  <button
                    onClick={() => setOriginFilter('all')}
                    className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'all' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'}\`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setOriginFilter('nacional')}
                    className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'nacional' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'}\`}
                  >
                    Nacionais
                  </button>
                  <button
                    onClick={() => setOriginFilter('importado')}
                    className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'importado' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'}\`}
                  >
                    Importados
                  </button>
                </div>
                
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="w-4 h-4 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Busca Profunda (Ex: CBD, THC, Autismo, Adesivo...)" 
                    value={deepSearchTerm}
                    onChange={(e) => setDeepSearchTerm(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-mecura-silver/50 focus:outline-none focus:border-mecura-neon/50 transition-colors"
                  />
                  {deepSearchTerm && (
                    <button 
                      onClick={() => setDeepSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mecura-silver hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>`;

code = code.replace(targetStr, replacementStr);

const filterTarget = `            {/* GRID CARD VIEW - Responsive for all screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
                .map((product, idx) => {`;

const filterReplacement = `            {/* GRID CARD VIEW - Responsive for all screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
                .filter(p => {
                  if (!deepSearchTerm) return true;
                  const term = deepSearchTerm.toLowerCase();
                  const enriched = enrichMedicationDetails(p.name, p.manufacturer, p.origin, p.type);
                  const searchString = \`\${p.name.toLowerCase()} \${p.categoryName?.toLowerCase() || ''} \${p.description?.toLowerCase() || ''} \${p.type.toLowerCase()} \${p.manufacturer.toLowerCase()} \${p.indications ? p.indications.toLowerCase() : ''} \${p.categoryIndications ? p.categoryIndications.join(' ').toLowerCase() : ''} \${enriched.activeIngredients.toLowerCase()} \${enriched.pharmaceuticalForm.toLowerCase()} \${p.details ? p.details.join(' ').toLowerCase() : ''}\`;
                  return searchString.includes(term);
                })
                .map((product, idx) => {`;

code = code.replace(filterTarget, filterReplacement);

const emptyStateTarget = `{allProducts
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
              .length === 0 && (`;

const emptyStateReplacement = `{allProducts
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
              .filter(p => {
                  if (!deepSearchTerm) return true;
                  const term = deepSearchTerm.toLowerCase();
                  const enriched = enrichMedicationDetails(p.name, p.manufacturer, p.origin, p.type);
                  const searchString = \`\${p.name.toLowerCase()} \${p.categoryName?.toLowerCase() || ''} \${p.description?.toLowerCase() || ''} \${p.type.toLowerCase()} \${p.manufacturer.toLowerCase()} \${p.indications ? p.indications.toLowerCase() : ''} \${p.categoryIndications ? p.categoryIndications.join(' ').toLowerCase() : ''} \${enriched.activeIngredients.toLowerCase()} \${enriched.pharmaceuticalForm.toLowerCase()} \${p.details ? p.details.join(' ').toLowerCase() : ''}\`;
                  return searchString.includes(term);
              })
              .length === 0 && (`;

code = code.replace(emptyStateTarget, emptyStateReplacement);

fs.writeFileSync(path, code);
console.log('Added deep search bar and logic');
