const fs = require('fs');

let welcome = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');
let dashboard = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

// Dashboard changes
// Replace the video tag with an img + video tag
const dashVideoRegex = /<video\n\s*poster="\/dashboard-bg-poster\.jpg"[^>]*ref=\{\(el\) => \{ if \(el\) \{ el\.play\(\)\.catch\(\(\)=>\{\}\); \} \}\}[^>]*\/>/g;
const dashReplacement = `<img src="/dashboard-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="background" />
                <video
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  webkit-playsinline="true"
                  controls={false}
                  disablePictureInPicture
                  ref={(el) => { if (el) { el.play().catch(()=>{ el.style.display = 'none'; }); } }}
                  src="/2131-ezgif.com-video-compressor.mp4" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                />`;
dashboard = dashboard.replace(dashVideoRegex, dashReplacement);
fs.writeFileSync('src/screens/DashboardScreen.tsx', dashboard, 'utf8');

// Welcome changes
// First, update the useEffect in WelcomeScreen to hide the video on catch
welcome = welcome.replace(
  `bgVideoRef.current.play().catch((e) => console.log('Video autoplay prevented:', e));`,
  `bgVideoRef.current.play().catch((e) => {
        console.log('Video autoplay prevented:', e);
        if (bgVideoRef.current) bgVideoRef.current.style.display = 'none';
      });`
);

// Second, inject the img before the video
welcome = welcome.replace(
  `{/* Video Element */}\n              <video`,
  `{/* Video Element */}\n              <img src="/welcome-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="background" />\n              <video`
);

// Remove the poster attribute from the video in WelcomeScreen to avoid the play button showing up on the poster itself before JS hides it (actually, removing poster is good, so there's no native poster just our img)
welcome = welcome.replace(
  `poster="/welcome-bg-poster.jpg" \n                autoPlay`,
  `autoPlay`
);

fs.writeFileSync('src/screens/WelcomeScreen.tsx', welcome, 'utf8');

console.log('Fallback logic applied to videos');
