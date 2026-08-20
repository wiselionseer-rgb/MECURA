const fs = require('fs');

let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

const replacementFn = (content, matchClass, posterImg, videoSrc, overlayClass, id) => {
  // Regex to match the whole absolute inset-0 z-0 block with its children
  // It looks like:
  // <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/dashboard-poster.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
  //   <div className="absolute inset-0 bg-gradient-to-br..." />
  // </div>
  
  const regex = /<div className="absolute inset-0 z-0" style={{ backgroundImage: 'url\(\/dashboard-poster\.jpg\)',[^>]+>[\s\S]*?<div className="absolute inset-0 bg-gradient-to-br[^>]+>[\s\S]*?<\/div>/;
  
  return content.replace(regex, `<div className="absolute inset-0 z-0 bg-black">
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-70" 
                  style={{ backgroundImage: 'url(/dashboard-bg-poster.jpg)' }} 
                />
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  ref={(el) => {
                    if (el && !el.dataset.attempted) {
                      el.dataset.attempted = 'true';
                      const p = el.play();
                      if (p) {
                        p.catch(() => {
                          el.style.display = 'none';
                        });
                      }
                    }
                  }}
                  src="/dashboard-bg.mp4" 
                  className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
              </div>`);
};

// Apply three times for the three occurrences
content = replacementFn(content);
content = replacementFn(content);
content = replacementFn(content);

fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
console.log('Dashboard video fixed');
