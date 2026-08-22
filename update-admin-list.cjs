const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetList = `              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mecura-silver" />
                <input
                  type="text"
                  placeholder="Buscar medicamentos..."
                  value={medicineSearchTerm}
                  onChange={(e) => setMedicineSearchTerm(e.target.value)}
                  className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-mecura-neon/50"
                />
              </div>

              <div className="space-y-8">
                {productCategories.map(category => {
                    const filteredProducts = category.products.filter(p => 
                        p.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
                        p.manufacturer.toLowerCase().includes(medicineSearchTerm.toLowerCase())
                    );
                    
                    if (filteredProducts.length === 0) return null;

                    return (
                        <div key={category.id} className="space-y-4">
                            <h3 className="text-lg font-bold text-mecura-pearl border-b border-white/10 pb-2">{category.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map(product => (
                                    <div key={product.name} className="bg-[#12121A] border border-white/5 rounded-xl p-4 flex flex-col h-full relative group">
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold mb-1 line-clamp-2">{product.name}</h4>
                                            <p className="text-mecura-neon/80 text-xs mb-3">{product.manufacturer} • {product.type}</p>
                                            <p className="text-[#8A8A9E] text-xs line-clamp-3">{product.description}</p>
                                        </div>`;
                                        
const replacementList = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mecura-silver" />
                  <input
                    type="text"
                    placeholder="Buscar nome ou marca..."
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                    className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-mecura-neon/50"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mecura-silver" />
                  <input
                    type="text"
                    placeholder="Filtrar por doença/patologia..."
                    value={diseaseFilter}
                    onChange={(e) => setDiseaseFilter(e.target.value)}
                    className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-mecura-neon/50"
                  />
                </div>
              </div>

              <div className="space-y-8">
                {productCategories.map(category => {
                    const filteredProducts = category.products.filter(p => 
                        (p.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
                         p.manufacturer.toLowerCase().includes(medicineSearchTerm.toLowerCase())) &&
                        (!diseaseFilter || 
                         (p.indications && p.indications.toLowerCase().includes(diseaseFilter.toLowerCase())) ||
                         category.title.toLowerCase().includes(diseaseFilter.toLowerCase()) ||
                         category.description.toLowerCase().includes(diseaseFilter.toLowerCase()))
                    );
                    
                    if (filteredProducts.length === 0) return null;

                    return (
                        <div key={category.id} className="space-y-4">
                            <h3 className="text-lg font-bold text-mecura-pearl border-b border-white/10 pb-2">{category.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map(product => (
                                    <div key={product.name} className="bg-[#12121A] border border-white/5 rounded-xl p-4 flex flex-col h-full relative group">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-white font-bold line-clamp-2 pr-6">{product.name}</h4>
                                                {product.priceBRL && (
                                                    <span className="text-mecura-neon font-bold whitespace-nowrap bg-mecura-neon/10 px-2 py-1 rounded text-xs">
                                                        R$ {product.priceBRL}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-mecura-neon/80 text-xs mb-3">{product.manufacturer} • {product.type}</p>
                                            <p className="text-[#8A8A9E] text-xs line-clamp-3 mb-2">{product.description}</p>
                                            {product.indications && (
                                                <p className="text-xs text-white/60 bg-white/5 p-2 rounded line-clamp-2 mt-auto">
                                                    <span className="font-semibold text-white/80">Indicações:</span> {product.indications}
                                                </p>
                                            )}
                                        </div>`;

code = code.replace(targetList, replacementList);
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
