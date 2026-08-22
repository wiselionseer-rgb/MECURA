const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// Add states for AI chat
const stateTarget = `  const [importMedicineText, setImportMedicineText] = useState('');`;
const stateReplacement = `  const [importMedicineText, setImportMedicineText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');`;
code = code.replace(stateTarget, stateReplacement);

// Update import UI handler to AI
const handlerTarget = `  const handleImportMedicines = () => {
    // Basic CSV/Line text import fallback
    const lines = importMedicineText.split('\\n');
    let added = 0;
    
    // Simplistic text parser
    lines.forEach(line => {
        if(line.trim() === '') return;
        const parts = line.split('-').map(s => s.trim());
        const name = parts[0] || 'Novo Produto';
        const manufacturer = parts[1] || 'Desconhecido';
        const type = parts[2] || 'Outro';
        
        addProduct(productCategories[0]?.id || '1', {
            name, manufacturer, type, origin: 'Importado', description: ''
        });
        added++;
    });
    
    if(added > 0) {
        alert(\`\${added} medicamentos importados com sucesso!\`);
    }
    setShowImportMedicineModal(false);
    setImportMedicineText('');
  };`;

const handlerReplacement = `  const handleAiCatalogManager = async () => {
    if (!importMedicineText.trim()) return;
    
    setIsAiLoading(true);
    setAiError('');
    setAiSuccessMsg('');
    
    try {
        const response = await fetch('/api/admin-catalog-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: importMedicineText,
                currentCatalog: productCategories
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro desconhecido');
        }
        
        if (data.actions && Array.isArray(data.actions)) {
            let addCount = 0;
            let updateCount = 0;
            let deleteCount = 0;
            
            data.actions.forEach((action: any) => {
                try {
                    if (action.type === 'add' && action.categoryId && action.product) {
                        addProduct(action.categoryId, action.product);
                        addCount++;
                    } else if (action.type === 'update' && action.categoryId && action.originalName && action.updates) {
                        updateProduct(action.categoryId, action.originalName, action.updates);
                        updateCount++;
                    } else if (action.type === 'delete' && action.categoryId && action.originalName) {
                        deleteProduct(action.categoryId, action.originalName);
                        deleteCount++;
                    }
                } catch (err) {
                    console.error("Failed to apply action", action, err);
                }
            });
            
            setAiSuccessMsg(data.message || \`Ações executadas: \${addCount} adicões, \${updateCount} atualizações, \${deleteCount} exclusões.\`);
            setTimeout(() => {
                setShowImportMedicineModal(false);
                setImportMedicineText('');
                setAiSuccessMsg('');
            }, 3000);
        } else {
            throw new Error('Resposta inválida do servidor IA');
        }
    } catch (error: any) {
        console.error('Erro no Gerenciador IA:', error);
        setAiError(error.message || 'Falha ao processar solicitação. O Gemini pode não estar configurado corretamente.');
    } finally {
        setIsAiLoading(false);
    }
  };`;

if (!code.includes('handleAiCatalogManager')) {
    code = code.replace(handlerTarget, handlerReplacement);
}

// Replace UI Modal
const modalTarget = `            {/* Modal Import */}
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
                        placeholder="Nome Medicamento 1 - Fabricante A - Gomas\\nNome Medicamento 2 - Fabricante B - Óleo"
                    />
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowImportMedicineModal(false)}>Cancelar</Button>
                      <Button onClick={handleImportMedicines}>Importar Todos</Button>
                    </div>
                  </div>
                </div>
            )}`;

const modalReplacement = `            {/* Modal Import / AI Chat */}
            {showImportMedicineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportMedicineModal(false)} />
                  <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="flex items-center gap-3 mb-2">
                        <BrainCircuit className="w-6 h-6 text-mecura-neon" />
                        <h3 className="text-xl font-bold text-white">Assistente de Catálogo com IA</h3>
                    </div>
                    <p className="text-sm text-[#8A8A9E] mb-4">
                        Descreva o que deseja fazer com o catálogo. Cole textos de PDFs, tabelas de fornecedores ou peça para atualizar preços em massa. A Inteligência Artificial da Mecura vai interpretar e executar.
                    </p>
                    
                    <div className="flex-1 overflow-y-auto mb-4 min-h-[150px]">
                        <textarea
                            value={importMedicineText}
                            onChange={(e) => setImportMedicineText(e.target.value)}
                            className="w-full h-48 bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-mecura-neon text-sm custom-scrollbar resize-none"
                            placeholder="Exemplos:\\n- 'Colei o texto deste PDF do fornecedor X. Adicione esses novos óleos de CBD ao catálogo.'\\n- 'Atualize todos os preços dos produtos da marca GreenBudz aumentando em R$ 30,00.'\\n- 'Crie um novo produto chamado Gummies de Melatonina, marca Y, preço R$ 200 para insônia.'"
                        />
                    </div>
                    
                    {aiError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                            {aiError}
                        </div>
                    )}
                    {aiSuccessMsg && (
                        <div className="bg-mecura-neon/10 border border-mecura-neon/20 text-mecura-neon p-3 rounded-lg text-sm mb-4">
                            {aiSuccessMsg}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-xs text-[#8A8A9E]">
                        Powered by Gemini AI
                      </div>
                      <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowImportMedicineModal(false)} disabled={isAiLoading}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAiCatalogManager} disabled={isAiLoading || !importMedicineText.trim()}>
                          {isAiLoading ? 'Processando com IA...' : 'Enviar para IA'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
            )}`;

if (!code.includes('Assistente de Catálogo com IA')) {
    code = code.replace(modalTarget, modalReplacement);
    fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
    console.log("AdminDashboardScreen patched.");
} else {
    console.log("AdminDashboardScreen already patched.");
}
