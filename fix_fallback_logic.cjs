const fs = require('fs');

function processFile(filePath, isWelcome) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add the videoFailed state
  if (!content.includes('videoFailed')) {
    content = content.replace(
      'const [step, setStep] = useState(1);',
      'const [step, setStep] = useState(1);\n  const [videoFailed, setVideoFailed] = useState(false);'
    );
    // For DashboardScreen which doesn't have step
    content = content.replace(
      'const [isProfileOpen, setIsProfileOpen] = useState(false);',
      'const [isProfileOpen, setIsProfileOpen] = useState(false);\n  const [videoFailed, setVideoFailed] = useState(false);'
    );
  }

  if (isWelcome) {
    const regex = /\{\/\*\s*Video Element\s*\*\/\}\s*<img\s*src="\/welcome-bg\.webp"[\s\S]*?\/>/;
    const replacement = `{/* Video Background Fallback Logic */}
              <img src="/welcome-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
              {!videoFailed && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  ref={(el) => {
                    if (el && !el.dataset.initialized) {
                      el.dataset.initialized = 'true';
                      const p = el.play();
                      if (p !== undefined) {
                        p.catch((e) => {
                          console.log('Autoplay blocked:', e);
                          setVideoFailed(true);
                        });
                      }
                    }
                  }}
                  src="/0820-ezgif.com-video-compressor.mp4"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10"
                />
              )}`;
    content = content.replace(regex, replacement);
  } else {
    const regex = /<img\s*src="\/dashboard-bg\.webp"[\s\S]*?\/>/g;
    const replacement = `<img src="/dashboard-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                {!videoFailed && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.dataset.initialized = 'true';
                        const p = el.play();
                        if (p !== undefined) {
                          p.catch((e) => {
                            console.log('Autoplay blocked:', e);
                            setVideoFailed(true);
                          });
                        }
                      }
                    }}
                    src="/2131-ezgif.com-video-compressor.mp4"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                  />
                )}`;
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

processFile('src/screens/WelcomeScreen.tsx', true);
processFile('src/screens/DashboardScreen.tsx', false);
console.log('Fallback logic rewritten successfully.');
