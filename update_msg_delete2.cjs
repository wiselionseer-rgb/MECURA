const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetRegex = /<div \s*className=\{\`max-w-\[75%\] p-4 rounded-2xl shadow-sm \$\{[\s\S]*?<p className="text-\[15px\] leading-relaxed">\{msg\.text\}<\/p>\s*<\/div>\s*\)\}/;

const newCode = `<div 
                      className={\`max-w-[75%] p-4 rounded-2xl shadow-sm relative group \${
                        msg.sender === 'doctor' 
                          ? 'bg-mecura-neon/10 text-white rounded-tr-sm border border-mecura-neon/20' 
                          : 'bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated'
                      }\`}
                    >
                      <p className="text-[15px] leading-relaxed pr-8 whitespace-pre-wrap">{msg.text}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovePrescribedMedication(msg.id);
                        }}
                        className="absolute top-2 right-2 px-2 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Apagar mensagem"
                      >
                        <Trash2 className="w-3 h-3 pointer-events-none" />
                      </button>
                    </div>
                  )}`;

if(targetRegex.test(dashboardCode)) {
  dashboardCode = dashboardCode.replace(targetRegex, newCode);
  fs.writeFileSync(dashboardPath, dashboardCode);
  console.log("Success message delete regex");
} else {
  console.log("Target code not found with regex");
}
