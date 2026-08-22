const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// Import React Markdown
if (!code.includes('import Markdown')) {
    code = "import Markdown from 'react-markdown';\n" + code;
}

// Replace the dangerouslySetInnerHTML with Markdown
const regex = /<div className="prose prose-invert prose-sm max-w-none prose-p:text-\[#8A8A9E\] prose-li:text-\[#8A8A9E\]" dangerouslySetInnerHTML=\{\{ __html: agronomicResult\.replace\(\/\\n\/g, '<br \/>'\) \}\} \/>/;
const newMarkdown = `<div className="prose prose-invert prose-sm max-w-none text-white prose-p:text-[#8A8A9E] prose-li:text-[#8A8A9E]">
                           <Markdown>{agronomicResult}</Markdown>
                        </div>`;

if (code.match(regex)) {
   code = code.replace(regex, newMarkdown);
   console.log("Replaced with Markdown");
} else {
   console.log("Could not find regex to replace markdown");
   // Try simpler regex
   const regex2 = /<div className="prose prose-invert prose-sm max-w-none prose-p:text-\[\#8A8A9E\] prose-li:text-\[\#8A8A9E\]" dangerouslySetInnerHTML=\{[\s\S]*?\} \/>/g;
   if(code.match(regex2)) {
     code = code.replace(regex2, newMarkdown);
     console.log("Replaced with Markdown (fallback)");
   }
}

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
