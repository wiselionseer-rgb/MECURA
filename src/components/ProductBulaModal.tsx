import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ShieldCheck, Activity, Pill, Beaker, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { CBDProduct, enrichMedicationDetails } from '../data/cbdGuide';

interface ExtendedCBDProduct extends CBDProduct {
  categoryId?: string;
  categoryName?: string;
  categoryIndications?: string[];
}

interface ProductBulaModalProps {
  product: ExtendedCBDProduct | null;
  onClose: () => void;
  exchangeRate: number;
}

export function ProductBulaModal({ product, onClose, exchangeRate }: ProductBulaModalProps) {
  if (!product) return null;

  const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type, product);

  const [copiedPrescription, setCopiedPrescription] = React.useState(false);

  const anyProd = product as any;
  const ratio = anyProd.ratio;
  const carrierVehicle = anyProd.carrierVehicle;
  const mgPerDropCBD = anyProd.mgPerDropCBD;
  const mgPerDropTHC = anyProd.mgPerDropTHC;
  const mgPerDropDelta8 = anyProd.mgPerDropDelta8;
  const dropsPerMl = anyProd.dropsPerMl;
  const gmpCertified = anyProd.gmpCertified;
  const hplcStandardized = anyProd.hplcStandardized;
  const anvisaRdc = anyProd.anvisaRdc;
  const mechanismOfAction = anyProd.mechanismOfAction;
  const adverseEffects = anyProd.adverseEffects;
  const contraindications = anyProd.contraindications;
  const posologyDetails = anyProd.posologyDetails || anyProd.usageInstructions || enriched.usageInstructions;
  const prescriptionExample = anyProd.prescriptionExample;

  // Generate generic precautions based on type
  const isTHC = product.type.toLowerCase().includes('thc') || product.name.toLowerCase().includes('thc') || product.type.toLowerCase().includes('full spectrum');
  const isImportado = (product.origin || '').toLowerCase().includes('importado');

  const handleCopyPrescription = () => {
    const textToCopy = prescriptionExample || `${product.name} — ${enriched.quantity || '01 Frasco'}\nUso: ${posologyDetails}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrescription(true);
    setTimeout(() => setCopiedPrescription(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-mecura-surface border border-mecura-elevated w-full max-w-4xl rounded-2xl shadow-2xl relative my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-mecura-surface/95 backdrop-blur-md rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 shrink-0">
                <FileText className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">Bula do Medicamento & Guia Clínico</h2>
                <p className="text-xs text-mecura-silver">Ficha Farmacêutica Completa para Prescrição Médica</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {prescriptionExample && (
                <button
                  onClick={handleCopyPrescription}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    copiedPrescription 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-mecura-neon/10 hover:bg-mecura-neon/20 text-mecura-neon border-mecura-neon/30'
                  }`}
                  title="Copiar modelo de prescrição médica"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{copiedPrescription ? 'Prescrição Copiada!' : 'Copiar Prescrição'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fechar bula"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            
            {/* 1. Identificação do Medicamento */}
            <section>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-mecura-neon" />
                1. Identificação & Especificações Farmacológicas
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isImportado
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {product.origin || (isImportado ? 'Importado' : 'Nacional')}
                      </span>
                      {anvisaRdc && (
                        <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] rounded-full font-bold">
                          {anvisaRdc}
                        </span>
                      )}
                      {gmpCertified && (
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] rounded-full font-bold">
                          Selo cGMP Farmacêutico
                        </span>
                      )}
                      {hplcStandardized && (
                        <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] rounded-full font-bold">
                          Laudo HPLC Testado
                        </span>
                      )}
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-mecura-pearl mb-1">{product.name}</h4>
                    <p className="text-sm font-semibold text-mecura-neon/80 mb-3">{product.type}</p>
                    
                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div>
                        <span className="text-[11px] text-mecura-silver block mb-0.5">Princípio Ativo & Fitocomplexo</span>
                        <p className="text-white font-medium">{product.activeIngredients || enriched.activeIngredients}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-mecura-silver block mb-0.5">Fabricante / Laboratório</span>
                        <p className="text-white font-medium flex items-center gap-2">
                          {product.manufacturer}
                          <span className="px-2 py-0.5 bg-white/10 text-[10px] rounded uppercase font-bold text-mecura-silver">
                            {product.origin}
                          </span>
                        </p>
                      </div>
                      {ratio && (
                        <div>
                          <span className="text-[11px] text-mecura-silver block mb-0.5">Proporção / Ratio Canabinoide</span>
                          <p className="text-mecura-neon font-semibold">{ratio}</p>
                        </div>
                      )}
                      {product.categoryName && (
                        <div>
                          <span className="text-[11px] text-mecura-silver block mb-0.5">Categoria do Guia</span>
                          <p className="text-mecura-pearl">{product.categoryName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-mecura-surface-light/30 rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs text-mecura-silver block mb-2 font-semibold uppercase tracking-wider">Apresentação & Veículo</span>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Beaker className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-white font-bold">{enriched.pharmaceuticalForm}</p>
                            <p className="text-mecura-silver">Via: <strong className="text-white">{enriched.administrationRoute}</strong></p>
                            <p className="text-mecura-silver">Volume / Quantidade: <strong className="text-white">{enriched.quantity}</strong></p>
                          </div>
                        </div>

                        {carrierVehicle && (
                          <div className="p-2.5 bg-black/30 rounded-lg border border-white/5">
                            <span className="text-[10px] text-mecura-silver uppercase block font-semibold">Veículo Carreador:</span>
                            <span className="text-white font-medium text-xs">{carrierVehicle}</span>
                          </div>
                        )}

                        {(mgPerDropCBD !== undefined || mgPerDropTHC !== undefined || dropsPerMl !== undefined) && (
                          <div className="p-2.5 bg-mecura-neon/5 rounded-lg border border-mecura-neon/20 text-xs">
                            <span className="text-[10px] text-mecura-neon uppercase block font-bold">Calibração Posológica:</span>
                            <div className="space-y-0.5 mt-1 text-white">
                              {dropsPerMl && <p>• 1 mL = <strong>~{dropsPerMl} gotas</strong> no conta-gotas medicinal</p>}
                              {mgPerDropCBD !== undefined && <p>• Cada gota fornece <strong>{mgPerDropCBD} mg de CBD</strong> ativo</p>}
                              {mgPerDropTHC !== undefined && <p>• Cada gota fornece <strong>{mgPerDropTHC} mg de THC</strong> ativo</p>}
                              {mgPerDropDelta8 !== undefined && <p>• Cada gota fornece <strong>{mgPerDropDelta8} mg de Delta-8 THC</strong></p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <span className="text-xs text-mecura-silver block mb-1">
                        {isImportado ? 'Valor em Reais (BRL)' : 'Aquisição Nacional'}
                      </span>
                      {product.priceBRL ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-mecura-neon">
                            R$ {product.priceBRL.toFixed(2).replace('.', ',')}
                          </span>
                          {product.priceUSD && (
                            <span className="text-xs text-mecura-silver">
                              (ou US$ {product.priceUSD.toFixed(2)})
                            </span>
                          )}
                        </div>
                      ) : product.priceUSD ? (
                        <p className="text-xl font-black text-mecura-neon">
                          R$ {(product.priceUSD * exchangeRate).toFixed(2).replace('.', ',')}
                          <span className="text-xs text-mecura-silver font-normal ml-2">US$ {product.priceUSD.toFixed(2)}</span>
                        </p>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-emerald-400">
                            Direto com a Associação Nacional
                          </p>
                          <span className="text-[11px] text-mecura-silver">Acolhimento e suporte farmacêutico contínuo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Indicações Clínicas e Patologias */}
            <section>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-mecura-neon" />
                2. Indicações Clínicas & Patologias Alvo
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                {product.description && (
                  <div>
                    <h4 className="text-xs font-bold text-mecura-pearl uppercase tracking-wider mb-1">Descrição Farmacológica Detalhada</h4>
                    <p className="text-xs sm:text-sm text-mecura-silver leading-relaxed">{product.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-bold text-mecura-pearl uppercase tracking-wider mb-2">Principais Patologias Indicadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.indications ? (
                      product.indications.split(/[,;•\n]/).filter(s => s.trim().length > 0).map((ind, i) => (
                        <span key={i} className="px-3 py-1 bg-mecura-neon/10 border border-mecura-neon/20 text-mecura-neon text-xs font-semibold rounded-lg">
                          {ind.trim()}
                        </span>
                      ))
                    ) : (product.categoryIndications && product.categoryIndications.length > 0) ? (
                      product.categoryIndications.map((ind, i) => (
                        <span key={i} className="px-3 py-1 bg-mecura-neon/10 border border-mecura-neon/20 text-mecura-neon text-xs font-semibold rounded-lg">
                          {ind}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-mecura-silver">Indicações conforme prescrição individualizada.</span>
                    )}
                  </div>
                </div>

                {mechanismOfAction && (
                  <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Mecanismo de Ação Farmacodinâmico
                    </h4>
                    <p className="text-xs text-mecura-pearl leading-relaxed">{mechanismOfAction}</p>
                  </div>
                )}

                {product.details && product.details.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <h4 className="text-xs font-bold text-mecura-pearl uppercase tracking-wider mb-2">Especificações Técnicas Laboratoriais</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="text-xs text-mecura-silver flex items-start gap-1.5">
                          <span className="text-mecura-neon">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Posologia, Dosagem e Modo de Uso */}
            <section>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-mecura-neon" />
                3. Posologia, Titulação e Modo de Uso
              </h3>
              <div className="bg-mecura-neon/5 border border-mecura-neon/20 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="text-xs sm:text-sm text-white leading-relaxed font-medium">
                  <strong className="text-mecura-neon block mb-1">Protocolo Sugerido de Administração:</strong>
                  {posologyDetails}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-mecura-silver uppercase block mb-1">Via de Administração</span>
                    <p className="text-xs sm:text-sm text-white font-bold">{enriched.administrationRoute}</p>
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-mecura-silver uppercase block mb-1">Regra de Titulação</span>
                    <p className="text-xs sm:text-sm text-white font-bold">"Start Low, Go Slow" (ajuste a cada 3-5 dias)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Modelo de Prescrição Médica para Receituário */}
            {prescriptionExample && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    4. Modelo de Prescrição Médica para Receituário
                  </h3>
                  <button
                    onClick={handleCopyPrescription}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                      copiedPrescription 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{copiedPrescription ? 'Copiado para Área de Transferência!' : 'Copiar Texto da Receita'}</span>
                  </button>
                </div>

                <div className="p-4 bg-[#0A0A0F] border border-emerald-500/30 rounded-xl relative group">
                  <p className="font-mono text-xs sm:text-sm text-emerald-200 leading-relaxed whitespace-pre-wrap select-all">
                    {prescriptionExample}
                  </p>
                  <p className="text-[10px] text-mecura-silver mt-2 border-t border-white/5 pt-2">
                    Dica: Copie este texto diretamente para o Receituário Especial ou para o Laudo Evolutivo Médico.
                  </p>
                </div>
              </section>
            )}

            {/* 5. Precauções e Contraindicações */}
            <section>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {prescriptionExample ? '5' : '4'}. Contraindicações e Precauções
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                {contraindications && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Contraindicações Específicas</h4>
                    <p className="text-xs sm:text-sm text-mecura-silver leading-relaxed">{contraindications}</p>
                  </div>
                )}

                {adverseEffects && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Reações Adversas Potenciais</h4>
                    <p className="text-xs sm:text-sm text-mecura-silver leading-relaxed">{adverseEffects}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Contraindicações Gerais</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-mecura-silver">
                    <li>Hipersensibilidade conhecida aos canabinoides ou aos veículos carreadores (MCT, Andiroba, Copaíba).</li>
                    {isTHC && (
                      <>
                        <li>Histórico pessoal ou familiar de esquizofrenia ou transtornos psicóticos graves (cautela com THC).</li>
                        <li>Gestação e lactação sem estrita avaliação risco-benefício expressa do especialista.</li>
                        <li>Crianças e adolescentes (exceto em condições refratárias como TEA ou epilepsia sob monitoramento).</li>
                      </>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Interações com o Citocromo P450</h4>
                  <p className="text-xs text-mecura-silver leading-relaxed">
                    O CBD inibe as isoenzimas CYP3A4 e CYP2C19. Pacientes em uso concomitante de clobazam, varfarina, antiepilépticos ou imunossupressores devem ter dosagens monitoradas.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Conservação */}
            <section>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                {prescriptionExample ? '6' : '5'}. Cuidados de Conservação
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 text-xs text-mecura-silver leading-relaxed">
                Conservar em temperatura ambiente (15ºC a 30ºC), protegido da luz solar direta, calor e umidade excessiva. Manter o frasco bem fechado na embalagem original e fora do alcance de crianças e animais de estimação. Após aberto, consumir no prazo de validade indicado no frasco.
              </div>
            </section>

          </div>
          
          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0A0F] rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-mecura-silver max-w-xl text-center sm:text-left">
                <strong>Nota Clínica:</strong> Este guia farmacoterapêutico é exclusivo para apoio técnico à decisão médica e está em conformidade com as diretrizes do CFM e Anvisa (RDC 660/2022).
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {prescriptionExample && (
                  <button
                    onClick={handleCopyPrescription}
                    className="flex-1 sm:flex-none px-4 py-2 bg-mecura-neon/10 hover:bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/30 text-xs font-bold rounded-xl transition-colors"
                  >
                    {copiedPrescription ? 'Copiado!' : 'Copiar Prescrição'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-2 bg-mecura-surface-light hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10 text-xs sm:text-sm"
                >
                  Fechar Bula
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
