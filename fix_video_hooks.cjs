const fs = require('fs');

function injectRef(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add useRef if it's not imported
  if (!content.includes('useRef')) {
    content = content.replace("import { useState, useEffect }", "import { useState, useEffect, useRef }");
    if (!content.includes('useRef')) {
      content = content.replace("import { useState }", "import { useState, useRef, useEffect }");
    }
  }

  // Find the component function start
  const screenMatch = content.match(/export function (\w+)\(\) \{/);
  if (!screenMatch) return;
  const funcStart = screenMatch[0];

  // Insert the ref and effect
  const refCode = `
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch((e) => console.log('Video autoplay prevented:', e));
    }
  }, []);
`;
  content = content.replace(funcStart, funcStart + refCode);

  // Replace the inline ref with the hooked ref
  content = content.replace(/ref=\{\(el\) => \{ if \(el\) \{ el\.play\(\)\.catch\(\(\) => \{\}\); \} \}\}/g, 'ref={bgVideoRef}');

  fs.writeFileSync(filePath, content, 'utf8');
}

injectRef('src/screens/WelcomeScreen.tsx');
injectRef('src/screens/DashboardScreen.tsx');

console.log('Injected video hooks');
