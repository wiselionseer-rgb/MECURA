const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// 1. Add Paperclip import if missing
if (!code.includes('Paperclip')) {
    code = code.replace(/from 'lucide-react';/, "  Paperclip,\n  Bot,\n  User,\n} from 'lucide-react';");
}

// 2. Add AI States and Refs
const stateTarget = `  const [importMedicineText, setImportMedicineText] = useState('');`;
const stateReplacement = `  const [importMedicineText, setImportMedicineText] = useState('');
  
  // AI Chat States
  const [aiChatHistory, setAiChatHistory] = useState<Array<{role: 'user'|'ai', text: string, file?: any}>>([
      { role: 'ai', text: 'Olá! Sou o assistente de IA da Mecura. Envie um arquivo (PDF, Tabela) e me diga o que deseja atualizar ou adicionar no catálogo!' }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAiFile, setSelectedAiFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
`;
code = code.replace(stateTarget, stateReplacement);

// 3. Add Handlers (replacing handleImportMedicines)
const handlerStartStr = `  const handleImportMedicines = () => {`;
const handlerEndStr = `setShowImportMedicineModal(false);\n  };`;

const handlerTarget = code.substring(code.indexOf(handlerStartStr), code.indexOf(handlerEndStr) + handlerEndStr.length);

const handlerReplacement = `  const handleAiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            setSelectedAiFile({
                name: file.name,
                data: event.target.result as string,
                mimeType: file.type
            });
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSendAiMessage = async () => {
    if (!aiInputText.trim() && !selectedAiFile) return;

    const userMsg = {
        role: 'user' as const,
        text: aiInputText,
        file: selectedAiFile
    };
    
    setAiChatHistory(prev => [...prev, userMsg]);
    const currentPrompt = aiInputText;
    const currentFile = selectedAiFile;
    
    setAiInputText('');
    setSelectedAiFile(null);
    setIsAiLoading(true);

    try {
        const response = await fetch('/api/admin-catalog-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: currentPrompt,
                currentCatalog: productCategories,
                file: currentFile
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Erro na API');
        
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
                } catch (e) {
                    console.error("Action error", e);
                }
            });
            
            setAiChatHistory(prev => [...prev, {
                role: 'ai',
                text: data.message || \`Ações executadas: \${addCount} adicionados, \${updateCount} atualizados, \${deleteCount} removidos.\`
            }]);
        } else {
            setAiChatHistory(prev => [...prev, { role: 'ai', text: data.message || "Não encontrei ações válidas para executar." }]);
        }
    } catch (error: any) {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: \`Erro: \${error.message}\` }]);
    } finally {
        setIsAiLoading(false);
    }
  };`;

code = code.replace(handlerTarget, handlerReplacement);

// 4. Replace UI Modal
const modalTargetStr = `            {/* Modal Import */}`;
const modalEndStr = `            )}

          </div>
        )}`;

// Get the exact slice
const modalTargetBlock = code.substring(code.indexOf(modalTargetStr), code.indexOf(modalEndStr) + modalEndStr.length - 23); // Keep closing brackets out of slice to be safe

const modalReplacementBlock = `            {/* Modal AI Chat */}
            {showImportMedicineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportMedicineModal(false)} />
                  <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[80vh] max-h-[800px] overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161622]">
                        <div className="flex items-center gap-3">
                            <BrainCircuit className="w-6 h-6 text-mecura-neon" />
                            <div>
                                <h3 className="font-bold text-white leading-none">Assistente Mecura AI</h3>
                                <p className="text-xs text-[#8A8A9E] mt-1">Gerenciador de Catálogo</p>
                            </div>
                        </div>
                        <button onClick={() => setShowImportMedicineModal(false)} className="text-[#8A8A9E] hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0A0A0F]">
                        {aiChatHistory.map((msg, i) => (
                            <div key={i} className={\`flex gap-3 \${msg.role === 'user' ? 'flex-row-reverse' : ''}\`}>
                                <div className={\`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 \${msg.role === 'user' ? 'bg-[#262636]' : 'bg-mecura-neon/10'}\`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-mecura-neon" />}
                                </div>
                                <div className={\`max-w-[80%] rounded-2xl p-4 \${msg.role === 'user' ? 'bg-[#262636] text-white rounded-tr-none' : 'bg-[#161622] text-white border border-white/5 rounded-tl-none'}\`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    {msg.file && (
                                        <div className="mt-3 p-2 bg-black/20 rounded-lg flex items-center gap-2 border border-white/5">
                                            <Paperclip className="w-4 h-4 text-mecura-neon" />
                                            <span className="text-xs text-[#8A8A9E] truncate">{msg.file.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isAiLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-mecura-neon" />
                                </div>
                                <div className="bg-[#161622] border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" style={{animationDelay: '0.1s'}} />
                                    <div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" style={{animationDelay: '0.2s'}} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#161622] border-t border-white/10">
                        {selectedAiFile && (
                            <div className="mb-3 inline-flex items-center gap-2 bg-[#262636] px-3 py-1.5 rounded-full border border-white/10">
                                <Paperclip className="w-3.5 h-3.5 text-mecura-neon" />
                                <span className="text-xs text-[#8A8A9E] max-w-[200px] truncate">{selectedAiFile.name}</span>
                                <button onClick={() => setSelectedAiFile(null)} className="text-[#8A8A9E] hover:text-white ml-1">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAiFileSelect} 
                                className="hidden" 
                                accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-[#262636] hover:bg-[#363646] text-[#8A8A9E] hover:text-white rounded-xl transition-colors"
                                title="Anexar Arquivo"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={aiInputText}
                                onChange={(e) => setAiInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                                placeholder="Digite o que deseja fazer com o catálogo..."
                                className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon text-sm"
                                disabled={isAiLoading}
                            />
                            <button 
                                onClick={handleSendAiMessage}
                                disabled={isAiLoading || (!aiInputText.trim() && !selectedAiFile)}
                                className="p-3 bg-mecura-neon text-black rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                  </div>
                </div>
            )}`;

code = code.replace(modalTargetBlock, modalReplacementBlock);
fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
console.log("Admin UI patched.");
