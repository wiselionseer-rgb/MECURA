const fs = require('fs');
let srv = fs.readFileSync('server.ts', 'utf8');
srv = srv.replace("          });\n      });\n      }", "          });\n      }\n");
fs.writeFileSync('server.ts', srv, 'utf8');
