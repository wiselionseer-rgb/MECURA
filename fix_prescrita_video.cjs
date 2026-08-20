const fs = require('fs');
let content = fs.readFileSync('src/screens/DashboardScreen.tsx', 'utf8');

const target = `<motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-mecura-neon/10 blur-[80px] rounded-full pointer-events-none" />`;

const replacement = `<motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer bg-[#0A0A0F]"
              onClick={() => navigate('/chat')}
            >
              {/* Background Video */}
              <div className="absolute inset-0 z-0">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  src="/2131.mov" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F]/90 via-[#0A0A0F]/70 to-[#A6FF00]/10" />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-mecura-neon/15 blur-[80px] rounded-full pointer-events-none z-0" />`;

if (content.includes(target.replace(/\r\n/g, '\n'))) {
  content = content.replace(target.replace(/\r\n/g, '\n'), replacement);
  fs.writeFileSync('src/screens/DashboardScreen.tsx', content, 'utf8');
  console.log('patched prescrita video');
} else {
  console.log('target not found');
}
