const fs = require('fs');

let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

const regexH2 = /className="text-4xl font-serif font-semibold text-white mb-12 leading-tight tracking-tight"/;
content = content.replace(regexH2, 'className="text-4xl font-serif font-semibold text-white mb-12 leading-tight tracking-tight shrink-0"');

const regexCarousel = /className="flex gap-4 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6"/;
content = content.replace(regexCarousel, 'className="flex gap-4 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 shrink-0"');

const regexCard = /className={`flex-shrink-0 w-\[275px\] backdrop-blur-xl border rounded-\[28px\] p-7 relative snap-center flex flex-col overflow-hidden/g;
content = content.replace(regexCard, 'className={`flex-shrink-0 min-h-[280px] w-[275px] backdrop-blur-xl border rounded-[28px] p-7 relative snap-center flex flex-col overflow-hidden');

fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('Fixed flexbox shrinking bug');
