const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `                  Salvar
                </button>
              </div>
              <p className="text-xs text-[#8A8A9E] mt-3">
                A cotação atual é <strong>R$ {exchangeRate.toFixed(2)}</strong>. Esta cotação é usada para converter os preços dos produtos (em USD) para Reais (BRL).
              </p>
            </div>`;

const newButtons = `                  Salvar
                </button>
              </div>

              <div className="mt-4 flex">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('https://open.er-api.com/v6/latest/USD');
                      const data = await res.json();
                      const rate = parseFloat(data.rates.BRL);
                      if (!isNaN(rate)) {
                        const el = document.getElementById('exchange-rate-input');
                        if (el) el.value = rate.toFixed(2);
                        updateExchangeRate(rate);
                        alert('Cotação atualizada em tempo real (Dólar Comercial): R$ ' + rate.toFixed(2));
                      }
                    } catch (e) {
                      alert('Erro ao buscar cotação em tempo real. Tente novamente.');
                    }
                  }}
                  className="w-full bg-[#1A2E05] text-mecura-neon border border-mecura-neon/50 font-bold px-6 py-3 rounded-xl hover:bg-mecura-neon/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Sincronizar Dólar Comercial
                </button>
              </div>

              <p className="text-xs text-[#8A8A9E] mt-4">
                A cotação atual é <strong>R$ {exchangeRate.toFixed(2)}</strong>. (Pode variar ligeiramente do site C6 devido a spread/turismo).
              </p>
            </div>`;

code = code.replace(targetStr, newButtons);

if (!code.includes('RefreshCw')) {
  code = code.replace('import { ', 'import { RefreshCw, ');
}

fs.writeFileSync(path, code);
