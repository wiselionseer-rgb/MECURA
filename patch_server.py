with open("server.ts", "r") as f:
    code = f.read()

old_block = """  app.post("/api/admin-agronomic-ai", async (req, res) => {
    const { medicalReportText, prescriptionText, medicalReportFile, prescriptionFile, agronomistName, agronomistCrea } = req.body;"""

new_block = """  app.post("/api/admin-agronomic-ai", async (req, res) => {
    const { medicalReportText, prescriptionText, medicalReportFile, prescriptionFile, agronomistName, agronomistCrea, targetPlants } = req.body;"""

code = code.replace(old_block, new_block)

old_prompt_instructions = """ATENÇÃO AOS CÁLCULOS (Siga estritamente):
1. Extraia o total de mg/dia de todos os óleos/flores prescritos. (Se a receita enviada for a do exemplo, o valor é 5000mg/dia).
2. Mensal = mg/dia * 30.
3. Anual = mg/dia * 365 (Ex: se 5000mg/dia, anual é 1.825.000mg ou 1.825g).
4. Peso de flor seca base: assuma rendimento de extração (se aplicável) e teor. (No modelo: 10% de teor, ou seja, 1.825g canabinoides = 18.250g de flores secas, que equivale a 18.250kg).
5. Margem de perda de 30% no cultivo. Multiplique o peso de flor seca por 1.30 (ex: 18.250 * 1.30 = 23.725g ou 23.795g para replicar a aritmética do autor).
6. Plantas totais: Divida o peso final com margem por 150g (rendimento por planta). (Ex: 23795 / 150 = 158.6 -> 158 plantas).
7. Sementes: Total de plantas * 1.30 (Margem de germinação de 30%). (Ex: 158 * 1.30 = 205.4 -> 206 sementes).
8. Ciclos: 3 colheitas por ano. Plantas por ciclo = Total de Plantas / 3 (Ex: 158 / 3 = 52.6, arredondado para 53)."""

new_prompt_instructions = """ATENÇÃO AOS CÁLCULOS (Siga estritamente):
${targetPlants ? `O USUÁRIO DEFINIU UMA QUANTIDADE EXATA DE PLANTAS A SEREM RECOMENDADAS: ${targetPlants} plantas.
Você DEVE ajustar TODOS os seus cálculos para que o resultado final "Plantas totais" seja EXATAMENTE ${targetPlants}. Refaça a matemática de trás para frente se necessário (ajustando a mg/dia ou rendimento/teor para bater essa meta perfeitamente).` : ''}

1. Extraia o total de mg/dia de todos os óleos/flores prescritos. (Se a receita enviada for a do exemplo, o valor é 5000mg/dia). ${targetPlants ? '*(Ajuste isso ou o rendimento para bater o total de plantas desejado)*' : ''}
2. Mensal = mg/dia * 30.
3. Anual = mg/dia * 365 (Ex: se 5000mg/dia, anual é 1.825.000mg ou 1.825g).
4. Peso de flor seca base: assuma rendimento de extração (se aplicável) e teor. (No modelo: 10% de teor, ou seja, 1.825g canabinoides = 18.250g de flores secas, que equivale a 18.250kg).
5. Margem de perda de 30% no cultivo. Multiplique o peso de flor seca por 1.30.
6. Plantas totais: Divida o peso final com margem por 150g (rendimento por planta). ${targetPlants ? `(OBRIGATÓRIO RESULTAR EM ${targetPlants} PLANTAS)` : ''}
7. Sementes: Total de plantas * 1.30 (Margem de germinação de 30%). (Ex: 158 * 1.30 = 205.4 -> 206 sementes).
8. Ciclos: 3 colheitas por ano. Plantas por ciclo = Total de Plantas / 3."""

code = code.replace(old_prompt_instructions, new_prompt_instructions)

with open("server.ts", "w") as f:
    f.write(code)
print("Patched server.ts!")
