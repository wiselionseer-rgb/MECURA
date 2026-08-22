const fs = require('fs');
let code = fs.readFileSync('src/screens/AnalysisScreen.tsx', 'utf-8');

const target = `      {/* Dynamic Text */}
      <div className="h-16 flex items-center justify-center z-10 px-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="text-mecura-silver text-lg font-medium tracking-wide absolute text-center"
          >
            {MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>`;

const replacement = `      {/* Dynamic Text */}
      <div className="h-24 flex items-center justify-center z-10 px-4 relative w-full max-w-[90%] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="text-mecura-silver text-base sm:text-lg font-medium tracking-wide absolute text-center w-full px-2"
          >
            {MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/screens/AnalysisScreen.tsx', code);
