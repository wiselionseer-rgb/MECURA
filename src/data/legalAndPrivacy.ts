/**
 * Instituto Mecura Ltda - Informações Institucionais, Parecer Jurídico de Resguardo,
 * Política de Privacidade (LGPD) e Termos de Uso.
 * 
 * Baseado no Parecer Jurídico emitido pelo Dr. Max Warner Santos Souza (OAB/MG 154.052)
 * para o Instituto Mecura Ltda.
 */

export interface InstitutionalData {
  companyName: string;
  tradingName: string;
  cnpj: string;
  lawyerName: string;
  lawyerOab: string;
  lawyerRole: string;
  dpoName: string;
  dpoEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  website: string;
  address: string;
  lastUpdated: string;
}

export const INSTITUTIONAL_INFO: InstitutionalData = {
  companyName: 'Instituto Mecura Ltda',
  tradingName: 'Instituto Mecura - Saúde Integrativa & Canabinoide',
  cnpj: '69.202.927/0001-19',
  lawyerName: 'Dr. Max Warner Santos Souza',
  lawyerOab: 'OAB/MG 154.052',
  lawyerRole: 'Consultor Jurídico Especialista em Direito Canábico & Salvo-Conduto',
  dpoName: 'Comitê de Privacidade & Proteção de Dados (DPO)',
  dpoEmail: 'privacidade@institutomecura.com',
  supportPhone: '+55 (66) 99628-0883',
  supportWhatsapp: '5566996280883',
  supportEmail: 'contato@institutomecura.com',
  website: 'https://instmecura.sementesagrada.com',
  address: 'Brasil • Atendimento e Telemedicina em Âmbito Nacional',
  lastUpdated: 'Setembro de 2026'
};

export interface LegalSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  content: string[];
  articles?: { law: string; text: string }[];
}

export const LEGAL_OPINION_DATA = {
  title: 'Parecer Jurídico de Resguardo & Conformidade Regulatória',
  author: 'Dr. Max Warner Santos Souza — OAB/MG 154.052',
  target: 'Instituto Mecura Ltda e Pacientes Acolhidos',
  summary: `O presente parecer técnico-jurídico estabelece as diretrizes de legalidade, segurança jurídica e resguardo institucional para a atuação do Instituto Mecura Ltda, bem como para os pacientes que realizam tratamento de saúde com produtos à base de Cannabis medicinal e os que optam pelo autocultivo com fins estritamente terapêuticos.`,
  pillars: [
    {
      id: 'direito-saude',
      title: '1. Fundamentação Constitucional: Direito à Saúde e Dignidade',
      badge: 'CF/88 Art. 196 e Art. 5º',
      summary: 'A saúde é direito de todos e dever do Estado. O acesso a tratamentos eficientes decorre do princípio supremo da dignidade humana.',
      details: [
        'A Constituição Federal de 1988 consagra, em seu Artigo 196, que "a saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas que visem à redução do risco de doença e de outros agravos e ao acesso universal e igualitário às ações e serviços para sua promoção, proteção e recuperação".',
        'O Artigo 5º, caput, da Carta Magna protege de modo inviolável o direito à vida, à liberdade e à segurança pessoal.',
        'O Instituto Mecura atua como ponte e suporte viabilizador desse direito fundamental, assegurando que o paciente com indicação clínica comprovada encontre meios dignos, seguros e respaldados pela ciência para obter e manter seu tratamento terapêutico continuado.'
      ]
    },
    {
      id: 'liberdade-cientifica',
      title: '2. Liberdade de Informação, Ensino e Expressão Científica',
      badge: 'CF/88 Art. 5º, IV/IX e Art. 206',
      summary: 'É plena a liberdade de difusão de conhecimentos científicos, catalogação botânica e instruções agronômicas.',
      details: [
        'Conforme o Artigo 5º, incisos IV e IX da Constituição Federal, são livres a manifestação do pensamento e a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença.',
        'Em complemento, o Artigo 206, incisos II e III, assegura a liberdade de aprender, ensinar, pesquisar e divulgar o pensamento, a arte e o saber.',
        'Portanto, o fornecimento de guias educativos, laudos agronômicos de dimensionamento de cultivo, catálogos técnicos de canabinoides (CBD, THC, CBG, CBN, etc.) e informações botânicas integra o exercício legítimo da liberdade científica, educacional e comunicacional garantida na Constituição.'
      ]
    },
    {
      id: 'jurisprudencia-stj',
      title: '3. Jurisprudência Consolidada do STJ: Autocultivo Medicinal e Habeas Corpus',
      badge: 'STJ REsp 1.972.092/SP',
      summary: 'Precedentes das 5ª e 6ª Turmas do STJ reconhecem a atipicidade penal do cultivo pessoal exclusivamente medicinal amparado por prescrição e laudos técnicos.',
      details: [
        'O Superior Tribunal de Justiça (STJ), órgão guardião da legislação federal, através de decisões históricas de sua Quinta e Sexta Turmas (destacando-se o Recurso Especial nº 1.972.092/SP, Rel. Ministro Rogério Schietti Cruz, e RHC 147.119/SP, Rel. Ministro Sebastião Reis Júnior), pacificou o entendimento de que a conduta de cultivar Cannabis sativa exclusivamente para fins medicinais próprios é desprovida de tipicidade penal.',
        'O STJ assentou categoricamente que o paciente que planta em pequena escala para extrair o óleo medicinal de que necessita não pratica o crime de tráfico de drogas (Art. 33 da Lei 11.343/2006), tampouco mero uso recreativo (Art. 28).',
        'Para concessão de Salvo-Conduto / Habeas Corpus preventivo contra constrangimento policial ou penal, os Tribunais exigem a comprovação de três elementos essenciais: (1) Prescrição médica detalhada com CID e justificativa clínica; (2) Laudo Técnico Agronômico com dimensionamento exato do número de plantas e ciclos; e (3) Laudo de acompanhamento clínico/psicomotor que ateste a evolução do tratamento.',
        'O Instituto Mecura estrutura e disponibiliza todo o ferramental técnico e laudos periciais de acordo com os critérios rigorosamente exigidos pela jurisprudência dos Tribunais Superiores.'
      ]
    },
    {
      id: 'anvisa-regulatorio',
      title: '4. Marco Regulatório da ANVISA e Normas Sanitárias',
      badge: 'RDC 660/2022 e RDC 327/2019',
      summary: 'A importação de produtos de Cannabis para uso pessoal e a comercialização farmacêutica são plenamente regulamentadas.',
      details: [
        'A Diretoria Colegiada da ANVISA regulamentou a importação excepcional de produtos derivados de Cannabis por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, inicialmente pela RDC nº 335/2020 (alterada pela RDC nº 570/2021) e consolidada pela vigente RDC nº 660/2022.',
        'A ANVISA publicou a Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA com a lista de produtos aptos para importação facilitada.',
        'Adicionalmente, a RDC nº 327/2019 estabelece os requisitos para autorização sanitária de produtos de Cannabis em farmácias no Brasil.',
        'A plataforma Mecura integra suporte para emissão de pedidos e orientação de preenchimento junto ao portal Gov.br da ANVISA, assegurando conformidade estrita aos procedimentos sanitários federais.'
      ]
    },
    {
      id: 'ato-medico',
      title: '5. Lei do Ato Médico e Telemedicina Ética',
      badge: 'Lei 12.842/2013 & CFM 2.314/2022',
      summary: 'A plataforma opera como infraestrutura tecnológica de acolhimento. Diagnóstico e prescrição são privativos de médicos com ICP-Brasil.',
      details: [
        'Em obediência irrestrita à Lei Federal nº 12.842/2013 (Lei do Ato Médico) e às Resoluções do Conselho Federal de Medicina (notadamente a Resolução CFM nº 2.314/2022 sobre Telemedicina), o Instituto Mecura esclarece que a plataforma digital exerce função de meio tecnológico, triagem primária e organização de prontuário.',
        'O diagnóstico nosológico, a anamnese conclusiva e a emissão de prescrições terapêuticas são atos médicos privativos, desempenhados exclusivamente por profissionais devidamente registrados nos seus respectivos Conselhos Regionais de Medicina (CRM).',
        'Todos os receituários, laudos e atestados emitidos na plataforma contam com assinatura digital avançada/qualificada padrão ICP-Brasil, dotada de carimbo de tempo e rastreabilidade que conferem fé pública e validade jurídica nacional.'
      ]
    }
  ]
};

export const PRIVACY_POLICY_LGPD_DATA = {
  title: 'Política de Privacidade e Proteção de Dados Pessoais',
  law: 'Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD)',
  controller: 'Instituto Mecura Ltda • CNPJ 69.202.927/0001-19',
  dpoContact: 'privacidade@institutomecura.com',
  summary: `O Instituto Mecura Ltda preza pela absoluta segurança, confidencialidade e privacidade dos dados de seus usuários e pacientes. Esta Política descreve como coletamos, tratamos, protegemos e compartilhamos dados pessoais e dados pessoais sensíveis de saúde, em estrita conformidade com a LGPD e o sigilo médico deontológico.`,
  sections: [
    {
      id: 'base-legal',
      title: '1. Bases Legais para Tratamento de Dados',
      content: [
        'O tratamento de dados pessoais no Instituto Mecura ocorre sob as bases legais autorizadas pela LGPD:',
        '• Art. 7º, inciso I: Mediante consentimento expresso e inequívoco do titular;',
        '• Art. 11, inciso II, alínea "f": Para a tutela da saúde, exclusivamente em procedimentos realizados por profissionais de saúde, serviços de saúde ou autoridade sanitária;',
        '• Art. 7º, inciso II e Art. 11, inciso II, alínea "a": Para cumprimento de obrigações legais ou regulatórias (como a guarda obrigatória de prontuários médicos pelo CFM e resoluções da ANVISA);',
        '• Art. 7º, inciso VI e Art. 11, inciso II, alínea "e": Para o exercício regular de direitos em processos judiciais (ex.: apresentação de laudos e receitas em ações de Habeas Corpus ou salvo-conduto).'
      ]
    },
    {
      id: 'dados-coletados',
      title: '2. Dados Coletados e Finalidades',
      content: [
        '• Dados Cadastrais: Nome completo, CPF, data de nascimento, telefone/WhatsApp e e-mail. Finalidade: identificação única do paciente, elaboração de receitas médicas oficiais, cadastro na ANVISA e comunicação sobre consultas e prescrições.',
        '• Dados Pessoais Sensíveis de Saúde: Sintomas relatados, patologias preexistentes, uso contínuo de medicamentos, exames prévios, objetivos terapêuticos e relatos de dosagem. Finalidade: subsidiar a avaliação clínica do médico e permitir o acompanhamento evolutivo do tratamento canabinoide.',
        '• Dados Técnicos de Acesso: Registros de conexão (IP, data, hora, tipo de navegador), conforme dever legal do Marco Civil da Internet (Lei nº 12.965/2014).'
      ]
    },
    {
      id: 'seguranca-dados',
      title: '3. Medidas de Segurança e Criptografia',
      content: [
        'Adotamos medidas técnicas, administrativas e organizacionais de vanguarda para proteger suas informações contra acessos não autorizados, incidentes acidentais ou ilícitos de destruição, perda ou alteração:',
        '• Criptografia de ponta a ponta em trânsito (protocolos TLS/HTTPS modernos);',
        '• Armazenamento em servidores e nuvem com certificações internacionais de conformidade e segurança (SOC 2, ISO 27001);',
        '• Controle rigoroso de acesso baseado em funções (RBAC - Role-Based Access Control): somente você e os profissionais médicos autorizados têm acesso ao seu histórico clínico;',
        '• Sigilo Médico: todos os médicos cooperados são contratualmente e deontologicamente vinculados ao dever perpétuo de sigilo profissional estabelecido no Código de Ética Médica.'
      ]
    },
    {
      id: 'direitos-titular',
      title: '4. Direitos do Titular de Dados (Art. 18 da LGPD)',
      content: [
        'Conforme o Artigo 18 da LGPD, você, na qualidade de titular dos dados pessoais, pode exercer a qualquer momento os seguintes direitos:',
        '1. Confirmação da existência de tratamento de seus dados;',
        '2. Acesso facilitado e transparente aos seus dados arquivados;',
        '3. Correção de dados incompletos, inexatos ou desatualizados;',
        '4. Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;',
        '5. Portabilidade dos seus dados clínicos e prescrições para outro profissional ou plataforma;',
        '6. Informação sobre as entidades com as quais os dados foram compartilhados;',
        '7. Revogação do consentimento, com a ressalva da guarda legal obrigatória de prontuários médicos exigida pelo Conselho Federal de Medicina (CFM).'
      ]
    },
    {
      id: 'canal-dpo',
      title: '5. Canal de Atendimento do DPO (Encarregado de Dados)',
      content: [
        'Para exercer qualquer um dos seus direitos, esclarecer dúvidas ou enviar solicitações relativas à privacidade, disponibilizamos canal direto com nosso Encarregado de Proteção de Dados (DPO):',
        '• E-mail do DPO: privacidade@institutomecura.com',
        '• WhatsApp do DPO / Suporte: (66) 99628-0883',
        'As solicitações serão analisadas e respondidas dentro dos prazos estabelecidos pela Autoridade Nacional de Proteção de Dados (ANPD).'
      ]
    }
  ]
};

export const TERMS_OF_USE_DATA = {
  title: 'Termos de Uso e Condições Gerais',
  target: 'Plataforma Digital Instituto Mecura',
  summary: `Ao utilizar a plataforma do Instituto Mecura, o usuário concorda expressamente com os presentes Termos de Uso, que regem o acesso aos serviços de triagem preliminar, telemedicina canabinoide, catálogo informativo e suporte à documentação legal.`,
  sections: [
    {
      id: 'natureza-servico',
      title: '1. Natureza da Plataforma e Limites de Atuação',
      content: [
        'O Instituto Mecura é uma plataforma tecnológica de suporte ao bem-estar e acesso à terapia canabinoide.',
        'A plataforma NÃO substitui o atendimento emergencial de pronto-socorro. Em caso de emergências clínicas, acione imediatamente o SAMU (192) ou dirija-se a uma unidade de emergência.',
        'A triagem realizada na plataforma serve exclusivamente para orientar o agendamento e organizar informações clínicas preliminares para o médico que realizará o atendimento.'
      ]
    },
    {
      id: 'responsabilidades-usuario',
      title: '2. Responsabilidades do Paciente / Usuário',
      content: [
        'O usuário declara que todas as informações cadastrais e relatos sobre seu estado de saúde fornecidos à plataforma e aos profissionais médicos são rigorosamente verídicos, completos e precisos.',
        'O usuário compromete-se a utilizar os medicamentos e produtos derivados de Cannabis estritamente para sua própria finalidade medicinal e sob a posologia indicada na receita médica oficial.',
        'É expressamente proibido ceder, revender, distribuir ou compartilhar medicamentos, óleos ou flores terapêuticas com terceiros, sob pena de responsabilização civil e criminal.'
      ]
    },
    {
      id: 'propriedade-intelectual',
      title: '3. Propriedade Intelectual e Licença de Uso',
      content: [
        'Todo o conteúdo, interfaces, marcas, textos, guias botânicos, códigos e logotipos do Instituto Mecura são de propriedade exclusiva da empresa ou licenciados legitimamente.',
        'É concedida ao usuário uma licença pessoal, revogável, intransferível e não exclusiva para uso dos serviços disponibilizados.'
      ]
    },
    {
      id: 'foro',
      title: '4. Legislação Aplicável e Foro',
      content: [
        'Estes Termos de Uso são regidos e interpretados de acordo com a legislação da República Federativa do Brasil, em especial o Código de Defesa do Consumidor (Lei nº 8.078/1990), o Marco Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018).'
      ]
    }
  ]
};
