import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Gift,
  Building2,
  Download,
  User
} from 'lucide-react';
import { FLOWERMED_PRODUCTS } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { cbdGuideData } from '../data/cbdGuide';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { deliverPdfBlob } from '../utils/downloadHelper';

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.03-.491-1.615-.662-2.644-2.31-2.724-2.418-.081-.108-.65-.866-.65-1.65 0-.783.407-1.168.552-1.328.144-.16.315-.2.42-.2.105 0 .21 0 .3.005.096.005.225-.037.352.269.13.313.447 1.092.486 1.172.04.08.066.174.013.28-.053.107-.08.174-.16.268-.08.093-.17.208-.242.279-.08.08-.164.167-.07.329.094.161.417.689.897 1.116.618.55 1.139.721 1.301.802.161.08.257.067.352-.04.095-.108.406-.472.514-.633.107-.162.215-.134.362-.08.148.053.937.442 1.098.522.161.08.269.121.309.188.04.068.04.393-.104.798z"/>
    </svg>
  );
}

const SHIPPING_FEE_USD = 36.00;
const FIXED_IMPORT_TAX_BRL = 39.90;

export function PharmacyScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, userName, userBirthDate, userCpf, userPhone, exchangeRate, pagamento_consulta, isConsultationFinished } = useStore();
  const { promotionsText, catalogUrl, catalogUrlNacional, setPromotionsText } = useAdminStore();
  
  const hasPaidConsultation = !!(
    pagamento_consulta || 
    (typeof window !== 'undefined' && localStorage.getItem('mecura_pagamento') === 'true')
  );

  useEffect(() => {
    if (promotionsText.includes('Desconto progressivo por volume')) {
      setPromotionsText('🔥 PROMOÇÕES ATIVAS 🔥\n\n• Drops Day&Night: 15% OFF (NIGHTSHADE + FORMULA ONE).\n• Combo para Dormir bem: Compre 2x óleos Deep Vibe e ganhe uma NIGHTSHADE.\n• Combo para ser Produtivo: Compre 2x óleos Super Vibe e ganhe uma FORMULA ONE.\n• Linha vibe na sua rotina: 15% OFF no combo SUPER e DEEP vibe.\n• Foco mental com THCV: 15% OFF no SLIM VIBE.\n• Formula de 40 Servings: Leve outra de 10 Servings com 50% OFF.\n• 2x Formulas da mesma Strain: Leve a segunda com 20% OFF (10 ou 40 Servings).\n• 2x Dried Formula da Strain BM: De 40 servings, leve a segunda com 30% OFF.');
    }
  }, [promotionsText, setPromotionsText]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  
  // Extract prescribed items from messages & classify accurately
  const prescriptionItems = useMemo(() => {
    let collectedProds: Array<{
      id: string;
      name: string;
      brand?: string;
      origin?: string;
      type?: string;
      dosage?: string[];
      details?: string[];
      description?: string;
      priceUSD?: number;
      priceBRL?: number;
      image?: string;
    }> = [];

    // 1. Check direct product messages
    const productMessages = messages.filter(msg => msg.type === 'product' && msg.productData);
    productMessages.forEach(m => {
      collectedProds.push({
        id: m.id,
        name: m.productData!.name,
        brand: m.productData!.brand,
        origin: m.productData!.origin,
        type: m.productData!.type,
        dosage: Array.isArray(m.productData!.dosage) ? m.productData!.dosage : [String(m.productData!.dosage || '')],
        details: m.productData!.details,
        description: m.productData!.description,
        priceUSD: m.productData!.priceUSD,
        priceBRL: m.productData!.priceBRL,
        image: m.productData!.image
      });
    });

    // 2. Check receita_previa messages
    if (collectedProds.length === 0) {
      const previaMsg = messages.find(m => m.type === 'receita_previa' && m.receitaPreviaData?.items?.length);
      if (previaMsg?.receitaPreviaData?.items) {
        previaMsg.receitaPreviaData.items.forEach((it, idx) => {
          collectedProds.push({
            id: `${previaMsg.id}-${idx}`,
            name: it.name,
            brand: it.brand,
            origin: it.origin,
            type: it.type,
            dosage: Array.isArray(it.dosage) ? it.dosage : [String(it.dosage || '')],
            details: it.details,
            description: it.description,
            priceUSD: (it as any).priceUSD,
            priceBRL: (it as any).priceBRL,
            image: (it as any).image
          });
        });
      }
    }

    const rawItems = collectedProds.map((prod, index) => {
      const nameLower = (prod.name || '').toLowerCase();
      const brandLower = (prod.brand || '').toLowerCase();
      const originLower = (prod.origin || '').toLowerCase();

      // Check if explicitly national association
      const isExplicitlyNational = (
        prod.origin === 'Nacional' ||
        originLower.includes('nacional') ||
        originLower.includes('associação') ||
        originLower.includes('associacao') ||
        originLower.includes('abec') ||
        brandLower.includes('abec') ||
        brandLower.includes('associação') ||
        brandLower.includes('associacao') ||
        brandLower.includes('nacional') ||
        nameLower.includes('abec') ||
        nameLower.includes('associação') ||
        nameLower.includes('associacao') ||
        nameLower.includes('alto cbd') ||
        nameLower.includes('alto thc') ||
        nameLower.includes('equilibrado full spectrum') ||
        nameLower.includes('cbd 5:1') ||
        nameLower.includes('cbd 10:1') ||
        nameLower.includes('cbd 20:1') ||
        nameLower.includes('cbd 2:1') ||
        nameLower.includes('4 cbd : 1 cbg : 1 cbn')
      );

      // Check if explicitly imported
      const isExplicitlyImported = !isExplicitlyNational && (
        prod.origin === 'Importado' ||
        brandLower.includes('flowermed') || 
        brandLower.includes('greenbudz') || 
        brandLower.includes('folheto') ||
        brandLower.includes('sphera') ||
        originLower.includes('importad') ||
        originLower.includes('eua') ||
        originLower.includes('usa') ||
        nameLower.includes('flowermed') ||
        nameLower.includes('greenbudz') ||
        nameLower.includes('sphera') ||
        nameLower.includes('lemon octane') ||
        nameLower.includes('sour lifter') ||
        nameLower.includes('forbidden fruit') ||
        nameLower.includes('superglue') ||
        nameLower.includes('gelato') ||
        nameLower.includes('glitter bomb') ||
        nameLower.includes('astro candy') ||
        nameLower.includes('strawpicana') ||
        nameLower.includes('zoap') ||
        nameLower.includes('trop banana') ||
        nameLower.includes('girl cookies') ||
        nameLower.includes('syringe') ||
        nameLower.includes('budder') ||
        nameLower.includes('chill vibe') ||
        nameLower.includes('calm vibe') ||
        nameLower.includes('full balance') ||
        nameLower.includes('drops by') ||
        nameLower.includes('d9 nano') ||
        nameLower.includes('hemp oil')
      );

      const isAssociacao = isExplicitlyNational || (!isExplicitlyImported && (
        originLower.includes('nacional') ||
        originLower.includes('associação') ||
        originLower.includes('associacao') ||
        originLower.includes('abec') ||
        brandLower.includes('abec') ||
        brandLower.includes('associação') ||
        brandLower.includes('associacao') ||
        brandLower.includes('nacional') ||
        nameLower.includes('abec') ||
        nameLower.includes('associação') ||
        nameLower.includes('associacao') ||
        nameLower.includes('nacional')
      ));

      // Resolve USD base price for imported items so that exchangeRate converts it dynamically
      let resolvedPriceUSD: number | undefined = prod.priceUSD;

      if (!isAssociacao) {
        const cleanName = nameLower.trim();

        const fe = FLOWER_EXTRACTIONS_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
        if (fe) {
          if (fe.priceUSD) resolvedPriceUSD = fe.priceUSD;
          else if (fe.priceBRL) resolvedPriceUSD = fe.priceBRL / 5.0;
        }

        if (!resolvedPriceUSD) {
          const fm = FLOWERMED_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          if (fm) {
            if (fm.priceUSD) resolvedPriceUSD = fm.priceUSD;
            else if (fm.priceBRL) resolvedPriceUSD = fm.priceBRL / 5.0;
          }
        }

        if (!resolvedPriceUSD) {
          for (const cat of cbdGuideData) {
            const p = cat.products.find(pr => pr.name.toLowerCase() === cleanName || cleanName.includes(pr.name.toLowerCase()) || pr.name.toLowerCase().includes(cleanName));
            if (p) {
              if (p.priceUSD) resolvedPriceUSD = p.priceUSD;
              else if (p.priceBRL) resolvedPriceUSD = p.priceBRL / 5.0;
              break;
            }
          }
        }

        if (!resolvedPriceUSD) {
          if (prod.priceBRL) {
            resolvedPriceUSD = prod.priceBRL / 5.0;
          } else {
            resolvedPriceUSD = index === 0 ? 80.00 : 39.90;
          }
        }
      }

      const unitPriceBRL = isAssociacao 
        ? 0 
        : Number(((resolvedPriceUSD || 80.00) * exchangeRate).toFixed(2));

      return {
        id: prod.id,
        name: prod.name,
        brand: isAssociacao ? 'Associação Nacional' : (prod.brand || 'GreenBudz / Flowermed (EUA)'),
        origin: isAssociacao ? 'Nacional' : (prod.origin || 'Importado'),
        details: prod.details || [],
        dosage: prod.dosage || [],
        description: prod.description || '',
        isAssociacao: Boolean(isAssociacao),
        priceUSD: resolvedPriceUSD,
        priceBRL: unitPriceBRL,
        unitPriceBRL,
        durationPerUnit: 60,
        image: prod.image,
      };
    });

    return rawItems;
  }, [messages, exchangeRate, isConsultationFinished]);

  const importedItems = prescriptionItems.filter(item => !item.isAssociacao);
  const associacaoItems = prescriptionItems.filter(item => item.isAssociacao);
  const hasImportedItems = importedItems.length > 0;
  const hasAssociacaoItems = associacaoItems.length > 0;

  // Cart State
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Initialize quantities when items change
  useEffect(() => {
    const newQuantities: Record<string, number> = {};
    importedItems.forEach(item => {
      if (!quantities[item.id]) {
        newQuantities[item.id] = 1;
      } else {
        newQuantities[item.id] = quantities[item.id];
      }
    });
    if (Object.keys(newQuantities).length > 0 && Object.keys(quantities).length === 0) {
      setQuantities(newQuantities);
    }
  }, [importedItems]);

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

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(20, (prev[id] || 1) + delta))
    }));
  };

  // Calculations ONLY for imported items
  const calculateSubtotal = () => {
    let total = 0;
    
    importedItems.forEach(item => {
      const qty = quantities[item.id] || 1;
      const basePrice = item.unitPriceBRL;
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

      total += itemTotal;
    });
    
    return total;
  };

  const shippingFeeBRL = hasImportedItems ? SHIPPING_FEE_USD * exchangeRate : 0;
  const fixedImportTaxBRL = hasImportedItems ? FIXED_IMPORT_TAX_BRL : 0;
  const subtotal = calculateSubtotal();
  const totalBeforeDiscount = hasImportedItems ? (subtotal + shippingFeeBRL + fixedImportTaxBRL) : 0;
  const finalTotal = Math.max(0, totalBeforeDiscount - discount);

  const handleSendWhatsAppOrder = () => {
    const itemsText = importedItems.map(item => {
      const qty = quantities[item.id] || 1;
      const itemTotal = item.unitPriceBRL * qty;
      return `• *${qty}x* ${item.name} (${item.brand}) - R$ ${itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }).join('\n');

    const addressText = address.street.trim()
      ? `${address.street}, ${address.number || 'S/N'} ${address.complement ? `(${address.complement})` : ''}
Bairro: ${address.neighborhood || 'Não informado'}
Cidade: ${address.city || ''} - ${address.state || ''}
CEP: ${address.cep || ''}`
      : 'A combinar com a equipe';

    const patientInfo = `Nome: ${userName || 'Paciente'}${userCpf ? `\nCPF: ${userCpf}` : ''}${userPhone ? `\nTelefone: ${userPhone}` : ''}`;

    const message = `🌿 *SOLICITAÇÃO DE PEDIDO - FARMÁCIA GREENBUDZ* 🌿

👤 *DADOS DO PACIENTE:*
${patientInfo}

📦 *MEDICAMENTOS PRESCRITOS:*
${itemsText}

🚚 *ENDEREÇO DE ENTREGA:*
${addressText}

💰 *RESUMO FINANCEIRO:*
• Subtotal dos Produtos: R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Frete Internacional: R$ ${shippingFeeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Taxas de Importação fixa: R$ ${fixedImportTaxBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
*VALOR TOTAL ESTIMADO: R$ ${finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

Olá! Gostaria de confirmar a solicitação do meu pedido e receber as orientações de finalização e envio! ✨`;

    const whatsappUrl = `https://wa.me/5566996280883?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    navigate('/dashboard');
  };

  const handleDownloadPrescription = async () => {
    setIsDownloadingPdf(true);
    try {
      const pName = userName || 'Paciente';
      const blob = await generatePrescriptionPDF(pName, messages, {
        customPatientName: pName,
        birthDate: userBirthDate,
        cpf: userCpf,
        returnBlob: true
      }) as Blob;
      if (blob) {
        deliverPdfBlob(blob, `Receita_Medica_${pName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (e) {
      console.error("Erro ao gerar receita:", e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[
        { num: 1, label: 'Carrinho' },
        { num: 2, label: 'Entrega & Solicitação' }
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
          {idx < 1 && (
            <div className={`w-12 h-[2px] mb-4 mx-2 transition-colors duration-500 ${
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
      className="space-y-6 pb-48 sm:pb-56"
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
            Produtos originais dos EUA. Vendido e entregue por <strong className="text-white">GreenBudz / Flowermed</strong>. Cuidamos de todo o processo alfandegário com taxa fixa.
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
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 border-b border-mecura-neon/20 pb-4">
                <h4 className="text-mecura-neon font-black text-xl flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-6 h-6 animate-pulse text-mecura-neon" />
                  Ofertas Especiais
                </h4>
                <div className="px-4 py-1.5 bg-mecura-neon text-[#0A0A0F] rounded-full font-black text-xs tracking-widest shadow-[0_0_15px_rgba(166,255,0,0.5)]">
                  ATIVAS AGORA
                </div>
              </div>
              
              {promotionsText && (
                <div className="mb-6 space-y-2 text-sm text-mecura-pearl">
                  {promotionsText.split('\n').map((line, index) => (
                    <div key={index} className="leading-relaxed">{line}</div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <a 
                  href={'https://drive.google.com/file/d/1X5dDlzrVQ5bENVFd8He96OB-TT39gA8Z/preview'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-mecura-neon text-[#0A0A0F] px-6 py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-[#b5ff33] transition-colors shadow-[0_0_20px_rgba(166,255,0,0.3)]"
                >
                  <Gift className="w-5 h-5" />
                  <span>VER CATÁLOGO PRODUTOS VIA INALADA</span>
                </a>
                
                <a 
                  href={'https://drive.google.com/file/d/1RkfK1c76aaiyLnSeVxSsFif8WAEi3aU_/preview'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-mecura-pearl text-[#0A0A0F] px-6 py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-white transition-colors"
                >
                  <Gift className="w-5 h-5" />
                  <span>VER CATÁLOGO PRODUTOS VIA ORAL</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1. SEÇÃO DE PRODUTOS IMPORTADOS */}
        {hasImportedItems && (
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                🇺🇸 Medicamentos Importados (EUA)
              </span>
              <span className="text-xs font-sans text-mecura-silver">
                {importedItems.length} {importedItems.length === 1 ? 'item' : 'itens'}
              </span>
            </h3>
            
            {importedItems.map((item, idx) => {
              const qty = quantities[item.id] || 1;
              const basePrice = item.unitPriceBRL;
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
              }

              return (
                <div key={`${item.id || 'imp'}-${idx}`} className="bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[24px] p-5 space-y-5 shadow-lg relative overflow-hidden group mb-4">
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
                          target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=Importado";
                        }}
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#0A0A0F] border border-[#262636] rounded-lg px-2 py-1 flex items-center gap-1 shadow-lg">
                        <span className="text-[10px] text-white font-bold">🇺🇸</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider mb-1 block">
                          {item.brand || 'GreenBudzCBD'}
                        </span>
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
                        <span className="font-bold text-white w-6 text-center text-sm">{qty}</span>
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
                          Dura aprox. {Math.round((item.durationPerUnit * qty) / 30)} meses
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white tracking-tight">
                        <span className="text-sm text-[#8A8A9E] font-normal mr-1">R$</span>
                        {itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. SEÇÃO DE PRODUTOS DE ASSOCIAÇÃO NACIONAL (SEM PREÇO / SEM COBRANÇA DE IMPORTAÇÃO) */}
        {hasAssociacaoItems && (
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-serif font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                🇧🇷 Opções de Associação Nacional (Brasil)
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Direto na Associação
              </span>
            </h3>

            <div className="bg-[#121A16] border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-300/90 leading-relaxed flex items-start gap-3 shadow-sm">
              <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Aquisição Direta com Associação Brasileira Autorizada</strong>
                Os itens abaixo foram receitados como opções nacionais de alta qualidade. O fornecimento é intermediado diretamente pela associação credenciada, <strong>sem custos alfandegários ou taxas de importação</strong>.
              </div>
            </div>

            {associacaoItems.map((item, idx) => (
              <div key={`${item.id || 'assoc'}-${idx}`} className="bg-gradient-to-b from-[#0D1512] to-[#121A16] border border-emerald-500/30 rounded-[24px] p-5 space-y-4 shadow-lg relative overflow-hidden group mb-3">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#0A0A0F] border border-emerald-500/20 p-2 flex-shrink-0 shadow-inner relative flex items-center justify-center">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1603903597871-3312c9ba4c81?q=80&w=400&auto=format&fit=crop"} 
                      alt={item.name} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.dataset.fallbackApplied) return;
                        target.dataset.fallbackApplied = 'true';
                        target.src = "https://placehold.co/400x400/0f241a/10b981?text=Associacao";
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#0A0A0F] border border-emerald-500/30 rounded-lg px-2 py-0.5 flex items-center gap-1 shadow-lg">
                      <span className="text-[10px] text-white font-bold">🇧🇷</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">
                        Associação Nacional
                      </span>
                      <h4 className="font-bold text-white text-[15px] leading-tight">{item.name}</h4>
                    </div>
                    {item.dosage && item.dosage.length > 0 && (
                      <p className="text-xs text-mecura-silver/90 mt-1.5 line-clamp-2">
                        {item.dosage.join(' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs text-emerald-400/80 font-medium">
                    Fornecimento Institucional
                  </span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                    Sem cobrança no checkout
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasImportedItems && !hasAssociacaoItems && (
          <div className="bg-[#12121A] border border-mecura-elevated rounded-[24px] p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-mecura-surface flex items-center justify-center mx-auto text-mecura-silver border border-white/5">
              <Package className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-lg">Nenhum Medicamento Prescrito Ainda</h4>
              <p className="text-xs text-mecura-silver max-w-md mx-auto leading-relaxed">
                A sua farmácia personalizada é individualizada e será liberada assim que o médico emitir a sua receita oficial durante o atendimento.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
              {!hasPaidConsultation ? (
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-mecura-neon hover:bg-[#b5ff33] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(166,255,0,0.3)] transition-all cursor-pointer"
                >
                  Iniciar Consulta Médica
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="w-full py-3 bg-mecura-neon hover:bg-[#b5ff33] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(166,255,0,0.3)] transition-all cursor-pointer"
                >
                  Acessar Sala de Consulta
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Voltar ao Painel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Financeiro (APENAS SE HOUVER IMPORTADOS) */}
      {hasImportedItems ? (
        <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-6 space-y-4 relative overflow-hidden mb-8">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-mecura-neon/5 blur-3xl rounded-full" />
          
          <h3 className="font-bold text-white text-lg">Resumo Financeiro (Importados)</h3>
          
          <div className="space-y-3 text-sm relative z-10">
            <div className="flex justify-between text-[#8A8A9E]">
              <span>Produtos ({importedItems.reduce((acc, item) => acc + (quantities[item.id] || 1), 0)} itens)</span>
              <span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[#8A8A9E] items-center">
              <span className="flex items-center gap-1.5">
                Frete Internacional
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
      ) : hasAssociacaoItems ? (
        <div className="bg-[#121A16] border border-emerald-500/20 rounded-[24px] p-6 text-center space-y-3">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
          <h4 className="text-white font-bold text-base">Receita de Associação Nacional</h4>
          <p className="text-xs text-mecura-silver max-w-sm mx-auto">
            Utilize o documento oficial da receita para efetuar a aquisição direta junto à associação brasileira indicada.
          </p>
          <button
            onClick={handleDownloadPrescription}
            disabled={isDownloadingPdf}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0F] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Download className="w-4 h-4" />
            {isDownloadingPdf ? 'Baixando PDF...' : 'Baixar Receita Médica Oficial (PDF)'}
          </button>
        </div>
      ) : null}
    </motion.div>
  );

  const renderAddress = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-48 sm:pb-56"
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
            value={address.cep}
            onChange={(e) => setAddress({ ...address, cep: e.target.value })}
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Endereço Completo</label>
          <input 
            type="text" 
            placeholder="Rua, Avenida, etc."
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Número</label>
            <input 
              type="text" 
              placeholder="Ex: 123"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Complemento</label>
            <input 
              type="text" 
              placeholder="Apto, Bloco..."
              value={address.complement}
              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Bairro</label>
          <input 
            type="text" 
            placeholder="Seu bairro"
            value={address.neighborhood}
            onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
            className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Cidade</label>
            <input 
              type="text" 
              placeholder="Sua cidade"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#8A8A9E] uppercase tracking-wider mb-2">Estado</label>
            <input 
              type="text" 
              placeholder="UF"
              maxLength={2}
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon/50 transition-all placeholder:text-[#4A4A5E] uppercase text-center"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1A1A26]">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => {
              if (step > 1) setStep((step - 1) as any);
              else navigate('/dashboard');
            }}
            className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#202030] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif font-bold text-base tracking-wide">
              {hasImportedItems ? 'Farmácia GreenBudz' : 'Prescrição Médica'}
            </h1>
            <span className="text-[10px] text-mecura-neon font-medium block">
              {hasImportedItems ? 'Vendido e entregue por GreenBudz' : 'Dispensação & Acompanhamento'}
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-[#161622] border border-mecura-neon/30 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 transition-colors"
            title="Acessar Área do Paciente"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {hasImportedItems && renderStepIndicator()}

        <AnimatePresence mode="wait">
          {step === 1 && renderCart()}
          {step === 2 && renderAddress()}
        </AnimatePresence>

        {/* Sticky Bottom Action Bar */}
        {hasImportedItems ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-[#161622]/95 backdrop-blur-xl border border-[#262636] rounded-[28px] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#8A8A9E] font-medium uppercase tracking-wider">Total do Pedido</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">R$</span>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-emerald-400">IMPORTAÇÃO OFICIAL</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step === 1) {
                      setStep(2);
                    } else {
                      handleSendWhatsAppOrder();
                    }
                  }}
                  className={`w-full font-bold py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(166,255,0,0.25)] flex items-center justify-center gap-2.5 text-[15px] cursor-pointer ${
                    step === 1
                      ? 'bg-mecura-neon text-[#0A0A0F] hover:bg-[#b5ff33]'
                      : 'bg-[#25D366] text-white hover:bg-[#20ba59] shadow-[0_0_25px_rgba(37,211,102,0.35)]'
                  }`}
                >
                  {step === 1 ? (
                    <>
                      <span>Continuar para Endereço de Entrega</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="w-5 h-5 fill-current" />
                      <span>Solicitar Pedido no WhatsApp</span>
                    </>
                  )}
                </motion.button>
                
                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[#8A8A9E]">
                  <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" />
                  <span className="text-[10px]">
                    {step === 1 ? 'Processo de importação legalizado pela Anvisa' : 'Atendimento e suporte direto com a equipe oficial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : hasAssociacaoItems ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-[#161622]/95 backdrop-blur-xl border border-emerald-500/30 rounded-[28px] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0F] font-bold py-4 rounded-2xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-[15px]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Voltar ao Painel do Paciente
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
