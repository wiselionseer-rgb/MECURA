const fs = require('fs');

// WelcomeScreen
let welcomeContent = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

const welcomeTarget = `<div className="absolute inset-0 z-0">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                controls={false}
                disablePictureInPicture
                src="/Cannabis_oil_bottle_with_plants_202608200004.mp4" 
                className="w-full h-full object-cover opacity-[0.80] pointer-events-none"
              />`;

const welcomeReplacement = `<div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/welcome-poster.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
                        el.style.opacity = '0'; // Hide video to show background poster instead
                      });
                    }
                  }
                }}
                src="/Cannabis_oil_bottle_with_plants_202608200004.mp4" 
                className="w-full h-full object-cover opacity-[0.80] pointer-events-none"
              />`;

welcomeContent = welcomeContent.replace(welcomeTarget.replace(/\r\n/g, '\n'), welcomeReplacement);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcomeContent, 'utf8');
console.log('WelcomeScreen video fixed');


// DashboardScreen (Pending, Queue, Finished)
let dashContent = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

const dashReplacer = (content, bgClass) => {
  return content.replace(
    `<div className="absolute inset-0 z-0">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  src="/2131.mp4" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                />`,
    `<div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/dashboard-poster.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
                          el.style.opacity = '0';
                        });
                      }
                    }
                  }}
                  src="/2131.mp4" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                />`
  );
}

dashContent = dashReplacer(dashContent); // first match (Finished)
dashContent = dashReplacer(dashContent); // second match (Queue)
dashContent = dashReplacer(dashContent); // third match (Pending)

fs.writeFileSync('src/screens/DashboardScreen.tsx', dashContent, 'utf8');
console.log('DashboardScreen video fixed');

