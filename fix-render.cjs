const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const regex = /<Markdown>\{agronomicResult\}<\/Markdown>/g;
code = code.replace(regex, '<div dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/```html/g, "").replace(/```/g, "") }} id="agronomic-report-content" className="text-black bg-white p-4 rounded" />');

// also remove the prose wrapper if possible, or just let it be overridden by the div styles.
const oldDiv = '<div className="prose prose-invert prose-sm max-w-none text-white prose-p:text-[#8A8A9E] prose-li:text-[#8A8A9E]">';
code = code.replace(oldDiv, '<div className="bg-white p-6 rounded-xl overflow-x-auto relative text-black">');

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
