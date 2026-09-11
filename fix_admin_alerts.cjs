const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix Salvar button alert
const targetSalvar = `                        updateExchangeRate(val);
                        alert('Cotação salva com sucesso!');`;
const newSalvar = `                        updateExchangeRate(val);
                        setSupportToastMessage('Cotação salva com sucesso!');`;
if(code.includes(targetSalvar)) {
  code = code.replace(targetSalvar, newSalvar);
}

// Fix Sincronizar button alert
const targetSync1 = `                        updateExchangeRate(rate);
                        alert('Cotação atualizada em tempo real via API comercial: R$ ' + rate.toFixed(2));`;
const newSync1 = `                        updateExchangeRate(rate);
                        setSupportToastMessage('Cotação atualizada: R$ ' + rate.toFixed(2));`;
if(code.includes(targetSync1)) {
  code = code.replace(targetSync1, newSync1);
}

const targetSyncError = `                    } catch (e) {
                      alert('Erro ao buscar cotação em tempo real. Tente novamente.');
                    }`;
const newSyncError = `                    } catch (e) {
                      setSupportToastMessage('Erro ao buscar cotação. Tente novamente.');
                    }`;
if(code.includes(targetSyncError)) {
  code = code.replace(targetSyncError, newSyncError);
}

fs.writeFileSync(path, code);
console.log("Success replacing alerts with toasts");
