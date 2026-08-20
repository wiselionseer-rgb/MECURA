const fs = require('fs');
let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

const target = `            {/* Timeline Carousel */}
            <div className="flex gap-5 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
              {[
                { icon: Activity, title: 'Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida e segura.', active: true, step: '01' },
                { icon: MessageSquare, title: 'Consulta via Chat', desc: 'Fale com um médico especialista sem precisar agendar horário.', active: false, step: '02' },
                { icon: FileText, title: 'Prescrição Médica', desc: 'Se indicado, receba a receita e orientações para solicitar os produtos.', active: false, step: '03' },
                { icon: Package, title: 'Entrega em Casa', desc: 'Acompanhe a importação até que os produtos sejam entregues na sua porta.', active: false, step: '04' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={\`flex-shrink-0 w-[290px] backdrop-blur-xl border rounded-[32px] p-7 relative snap-center flex flex-col \${
                    item.active 
                      ? 'bg-white/[0.04] border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]' 
                      : 'bg-white/[0.015] border-white/[0.04] shadow-[0_8px_20px_rgba(0,0,0,0.1)]'
                  }\`}
                >
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {item.active && (
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 \${
                      item.active 
                        ? 'bg-mecura-neon/10 border border-mecura-neon/30 shadow-[0_0_25px_rgba(166,255,0,0.15)]' 
                        : 'bg-white/[0.03] border border-white/[0.05]'
                    }\`}>
                      <item.icon strokeWidth={1.5} className={\`w-6 h-6 \${item.active ? 'text-mecura-neon' : 'text-white/40'}\`} />
                    </div>
                    <span className={\`text-4xl font-serif font-light tracking-tighter \${item.active ? 'text-white/20' : 'text-white/5'}\`}>{item.step}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className={\`font-serif font-medium text-2xl mb-3 tracking-tight \${item.active ? 'text-white' : 'text-white/70'}\`}>{item.title}</h4>
                    <p className={\`text-[15px] leading-relaxed font-light \${item.active ? 'text-white/70' : 'text-white/40'}\`}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>`;

const replacement = `            {/* Timeline Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
              {[
                { icon: Activity, title: 'Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida e segura.', active: true, step: '01' },
                { icon: MessageSquare, title: 'Consulta via Chat', desc: 'Fale com um médico especialista sem precisar agendar horário.', active: false, step: '02' },
                { icon: FileText, title: 'Prescrição Médica', desc: 'Se indicado, receba a receita e orientações para solicitar os produtos.', active: false, step: '03' },
                { icon: Package, title: 'Entrega em Casa', desc: 'Acompanhe a importação até que os produtos sejam entregues na sua porta.', active: false, step: '04' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={\`flex-shrink-0 w-[275px] backdrop-blur-xl border rounded-[28px] p-7 relative snap-center flex flex-col overflow-hidden \${
                    item.active 
                      ? 'bg-gradient-to-br from-white/[0.06] to-[#0A0A0F]/80 border-white/[0.15] shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]' 
                      : 'bg-[#12121A]/80 border-white/[0.04] shadow-[0_8px_20px_rgba(0,0,0,0.1)]'
                  }\`}
                >
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {item.active && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-mecura-neon/15 blur-[40px] rounded-full pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className={\`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 \${
                      item.active 
                        ? 'bg-mecura-neon/10 border border-mecura-neon/30 shadow-[0_0_20px_rgba(166,255,0,0.15)]' 
                        : 'bg-white/[0.03] border border-white/[0.05]'
                    }\`}>
                      <item.icon strokeWidth={1.5} className={\`w-5 h-5 \${item.active ? 'text-mecura-neon' : 'text-[#8A8A9E]'}\`} />
                    </div>
                    
                    {/* The elegant step badge replacing the confusing italic text */}
                    <div className={\`px-3 py-1.5 rounded-full border \${
                      item.active 
                        ? 'bg-mecura-neon/10 border-mecura-neon/30 text-mecura-neon' 
                        : 'bg-white/5 border-white/10 text-[#8A8A9E]'
                    }\`}>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Passo {item.step}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <h4 className={\`font-serif font-bold text-[22px] mb-3 tracking-tight leading-tight \${item.active ? 'text-white' : 'text-white/80'}\`}>{item.title}</h4>
                    <p className={\`text-[14px] leading-relaxed font-light \${item.active ? 'text-[#B0B0C0]' : 'text-[#8A8A9E]'}\`}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>`;

content = content.replace(target.replace(/\\r\\n/g, '\\n'), replacement);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('carousel labels fixed');
