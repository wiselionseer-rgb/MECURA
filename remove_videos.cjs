const fs = require('fs');

function removeVideos(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove all <video ... /> tags. The regex /<video[\s\S]*?\/>/g matches from <video to the first />
  content = content.replace(/<video[\s\S]*?\/>/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
}

removeVideos('src/screens/WelcomeScreen.tsx');
removeVideos('src/screens/DashboardScreen.tsx');
console.log('Videos removed from code');
