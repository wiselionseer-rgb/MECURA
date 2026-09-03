const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

// Update height to minHeight in the guide div
code = code.replace(
  'style={{ width: "794px", height: "1123px", backgroundColor: "#FFFFFF", color: "#111827", pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}',
  'style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827", pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}'
);

// Update the resizing logic to handle multiple guides
const oldResizing = `  const reportDiv = container.firstElementChild?.firstElementChild as HTMLElement;
  if (reportDiv && reportDiv.style.minHeight === '1123px') {
    const currentHeight = reportDiv.getBoundingClientRect().height;
    const a4Height = 1123;
    if (currentHeight > a4Height) {
      const pages = Math.ceil(currentHeight / a4Height);
      reportDiv.style.height = \`\${pages * a4Height}px\`;
    }
  }`;

const newResizing = `  const wrapperDiv = container.firstElementChild as HTMLElement;
  if (wrapperDiv) {
    const guideDivs = Array.from(wrapperDiv.children);
    for (const el of guideDivs) {
      const guideDiv = el as HTMLElement;
      if (guideDiv.style.minHeight === '1123px') {
        const currentHeight = guideDiv.getBoundingClientRect().height;
        const a4Height = 1123;
        if (currentHeight > a4Height) {
          const pages = Math.ceil(currentHeight / a4Height);
          guideDiv.style.height = \`\${pages * a4Height}px\`;
        }
      }
    }
  }`;

if (code.includes(oldResizing)) {
    code = code.replace(oldResizing, newResizing);
} else {
    // maybe it doesn't match exactly. Let's find it.
    console.log("Could not find old resizing logic");
}

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
