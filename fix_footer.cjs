const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

if (!code.includes('const reportDiv = container.firstElementChild')) {
  code = code.replaceAll(
    'const opt = {',
    `const reportDiv = container.firstElementChild?.firstElementChild as HTMLElement;
  if (reportDiv && reportDiv.style.minHeight === '1123px') {
    const currentHeight = reportDiv.getBoundingClientRect().height;
    const a4Height = 1123;
    if (currentHeight > a4Height) {
      const pages = Math.ceil(currentHeight / a4Height);
      reportDiv.style.height = \`\${pages * a4Height}px\`;
    }
  }

  const opt = {`
  );
}

code = code.replaceAll(
  '<div className="mt-8 pt-8 border-t border-[#E2E8F0]">',
  '<div className="mt-auto pt-8 border-t border-[#E2E8F0]" style={{ pageBreakInside: "avoid" }}>'
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
