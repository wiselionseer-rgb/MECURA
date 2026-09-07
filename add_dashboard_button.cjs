const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetJSX = `          </div>
          
          {/* HIGH IMPACT PREMIUM BANNER */}`;

const newJSX = `          </div>
          
          {/* Botão de Nova Triagem (Para quem já é paciente e quer nova consulta) */}
          <motion.div
            variants={itemVariants}
            className="mt-4 flex items-center justify-between bg-[#161622] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => navigate('/onboarding')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Nova Triagem Clínica</h4>
                <p className="text-xs text-[#8A8A9E]">Iniciar avaliação para uma nova queixa</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8A8A9E]" />
          </motion.div>
          
          {/* HIGH IMPACT PREMIUM BANNER */}`;

if(code.includes(targetJSX)) {
  code = code.replace(targetJSX, newJSX);
  fs.writeFileSync(path, code);
  console.log("Success adding button");
} else {
  console.log("Target JSX not found in Dashboard");
}
