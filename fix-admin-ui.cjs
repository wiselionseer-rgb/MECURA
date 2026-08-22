const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// Add state for Editing Medicine
const stateTarget = `  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);`;
const stateReplacement = `  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState(null);`;
code = code.replace(stateTarget, stateReplacement);

// Add edit UI handlers
const uiHandlersTarget = `  const handleAddMedicine = () => {`;
const uiHandlersReplacement = `  const handleEditMedicine = () => {
    if (!medicineToEdit) return;
    
    const productData = {
        name: medicineToEdit.name,
        manufacturer: medicineToEdit.manufacturer,
        origin: medicineToEdit.origin,
        type: medicineToEdit.type,
        description: medicineToEdit.description,
        priceBRL: medicineToEdit.priceBRL ? parseFloat(medicineToEdit.priceBRL) : undefined,
        indications: medicineToEdit.indications
    };
    
    updateProduct(medicineToEdit.categoryId, medicineToEdit.originalName, productData);
    setShowEditMedicineModal(false);
    setMedicineToEdit(null);
  };

  const handleAddMedicine = () => {`;
code = code.replace(uiHandlersTarget, uiHandlersReplacement);

// Replace mapping inside the cards to show prices + edit button
const cardTarget = `                                            <div className="flex justify-between items-start mb-1">
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
                                        </button>`;

const cardReplacement = `                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h4 className="text-white font-bold line-clamp-2 pr-12">{product.name}</h4>
                                                <span className="text-mecura-neon font-bold whitespace-nowrap bg-mecura-neon/10 px-2 py-1 rounded text-xs">
                                                    {product.priceBRL ? \`R$ \${Number(product.priceBRL).toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Sem Valor')}
                                                </span>
                                            </div>
                                            <p className="text-mecura-neon/80 text-xs mb-3">{product.manufacturer} • {product.type}</p>
                                            <p className="text-[#8A8A9E] text-xs line-clamp-3 mb-2">{product.description || 'Nenhuma descrição fornecida.'}</p>
                                            <div className="mt-auto pt-2">
                                                <p className="text-xs text-white/60 bg-white/5 p-2 rounded line-clamp-2">
                                                    <span className="font-semibold text-white/80">Indicações:</span> {product.indications || 'Não especificadas'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setMedicineToEdit({
                                                        ...product,
                                                        originalName: product.name,
                                                        categoryId: category.id,
                                                        priceBRL: product.priceBRL || '',
                                                        indications: product.indications || ''
                                                    });
                                                    setShowEditMedicineModal(true);
                                                }}
                                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                                                title="Editar"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if(confirm('Tem certeza que deseja remover este medicamento?')) {
                                                        deleteProduct(category.id, product.name);
                                                    }
                                                }}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>`;
code = code.replace(cardTarget, cardReplacement);

// Add the edit modal to the UI
const modalTarget = `            {/* Modal Import */}`;
const modalReplacement = `            {/* Modal Edit Medicine */}
            {showEditMedicineModal && medicineToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditMedicineModal(false)} />
                  <div className="relative w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Editar Medicamento</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#8A8A9E] mb-1">Nome do Produto</label>
                        <input
                          type="text"
                          value={medicineToEdit.name}
                          onChange={(e) => setMedicineToEdit({...medicineToEdit, name: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Fabricante</label>
                            <input
                            type="text"
                            value={medicineToEdit.manufacturer}
                            onChange={(e) => setMedicineToEdit({...medicineToEdit, manufacturer: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Tipo / Veículo</label>
                            <input
                            type="text"
                            value={medicineToEdit.type}
                            onChange={(e) => setMedicineToEdit({...medicineToEdit, type: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-[#8A8A9E] mb-1">Descrição Curta</label>
                        <input
                          type="text"
                          value={medicineToEdit.description}
                          onChange={(e) => setMedicineToEdit({...medicineToEdit, description: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Valor (R$)</label>
                            <input
                            type="number"
                            value={medicineToEdit.priceBRL}
                            onChange={(e) => setMedicineToEdit({...medicineToEdit, priceBRL: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            placeholder="Ex: 250"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#8A8A9E] mb-1">Patologia / Doença (Filtro)</label>
                            <input
                            type="text"
                            value={medicineToEdit.indications}
                            onChange={(e) => setMedicineToEdit({...medicineToEdit, indications: e.target.value})}
                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon"
                            placeholder="Ex: Ansiedade, Insônia"
                            />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                      <Button variant="ghost" onClick={() => setShowEditMedicineModal(false)}>Cancelar</Button>
                      <Button onClick={handleEditMedicine}>Salvar</Button>
                    </div>
                  </div>
                </div>
            )}

            {/* Modal Import */}`;
code = code.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
