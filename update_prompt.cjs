const fs = require('fs');

const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const replacement = `        - NUNCA sugira dois óleos de CBD ou dois produtos com o mesmo princípio ativo e a mesma via sublingual para o mesmo paciente.
        - Em cada categoria (Importados ou Nacionais), sugira no máximo 1 ÓLEO PRINCIPAL de uso contínuo (ex: CBD ou THC/CBD) e, apenas se houver real justificativa clínica, 1 item de via ou forma complementar diferente (ex: Pomada tópica para dor localizada, Gomas mastigáveis noturnas para insônia, Flores in natura ou Extratos Concentrados para resgate de crises).

        DIRETRIZ DE ESCOLHA DE CEPAS/TERPENOS PARA CONCENTRADOS INALATÓRIOS (VAPORIZAÇÃO):
        Se o paciente apresentar dores agudas, crises crônicas de insônia ou necessidade de resgate rápido, justifique a prescrição de Extratos Concentrados (Stirred, Granulated, Dried, Crystalized). Você DEVE ESPECIFICAR a Cepa (Strain) ideal com base nos terpenos:
        - LC (Mirceno, Cariofileno, Limoneno) ou BM (Cariofileno, Mirceno): Para RELAXAMENTO PROFUNDO, SEDATIVO E INSÔNIA.
        - TW (Terpinoleno, Mirceno, Pineno) ou PR (Limoneno, Cariofileno): Para ESTIMULANTE, FOCO, TDAH e DEPRESSÃO/FADIGA.
        - ICC (Mirceno, Limoneno, Cariofileno) ou AH (Cariofileno, Limoneno, Linalol): Para ANSIEDADE, INFLAMAÇÃO E REVIGORANTE.
        - DS (Mirceno, Cariofileno): Para RELAXAMENTO E REVIGORANTE MUSCULAR.

        CATÁLOGO OFICIAL DISPONÍVEL (Para a Opção Importada):
        \${productCategories.map(cat => \`Categoria: \${cat.title}\\n\${cat.products.map(p => \`- \${p.name} (\${p.type}): \${p.description || ''}\`).join('\\n')}\`).join('\\n\\n')}`;

code = code.replace(
`        - NUNCA sugira dois óleos de CBD ou dois produtos com o mesmo princípio ativo e a mesma via sublingual para o mesmo paciente.
        - Em cada categoria (Importados ou Nacionais), sugira no máximo 1 ÓLEO PRINCIPAL de uso contínuo (ex: CBD ou THC/CBD) e, apenas se houver real justificativa clínica, 1 item de via ou forma complementar diferente (ex: Pomada tópica para dor localizada, Gomas mastigáveis noturnas para insônia, ou Flores in natura para resgate de crises).

        CATÁLOGO OFICIAL DISPONÍVEL (Para a Opção Importada):
        \${productCategories.map(cat => \`Categoria: \${cat.title}\\n\${cat.products.map(p => \`- \${p.name} (\${p.type})\`).join('\\n')}\`).join('\\n\\n')}`,
replacement
);

fs.writeFileSync(path, code);
