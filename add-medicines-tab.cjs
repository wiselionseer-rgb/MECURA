const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetActiveTab = `type TabType = 'metrics' | 'patients' | 'doctors' | 'chat' | 'history' | 'support' | 'abandonment' | 'coupons' | 'promotions' | 'notifications';`;
const replacementActiveTab = `type TabType = 'metrics' | 'patients' | 'doctors' | 'chat' | 'history' | 'support' | 'abandonment' | 'coupons' | 'promotions' | 'notifications' | 'medicines';`;
code = code.replace(targetActiveTab, replacementActiveTab);

// Let's add state for medicines
const targetModalsState = `  // Modals state`;
const replacementModalsState = `  // Medicines State
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showImportMedicineModal, setShowImportMedicineModal] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '' });
  const [importMedicineText, setImportMedicineText] = useState('');

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.categoryId) {
        alert('Preencha o nome e selecione uma categoria.');
        return;
    }
    const product = {
        name: newMedicine.name,
        manufacturer: newMedicine.manufacturer || 'Não informado',
        origin: newMedicine.origin || 'Nacional',
        type: newMedicine.type || 'Geral',
        details: [],
        description: newMedicine.description || ''
    };
    addProduct(newMedicine.categoryId, product);
    setShowAddMedicineModal(false);
    setNewMedicine({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '' });
  };

  const handleImportMedicines = () => {
     if (!importMedicineText.trim()) return;
     const lines = importMedicineText.split('\\n');
     let addedCount = 0;
     let currentCategoryId = productCategories.length > 0 ? productCategories[0].id : '';
     
     lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split('-').map(s => s.trim());
        const name = parts[0];
        if (!name) return;
        const manufacturer = parts[1] || 'Importado via Lista';
        const type = parts[2] || 'Geral';
        
        addProduct(currentCategoryId, {
            name,
            manufacturer,
            origin: 'Nacional',
            type,
            details: [],
            description: ''
        });
        addedCount++;
     });
     alert(addedCount + ' medicamentos importados com sucesso!');
     setShowImportMedicineModal(false);
     setImportMedicineText('');
  };

  // Modals state`;
code = code.replace(targetModalsState, replacementModalsState);

// Let's add the UI
const targetRender = `        {activeTab === 'notifications' && (`;
const replacementRender = `        {activeTab === 'medicines' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Catálogo & Medicamentos</h2>
                <p className="text-mecura-silver">Gerencie os medicamentos e produtos do guia de prescrição.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setShowImportMedicineModal(true)} variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Importar Lista
                </Button>
                <Button onClick={() => setShowAddMedicineModal(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Manual
                </Button>
              </div>
            </div>

            <div className="bg-[#0A0A0F] border border-mecura-elevated rounded-2xl p-4 md:p-6">
              <div className="relative mb-6">
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
                                        </div>
                                        <button
                                            onClick={() => {
                                                if(confirm('Tem certeza que deseja remover este medicamento?')) {
                                                    deleteProduct(category.id, product.name);
                                                }
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {productCategories.every(c => c.products.filter(p => p.name.toLowerCase().includes(medicineSearchTerm.toLowerCase())).length === 0) && (
                    <div className="text-center py-12 text-[#8A8A9E]">
                        Nenhum medicamento encontrado para esta busca.
                    </div>
                )}
              </div>
            </div>
            
            {/* Modal Add Medicine */}
            {showAddMedicineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMedicineModal(false)} />
                  <div className="relative w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Adicionar Medicamento</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#8A8A9E] mb-1">Categoria</label>
                        <select
                          value={newMedicine.categoryId}
                          onChange={(e) => setNewMedicine({...newMedicine, categoryId: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                        >
                          <option value="">Selecione uma categoria...</option>
                          {productCategories.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-[#8A8A9E] mb-1">Nome do Produto</label>
                        <input
                          type="text"
                          value={newMedicine.name}
                          onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                          placeholder="Ex: Óleo CBD 1000mg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Fabricante</label>
                            <input
                            type="text"
                            value={newMedicine.manufacturer}
                            onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            placeholder="Ex: Associação Nacional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Tipo / Veículo</label>
                            <input
                            type="text"
                            value={newMedicine.type}
                            onChange={(e) => setNewMedicine({...newMedicine, type: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            placeholder="Ex: Óleo, Goma, Pomada..."
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-[#8A8A9E] mb-1">Descrição Curta</label>
                        <input
                          type="text"
                          value={newMedicine.description}
                          onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                          placeholder="Ex: Ideal para alívio de dor e ansiedade."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                      <Button variant="ghost" onClick={() => setShowAddMedicineModal(false)}>Cancelar</Button>
                      <Button onClick={handleAddMedicine}>Adicionar</Button>
                    </div>
                  </div>
                </div>
            )}
            
            {/* Modal Import */}
            {showImportMedicineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportMedicineModal(false)} />
                  <div className="relative w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Importar Lista</h3>
                    <p className="text-sm text-[#8A8A9E] mb-4">Cole a lista de medicamentos (ex: textos copiados de um PDF). Cada linha será um medicamento novo.</p>
                    <p className="text-xs text-mecura-neon/80 mb-4 bg-mecura-neon/5 p-2 rounded border border-mecura-neon/20">Dica: Use o formato "Nome do Produto - Fabricante - Tipo" ou apenas os nomes.</p>
                    <textarea
                        value={importMedicineText}
                        onChange={(e) => setImportMedicineText(e.target.value)}
                        className="w-full h-48 bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-mecura-neon text-sm custom-scrollbar"
                        placeholder="Nome Medicamento 1 - Fabricante A - Gomas\nNome Medicamento 2 - Fabricante B - Óleo"
                    />
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowImportMedicineModal(false)}>Cancelar</Button>
                      <Button onClick={handleImportMedicines}>Importar Todos</Button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (`;

code = code.replace(targetRender, replacementRender);

// imports Check
if (!code.includes("FileText,") && !code.includes(" FileText ")) {
    code = code.replace("import { Users", "import { Users, FileText, Plus");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
