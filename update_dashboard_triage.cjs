const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetJSX = `          <motion.div
            variants={itemVariants}
            className="mt-4 flex items-center justify-between bg-[#161622] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => navigate('/onboarding')}
          >`;

const newJSX = `          <motion.div
            variants={itemVariants}
            className="mt-4 flex items-center justify-between bg-[#161622] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => {
              useStore.getState().clearTriage();
              navigate('/onboarding');
            }}
          >`;

if(code.includes(targetJSX)) {
  code = code.replace(targetJSX, newJSX);
  fs.writeFileSync(path, code);
  console.log("Success updating dashboard button");
} else {
  console.log("Target JSX not found in Dashboard");
}
