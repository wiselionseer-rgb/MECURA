const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetState = `  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '' });`;
const replacementState = `  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '', priceBRL: '', indications: '' });
  const [diseaseFilter, setDiseaseFilter] = useState('');`;
code = code.replace(targetState, replacementState);

const targetHandleAdd = `    const product = {
        name: newMedicine.name,
        manufacturer: newMedicine.manufacturer || 'Não informado',
        origin: newMedicine.origin || 'Nacional',
        type: newMedicine.type || 'Geral',
        details: [],
        description: newMedicine.description || ''
    };`;
const replacementHandleAdd = `    const product = {
        name: newMedicine.name,
        manufacturer: newMedicine.manufacturer || 'Não informado',
        origin: newMedicine.origin || 'Nacional',
        type: newMedicine.type || 'Geral',
        details: [],
        description: newMedicine.description || '',
        priceBRL: newMedicine.priceBRL ? parseFloat(newMedicine.priceBRL) : undefined,
        indications: newMedicine.indications || ''
    };`;
code = code.replace(targetHandleAdd, replacementHandleAdd);

const targetSetNewMedicine = `setNewMedicine({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '' });`;
const replacementSetNewMedicine = `setNewMedicine({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '', priceBRL: '', indications: '' });`;
code = code.replace(targetSetNewMedicine, replacementSetNewMedicine);

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
