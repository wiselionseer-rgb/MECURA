import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ShieldCheck, Activity, Pill, Beaker, FileText, AlertTriangle } from 'lucide-react';
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

  const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);

  // Generate generic precautions based on type
  const isTHC = product.type.toLowerCase().includes('thc') || product.name.toLowerCase().includes('thc') || product.type.toLowerCase().includes('full spectrum');
  const isImportado = product.origin.toLowerCase().includes('importado');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-mecura-surface border border-mecura-elevated w-full max-w-4xl rounded-2xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 bg-mecura-surface/95 backdrop-blur-md rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                <FileText className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Bula do Medicamento</h2>
                <p className="text-sm text-mecura-silver">Informações para Prescrição Médica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-mecura-silver hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            
            {/* 1. Identificação do Medicamento */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-mecura-neon" />
                1. Identificação do Medicamento
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-2xl font-black text-mecura-pearl mb-1">{product.name}</h4>
                    <p className="text-sm font-semibold text-mecura-neon/80 mb-4">{product.type}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-mecura-silver block mb-0.5">Princípio Ativo</span>
                        <p className="text-sm text-white font-medium">{enriched.activeIngredients}</p>
                      </div>
                      <div>
                        <span className="text-xs text-mecura-silver block mb-0.5">Fabricante / Marca</span>
                        <p className="text-sm text-white font-medium flex items-center gap-2">
                          {product.manufacturer}
                          <span className="px-2 py-0.5 bg-white/10 text-[10px] rounded uppercase font-bold text-mecura-silver">
                            {product.origin}
                          </span>
                        </p>
                      </div>
                      {product.categoryName && (
                        <div>
                          <span className="text-xs text-mecura-silver block mb-0.5">Categoria Terapêutica</span>
                          <p className="text-sm text-white font-medium">{product.categoryName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-mecura-surface-light/30 rounded-lg p-4 border border-white/5 flex flex-col justify-center">
                    <span className="text-xs text-mecura-silver block mb-2">Apresentação</span>
                    <div className="flex items-start gap-3 mb-4">
                      <Beaker className="w-5 h-5 text-mecura-neon shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-white font-bold">{enriched.pharmaceuticalForm}</p>
                        <p className="text-xs text-mecura-silver mt-1">Via: {enriched.administrationRoute}</p>
                        <p className="text-xs text-mecura-silver mt-0.5">Volume/Qtd: {enriched.quantity}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-auto">
                      <span className="text-xs text-mecura-silver block mb-1">Preço Estimado</span>
                      <p className="text-lg font-black text-mecura-neon">
                        {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte Valor')}
                      </p>
                      {product.priceUSD && !product.priceBRL && (
                        <p className="text-[10px] text-mecura-silver/60">Baseado no câmbio atual (US$ {product.priceUSD.toFixed(2)})</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Indicações Clínicas */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-mecura-neon" />
                2. Indicações Clínicas
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-5 space-y-4">
                {product.description && (
                  <div>
                    <h4 className="text-sm font-bold text-mecura-pearl mb-1">Descrição Geral</h4>
                    <p className="text-sm text-mecura-silver leading-relaxed">{product.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-bold text-mecura-pearl mb-2">Uso Clínico e Patologias</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.indications ? (
                      product.indications.split(',').map((ind, i) => (
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
                      <span className="text-sm text-mecura-silver">Indicações gerais conforme categoria.</span>
                    )}
                  </div>
                </div>

                {product.details && product.details.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-sm font-bold text-mecura-pearl mb-2">Especificações Técnicas</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-mecura-silver">{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Posologia e Modo de Uso */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-mecura-neon" />
                3. Posologia, Dosagem e Modo de Uso
              </h3>
              <div className="bg-mecura-neon/5 border border-mecura-neon/20 rounded-xl p-5">
                <p className="text-sm text-white leading-relaxed font-medium">
                  {enriched.usageInstructions || "A dosagem deve ser individualizada, iniciando com a menor dose eficaz ("start low, go slow") e tateando gradualmente conforme resposta clínica e tolerabilidade."}
                </p>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <span className="text-xs text-mecura-silver block mb-1">Via de Administração</span>
                    <p className="text-sm text-white font-bold">{enriched.administrationRoute}</p>
                  </div>
                  {isImportado && enriched.pharmaceuticalForm.toLowerCase().includes('óleo') && (
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <span className="text-xs text-amber-500 block mb-1">Atenção (Medicamento Importado)</span>
                      <p className="text-xs text-white">1 mL equivale a aproximadamente 40 gotas (dependendo do conta-gotas do fabricante).</p>
                    </div>
                  )}
                  {!isImportado && enriched.pharmaceuticalForm.toLowerCase().includes('óleo') && (
                    <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <span className="text-xs text-emerald-500 block mb-1">Atenção (Medicamento Nacional)</span>
                      <p className="text-xs text-white">1 mL costuma equivaler a cerca de 20 a 30 gotas.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Precauções e Contraindicações */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                4. Contraindicações e Precauções
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Contraindicações Absolutas</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-mecura-silver">
                    <li>Hipersensibilidade conhecida aos canabinoides ou a qualquer excipiente da fórmula.</li>
                    {isTHC && (
                      <>
                        <li>Histórico pessoal ou familiar de esquizofrenia ou transtornos psicóticos (devido ao THC).</li>
                        <li>Gestantes e lactantes (o THC atravessa a barreira placentária e é excretado no leite).</li>
                        <li>Crianças e adolescentes (exceto em indicações muito específicas e refratárias, com cautela e monitoramento).</li>
                      </>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Precauções e Advertências</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-mecura-silver">
                    <li><strong>Interações Medicamentosas:</strong> O CBD é metabolizado pelo complexo do citocromo P450 (principalmente CYP3A4 e CYP2C19). Pode aumentar o nível sérico de medicações como clobazam, varfarina, e alguns antidepressivos.</li>
                    <li><strong>Insuficiência Hepática/Renal:</strong> Monitorar enzimas hepáticas, especialmente em doses elevadas.</li>
                    {isTHC ? (
                      <li><strong>Efeitos no SNC:</strong> Pode causar sonolência, tontura e alterações cognitivas. Pacientes não devem operar maquinário pesado ou dirigir nas primeiras semanas de adaptação ao THC.</li>
                    ) : (
                      <li><strong>Efeitos Iniciais:</strong> Nas primeiras semanas, pode ocorrer sonolência leve, fadiga ou distúrbios gastrointestinais (frequentemente ligados ao óleo carreador).</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Conservação */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                5. Cuidados de Conservação
              </h3>
              <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4">
                <p className="text-sm text-mecura-silver leading-relaxed">
                  Conservar em temperatura ambiente (15ºC a 30ºC), protegido da luz solar direta e da umidade. Manter o frasco bem fechado e fora do alcance de crianças e animais de estimação. Após aberto, consumir conforme validade na embalagem.
                </p>
              </div>
            </section>

          </div>
          
          {/* Footer */}
          <div className="p-5 border-t border-white/10 bg-[#0A0A0F] rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-mecura-silver max-w-xl text-center sm:text-left">
                <strong>Nota:</strong> Estas informações são um guia rápido e não substituem o julgamento clínico. A prescrição de derivados de Cannabis deve seguir as normativas da Anvisa vigentes.
              </p>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-mecura-surface-light hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10"
              >
                Fechar Bula
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
