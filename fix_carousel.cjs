const fs = require('fs');

let content = fs.readFileSync('src/screens/WelcomeScreen.tsx', 'utf8');

const target = `            {/* Timeline */}
            <div className="space-y-0 relative pl-2">
              {[
                { icon: Activity, title: 'Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida e segura.', active: true },
                { icon: MessageSquare, title: 'Consulta via Chat', desc: 'Fale com um médico especialista sem precisar agendar horário.', active: false },
                { icon: FileText, title: 'Prescrição Médica', desc: 'Se indicado, receba a receita e orientações para solicitar os produtos.', active: false },
                { icon: Package, title: 'Entrega em Casa', desc: 'Acompanhe a importação até que os produtos sejam entregues na sua porta.', active: false, isLast: true }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="flex gap-6 relative"
                >
                  <div className="flex flex-col items-center">
                    <div className={\`w-14 h-14 rounded-full \${item.active ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_20px_rgba(166,255,0,0.2)]' : 'bg-[#161622] border-white/5'} border-2 flex items-center justify-center z-10 transition-colors duration-300\`}>
                      <item.icon className={\`w-6 h-6 \${item.active ? 'text-mecura-neon' : 'text-[#8A8A9E]'}\`} />
                    </div>
                    {!item.isLast && (
                      <div className={\`w-[2px] h-full \${item.active ? 'bg-gradient-to-b from-mecura-neon to-white/5' : 'bg-white/5'} absolute top-14 bottom-[-14px] left-7 -translate-x-1/2\`} />
                    )}
                  </div>
                  <div className={\`pb-12 pt-3 \${item.isLast ? 'pb-4' : ''}\`}>
                    <h4 className={\`font-bold text-xl mb-2 \${item.active ? 'text-white' : 'text-white/80'}\`}>{item.title}</h4>
                    <p className="text-[#8A8A9E] text-[15px] leading-relaxed font-light">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>`;

const replacement = `            {/* Timeline Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
              {[
                { icon: Activity, title: 'Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida e segura.', active: true, step: '01' },
                { icon: MessageSquare, title: 'Consulta via Chat', desc: 'Fale com um médico especialista sem precisar agendar horário.', active: false, step: '02' },
                { icon: FileText, title: 'Prescrição Médica', desc: 'Se indicado, receba a receita e orientações para solicitar os produtos.', active: false, step: '03' },
                { icon: Package, title: 'Entrega em Casa', desc: 'Acompanhe a importação até que os produtos sejam entregues na sua porta.', active: false, step: '04' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className={\`flex-shrink-0 w-[280px] \${item.active ? 'bg-gradient-to-b from-[#1A1A24] to-[#161622] border-mecura-neon/40 shadow-[0_8px_30px_rgba(166,255,0,0.1)]' : 'bg-[#161622] border-white/5'} border rounded-[28px] p-6 relative snap-center flex flex-col\`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={\`w-12 h-12 rounded-[18px] \${item.active ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.2)]' : 'bg-[#1C1C28] border-white/5'} border flex items-center justify-center transition-colors duration-300\`}>
                      <item.icon className={\`w-5 h-5 \${item.active ? 'text-mecura-neon' : 'text-[#8A8A9E]'}\`} />
                    </div>
                    <span className="text-4xl font-serif font-black text-white/5 italic">{item.step}</span>
                  </div>
                  <h4 className={\`font-bold text-lg mb-3 \${item.active ? 'text-white' : 'text-white/90'}\`}>{item.title}</h4>
                  <p className="text-[#8A8A9E] text-sm leading-relaxed font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>`;

content = content.replace(target.replace(/\\r\\n/g, '\\n'), replacement);
fs.writeFileSync('src/screens/WelcomeScreen.tsx', content, 'utf8');
console.log('carousel patched');
