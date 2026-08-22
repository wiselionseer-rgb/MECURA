const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldSig = `    <!-- PÁGINA DE ASSINATURA -->
    <div style="page-break-before: always; text-align: center; margin-top: 50px;">
        <p style="text-align: left; margin-bottom: 60px;">É o parecer;</p>
        
        <div style="margin: 0 auto; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Eng. Agr. \${agronomistName || 'Wilian Dalenogare Pereira'}</p>
            <p style="font-weight: bold; margin: 0;">CREA: \${agronomistCrea || '052193520-2'}</p>
            <p style="font-weight: bold; margin: 0;">Luis Eduardo Magalhães – BA 24/07/2025</p>
        </div>
        
        <div style="margin: 60px auto 0; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Paciente: [NOME DO PACIENTE]</p>
            <p style="font-weight: bold; margin: 0;">CPF: [CPF DO PACIENTE]</p>
        </div>
    </div>`;

const newSig = `    <!-- PÁGINA DE ASSINATURA -->
    <div style="page-break-inside: avoid; text-align: center; margin-top: 40px;">
        <p style="text-align: left; margin-bottom: 40px;">É o parecer;</p>
        
        <div style="margin: 0 auto; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Eng. Agr. \${agronomistName || 'Wilian Dalenogare Pereira'}</p>
            <p style="font-weight: bold; margin: 0;">CREA: \${agronomistCrea || '052193520-2'}</p>
            <p style="font-weight: bold; margin: 0;">Luis Eduardo Magalhães – BA 24/07/2025</p>
        </div>
        
        <div style="margin: 40px auto 0; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Paciente: [NOME DO PACIENTE]</p>
            <p style="font-weight: bold; margin: 0;">CPF: [CPF DO PACIENTE]</p>
        </div>
    </div>`;

code = code.replace(oldSig, newSig);

fs.writeFileSync('server.ts', code);
