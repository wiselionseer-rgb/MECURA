const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {revenueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>`;

const configSection = `
            <h3 className="text-xl font-bold mt-12 mb-4">Configurações Financeiras</h3>
            <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636] max-w-md">
              <div className="text-[#8A8A9E] mb-2 font-medium">Cotação do Dólar (R$)</div>
              <div className="flex gap-4">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={exchangeRate}
                  id="exchange-rate-input"
                  className="bg-[#0A0A0F] text-white border border-[#262636] rounded-xl px-4 py-3 flex-1 focus:outline-none focus:border-mecura-neon"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('exchange-rate-input');
                    if (el) {
                      const val = parseFloat(el.value);
                      if (!isNaN(val) && val > 0) {
                        updateExchangeRate(val);
                        alert('Cotação atualizada com sucesso!');
                      }
                    }
                  }}
                  className="bg-mecura-neon text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b5ff33] transition-colors"
                >
                  Salvar
                </button>
              </div>
              <p className="text-xs text-[#8A8A9E] mt-3">
                A cotação atual é <strong>R$ {exchangeRate.toFixed(2)}</strong>. Esta cotação é usada para converter os preços dos produtos (em USD) para Reais (BRL).
              </p>
            </div>`;

code = code.replace(targetStr, targetStr + configSection);
fs.writeFileSync(path, code);
