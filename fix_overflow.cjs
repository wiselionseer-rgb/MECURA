const fs = require('fs');
let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

// Fix horizontal scroll
content = content.replace(/w-\[600px\]/g, 'w-full max-w-[600px] overflow-x-hidden');

// Ensure the container for step 2 hides overflow-x
content = content.replace(
  'className="absolute inset-0 flex flex-col px-6 pt-28 pb-36 overflow-y-auto bg-[#0A0A0F]"',
  'className="absolute inset-0 flex flex-col px-6 pt-28 pb-36 overflow-y-auto overflow-x-hidden bg-[#0A0A0F]"'
);

fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('patched overflow');
