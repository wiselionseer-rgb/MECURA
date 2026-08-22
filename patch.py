with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

if "isEditingAgronomic" not in code:
    code = code.replace("const [agronomicResult, setAgronomicResult] = useState('');", 
                        "const [agronomicResult, setAgronomicResult] = useState('');\n  const [isEditingAgronomic, setIsEditingAgronomic] = useState(false);")
    
    code = code.replace("import { Edit, Save, Plus, Trash2, X, Download } from 'lucide-react';", 
                        "import { Edit, Save, Plus, Trash2, X, Download, Edit3, Check } from 'lucide-react';")
    
    old_header = """<div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white">Resultado (Parecer)</h3>
                     {agronomicResult && (
                        <div className="flex gap-4">
                            <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-[#8A8A9E] hover:text-white transition-colors text-sm font-bold">
                               Copiar HTML
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                               <Download className="w-4 h-4" /> Baixar PDF
                            </button>
                        </div>
                     )}
                  </div>"""
    
    new_header = """<div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white">Resultado (Parecer)</h3>
                     {agronomicResult && (
                        <div className="flex gap-4">
                            <button onClick={() => setIsEditingAgronomic(!isEditingAgronomic)} className={`flex items-center gap-2 transition-colors text-sm font-bold ${isEditingAgronomic ? 'text-mecura-neon' : 'text-[#8A8A9E] hover:text-white'}`}>
                               {isEditingAgronomic ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                               {isEditingAgronomic ? 'Concluir Edição' : 'Editar Laudo'}
                            </button>
                            <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-[#8A8A9E] hover:text-white transition-colors text-sm font-bold">
                               Copiar HTML
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                               <Download className="w-4 h-4" /> Baixar PDF
                            </button>
                        </div>
                     )}
                  </div>"""
    
    code = code.replace(old_header, new_header)
    
    import re
    # We find the div using regex to be safe about exact whitespace inside
    pattern = r'<div dangerouslySetInnerHTML={{ __html: agronomicResult\.replace\(\/```html\/g, ""\)\.replace\(\/```\/g, ""\) }} id="agronomic-report-container" className="[^"]*" \/>'
    
    replacement = r'''<div contentEditable={isEditingAgronomic} suppressContentEditableWarning={true} onBlur={(e) => setAgronomicResult(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/```html/g, "").replace(/```/g, "") }} id="agronomic-report-container" className={`text-black bg-white p-4 rounded outline-none transition-all ${isEditingAgronomic ? 'ring-4 ring-mecura-neon/50' : ''}`} />'''
    
    code = re.sub(pattern, replacement, code)
    
    with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Patched successfully!")
