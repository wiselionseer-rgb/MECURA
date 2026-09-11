const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetAPI = `                      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
                      const data = await res.json();
                      const rate = parseFloat(data.USDBRL.ask);`;

const newAPI = `                      // Usando API alternativa confiável sem limite tão restrito
                      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                      const data = await res.json();
                      const rate = data.rates.BRL;`;

if(code.includes(targetAPI)) {
  code = code.replace(targetAPI, newAPI);
  fs.writeFileSync(path, code);
  console.log("Success updating API call");
} else {
  console.log("targetAPI not found");
}
