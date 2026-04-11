import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Plane, 
  CreditCard, 
  MapPin, 
  Package, 
  CheckCircle2,
  Info,
  ChevronRight,
  Minus,
  Plus,
  QrCode,
  Lock,
  ChevronDown,
  Tag,
  FileText,
  Sparkles,
  Gift
} from 'lucide-react';

const SHIPPING_FEE_USD = 36.00;
const FIXED_IMPORT_TAX_BRL = 39.90;

export function PharmacyScreen() {
  const navigate = useNavigate();
  const { messages } = useStore();
  const { promotionsText, catalogUrl } = useAdminStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Extract prescribed items from messages
  const { exchangeRate } = useStore();
  const prescriptionItems = messages
    .filter(msg => msg.type === 'product' && msg.productData)
    .map((msg, index) => ({
      id: msg.id,
      name: msg.productData!.name,
      brand: msg.productData!.brand,
      origin: msg.productData!.origin,
      details: msg.productData!.details,
      priceUSD: msg.productData!.priceUSD || (index === 0 ? 117.70 : 43.67), // Default prices if not provided
      durationPerUnit: 60, // Default duration
      image: msg.productData!.image,
    }));

  // Cart State
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Initialize quantities when items change
  useEffect(() => {
    const newQuantities: Record<string, number> = {};
    prescriptionItems.forEach(item => {
      if (!quantities[item.id]) {
        newQuantities[item.id] = 1;
      } else {
        newQuantities[item.id] = quantities[item.id];
      }
    });
    if (Object.keys(newQuantities).length > 0 && Object.keys(quantities).length === 0) {
      setQuantities(newQuantities);
    }
  }, [prescriptionItems]);

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  // Address State
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    neighborhood: '',
    number: '',
    complement: '',
    state: '',
    city: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = useState(1);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(20, (prev[id] || 1) + delta))
    }));
  };

  // Calculations
  const calculateSubtotal = () => {
    let total = 0;
    
    prescriptionItems.forEach(item => {
      const qty = quantities[item.id] || 1;
      const basePrice = item.priceUSD * exchangeRate;
      let itemTotal = basePrice * qty;
      
      const nameLower = item.name.toLowerCase();
      
      // 1. Linha Vibe - Óleos
      if (nameLower.includes('vibe') && !nameLower.includes('gumm')) {
        if (qty >= 6) {
          itemTotal = itemTotal * 0.7; // 30% off
        } else if (qty >= 4) {
          itemTotal = itemTotal * 0.8; // 20% off
        } else if (qty >= 2) {
          itemTotal = itemTotal * 0.9; // 10% off
        }
      }
      // 2. Chill Vibe Gummy
      else if (nameLower.includes('chill') && nameLower.includes('gumm')) {
        const setsOf10 = Math.floor(qty / 10);
        const remainder = qty % 10;
        itemTotal = (setsOf10 * 350 * exchangeRate) + (remainder * basePrice);
      }
      // 3. Drops by GreenBudz Gummies
      else if (nameLower.includes('drops by greenbudz') && nameLower.includes('gumm')) {
        const setsOf2 = Math.floor(qty / 2);
        const remainder = qty % 2;
        itemTotal = (setsOf2 * 49.90 * exchangeRate) + (remainder * basePrice);
      }
      // 4. Ignite - Óleos
      else if (nameLower.includes('ignite') && (nameLower.includes('óleo') || nameLower.includes('oil') || nameLower.includes('30ml'))) {
        const setsOf3 = Math.floor(qty / 3);
        const remainder = qty % 3;
        itemTotal = (setsOf3 * 2 * basePrice) + (remainder * basePrice);
      }
      
      total += itemTotal;
    });
    
    return total;
  };

  const shippingFeeBRL = SHIPPING_FEE_USD * exchangeRate;
  const subtotal = calculateSubtotal();
  const totalBeforeDiscount = subtotal + shippingFeeBRL + FIXED_IMPORT_TAX_BRL;
  const pixDiscount = paymentMethod === 'pix' ? totalBeforeDiscount * 0.05 : 0;
  const finalTotal = totalBeforeDiscount - discount - pixDiscount;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[
        { num: 1, label: 'Carrinho' },
        { num: 2, label: 'Entrega' },
        { num: 3, label: 'Pagamento' }
      ].map((s, idx) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              step === s.num 
                ? 'bg-mecura-neon text-[#0A0A0F] shadow-[0_0_15px_rgba(166,255,0,0.4)] scale-110' 
                : step > s.num
                  ? 'bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/30'
                  : 'bg-[#161622] text-[#6A6A7E] border border-[#262636]'
            }`}>
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${
              step >= s.num ? 'text-white' : 'text-[#6A6A7E]'
            }`}>{s.label}</span>
          </div>
          {idx < 2 && (
            <div className={`w-10 h-[2px] mb-4 mx-2 transition-colors duration-500 ${
              step > s.num ? 'bg-mecura-neon/50' : 'bg-[#262636]'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCart = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-32"
    >
      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-[#1A2E1A] to-[#121A12] border border-mecura-neon/20 rounded-2xl p-4 flex items-start gap-4 shadow-[0_0_20px_rgba(166,255,0,0.05)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-mecura-neon/10 blur-2xl rounded-full" />
        <div className="w-10 h-10 rounded-full bg-mecura-neon/10 flex items-center justify-center flex-shrink-0 border border-mecura-neon/20">
          <Plane className="w-5 h-5 text-mecura-neon" />
        </div>
        <div className="relative z-10">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            Importação Legalizada Anvisa
            <ShieldCheck className="w-4 h-4 text-mecura-neon" />
          </h4>
          <p className="text-[#8A8A9E] text-xs mt-1 leading-relaxed">
            Produtos originais dos EUA. Vendido e entregue por <strong className="text-white">GreenBudz</strong>. Cuidamos de todo o processo alfandegário com taxa fixa.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {(promotionsText || catalogUrl) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1A2E05] via-[#121A0A] to-[#0A0A0F] border border-mecura-neon/40 rounded-[24px] p-6 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(166,255,0,0.15)]"
          >
            {/* Animated background elements */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -top-20 w-64 h-64 bg-mecura-neon/20 blur-[60px] rounded-full pointer-events-none" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-20 -bottom-20 w-64 h-64 bg-mecura-neon/10 blur-[60px] rounded-full pointer-events-none" 
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 border-b border-mecura-neon/20 pb-4">
                <h4 className="text-mecura-neon font-black text-xl flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-6 h-6 animate-pulse text-mecura-neon" />
                  Ofertas Especiais
                </h4>
                <motion.div 
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-4 py-1.5 bg-mecura-neon text-[#0A0A0F] rounded-full font-black text-xs tracking-widest shadow-[0_0_15px_rgba(166,255,0,0.5)]"
                >
                  ATIVAS AGORA
                </motion.div>
              </div>
              
              {promotionsText && (
                <div className="mb-8 space-y-3">
                  {promotionsText.split('\n').map((line, index) => {
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      const content = line.substring(1).trim();
                      const parts = content.split(':');
                      if (parts.length > 1) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index} 
                            className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-mecura-neon/20 hover:border-mecura-neon/50 transition-colors group"
                          >
                            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.8)] flex-shrink-0 group-hover:scale-125 transition-transform" />
                            <div>
                              <span className="font-black text-mecura-neon text-[15px] tracking-wide">{parts[0]}:</span>
                              <span className="text-white/90 ml-2 text-[15px] leading-relaxed">{parts.slice(1).join(':')}</span>
                            </div>
                          </motion.div>
                        );
                      }
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index} 
                          className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-mecura-neon/20 hover:border-mecura-neon/50 transition-colors group"
                        >
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-mecura-neon/70 flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-white/90 text-[15px] leading-relaxed">{content}</span>
                        </motion.div>
                      );
                    }
                    if (line.trim() === '') return <div key={index} className="h-2" />;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={index} 
                        className="font-black text-xl text-white mb-6 flex items-center justify-center text-center tracking-wide"
                      >
                        {line}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {catalogUrl && (
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden flex items-center justify-center gap-3 w-full bg-mecura-neon text-[#0A0A0F] px-6 py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:bg-[#b5ff33] transition-colors shadow-[0_0_20px_rgba(166,255,0,0.3)] group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Gift className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Ver Catálogo Completo</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        )}

        <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
          Sua Prescrição Médica
        </h3>
        
        {prescriptionItems.length > 0 ? (
          prescriptionItems.map(item => (
            <div key={item.id} className="bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[24px] p-5 space-y-5 shadow-lg relative overflow-hidden group mb-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-mecura-neon/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-2 flex-shrink-0 shadow-inner relative">
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=400&auto=format&fit=crop"} 
                    alt={item.name} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.dataset.fallbackApplied) return;
                      target.dataset.fallbackApplied = 'true';
                      
                      const typeLower = item.name.toLowerCase();
                      if (typeLower.includes('óleo') || typeLower.includes('oil')) {
                        target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=Oleo";
                      } else if (typeLower.includes('goma') || typeLower.includes('gumm')) {
                        target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=Gomas";
                      } else {
                        target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=CBD";
                      }
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#0A0A0F] border border-[#262636] rounded-lg px-2 py-1 flex items-center gap-1 shadow-lg">
                    <span className="text-[10px] text-white font-bold">🇺🇸</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider mb-1 block">{item.brand || 'GreenBudzCBD'}</span>
                    <h4 className="font-bold text-white text-[15px] leading-tight">{item.name}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.details.slice(0, 2).map((detail, idx) => (
                      <span key={idx} className="text-[10px] bg-[#0A0A0F] border border-[#262636] text-[#8A8A9E] px-2 py-1 rounded-md">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-[#262636]">
                <div className="space-y-2">
                  <span className="text-[11px] text-[#8A8A9E] font-medium">Quantidade</span>
                  <div className="flex items-center gap-1 bg-[#0A0A0F] border border-[#262636] rounded-xl p-1 w-fit">
                    <button 
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#1A1A26] rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-white w-6 text-center text-sm">{quantities[item.id] || 1}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 bg-mecura-neon/10 border border-mecura-neon/20 px-2 py-1 rounded-md mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
                    <span className="text-[10px] text-mecura-neon font-bold">
                      Dura aprox. {Math.round((item.durationPerUnit * (quantities[item.id] || 1)) / 30)} meses
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    <span className="text-sm text-[#8A8A9E] font-normal mr-1">R$</span>
                    {(() => {
                      const qty = quantities[item.id] || 1;
                      const basePrice = item.priceUSD * exchangeRate;
                      let itemTotal = basePrice * qty;
                      const nameLower = item.name.toLowerCase();
                      
                      if (nameLower.includes('vibe') && !nameLower.includes('gumm')) {
                        if (qty >= 6) itemTotal *= 0.7;
                        else if (qty >= 4) itemTotal *= 0.8;
                        else if (qty >= 2) itemTotal *= 0.9;
                      } else if (nameLower.includes('chill') && nameLower.includes('gumm')) {
                        itemTotal = (Math.floor(qty / 10) * 350 * exchangeRate) + ((qty % 10) * basePrice);
                      } else if (nameLower.includes('drops by greenbudz') && nameLower.includes('gumm')) {
                        itemTotal = (Math.floor(qty / 2) * 49.90 * exchangeRate) + ((qty % 2) * basePrice);
                      } else if (nameLower.includes('ignite') && (nameLower.includes('óleo') || nameLower.includes('oil') || nameLower.includes('30ml'))) {
                        itemTotal = (Math.floor(qty / 3) * 2 * basePrice) + ((qty % 3) * basePrice);
                      }
                      
                      return itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-8 text-center">
            <Package className="w-12 h-12 text-[#8A8A9E] mx-auto mb-4 opacity-50" />
            <h4 className="text-white font-bold mb-2">Nenhum medicamento prescrito</h4>
            <p className="text-[#8A8A9E] text-sm">Sua prescrição médica ainda não contém medicamentos ou a consulta não foi finalizada.</p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {prescriptionItems.length > 0 && (
        <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-6 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-mecura-neon/5 blur-3xl rounded-full" />
          
          <h3 className="font-bold text-white text-lg">Resumo Financeiro</h3>
          
          <div className="space-y-3 text-sm relative z-10">
            <div className="flex justify-between text-[#8A8A9E]">
              <span>Produtos ({Object.values(quantities).reduce((a, b) => a + b, 0)} itens)</span>
              <span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[#8A8A9E] items-center">
              <span className="flex items-center gap-1.5">
                Frete
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-mecura-neon cursor-help" />
                </div>
              </span>
              <span className="text-white">R$ {shippingFeeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[#8A8A9E] items-center">
              <span className="flex items-center gap-1.5">
                Taxas Importação fixa
              </span>
              <span className="text-white">R$ {FIXED_IMPORT_TAX_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="pt-4 border-t border-[#262636] border-dashed">
              <div className="flex justify-between items-end">
                <span className="font-bold text-white text-base">Total Estimado</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-mecura-neon tracking-tight">
                    <span className="text-sm mr-1">R$</span>
                    {totalBeforeDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderAddress = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-32"
    >
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-mecura-neon/20 to-transparent rounded-2xl flex items-center justify-center mx-auto border border-mecura-neon/20 shadow-[0_0_20px_rgba(166,255,0,0.1)]">
          <MapPin className="w-7 h-7 text-mecura-neon" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">Endereço de Entrega</h2>
        <p className="text-sm text-[#8A8A9E] max-w-[280px] mx-auto leading-relaxed">
          Para onde enviaremos seu tratamento? O envio é discreto e seguro.
        </p>
      </div>

      <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-6 space-y-5 shadow-lg">
        <div>
          <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">CEP</label>
          <input 
            type="text" 
            placeholder="00000-000"
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Endereço Completo</label>
          <input 
            type="text" 
            placeholder="Rua, Avenida, etc."
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Número</label>
            <input 
              type="text" 
              placeholder="Ex: 123"
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Complemento</label>
            <input 
              type="text" 
              placeholder="Apto, Bloco"
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Bairro</label>
          <input 
            type="text" 
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Cidade</label>
            <input 
              type="text" 
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">UF</label>
            <input 
              type="text" 
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all text-center uppercase"
              maxLength={2}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPayment = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-32"
    >
      <div className="text-center space-y-3 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-mecura-neon/20 to-transparent rounded-2xl flex items-center justify-center mx-auto border border-mecura-neon/20 shadow-[0_0_20px_rgba(166,255,0,0.1)]">
          <Lock className="w-7 h-7 text-mecura-neon" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">Pagamento Seguro</h2>
        <p className="text-sm text-[#8A8A9E] max-w-[280px] mx-auto leading-relaxed">
          Escolha a melhor forma para você. Transação criptografada de ponta a ponta.
        </p>
      </div>

      <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-6 space-y-6 shadow-lg">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('pix')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
              paymentMethod === 'pix' 
                ? 'border-mecura-neon bg-mecura-neon/5 shadow-[0_0_15px_rgba(166,255,0,0.1)]' 
                : 'border-[#2A2A3A] hover:border-[#3A3A4A] bg-[#0A0A0F]'
            }`}
          >
            {paymentMethod === 'pix' && <div className="absolute inset-0 bg-gradient-to-b from-mecura-neon/10 to-transparent opacity-50" />}
            <QrCode className={`w-7 h-7 relative z-10 ${paymentMethod === 'pix' ? 'text-mecura-neon' : 'text-[#8A8A9E]'}`} />
            <div className="text-center relative z-10">
              <span className={`font-bold text-sm block ${paymentMethod === 'pix' ? 'text-white' : 'text-[#8A8A9E]'}`}>PIX</span>
              <span className="text-[10px] text-[#0A0A0F] font-bold bg-mecura-neon px-2 py-0.5 rounded-full mt-1 inline-block">5% OFF</span>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('credit_card')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
              paymentMethod === 'credit_card' 
                ? 'border-mecura-neon bg-mecura-neon/5 shadow-[0_0_15px_rgba(166,255,0,0.1)]' 
                : 'border-[#2A2A3A] hover:border-[#3A3A4A] bg-[#0A0A0F]'
            }`}
          >
            {paymentMethod === 'credit_card' && <div className="absolute inset-0 bg-gradient-to-b from-mecura-neon/10 to-transparent opacity-50" />}
            <CreditCard className={`w-7 h-7 relative z-10 ${paymentMethod === 'credit_card' ? 'text-mecura-neon' : 'text-[#8A8A9E]'}`} />
            <div className="text-center relative z-10">
              <span className={`font-bold text-sm block ${paymentMethod === 'credit_card' ? 'text-white' : 'text-[#8A8A9E]'}`}>Cartão</span>
              <span className="text-[10px] text-[#8A8A9E] font-medium mt-1 inline-block">Até 6x sem juros</span>
            </div>
          </button>
        </div>

        {paymentMethod === 'credit_card' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-5 pt-2"
          >
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Parcelamento</label>
              <div className="relative">
                <select className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all appearance-none font-medium">
                  <option>1x de R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros</option>
                  <option>2x de R$ {(finalTotal/2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros</option>
                  <option>3x de R$ {(finalTotal/3).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros</option>
                  <option>6x de R$ {(finalTotal/6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E] pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Número do Cartão</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E] font-mono"
                />
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A5E]" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Validade</label>
                <input 
                  type="text" 
                  placeholder="MM/AA"
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">CVV</label>
                <input 
                  type="text" 
                  placeholder="123"
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E] font-mono"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Nome no Cartão</label>
              <input 
                type="text" 
                placeholder="Como impresso no cartão"
                className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E] uppercase"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-mecura-pearl font-sans relative">
      {/* Mobile constraint wrapper */}
      <div className="max-w-md mx-auto min-h-screen bg-[#0A0A0F] relative shadow-2xl border-x border-[#1A1A26] pb-40">
        
        <header className="flex items-center gap-4 p-6 pt-8 sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-xl z-50 border-b border-[#1A1A26]">
          <button 
            onClick={() => step === 1 ? navigate(-1) : setStep(step - 1 as any)}
            className="w-10 h-10 rounded-full bg-[#161622] flex items-center justify-center border border-[#262636] hover:border-mecura-neon/50 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover:text-mecura-neon transition-colors" />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">Farmácia GreenBudz</h1>
            <p className="text-xs text-mecura-neon font-medium">Vendido e entregue por GreenBudz</p>
          </div>
        </header>

        <div className="px-6 pt-6">
          {renderStepIndicator()}

          <AnimatePresence mode="wait">
            {step === 1 && <motion.div key="step1">{renderCart()}</motion.div>}
            {step === 2 && <motion.div key="step2">{renderAddress()}</motion.div>}
            {step === 3 && <motion.div key="step3">{renderPayment()}</motion.div>}
          </AnimatePresence>
        </div>

        {/* Sticky Bottom Action Bar */}
        {prescriptionItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-[#161622]/95 backdrop-blur-xl border border-[#262636] rounded-[28px] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#8A8A9E] font-medium uppercase tracking-wider">Total a pagar</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">R$</span>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'pix' && step === 3 && (
                    <div className="bg-mecura-neon/10 border border-mecura-neon/20 px-2.5 py-1 rounded-lg">
                      <span className="text-[10px] font-bold text-mecura-neon">5% OFF APLICADO</span>
                    </div>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step < 3) setStep(step + 1 as any);
                    else {
                      alert('Pedido confirmado com sucesso!');
                      navigate('/dashboard');
                    }
                  }}
                  className="w-full bg-mecura-neon text-[#0A0A0F] font-bold py-4 rounded-2xl hover:bg-[#b5ff33] transition-colors shadow-[0_0_20px_rgba(166,255,0,0.2)] flex items-center justify-center gap-2 text-[15px]"
                >
                  {step === 1 ? 'Continuar para Entrega' : step === 2 ? 'Ir para Pagamento' : 'Confirmar Compra Segura'}
                  {step === 3 ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </motion.button>
                
                {step === 3 && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[#6A6A7E]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Pagamento 100% seguro processado por Stone</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
