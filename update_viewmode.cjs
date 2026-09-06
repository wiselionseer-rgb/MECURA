const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const [viewMode, setViewMode] = useState<'categories' | 'diseases'>('categories');",
  "const [viewMode, setViewMode] = useState<'categories' | 'diseases' | 'all_products'>('categories');"
);

code = code.replace(
  /Visualizar por Doenças\s*<\/button>\s*<\/div>/,
  `Visualizar por Doenças
            </button>
            <button
              onClick={() => setViewMode('all_products')}
              className={\`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors \${
                viewMode === 'all_products' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'
              }\`}
            >
              Todos os Medicamentos
            </button>
          </div>`
);

fs.writeFileSync(path, code);
console.log('Updated viewMode and toggle button');
