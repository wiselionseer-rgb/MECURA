const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

code = code.replace(
  "    messages: []\n  }),\n}));",
  "    messages: []\n  }) },\n}));"
);
fs.writeFileSync('src/store/useStore.ts', code);
