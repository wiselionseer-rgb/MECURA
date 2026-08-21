const fs = require('fs');
let code = fs.readFileSync('src/screens/CheckoutScreen.tsx', 'utf-8');

const target = `      </motion.div>
    </div>
  );
}`;

const replacement = `      </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/screens/CheckoutScreen.tsx', code);
