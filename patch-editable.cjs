const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

if (!code.includes('isEditingAgronomic')) {
    // Add state
    code = code.replace(
        "const [agronomicResult, setAgronomicResult] = useState('');",
        "const [agronomicResult, setAgronomicResult] = useState('');\n  const [isEditingAgronomic, setIsEditingAgronomic] = useState(false);"
    );
    
    // Add imports
    code = code.replace(
        "import {",
        "import { Edit3, Check,"
    );
    
    // Header section
    const oldHeaderStart = 'Resultado (Parecer)</h3>';
    const indexOfHeader = code.indexOf(oldHeaderStart);
    if (indexOfHeader > -1) {
        // we'll inject the button right before the Copiar HTML button
        const copyHtmlButton = '<button onClick={handleCopyAgronomic}';
        const replaceStr = `<button onClick={() => setIsEditingAgronomic(!isEditingAgronomic)} className={\`flex items-center gap-2 transition-colors text-sm font-bold \${isEditingAgronomic ? 'text-mecura-neon' : 'text-[#8A8A9E] hover:text-white'}\`}>
                               {isEditingAgronomic ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                               {isEditingAgronomic ? 'Concluir Edição' : 'Editar Laudo'}
                            </button>
                            <button onClick={handleCopyAgronomic}`;
        code = code.replace(copyHtmlButton, replaceStr);
    }
    
    // Div section
    // <div dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/```html/g, "").replace(/```/g, "") }} id="agronomic-report-container" className="text-black bg-white p-4 rounded" />
    
    const oldDivRegex = /<div dangerouslySetInnerHTML={{ __html: agronomicResult\.replace\(\/```html\/g, ""\)\.replace\(\/```\/g, ""\) }} id="agronomic-report-container" className="[^"]*" \/>/g;
    
    code = code.replace(oldDivRegex, (match) => {
        return `<div onInput={(e) => setAgronomicResult(e.currentTarget.innerHTML)} contentEditable={isEditingAgronomic} dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/\\`\\`\\`html/g, "").replace(/\\`\\`\\`/g, "") }} id="agronomic-report-container" className={\`text-black bg-white p-4 rounded outline-none transition-all \${isEditingAgronomic ? 'ring-4 ring-mecura-neon/50' : ''}\`} />`;
    });
    
    fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
    console.log("Patched!");
}
