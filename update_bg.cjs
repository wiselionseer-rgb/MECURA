const fs = require('fs');

let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

const target = `            {/* Full Screen Background Video */}
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/welcome-poster.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/30 via-[#0A0A0F]/80 to-[#0A0A0F] opacity-95 pointer-events-none" />
              <div className="absolute inset-0 bg-mecura-neon/5 pointer-events-none" />
            </div>`;

const replacement = `            {/* Full Screen Background Video */}
            <div className="absolute inset-0 z-0 bg-black">
              {/* Fallback Poster */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-80" 
                style={{ backgroundImage: 'url(/welcome-bg-poster.jpg)' }} 
              />
              {/* Video Element */}
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
                        el.style.display = 'none'; // Fallback to poster on failure
                      });
                    }
                  }
                }}
                src="/welcome-bg.mp4" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10"
              />
              
              {/* Elegant Gradient for Readability - No Green/Neon tint */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/60 to-[#0A0A0F] z-20 pointer-events-none" />
            </div>`;

content = content.replace(target.replace(/\r\n/g, '\n'), replacement);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('Background replaced!');
