const fs = require('fs');
let code = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf8');
code = code.replace("  }, [patientId]);\n  }, []);", "  }, [patientId]);");
fs.writeFileSync('src/screens/ChatScreen.tsx', code, 'utf8');
