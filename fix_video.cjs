const fs = require('fs');

// Fix WelcomeScreen
let welcomeContent = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
const welcomeTarget = `              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                src="/Cannabis_oil_bottle_with_plants_202608200004.mp4" 
                className="w-full h-full object-cover opacity-[0.80]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/30 via-[#0A0A0F]/80 to-[#0A0A0F] opacity-95" />
              <div className="absolute inset-0 bg-mecura-neon/5 mix-blend-overlay" />`;

const welcomeReplacement = `              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                controls={false}
                disablePictureInPicture
                src="/Cannabis_oil_bottle_with_plants_202608200004.mp4" 
                className="w-full h-full object-cover opacity-[0.80] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/30 via-[#0A0A0F]/80 to-[#0A0A0F] opacity-95 pointer-events-none" />
              <div className="absolute inset-0 bg-mecura-neon/5 pointer-events-none" />`;

if (welcomeContent.includes(welcomeTarget.replace(/\r\n/g, '\n'))) {
  welcomeContent = welcomeContent.replace(welcomeTarget.replace(/\r\n/g, '\n'), welcomeReplacement);
  fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcomeContent, 'utf8');
  console.log('WelcomeScreen patched');
} else {
  console.log('WelcomeScreen target not found');
}

// Fix DashboardScreen
let dashContent = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');
const dashTarget = `                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  src="/2131.mov" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                />`;

const dashReplacement = `                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  src="/2131.mov" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                />`;

if (dashContent.includes(dashTarget.replace(/\r\n/g, '\n'))) {
  dashContent = dashContent.replace(dashTarget.replace(/\r\n/g, '\n'), dashReplacement);
  fs.writeFileSync('src/screens/DashboardScreen.tsx', dashContent, 'utf8');
  console.log('DashboardScreen patched');
} else {
  console.log('DashboardScreen target not found');
}
