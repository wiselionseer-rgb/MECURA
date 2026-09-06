const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `                <button
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
                </button>`;

const newButtons = `                <button
                  onClick={() => {
                    const el = document.getElementById('exchange-rate-input') as HTMLInputElement;
                    if (el) {
                      const val = parseFloat(el.value);
                      if (!isNaN(val) && val > 0) {
                        updateExchangeRate(val);
                        alert('Cotação salva com sucesso!');
                      }
                    }
                  }}
                  className="bg-mecura-neon text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b5ff33] transition-colors whitespace-nowrap"
                >
                  Salvar
                </button>
              </div>
              
              <div className="mt-4 flex">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
                      const data = await res.json();
                      const rate = parseFloat(data.USDBRL.ask);
                      if (!isNaN(rate)) {
                        const el = document.getElementById('exchange-rate-input') as HTMLInputElement;
                        if (el) el.value = rate.toFixed(2);
                        updateExchangeRate(rate);
                        alert('Cotação atualizada em tempo real via API comercial: R$ ' + rate.toFixed(2));
                      }
                    } catch (e) {
                      alert('Erro ao buscar cotação em tempo real. Tente novamente.');
                    }
                  }}
                  className="w-full bg-[#1A2E05] text-mecura-neon border border-mecura-neon/50 font-bold px-6 py-3 rounded-xl hover:bg-mecura-neon/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Sincronizar em Tempo Real (Comercial)
                </button>`;

// Ensure we don't duplicate imports if any are missing. Let's make sure RefreshCw is imported.
// It is likely imported from lucide-react. We will check it.
code = code.replace(targetStr, newButtons);
fs.writeFileSync(path, code);
