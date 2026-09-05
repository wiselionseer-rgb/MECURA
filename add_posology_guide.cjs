const fs = require('fs');

const pathCbd = 'src/data/cbdGuide.ts';
let codeCbd = fs.readFileSync(pathCbd, 'utf8');

// add usageInstructions to EnrichedMedicationInfo
if (!codeCbd.includes('usageInstructions?: string;')) {
  codeCbd = codeCbd.replace(
    `description: string;`,
    `description: string;\n  usageInstructions?: string;`
  );
}

// Add generic posologies
codeCbd = codeCbd.replace(
  `description: 'Pomada fitocanabinoide de uso tópico para alívio localizado de dores musculares, articulares e processos inflamatórios.'`,
  `description: 'Pomada fitocanabinoide de uso tópico para alívio localizado de dores musculares, articulares e processos inflamatórios.',
      usageInstructions: '• Aplicar uma fina camada sobre a região afetada e massagear suavemente até completa absorção, 2 a 3 vezes ao dia, ou conforme necessidade para alívio da dor.'`
);

codeCbd = codeCbd.replace(
  `description: 'Inalação vaporizada para rápida absorção e efeito analgésico ou ansiolítico imediato em momentos de crise.'`,
  `description: 'Inalação vaporizada para rápida absorção e efeito analgésico ou ansiolítico imediato em momentos de crise.',
      usageInstructions: '• Vaporizar a 180°C - 200°C através de vaporizador de ervas secas. Iniciar com 1 a 2 inalações profundas em momentos de crise (dor aguda, pico de ansiedade) e aguardar 15 minutos para avaliar o efeito.'`
);

codeCbd = codeCbd.replace(
  `description: 'Gomas mastigáveis com liberação gradual e prolongada para relaxamento sustentado e sono reparador.'`,
  `description: 'Gomas mastigáveis com liberação gradual e prolongada para relaxamento sustentado e sono reparador.',
      usageInstructions: '• Ingerir 1/2 a 1 goma mastigável, 1 vez ao dia (ou cerca de 45 minutos antes de dormir em caso de insônia). Não ultrapassar 2 gomas ao dia sem orientação médica.'`
);

codeCbd = codeCbd.replace(
  `description: 'Absorção pulmonar rápida sem combustão, oferecendo pico plasmático em minutos para resposta terapêutica ágil.'`,
  `description: 'Absorção pulmonar rápida sem combustão, oferecendo pico plasmático em minutos para resposta terapêutica ágil.',
      usageInstructions: '• Vaporizar a 160°C - 210°C usando vaporizador apropriado para concentrados. Realizar 1 inalação em momentos de crise aguda (dor, ansiedade, espasticidade) e aguardar 10-15 minutos.'`
);

codeCbd = codeCbd.replace(
  `description: 'Extrato balanceado 1:1 indicado para analgesia potente, dores neuropáticas, rigidez e espasticidade.'`,
  `description: 'Extrato balanceado 1:1 indicado para analgesia potente, dores neuropáticas, rigidez e espasticidade.',
      usageInstructions: '• Iniciar com 2 a 3 gotas (12/12 horas) via sublingual. Aumentar 1 gota por dose a cada 3 a 5 dias conforme tolerância e resposta analgésica.'`
);

codeCbd = codeCbd.replace(
  `description: 'Extrato predominante em THC para analgesia em dores intratáveis, insônia refratária e relaxamento neuromuscular.'`,
  `description: 'Extrato predominante em THC para analgesia em dores intratáveis, insônia refratária e relaxamento neuromuscular.',
      usageInstructions: '• Iniciar com 1 a 2 gotas exclusivamente à noite via sublingual. Aumentar 1 gota a cada 3 a 5 dias. Uso diurno apenas sob estrita recomendação médica devido ao efeito psicoativo.'`
);

codeCbd = codeCbd.replace(
  `description: 'Formulação rica em CBG para clareza mental, foco, suporte anti-inflamatório sistêmico e imunológico.'`,
  `description: 'Formulação rica em CBG para clareza mental, foco, suporte anti-inflamatório sistêmico e imunológico.',
      usageInstructions: '• Iniciar com 3 a 5 gotas via sublingual pela manhã ou início da tarde. Aumentar gradualmente conforme resposta para foco e modulação do humor. Evitar uso próximo ao horário de dormir.'`
);

codeCbd = codeCbd.replace(
  `description: 'Canabidiol de altíssima concentração para quadros de ansiedade severa, dores refratárias e regulação do humor.'`,
  `description: 'Canabidiol de altíssima concentração para quadros de ansiedade severa, dores refratárias e regulação do humor.',
      usageInstructions: '• Iniciar com 5-10 mg de CBD (aproximadamente 2-4 gotas, considerando que 1 gota = 5 mg de CBD a 200mg/ml) sublingual, 1 vez ao dia (preferencialmente à noite para iniciar). Aumentar gradualmente em 2-4 gotas a cada 3-5 dias, conforme tolerância e resposta, até 10-20 mg de CBD (aproximadamente 4-8 gotas) 2 vezes ao dia (12/12 horas).'`
);

codeCbd = codeCbd.replace(
  `description: 'Extrato Full Spectrum enriquecido com terpenos calmantes para relaxamento, inflamação e alívio da dor.'`,
  `description: 'Extrato Full Spectrum enriquecido com terpenos calmantes para relaxamento, inflamação e alívio da dor.',
      usageInstructions: '• Iniciar com 3-5 gotas (aprox. 7,5 - 12,5 mg de CBD) sublingual, 1 a 2 vezes ao dia. Aumentar 2 gotas a cada 3 a 5 dias até controle dos sintomas ou conforme indicação clínica.'`
);

fs.writeFileSync(pathCbd, codeCbd);

// Now update CBDGuideView
const pathView = 'src/components/CBDGuideView.tsx';
let codeView = fs.readFileSync(pathView, 'utf8');

// For mobile
codeView = codeView.replace(
  `<p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                                </p>`,
  `<p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                                </p>
                                {enriched.usageInstructions && (
                                  <div className="pt-1.5 mt-1.5 border-t border-white/5">
                                    <p className="text-[10px] leading-relaxed text-mecura-silver">
                                      <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                      {enriched.usageInstructions}
                                    </p>
                                  </div>
                                )}`
);

// For desktop
codeView = codeView.replace(
  `<p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                                      </p>`,
  `<p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                                      </p>
                                      {enriched.usageInstructions && (
                                        <div className="pt-2 mt-2 border-t border-white/5">
                                          <p className="text-[11px] leading-relaxed text-mecura-silver">
                                            <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                            {enriched.usageInstructions}
                                          </p>
                                        </div>
                                      )}`
);

fs.writeFileSync(pathView, codeView);
console.log("Updated both files");
