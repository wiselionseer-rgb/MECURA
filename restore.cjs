const fs = require('fs');
let code = fs.readFileSync('src/screens/CheckoutScreen.tsx', 'utf-8');

const target = `<input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Possui cupom?"
                      className="flex-1 bg-[#050508] border border-white/5 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 uppercase placeholder:normal-case placeholder:text-[#8A8A9E]"
                    />
                    
        {pixData ? (`;

const missingCode = `<input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Possui cupom?"
                      className="flex-1 bg-[#050508] border border-white/5 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 uppercase placeholder:normal-case placeholder:text-[#8A8A9E]"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      isLoading={isValidatingCoupon}
                      disabled={!couponCode}
                      className="bg-mecura-neon text-black font-bold h-14 px-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(166,255,0,0.3)] transition-all"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Methods List */}
              <div className="space-y-3 mb-8">
                {/* Pix */}
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={\`w-full text-left p-1 rounded-[24px] transition-all duration-300 group \${paymentMethod === 'pix' ? 'bg-gradient-to-r from-white/10 to-transparent border border-white/10' : 'bg-transparent border border-transparent hover:border-white/5'}\`}
                >
                  <div className={\`bg-[#0A0A0F] rounded-[20px] p-5 flex items-center justify-between transition-all duration-300 \${paymentMethod === 'pix' ? 'shadow-2xl' : 'group-hover:bg-[#12121A]'}\`}>
                    <div className="flex items-center gap-5">
                      <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner \${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'bg-mecura-neon/10' : 'bg-[#A6FF00]/10') : 'bg-[#12121A] group-hover:bg-white/5'}\`}>
                        <PixIcon className={\`w-7 h-7 \${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-[#A6FF00]') : 'text-[#8A8A9E]'}\`} />
                      </div>
                      <div>
                        <p className={\`font-bold text-[17px] mb-1 \${paymentMethod === 'pix' ? 'text-white' : 'text-[#8A8A9E]'}\`}>Pix</p>
                        <p className={\`text-[13px] \${paymentMethod === 'pix' ? 'text-mecura-neon' : 'text-[#8A8A9E]/60'}\`}>Aprovação imediata</p>
                      </div>
                    </div>
                    <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all \${paymentMethod === 'pix' ? 'border-mecura-neon bg-mecura-neon/10' : 'border-[#8A8A9E]/30'}\`}>
                      {paymentMethod === 'pix' && <div className="w-2.5 h-2.5 bg-mecura-neon rounded-full" />}
                    </div>
                  </div>
                </button>
              </div>

        {pixData ? (`;

code = code.replace(target, missingCode);
fs.writeFileSync('src/screens/CheckoutScreen.tsx', code);
