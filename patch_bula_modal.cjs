const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!code.includes('ProductBulaModal')) {
  code = code.replace(
    "import { useStore } from '../store/useStore';",
    "import { useStore } from '../store/useStore';\nimport { ProductBulaModal } from './ProductBulaModal';"
  );
}

// 2. Add state
if (!code.includes('const [selectedProduct, setSelectedProduct]')) {
  code = code.replace(
    "const [deepSearchTerm, setDeepSearchTerm] = useState('');",
    "const [deepSearchTerm, setDeepSearchTerm] = useState('');\n  const [selectedProduct, setSelectedProduct] = useState<any>(null);"
  );
}

// 3. Render modal at the end of the return statement
if (!code.includes('<ProductBulaModal')) {
  const targetEnd = `      </div>
    </motion.div>
  );
}`;
  const replacementEnd = `      </div>

      <ProductBulaModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        exchangeRate={exchangeRate} 
      />
    </motion.div>
  );
}`;
  code = code.replace(targetEnd, replacementEnd);
}

fs.writeFileSync(path, code);
console.log('Added ProductBulaModal logic');
