const fs = require('fs');
let code = fs.readFileSync('src/components/CBDGuideView.tsx', 'utf-8');

// 1. Add diseaseFilter state
const stateTarget = `  const [searchTerm, setSearchTerm] = useState('');`;
const stateReplacement = `  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');`;
code = code.replace(stateTarget, stateReplacement);

// 2. Update filtering logic
const filterTarget = `      const filteredProducts = category.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.details && product.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );`;
const filterReplacement = `      const filteredProducts = category.products.filter(product => 
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.details && product.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (!diseaseFilter || 
          (product.indications && product.indications.toLowerCase().includes(diseaseFilter.toLowerCase())) ||
          category.title.toLowerCase().includes(diseaseFilter.toLowerCase()) ||
          category.description.toLowerCase().includes(diseaseFilter.toLowerCase()))
      );`;
code = code.replace(filterTarget, filterReplacement);

// 3. Add diseaseFilter UI
const uiTarget = `          <div className="flex items-center gap-2 w-full md:w-auto">
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
            </div>`;
const uiReplacement = `          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
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
            </div>`;
code = code.replace(uiTarget, uiReplacement);

// 4. Update price display in both mobile and desktop (mobile)
const priceMobileTarget = `                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-black text-mecura-neon block">
                                {product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte'}
                              </span>`;
const priceMobileReplacement = `                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-black text-mecura-neon block">
                                {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte')}
                              </span>`;
code = code.replace(priceMobileTarget, priceMobileReplacement);

const indicationsMobileTarget = `                              {product.description && (
                                <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                  {product.description}
                                </p>
                              )}`;
const indicationsMobileReplacement = `                              {product.description && (
                                <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                  {product.description}
                                </p>
                              )}
                              {product.indications && (
                                <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                  <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                </p>
                              )}`;
code = code.replace(indicationsMobileTarget, indicationsMobileReplacement);

// Desktop
const priceDesktopTarget = `                              <td className="py-3.5 px-4 text-right align-top">
                                <span className="font-black text-mecura-neon whitespace-nowrap block">
                                  {product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte'}
                                </span>`;
const priceDesktopReplacement = `                              <td className="py-3.5 px-4 text-right align-top">
                                <span className="font-black text-mecura-neon whitespace-nowrap block">
                                  {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte')}
                                </span>`;
// We don't know the exact string, let's regex it
const priceRegex = /\{product\.priceUSD \? `R\$ \$\{\(product\.priceUSD \* exchangeRate\)\.toFixed\(2\)\}` : 'Consulte'\}/g;
code = code.replace(priceRegex, "{product.priceBRL ? `R$ ${Number(product.priceBRL).toFixed(2)}` : (product.priceUSD ? `R$ ${(product.priceUSD * exchangeRate).toFixed(2)}` : 'Consulte')}");

// Desktop description
const descriptionDesktopTarget = `                                {product.description && (
                                  <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                    {product.description}
                                  </p>
                                )}
                              </td>`;
const descriptionDesktopReplacement = `                                {product.description && (
                                  <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                                    {product.description}
                                  </p>
                                )}
                                {product.indications && (
                                  <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                    <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                  </p>
                                )}
                              </td>`;
code = code.replace(descriptionDesktopTarget, descriptionDesktopReplacement);

fs.writeFileSync('src/components/CBDGuideView.tsx', code);
