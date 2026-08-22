const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetSidebarItem = `            <button
              onClick={() => setActiveTab('doctors')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${
                activeTab === 'doctors' 
                  ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/30' 
                  : 'text-mecura-silver hover:bg-white/5 hover:text-white'
              }\`}`;
              
const newSidebarItem = `            <button
              onClick={() => setActiveTab('medicines')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${
                activeTab === 'medicines' 
                  ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/30' 
                  : 'text-mecura-silver hover:bg-white/5 hover:text-white'
              }\`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium text-sm">Catálogo & Medicamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${
                activeTab === 'doctors' 
                  ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/30' 
                  : 'text-mecura-silver hover:bg-white/5 hover:text-white'
              }\`}`;
code = code.replace(targetSidebarItem, newSidebarItem);

// Need to import Package if not imported
if (!code.includes("Package,") && !code.includes(" Package ")) {
    code = code.replace("import { Users, Activity", "import { Users, Activity, Package");
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
