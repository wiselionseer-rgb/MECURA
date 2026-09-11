const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetDetails = `            {isChecked && q.hasDetails && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <textarea
                  placeholder="Descreva mais detalhes aqui..."
                  value={answers[\`\${q.id}_details\`] || ''}
                  onChange={(e) => setAnswer(\`\${q.id}_details\`, e.target.value)}
                  className="w-full h-24 rounded-lg bg-mecura-bg border border-mecura-elevated p-3 text-sm text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none transition-colors"
                />
              </div>
            )}`;

const newDetails = `            {isChecked && q.hasDetails && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <textarea
                  placeholder={
                    q.id === 'remedios' || q.id === 'tratamento_atual' 
                      ? "Descreva mais detalhes aqui (nome do medicamento, dosagem e quantas vezes ao dia)..."
                      : "Descreva mais detalhes aqui..."
                  }
                  value={answers[\`\${q.id}_details\`] || ''}
                  onChange={(e) => setAnswer(\`\${q.id}_details\`, e.target.value)}
                  className="w-full h-24 rounded-lg bg-mecura-bg border border-mecura-elevated p-3 text-sm text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none transition-colors"
                />
              </div>
            )}`;

if(code.includes(targetDetails)) {
  code = code.replace(targetDetails, newDetails);
  fs.writeFileSync(path, code);
  console.log("Success updating onboarding details placeholder");
} else {
  console.log("Target details not found");
}
