const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetStr = `<button
            onClick={() => setActiveTab('doctors')}
            className={\`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-3 rounded-xl transition-colors \${
              activeTab === 'doctors' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }\`}
          >
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Médicos</span>
          </button>`;

const replacementStr = targetStr + `

          <button
            onClick={() => setActiveTab('medicines')}
            className={\`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-3 rounded-xl transition-colors \${
              activeTab === 'medicines' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }\`}
          >
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Medicamentos</span>
          </button>`;

if (code.includes("setActiveTab('doctors')")) {
    if (!code.includes("setActiveTab('medicines')")) {
        // Try replacing based on regex because spacing might be slightly off
        const regex = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('doctors'\)\}[\s\S]*?<\/button>/;
        
        const match = code.match(regex);
        if (match) {
            code = code.replace(regex, match[0] + `\n\n          <button
            onClick={() => setActiveTab('medicines')}
            className={\`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-3 rounded-xl transition-colors \${
              activeTab === 'medicines' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }\`}
          >
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Medicamentos</span>
          </button>`);
          fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
          console.log("Replaced successfully!");
        } else {
            console.log("Could not match regex.");
        }
    } else {
        console.log("Medicines tab already exists in code.");
    }
} else {
    console.log("Could not find doctors tab.");
}
