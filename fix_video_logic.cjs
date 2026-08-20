const fs = require('fs');

function fixVideo(filePath, bgImage) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the div fallback
  const fallbackDivRegex = new RegExp(`\\{\\/\\* Fallback Poster \\*\\/\\}\\s*<div\\s*className="[^"]*"\\s*style=\\{\\{ backgroundImage: 'url\\(${bgImage}\\)' \\}\\}\\s*\\/>`, 'g');
  content = content.replace(fallbackDivRegex, '');
  
  // Also remove the DashboardScreen fallback divs (which don't have the comment)
  const dashboardFallbackRegex = new RegExp(`<div\\s*className="[^"]*"\\s*style=\\{\\{ backgroundImage: 'url\\(${bgImage}\\)' \\}\\}\\s*\\/>`, 'g');
  content = content.replace(dashboardFallbackRegex, '');

  // Replace the complex ref with a simple one
  const complexRefRegex = /ref=\{\(el\) => \{[\s\S]*?\}\}/g;
  content = content.replace(complexRefRegex, "ref={(el) => { if (el) { el.play().catch(() => {}); } }}");

  fs.writeFileSync(filePath, content, 'utf8');
}

fixVideo('src/screens/WelcomeScreen.tsx', '/welcome-bg-poster.jpg');
fixVideo('src/screens/DashboardScreen.tsx', '/dashboard-bg-poster.jpg');

console.log('Fixed video logic');
