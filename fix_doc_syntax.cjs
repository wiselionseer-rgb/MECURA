const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');
code = code.replace(
  "  }, []);\n    const currentUnreadCount =",
  "  }, []);\n\n  useEffect(() => {\n    const currentUnreadCount ="
);
fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
