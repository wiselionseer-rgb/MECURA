const fs = require('fs');

let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

// Fix step 2 top/bottom padding
content = content.replace(
  'className="absolute inset-0 flex flex-col px-6 pt-28 pb-36 overflow-y-auto overflow-x-hidden bg-[#0A0A0F]"',
  'className="absolute inset-0 flex flex-col px-6 pt-16 pb-48 overflow-y-auto overflow-x-hidden bg-[#0A0A0F]"'
);

// Fix margin below "Corpo Clínico" card
content = content.replace(
  'className="bg-[#161622]/80 backdrop-blur-md border border-white/5 rounded-[28px] p-5 flex items-center gap-5 mb-12 shadow-2xl relative overflow-hidden shrink-0"',
  'className="bg-[#161622]/80 backdrop-blur-md border border-white/5 rounded-[28px] p-5 flex items-center gap-5 mb-8 shadow-2xl relative overflow-hidden shrink-0"'
);

// Fix margin below "Sua jornada de saúde" text
content = content.replace(
  'className="text-4xl font-serif font-semibold text-white mb-12 leading-tight tracking-tight shrink-0"',
  'className="text-4xl font-serif font-semibold text-white mb-8 leading-tight tracking-tight shrink-0"'
);

// Fix video tag to force inline playback
content = content.replace(
  '<video\n                poster="/welcome-bg-poster.jpg" \n                autoPlay \n                loop \n                muted \n                playsInline\n                controls={false}',
  '<video\n                poster="/welcome-bg-poster.jpg" \n                autoPlay \n                loop \n                muted \n                playsInline\n                webkit-playsinline="true"\n                controls={false}'
);

fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('Layout and video attributes fixed');
