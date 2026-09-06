const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldPrompt = `        DIRETRIZ DE PRESCRIÇÃO (IMPORTADOS E NACIONAIS):
        Você DEVE sugerir DUAS frentes de tratamento para o médico escolher, cobrindo opções Importadas e Nacionais.
        1. Opção de Importados: Utilize EXCLUSIVAMENTE os medicamentos do catálogo oficial abaixo.
        2. Opção de Associações Nacionais: Sugira formulações de associações brasileiras (ex: Óleo Integral THC/CBD 100mg/ml, Pomada Canábica, Gomas Terapêuticas, Flores in natura, ou Extrações e Concentrados), adequadas à fisiopatologia do paciente. Lembre-se que as Extrações e Concentrados (como Crumble, Live Resin, Diamonds) devem aparecer nas recomendações de acordo com cada paciente, igual aos outros medicamentos, principalmente para casos severos ou pacientes experientes.

        REGRA CLÍNICA CRÍTICA (NÃO DUPLICAR MEDICAMENTOS SIMILARES):
        - NUNCA sugira dois óleos de CBD ou dois produtos com o mesmo princípio ativo e a mesma via sublingual para o mesmo paciente.
        - Em cada categoria (Importados ou Nacionais), sugira no máximo 1 ÓLEO PRINCIPAL de uso contínuo (ex: CBD ou THC/CBD) e, apenas se houver real justificativa clínica, 1 item de via ou forma complementar diferente (ex: Pomada tópica para dor localizada, Gomas mastigáveis noturnas para insônia, Flores in natura ou Extratos Concentrados para resgate de crises).`;

const newPrompt = `        DIRETRIZ DE PRESCRIÇÃO (IMPORTADOS E NACIONAIS):
        Você DEVE sugerir DUAS frentes de tratamento INDEPENDENTES E COMPLETAS para o médico escolher.
        Se a condição do paciente exigir 3 produtos (ex: um óleo, uma goma e uma flor para resgate), você DEVE prescrever os 3 produtos equivalentes na via IMPORTADA e os mesmos 3 produtos equivalentes na via NACIONAL. O objetivo é que o paciente escolha fazer o tratamento INTEIRO apenas com importados, ou INTEIRO apenas com nacionais.

        REGRA CLÍNICA CRÍTICA:
        1. Opção de Importados: Crie um plano de tratamento COMPLETO, utilizando EXCLUSIVAMENTE os medicamentos do catálogo oficial abaixo. Inclua o óleo principal e todos os complementos necessários (resgate, tópico, gomas) APENAS do catálogo de importados.
        2. Opção de Associações Nacionais: Crie um plano de tratamento COMPLETO e equivalente, usando APENAS formulações genéricas de associações brasileiras (ex: Óleo Integral, Flores in natura, Gomas Nacionais, Extrações).
        3. Quantidade Correspondente: O número de itens na Opção Importada deve, em regra, refletir o número de itens na Opção Nacional. Não sugira apenas 1 importado e 3 nacionais. Mantenha a equivalência do tratamento.
        - Em cada categoria (Importados ou Nacionais), sugira no máximo 1 ÓLEO PRINCIPAL de uso contínuo e complementos conforme a necessidade clínica.`;

code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync(path, code);
