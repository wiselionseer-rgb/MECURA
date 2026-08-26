import re

with open("src/components/AdvisorChatWidget.tsx", "r") as f:
    code = f.read()

old_block = """      if (lowerText.includes("funciona a compra") || text === "Como funciona a compra e o envio dos medicamentos") {
        botResponse.text = "Tudo é feito dentro do nosso ecossistema. Após a receita, você escolhe o produto na nossa Farmácia, paga em Reais e nós cuidamos de toda a logística internacional até a sua porta.";
      } else if (lowerText.includes("doenças sao tratadas") || text === "Quais doenças sao tratadas com cannabis") {
        botResponse.text = "A Cannabis auxilia em mais de 50 condições, incluindo: Ansiedade, Insônia, Dor Crônica, Parkinson, Epilepsia, Autismo (TEA), TDAH e Fibromialgia. Nossos especialistas avaliam seu caso individualmente.";
      } else if (lowerText.includes("procedencia") || lowerText.includes("da onde vem") || text === "Da onde vem o remedio e qual a procedencia") {
        botResponse.text = "Trabalhamos apenas com laboratórios certificados (GMP) dos EUA, Uruguai e Colômbia. Todo lote possui certificado de análise (COA) garantindo pureza, concentração e ausência de metais pesados.";
      } else if (lowerText.includes("banco de sementes") || text === "Acesso ao maior banco de sementes internacionais") {
        botResponse.text = "Temos parceria com os maiores bancos de sementes internacionais (EUA e Europa). Garantimos genética de ponta e procedência para pacientes com Habeas Corpus ou autorização de cultivo.";
      } else if (lowerText.includes("produzir seu roprio") || text === "Como produzir seu roprio medicamento em casa legalizados") {
        botResponse.text = "Produzir seu próprio medicamento é o caminho para a independência. A Mecura oferece suporte jurídico e técnico para que você possa cultivar de forma 100% legalizada através de vias judiciais.";
      } else if (lowerText.includes("curso de cultivo") || text === "Curso de Cultivo do inciante ao Profissional") {
        botResponse.text = "Nosso curso vai do Iniciante ao Profissional. Você aprende desde a germinação até a extração do óleo medicinal com pureza máxima. Tudo acompanhado por nossos especialistas.";
      } else if (lowerText.includes("funciona") || text === "Como funciona?") {
        botResponse.text = "A jornada na Mecura é simples:\\n1) Agende sua consulta online\\n2) Passe com o médico especialista\\n3) Nós cuidamos da autorização da Anvisa\\n4) Compre o produto direto no App e receba em casa!\\nFácil, né?";
      } else if (lowerText.includes("valor") || lowerText.includes("custo") || text === "Valores e Custos") {
        botResponse.text = "A consulta (com direito a retorno) custa R$ 250,00. Já os valores dos produtos variam bastante dependendo da sua prescrição, mas começam a partir de R$ 300,00 por frasco importado.";
      } else if (lowerText.includes("legal") || lowerText.includes("brasil") || text === "É legal no Brasil?") {
        botResponse.text = "Sim! É 100% legalizado. O tratamento segue a regulação RDC 660 da Anvisa, que autoriza a importação para uso pessoal e medicinal desde que o paciente tenha prescrição médica.";
      } else if (lowerText.includes("quem somos") || text === "Quem somos nós?") {
        botResponse.text = "A Mecura é o maior ecossistema de saúde canábica do país. Unimos médicos, advogados e tecnologia para garantir que você tenha o melhor tratamento com segurança, legalidade e suporte humano.";
      } else if (lowerText.includes("assessor") || lowerText.includes("humano") || text === "Falar com um assessor agora") {"""

new_block = """      if (lowerText.includes("funciona a compra") || text === "Como funciona a compra e envio?") {
        botResponse.text = "Tudo é feito dentro do nosso ecossistema. Após a receita, você escolhe o produto na nossa Farmácia, paga em Reais (Pix ou Cartão) e nós cuidamos de toda a logística internacional até a sua porta.";
      } else if (lowerText.includes("doenças") || text === "Quais doenças são tratadas?") {
        botResponse.text = "A Cannabis auxilia em mais de 50 condições, incluindo: Ansiedade, Insônia, Dor Crônica, Parkinson, Epilepsia, Autismo (TEA), TDAH e Fibromialgia. Nossos especialistas avaliam seu caso individualmente.";
      } else if (lowerText.includes("procedência") || lowerText.includes("da onde vêm") || lowerText.includes("onde vem") || text === "Da onde vêm os medicamentos?") {
        botResponse.text = "Trabalhamos apenas com laboratórios certificados (GMP) dos EUA, Uruguai e Colômbia. Todo lote possui certificado de análise (COA) garantindo pureza, concentração e ausência de metais pesados.";
      } else if (lowerText.includes("cultivar") || lowerText.includes("produzir") || text === "Como cultivar e produzir em casa?") {
        botResponse.text = "Possuímos cursos completos desde o iniciante ao avançado, fornecemos parceria com os maiores bancos de sementes internacionais (EUA e Europa), e auxiliamos no processo de Habeas Corpus para você cultivar de forma 100% legal.";
      } else if (lowerText.includes("como funciona")) {
        botResponse.text = "A jornada na Mecura é simples:\\n1) Agende sua consulta online\\n2) Passe com o médico especialista\\n3) Nós cuidamos da autorização da Anvisa\\n4) Compre o produto direto no App e receba em casa!";
      } else if (lowerText.includes("pagamento") || text === "Problemas no pagamento") {
        botResponse.text = "Sinto muito que você esteja tendo problemas com o pagamento. Se o seu Pix não foi compensado ou se ocorreu algum erro na finalização, nossa equipe financeira pode verificar imediatamente para você. Deseja falar com nosso suporte?";
        botResponse.options = ["Falar com suporte humano", "Voltar ao início"];
      } else if (lowerText.includes("valor") || lowerText.includes("custo") || text === "Valores e Custos") {
        botResponse.text = "A consulta (com direito a retorno) custa R$ 250,00 (ou R$ 49,90 no plano essencial). Já os valores dos produtos variam dependendo da prescrição, começando a partir de R$ 300,00 por frasco importado.";
      } else if (lowerText.includes("legal") || lowerText.includes("brasil") || text === "É legalizado no Brasil?") {
        botResponse.text = "Sim! É 100% legalizado. O tratamento segue a regulação RDC 660 da Anvisa, que autoriza a importação para uso pessoal e medicinal desde que o paciente tenha prescrição médica.";
      } else if (lowerText.includes("quem somos") || text === "Quem somos nós?") {
        botResponse.text = "A Mecura é o maior ecossistema de saúde canábica do país. Unimos médicos, advogados e tecnologia para garantir que você tenha o melhor tratamento com segurança, legalidade e suporte humano.";
      } else if (lowerText.includes("assessor") || lowerText.includes("humano") || lowerText.includes("suporte") || text === "Falar com suporte humano") {"""

code = code.replace(old_block, new_block)

with open("src/components/AdvisorChatWidget.tsx", "w") as f:
    f.write(code)
