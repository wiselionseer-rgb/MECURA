const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /ESTRUTURA OBRIGATÓRIA DO LAUDO[\s\S]*?Crie uma estrutura lógica que faça os cálculos com base na dosagem real da receita médica fornecida.\`;/;

const newPrompt = `ESTRUTURA OBRIGATÓRIA DO LAUDO (Formato HTML - IDÊNTICO AO DOCUMENTO OFICIAL):
Você deve gerar APENAS código HTML válido (sem crases HTML no início ou no fim, apenas as tags).
O HTML deve ter a seguinte estrutura exata, com formatação para impressão profissional (textos justificados, fonte Arial, etc):

<div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; text-align: justify; padding: 20px;" id="agronomic-report-content">
    <div style="text-align: center; font-weight: bold; margin-bottom: 20px; line-height: 1.2;">
        <p style="margin: 0;">Auto cultivo para finalidade medicinal</p>
        <p style="margin: 0;">Parecer Técnico</p>
        <p style="margin: 0;">Indicações técnicas para cultivo pessoal com finalidade medicinal</p>
        <p style="margin: 0;">Paciente: [NOME DO PACIENTE EXTRAÍDO DO LAUDO]</p>
        <p style="margin: 0;">CPF PACIENTE: [CPF EXTRAÍDO DO LAUDO]</p>
        <p style="margin: 0;">Consultor e Eng. Agr: \${agronomistName || 'Wilian Dalenogare Pereira'}</p>
        <p style="margin: 0;">Indicações técnicas para cultivo pessoal de Cannabis sativa L. com finalidade medicinal.</p>
    </div>

    <p style="font-weight: bold; margin-bottom: 10px;">Resumo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A ANVISA definiu, por meio da Resolução da Diretoria Colegiada (RDC)... [Explique a base legal RDC 335/2020 e 570/2021, GACP, conforme solicitado anteriormente, em 1 ou 2 parágrafos justificados].</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Dimensionamento do Cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Apresente os custos de farmácia e a análise dos produtos da receita, calculando a quantidade de frascos. Faça as contas detalhadas da quantidade de mg de canabinoides diária, mensal e anual, necessidade de flores secas anuais, considerando extração de 80% e perdas de 30%].</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Temos a seguinte aritmética:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Explique a matemática: ex. 100g de flores secas com 10% CBD/THC geram 10g de extrato... Detalhe até o peso total de flores secas e molhadas necessárias].</p>
    
    <p style="text-indent: 40px; margin-bottom: 15px;">[Explique o rendimento por planta e calcule o número total de plantas e sementes (margem de segurança 30%)].</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Designer de cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Sugira a divisão em ciclos e opções de plantas mãe].</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Cultivares indicados:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Recomende genéticas (CBD ou THC conforme receita)].</p>

    <p style="margin-bottom: 30px;"><span style="font-weight: bold;">OBSERVAÇÃO:</span> O Laudo técnico é baseado nas informações passadas pelo médico ao paciente, estritamente para a quantificação de cultivo de Cannabis medicinal. O profissional responsável pelo laudo técnico para quantificação do cultivo medicinal não se responsabiliza pelo uso indevido ou incorreto do laudo técnico.</p>
    
    <!-- PÁGINA DE ASSINATURA -->
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
    </div>
</div>

GERAÇÃO:
Gere APENAS o código HTML validado, substituindo os dados entre colchetes [ ] pelos dados extraídos da receita médica e laudo médico. Realize os cálculos de forma lógica e completa na parte de dimensionamento. Não utilize a formatação markdown \`\`\`html, apenas escreva o código HTML diretamente.\`;`;

code = code.replace(regex, newPrompt);
fs.writeFileSync('server.ts', code);
