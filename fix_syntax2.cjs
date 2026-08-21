const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');
code = code.replace("  }, []); });\n      }\n    });", "  }, []);");
fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
