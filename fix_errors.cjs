const fs = require('fs');
let chat = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf8');
if (!chat.includes('AnimatePresence')) {
  chat = chat.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
  fs.writeFileSync('src/screens/ChatScreen.tsx', chat, 'utf8');
}
