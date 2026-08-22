const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const startIndex = code.indexOf('const systemPrompt = `Você é um Agrônomo');
const endIndex = code.indexOf('const contents = [systemPrompt];');

if (startIndex > -1 && endIndex > -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);

    const fixedPrompt = `const systemPrompt = \`Você é um assistente que gera laudos agronômicos de autocultivo medicinal para instrução de processos de HC. Ao calcular a demanda de cultivo, siga ESTRITAMENTE esta ordem e não pule etapas:

1. Extraia da prescrição médica: cannabinoide(s), dose diária/mensal EXATA como prescrita, forma (flor inalada vs extrato/óleo), médico, CRM/UF, CID(s).
2. Calcule a necessidade anual (mg) multiplicando a dose diária por 365 — nunca recalcule a partir do valor mensal já arredondado.
3. Converta para peso de flor seca usando o teor do cultivar e, se aplicável (extrato/óleo), a eficiência de extração (declare o valor usado, padrão 70-80%). Fórmula para óleo: anual_mg / (teor * eficiencia). Fórmula para flor: anual_mg / teor.
4. Aplique margem de segurança agronômica (25-30%), declarando a fórmula usada (divisão ou multiplicação) e mantendo-a fixa no documento.
5. Calcule número de plantas usando um rendimento/planta declarado explicitamente (justificado pelo nível de experiência do cultivador). (peso_flor_seca_com_margem_g / rendimento_planta_g)
6. Calcule sementes/mudas com margem de germinação (20-30%).
7. Defina ciclos/ano e plantas/ciclo (ex: 120 dias de ciclo = 3 ciclos por ano).
8. OBRIGATÓRIO: verifique se plantas_por_ciclo × ciclos_por_ano >= número de plantas calculado no passo 5. Se não bater, ajuste até bater, e mostre essa conta de fechamento explicitamente no laudo final.
9. Nunca reapresente o mesmo dado numérico com valores diferentes em partes distintas do texto.
10. Liste todas as premissas numéricas usadas (teor, eficiência, margens, rendimento/planta, duração de ciclo) em uma seção separada e visível.

ESTRUTURA E METODOLOGIA OBRIGATÓRIA DO LAUDO (Formato HTML):
Você deve gerar APENAS código HTML válido. NÃO UTILIZE markdown. NÃO USE as crases de markdown.
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
    <p style="text-indent: 40px; margin-bottom: 15px;">A ANVISA definiu, por meio da Resolução da Diretoria Colegiada (RDC)... [Explique a base legal RDC 335/2020 e 570/2021, GACP, em 1 ou 2 parágrafos justificados]. O paciente está diagnosticado com [CID(s) EXTRAÍDO(S)], conforme laudo emitido pelo(a) Dr(a) [NOME DO MÉDICO], [CRM/UF].</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Dimensionamento do Cultivo e Metodologia de Cálculo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Apresente os custos de farmácia/importação para embasar a necessidade do autocultivo].</p>
    
    <p style="font-weight: bold; margin-bottom: 10px;">Metodologia e Premissas Numéricas Utilizadas:</p>
    <ul style="margin-left: 40px; margin-bottom: 15px;">
        <li><strong>Teor do cultivar:</strong> [Ex: 10% de CBD/THC].</li>
        <li><strong>Eficiência de extração:</strong> [Ex: 80% (0.80) caso seja prescrito extrato/óleo].</li>
        <li><strong>Margem de perdas (agronômica):</strong> [Ex: 30%, calculada dividindo por 0.70 ou multiplicando por 1.30, mantenha fixo].</li>
        <li><strong>Rendimento por planta:</strong> [Ex: 150g seca/planta para cultivador indoor].</li>
        <li><strong>Duração do ciclo:</strong> [Ex: 120 dias, resultando em 3 ciclos por ano].</li>
        <li><strong>Margem de germinação:</strong> [Ex: 30%].</li>
    </ul>

    <p style="font-weight: bold; margin-bottom: 10px;">Cálculo de Necessidade:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">
        A prescrição médica indica [mg/dia] de [CANNABINOIDE]. A necessidade mensal é [mg/dia * 30] mg e a anual é [mg/dia * 365] mg.<br>
        Conversão para flor seca: Peso flor seca = [Anual] / ([teor] * [eficiência]). Resultado: [X g].<br>
        Com a margem de segurança, o peso de flor seca necessário sobe para: [X g com margem].<br>
        Considerando um rendimento de [Y g/planta], exige a colheita de [Z plantas] totais por ano (arredondado para cima).<br>
        Com a margem de germinação, são necessárias [W sementes/mudas].
    </p>

    <p style="font-weight: bold; margin-bottom: 10px;">Designer de cultivo (Validação):</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">
        O ciclo tem duração de [120 dias], permitindo [3 ciclos por ano]. Para atingir a meta de [Z plantas] anuais, serão cultivadas [Plantas por ciclo] plantas por ciclo.<br>
        <strong>Checagem:</strong> [Plantas por ciclo] plantas/ciclo × [3 ciclos/ano] = [Total projetado] plantas/ano. (Este total atende a necessidade de [Z plantas] anuais).
    </p>

    <p style="font-weight: bold; margin-bottom: 10px;">Cultivares indicados:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[Recomende genéticas adequadas aos canabinoides prescritos].</p>

    <p style="margin-bottom: 30px;"><span style="font-weight: bold;">OBSERVAÇÃO:</span> O Laudo técnico é baseado nas informações passadas pelo médico ao paciente, estritamente para a quantificação de cultivo de Cannabis medicinal. O profissional responsável pelo laudo técnico para quantificação do cultivo medicinal não se responsabiliza pelo uso indevido ou incorreto do laudo técnico.</p>
    
    <!-- PÁGINA DE ASSINATURA -->
    <div style="page-break-inside: avoid; text-align: center; margin-top: 40px;">
        <p style="text-align: left; margin-bottom: 40px;">É o parecer;</p>
        
        <div style="margin: 0 auto; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Eng. Agr. \${agronomistName || 'Wilian Dalenogare Pereira'}</p>
            <p style="font-weight: bold; margin: 0;">CREA: \${agronomistCrea || '052193520-2'}</p>
            <p style="font-weight: bold; margin: 0;">Luis Eduardo Magalhães – BA [DATA ATUAL]</p>
        </div>
        
        <div style="margin: 40px auto 0; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Paciente: [NOME DO PACIENTE]</p>
            <p style="font-weight: bold; margin: 0;">CPF: [CPF DO PACIENTE]</p>
        </div>
    </div>
</div>\`;
`;

    fs.writeFileSync('server.ts', before + fixedPrompt + after);
    console.log("Fixed!");
}
