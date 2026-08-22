const fs = require('fs');

let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const targetStr = `              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">                <div className="text-[#8A8A9E] mb-2">Pacientes</div>                <div className="text-3xl font-bold text-white">{patients.length}</div>              </div>            </div>          </div>        )}`;

const newStr = `              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">                <div className="text-[#8A8A9E] mb-2">Pacientes</div>                <div className="text-3xl font-bold text-white">{patients.length}</div>              </div>            </div>            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro)</h3>            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">                <div className="text-[#8A8A9E] mb-2">Receita Fila (R$ 50)</div>                <div className="text-3xl font-bold text-mecura-neon">                  {(queueCount * 50).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}                </div>              </div>              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">                <div className="text-[#8A8A9E] mb-2">Receita Premium (R$ 250)</div>                <div className="text-3xl font-bold text-purple-400">                  {(allAppointments.length * 250).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}                </div>              </div>              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>                <div className="text-3xl font-bold text-white">                  {((queueCount * 50) + (allAppointments.length * 250)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}                </div>              </div>            </div>          </div>        )}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
  console.log("Success");
} else {
  console.log("Target string not found!");
}
