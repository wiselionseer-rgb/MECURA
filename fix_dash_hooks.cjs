const fs = require('fs');
let dash = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');
dash = dash.replace(
  'const navigate = useNavigate();',
  'const navigate = useNavigate();\n  const [videoFailed, setVideoFailed] = useState(false);'
);
fs.writeFileSync('src/screens/DashboardScreen.tsx', dash, 'utf8');
console.log('Fixed DashboardScreen hooks.');
