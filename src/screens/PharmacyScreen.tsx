import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useAdminStore, PharmacyPreparedOrder } from '../store/useAdminStore';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
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
  const { messages, userName, userEmail, userBirthDate, userCpf, userPhone, patientId, activeConsultationId, queue, exchangeRate, pagamento_consulta, isConsultationFinished, subscribeToMessages } = useStore();
  const { promotionsText, catalogUrl, catalogUrlNacional, setPromotionsText, pharmacyOrders, updatePharmacyOrderStatus } = useAdminStore();
  
  const currentUid = auth.currentUser?.uid || (patientId && patientId !== 'doctor' ? patientId : '') || activeConsultationId || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : '') || '';
  const [directCloudOrder, setDirectCloudOrder] = useState<PharmacyPreparedOrder | null>(null);

  useEffect(() => {
    if (!currentUid) return;
    const unsubMsgs = subscribeToMessages(currentUid);
    const unsubOrder = onSnapshot(doc(db, 'pharmacy_orders', `order_${currentUid}`), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PharmacyPreparedOrder;
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setDirectCloudOrder({ ...data, id: snap.id });
        }
      }
    }, () => {});

    const unsubUser = onSnapshot(doc(db, 'users', currentUid), (snap) => {
      if (snap.exists()) {
        const uData = snap.data();
        if (uData?.approvedPharmacyOrder && Array.isArray(uData.approvedPharmacyOrder.items)) {
          setDirectCloudOrder(uData.approvedPharmacyOrder);
        }
      }
    }, () => {});

    return () => {
      unsubMsgs();
      unsubOrder();
      unsubUser();
    };
  }, [currentUid, subscribeToMessages]);

  // Match approved order for this patient by ID, email, CPF, phone, or name
  const approvedOrder = useMemo(() => {
    const cleanEmail = (auth.currentUser?.email || userEmail || '').trim().toLowerCase();
    const cleanCpf = (userCpf || '').replace(/\D/g, '');
    const cleanPhone = (userPhone || '').replace(/\D/g, '');
    const cleanName = (userName || '').trim().toLowerCase();

    const matchedInStore = (pharmacyOrders || []).find(o => {
      if (o.status !== 'approved' && o.status !== 'requested') return false;
      if (currentUid && o.patientId === currentUid) return true;
      if (cleanEmail && o.patientEmail && o.patientEmail.trim().toLowerCase() === cleanEmail) return true;
      if (cleanCpf.length >= 11 && o.patientCpf && o.patientCpf.replace(/\D/g, '') === cleanCpf) return true;
      if (cleanPhone.length >= 8 && o.patientPhone && o.patientPhone.replace(/\D/g, '') === cleanPhone) return true;
      if (cleanName && cleanName !== 'paciente' && o.patientName && o.patientName.trim().toLowerCase() === cleanName) return true;
      return false;
    });

    if (matchedInStore) return matchedInStore;
    if (directCloudOrder && (directCloudOrder.status === 'approved' || directCloudOrder.status === 'requested')) {
      return directCloudOrder;
    }
    return null;
  }, [pharmacyOrders, directCloudOrder, currentUid, userEmail, userCpf, userPhone, userName]);

  const hasApprovedOrder = !!(approvedOrder && approvedOrder.items && approvedOrder.items.length > 0);
  const myQueueEntry = useMemo(() => queue.find(p => currentUid && p.id === currentUid), [queue, currentUid]);

  const hasPaidConsultation = !!(
    pagamento_consulta || 
    isConsultationFinished ||
    hasApprovedOrder ||
    myQueueEntry?.status === 'finished' ||
    myQueueEntry?.status === 'in-consultation' ||
    myQueueEntry?.status === 'waiting' ||
    messages.some(m => m.type === 'product' || m.type === 'prescription' || m.type === 'receita_previa') ||
    (typeof window !== 'undefined' && (
      localStorage.getItem('mecura_pagamento') === 'true' ||
      localStorage.getItem('mecura_consultation_finished') === 'true'
    ))
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

    // 2. Check receita_previa or prescription messages with receitaPreviaData
    if (collectedProds.length === 0) {
      const previaMsg = messages.find(m => (m.type === 'receita_previa' || m.type === 'prescription') && m.receitaPreviaData?.items?.length);
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

      // Resolve BRL and USD prices from catalog
      let resolvedPriceUSD: number | undefined = prod.priceUSD;
      let resolvedPriceBRL: number | undefined = prod.priceBRL;
      const cleanName = nameLower.trim();

      for (const cat of cbdGuideData) {
        const p = cat.products.find(
          pr =>
            pr.name.toLowerCase() === cleanName ||
            cleanName.includes(pr.name.toLowerCase()) ||
            pr.name.toLowerCase().includes(cleanName)
        );
        if (p) {
          if (p.priceBRL) resolvedPriceBRL = p.priceBRL;
          if (p.priceUSD) resolvedPriceUSD = p.priceUSD;
          break;
        }
      }

      if (!isAssociacao) {
        if (!resolvedPriceBRL && !resolvedPriceUSD) {
          const fe = FLOWER_EXTRACTIONS_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          if (fe) {
            if (fe.priceBRL) resolvedPriceBRL = fe.priceBRL;
            if (fe.priceUSD) resolvedPriceUSD = fe.priceUSD;
          }
        }

        if (!resolvedPriceBRL && !resolvedPriceUSD) {
          const fm = FLOWERMED_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          if (fm) {
            if (fm.priceBRL) resolvedPriceBRL = fm.priceBRL;
            if (fm.priceUSD) resolvedPriceUSD = fm.priceUSD;
          }
        }

        if (!resolvedPriceUSD && !resolvedPriceBRL) {
          resolvedPriceUSD = index === 0 ? 80.00 : 39.90;
        }
      }

      const unitPriceBRL = resolvedPriceBRL
        ? Number(resolvedPriceBRL.toFixed(2))
        : isAssociacao
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
  
  // Initialize quantities when items change (preserving 0 if already set by the patient)
  useEffect(() => {
    setQuantities(prev => {
      const next = { ...prev };
      let changed = false;
      [...importedItems, ...associacaoItems].forEach(item => {
        if (next[item.id] === undefined) {
          next[item.id] = 1;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [importedItems, associacaoItems]);

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

  const getItemQty = (id: string, defaultQty = 1): number => {
    return quantities[id] !== undefined ? quantities[id] : defaultQty;
  };

  const handleQuantityChange = (id: string, delta: number, defaultQty = 1) => {
    setQuantities(prev => {
      const current = prev[id] !== undefined ? prev[id] : defaultQty;
      return {
        ...prev,
        [id]: Math.max(0, Math.min(20, current + delta))
      };
    });
  };

  // Calculations ONLY for imported items
  const calculateSubtotal = () => {
    let total = 0;
    
    importedItems.forEach(item => {
      const qty = getItemQty(item.id, 1);
      if (qty <= 0) return;
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

  const subtotal = calculateSubtotal();
  const hasSelectedImportedItems = hasImportedItems && subtotal > 0;
  const shippingFeeBRL = hasSelectedImportedItems ? SHIPPING_FEE_USD * exchangeRate : 0;
  const fixedImportTaxBRL = hasSelectedImportedItems ? FIXED_IMPORT_TAX_BRL : 0;
  const totalBeforeDiscount = hasSelectedImportedItems ? (subtotal + shippingFeeBRL + fixedImportTaxBRL) : 0;
  const finalTotal = Math.max(0, totalBeforeDiscount - discount);

  // Sync quantities with approvedOrder items when approvedOrder arrives
  useEffect(() => {
    if (approvedOrder && approvedOrder.items.length > 0) {
      setQuantities(prev => {
        const next = { ...prev };
        approvedOrder.items.forEach(it => {
          if (next[it.id] === undefined) {
            next[it.id] = it.unitQuantity ?? 1;
          }
        });
        return next;
      });
      if (approvedOrder.deliveryAddress && approvedOrder.deliveryAddress.street && !address.street) {
        setAddress({
          cep: approvedOrder.deliveryAddress.cep || '',
          street: approvedOrder.deliveryAddress.street || '',
          neighborhood: approvedOrder.deliveryAddress.neighborhood || '',
          number: approvedOrder.deliveryAddress.number || '',
          complement: approvedOrder.deliveryAddress.complement || '',
          state: approvedOrder.deliveryAddress.state || '',
          city: approvedOrder.deliveryAddress.city || ''
        });
      }
    }
  }, [approvedOrder]);

  const approvedSubtotalBRL = useMemo(() => {
    if (!approvedOrder) return 0;
    return approvedOrder.items.reduce(
      (sum, it) => {
        const qty = quantities[it.id] !== undefined ? quantities[it.id] : (it.unitQuantity ?? 1);
        return sum + (Number(it.unitPriceBRL) || 0) * qty;
      },
      0
    );
  }, [approvedOrder, quantities]);

  const approvedActiveCount = useMemo(() => {
    if (!approvedOrder) return 0;
    return approvedOrder.items.reduce(
      (sum, it) => sum + (quantities[it.id] !== undefined ? quantities[it.id] : (it.unitQuantity ?? 1)),
      0
    );
  }, [approvedOrder, quantities]);

  const approvedFinalTotalBRL = useMemo(() => {
    if (!approvedOrder || approvedActiveCount <= 0) return 0;
    return Math.max(
      0,
      approvedSubtotalBRL + (Number(approvedOrder.shippingBRL) || 0) - (Number(approvedOrder.discountBRL) || 0)
    );
  }, [approvedOrder, approvedSubtotalBRL, approvedActiveCount]);

  const handleSendWhatsAppOrder = async () => {
    const addressText = address.street.trim()
      ? `${address.street}, ${address.number || 'S/N'} ${address.complement ? `(${address.complement})` : ''}
Bairro: ${address.neighborhood || 'Não informado'}
Cidade: ${address.city || ''} - ${address.state || ''}
CEP: ${address.cep || ''}`
      : 'A confirmar com a equipe no atendimento';

    const pName = approvedOrder?.patientName || userName || 'Paciente';
    const pCpf = approvedOrder?.patientCpf || userCpf || '';
    const pPhone = approvedOrder?.patientPhone || userPhone || '';
    const patientInfo = `Nome: ${pName}${pCpf ? `\nCPF: ${pCpf}` : ''}${pPhone ? `\nTelefone: ${pPhone}` : ''}`;

    if (hasApprovedOrder && approvedOrder) {
      const updatedItems = approvedOrder.items.map(it => ({
        ...it,
        unitQuantity: getItemQty(it.id, it.unitQuantity ?? 1)
      }));

      const itemsToOrder = updatedItems.filter(it => (it.unitQuantity ?? 0) > 0);
      if (itemsToOrder.length === 0) {
        return;
      }

      const itemsLines = itemsToOrder.map(it => {
        const qty = it.unitQuantity ?? 1;
        const pricePart =
          approvedOrder.showPricesToPatient && it.unitPriceBRL > 0
            ? ` — R$ ${(it.unitPriceBRL * qty).toFixed(2)}`
            : '';
        const concPart = it.concentration ? ` [${it.concentration}]` : '';
        const dosagePart = it.dosage && it.dosage.length > 0 ? `\n   ↳ _Posologia: ${it.dosage.join(' ')}_` : '';
        return `• *${qty}x* ${it.name} (${it.brand})${concPart}${pricePart}${dosagePart}`;
      }).join('\n\n');

      const financialBlock =
        approvedOrder.showPricesToPatient && approvedFinalTotalBRL > 0
          ? `\n💰 *RESUMO DO PEDIDO APROVADO:*
Subtotal: R$ ${approvedSubtotalBRL.toFixed(2)}${approvedOrder.shippingBRL > 0 ? `\nFrete / Taxas: R$ ${approvedOrder.shippingBRL.toFixed(2)}` : ''}${approvedOrder.discountBRL > 0 ? `\nDesconto: -R$ ${approvedOrder.discountBRL.toFixed(2)}` : ''}
*Total do Pedido: R$ ${approvedFinalTotalBRL.toFixed(2)}*\n`
          : '';

      const message = `✅ *CONFIRMAÇÃO DE PEDIDO APROVADO - FARMÁCIA MECURA* 🌿

👤 *DADOS DO PACIENTE:*
${patientInfo}
🩺 *Médico Prescritor:* ${approvedOrder.doctorName || 'Dr. Guilherme Taveira Dias'}

📦 *MEDICAMENTOS DO PEDIDO APROVADO:*
${itemsLines}
${financialBlock}
🚚 *ENDEREÇO DE ENTREGA:*
${addressText}

Olá! Meu pedido já foi montado e aprovado na minha Farmácia do aplicativo. Gostaria de confirmar a solicitação do pedido e finalizar o envio! ✨`;

      const targetWhats = (approvedOrder.whatsappNumber || '5566996280883').replace(/\D/g, '') || '5566996280883';
      const whatsappUrl = `https://wa.me/${targetWhats}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      await updatePharmacyOrderStatus(approvedOrder.id, 'requested', {
        items: updatedItems,
        subtotalBRL: approvedSubtotalBRL,
        totalBRL: approvedFinalTotalBRL,
        deliveryAddress: address
      });

      navigate('/dashboard');
      return;
    }

    const baseItems = importedItems.length > 0 ? importedItems : associacaoItems;
    const activeItemsToOrder = baseItems.filter(item => getItemQty(item.id, 1) > 0);
    if (activeItemsToOrder.length === 0) {
      return;
    }

    const itemsText = activeItemsToOrder.map(item => {
      const qty = getItemQty(item.id, 1);
      return `• *${qty}x* ${item.name} (${item.brand || 'GreenBudz'})`;
    }).join('\n');

    const message = `🌿 *SOLICITAÇÃO DE PEDIDO - MEDICAMENTOS PRESCRITOS* 🌿

👤 *DADOS DO PACIENTE:*
${patientInfo}

📦 *MEDICAMENTOS PRESCRITOS:*
${itemsText}

🚚 *ENDEREÇO DE ENTREGA:*
${addressText}

Olá! Gostaria de confirmar a solicitação do meu pedido de medicamentos prescritos e receber as orientações de finalização e envio! ✨`;

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
        {/* 0. PEDIDO MONTADO E APROVADO PELO ADMIN (MONTADOR DE PEDIDOS PÓS-CONSULTA) */}
        {hasApprovedOrder && approvedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-[#132214] via-[#12181A] to-[#161622] border-2 border-mecura-neon/60 rounded-[26px] p-5 space-y-5 shadow-[0_0_35px_rgba(166,255,0,0.15)] relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 border-b border-mecura-neon/20 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-mecura-neon text-[#0A0A0F] font-black text-[10px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {approvedOrder.status === 'requested' ? 'Pedido Já Solicitado no WhatsApp' : 'Pedido Aprovado & Liberado'}
                </div>
                <h3 className="text-lg font-serif font-bold text-white pt-1">
                  Seu Pedido Pronto para Solicitação
                </h3>
                <p className="text-xs text-[#A0A0B2] leading-relaxed">
                  Prescrito por <strong className="text-white">{approvedOrder.doctorName || 'Dr. Guilherme Taveira Dias'}</strong>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon shrink-0">
                <Package className="w-5 h-5" />
              </div>
            </div>

            {approvedOrder.notes && (
              <div className="bg-[#0A0A0F]/80 border border-mecura-neon/25 rounded-2xl p-3.5 text-xs text-white/90 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-mecura-neon shrink-0 mt-0.5" />
                <span>{approvedOrder.notes}</span>
              </div>
            )}

            <div className="space-y-3">
              {approvedOrder.items.map((item, idx) => {
                const defaultQty = item.unitQuantity ?? 1;
                const qty = getItemQty(item.id, defaultQty);
                const isZeroed = qty === 0;
                const isImp = (item.origin || '').toLowerCase().includes('importado') || (item.origin || '').toLowerCase().includes('eua');
                const itemTotal = (Number(item.unitPriceBRL) || 0) * qty;

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`bg-[#0A0A0F] border rounded-2xl p-4 space-y-3 transition-all ${
                      isZeroed
                        ? 'border-[#262636]/60 opacity-60'
                        : 'border-[#262636]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30">
                            {item.brand}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-[#8A8A9E] border border-white/10">
                            {isImp ? '🇺🇸 Importado' : '🇧🇷 Nacional'}
                          </span>
                          {isZeroed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Não incluir agora (Zerado)
                            </span>
                          )}
                        </div>
                        <h4 className={`font-bold text-sm leading-snug pt-0.5 ${isZeroed ? 'text-white/60 line-through' : 'text-white'}`}>
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8A8A9E]">
                          {item.concentration && <span className="text-mecura-neon font-mono">{item.concentration}</span>}
                          {item.pharmaceuticalForm && <span>• {item.pharmaceuticalForm}</span>}
                          {item.quantitySpec && <span>• {item.quantitySpec}</span>}
                          {item.administrationRoute && <span>• {item.administrationRoute}</span>}
                        </div>
                      </div>
                    </div>

                    {item.dosage && item.dosage.length > 0 && (
                      <div className="bg-[#161622] border border-white/5 rounded-xl p-2.5 text-xs text-white/85">
                        <span className="text-[10px] font-bold uppercase text-mecura-neon block mb-0.5">
                          Posologia Prescrita:
                        </span>
                        {item.dosage.join(' ')}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#262636]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#8A8A9E]">Quantidade:</span>
                        <div className="flex items-center gap-1 bg-[#161622] border border-[#262636] rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, -1, defaultQty)}
                            disabled={qty <= 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                              qty <= 0
                                ? 'text-[#4A4A5E] cursor-not-allowed'
                                : 'text-[#8A8A9E] hover:text-white hover:bg-white/5 cursor-pointer'
                            }`}
                            title="Diminuir quantidade (0 para não incluir)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className={`font-mono font-bold w-6 text-center text-xs tabular-nums ${isZeroed ? 'text-amber-400' : 'text-white'}`}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, 1, defaultQty)}
                            className="w-7 h-7 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 rounded-lg cursor-pointer"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {qty > 0 ? (
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 0 }))}
                            className="text-[10px] font-semibold text-[#8A8A9E] hover:text-amber-300 underline underline-offset-2 cursor-pointer ml-1"
                          >
                            Zerar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 1 }))}
                            className="text-[10px] font-bold text-mecura-neon hover:underline underline-offset-2 cursor-pointer ml-1"
                          >
                            Incluir (1 un)
                          </button>
                        )}
                      </div>

                      {approvedOrder.showPricesToPatient && item.unitPriceBRL > 0 ? (
                        <div className="text-right">
                          <span className="block text-[10px] text-[#8A8A9E]">
                            {isZeroed ? 'Não contabilizado' : 'Valor do Item'}
                          </span>
                          <span className={`text-sm font-mono font-extrabold tabular-nums ${isZeroed ? 'text-[#6A6A7E]' : 'text-mecura-neon'}`}>
                            R$ {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                          isZeroed
                            ? 'text-[#8A8A9E] bg-white/5 border-white/10'
                            : 'text-mecura-neon bg-mecura-neon/10 border-mecura-neon/25'
                        }`}>
                          {isZeroed ? 'Não Incluído' : 'Liberado na Receita'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo Financeiro do Pedido Aprovado */}
            {approvedOrder.showPricesToPatient && (
              <div className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#8A8A9E]">
                  <span>Subtotal dos Medicamentos</span>
                  <span className="text-white font-mono tabular-nums">R$ {approvedSubtotalBRL.toFixed(2)}</span>
                </div>
                {approvedOrder.shippingBRL > 0 && approvedActiveCount > 0 && (
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>Frete / Taxas de Envio</span>
                    <span className="text-white font-mono tabular-nums">R$ {approvedOrder.shippingBRL.toFixed(2)}</span>
                  </div>
                )}
                {approvedOrder.discountBRL > 0 && approvedActiveCount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto Aplicado</span>
                    <span className="font-mono tabular-nums">- R$ {approvedOrder.discountBRL.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#262636] text-sm font-bold">
                  <span className="text-white">Total do Pedido</span>
                  <span className="text-mecura-neon font-mono text-base font-black tabular-nums">
                    R$ {approvedFinalTotalBRL.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Botões de Solicitação Direta ou Informar Endereço */}
            <div className="pt-1 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={approvedActiveCount <= 0}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  approvedActiveCount <= 0
                    ? 'bg-[#262636] text-[#6A6A7E] cursor-not-allowed'
                    : 'bg-mecura-neon hover:bg-[#b5ff33] text-[#0A0A0F] shadow-[0_0_20px_rgba(166,255,0,0.25)] cursor-pointer'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {approvedActiveCount <= 0
                    ? 'Selecione ao menos 1 medicamento acima'
                    : 'Informar Endereço e Solicitar Pedido'}
                </span>
                {approvedActiveCount > 0 && <ChevronRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={approvedActiveCount <= 0}
                onClick={handleSendWhatsAppOrder}
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                  approvedActiveCount <= 0
                    ? 'bg-[#1E2622] text-[#6A6A7E] cursor-not-allowed'
                    : 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] cursor-pointer'
                }`}
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" />
                <span>Solicitar Pedido Agora no WhatsApp</span>
              </button>
            </div>
          </motion.div>
        )}

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

        {/* 1. SEÇÃO DE PRODUTOS IMPORTADOS (Somente se não houver pedido aprovado substituindo ou para complementar) */}
        {!hasApprovedOrder && hasImportedItems && (
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
              const qty = getItemQty(item.id, 1);
              const isZeroed = qty === 0;
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
                <div
                  key={`${item.id || 'imp'}-${idx}`}
                  className={`bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[24px] p-5 space-y-5 shadow-lg relative overflow-hidden group mb-4 transition-all ${
                    isZeroed ? 'opacity-60' : ''
                  }`}
                >
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
                        <h4 className={`font-bold text-[15px] leading-tight ${isZeroed ? 'text-white/60 line-through' : 'text-white'}`}>
                          {item.name}
                        </h4>
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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#0A0A0F] border border-[#262636] rounded-xl p-1 w-fit">
                          <button 
                            type="button"
                            disabled={qty <= 0}
                            onClick={() => handleQuantityChange(item.id, -1, 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              qty <= 0
                                ? 'text-[#4A4A5E] cursor-not-allowed'
                                : 'text-[#8A8A9E] hover:text-white hover:bg-[#1A1A26] cursor-pointer'
                            }`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`font-bold w-6 text-center text-sm ${isZeroed ? 'text-amber-400' : 'text-white'}`}>
                            {qty}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(item.id, 1, 1)}
                            className="w-8 h-8 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {qty > 0 ? (
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 0 }))}
                            className="text-[10px] font-semibold text-[#8A8A9E] hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                          >
                            Zerar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 1 }))}
                            className="text-[10px] font-bold text-mecura-neon hover:underline underline-offset-2 cursor-pointer"
                          >
                            Incluir (1 un)
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      {!isZeroed && (
                        <div className="inline-flex items-center gap-1 bg-mecura-neon/10 border border-mecura-neon/20 px-2.5 py-1 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
                          <span className="text-[10px] text-mecura-neon font-bold">
                            Dura aprox. {Math.round((item.durationPerUnit * qty) / 30)} meses
                          </span>
                        </div>
                      )}
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm border ${
                        isZeroed
                          ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                          : 'text-white/90 bg-[#0A0A0F] border-[#262636]'
                      }`}>
                        {isZeroed ? 'Não incluir agora (Zerado)' : 'Item Prescrito'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. SEÇÃO DE PRODUTOS DE ASSOCIAÇÃO NACIONAL */}
        {!hasApprovedOrder && hasAssociacaoItems && (
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

            {associacaoItems.map((item, idx) => {
              const qty = getItemQty(item.id, 1);
              const isZeroed = qty === 0;
              return (
                <div
                  key={`${item.id || 'assoc'}-${idx}`}
                  className={`bg-gradient-to-b from-[#0D1512] to-[#121A16] border border-emerald-500/30 rounded-[24px] p-5 space-y-4 shadow-lg relative overflow-hidden group mb-3 transition-all ${
                    isZeroed ? 'opacity-60' : ''
                  }`}
                >
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
                        <h4 className={`font-bold text-[15px] leading-tight ${isZeroed ? 'text-white/60 line-through' : 'text-white'}`}>
                          {item.name}
                        </h4>
                      </div>
                      {item.dosage && item.dosage.length > 0 && (
                        <p className="text-xs text-mecura-silver/90 mt-1.5 line-clamp-2">
                          {item.dosage.join(' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8A8A9E]">Quantidade:</span>
                      <div className="flex items-center gap-1 bg-[#0A0A0F] border border-emerald-500/30 rounded-xl p-1">
                        <button
                          type="button"
                          disabled={qty <= 0}
                          onClick={() => handleQuantityChange(item.id, -1, 1)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            qty <= 0
                              ? 'text-[#4A4A5E] cursor-not-allowed'
                              : 'text-[#8A8A9E] hover:text-white cursor-pointer'
                          }`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-mono font-bold w-6 text-center text-xs tabular-nums ${isZeroed ? 'text-amber-400' : 'text-white'}`}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1, 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {qty > 0 ? (
                        <button
                          type="button"
                          onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 0 }))}
                          className="text-[10px] font-semibold text-[#8A8A9E] hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                        >
                          Zerar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 1 }))}
                          className="text-[10px] font-bold text-emerald-400 hover:underline underline-offset-2 cursor-pointer"
                        >
                          Incluir (1 un)
                        </button>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                      isZeroed
                        ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                      {isZeroed ? 'Não Incluído' : 'Pronto para Solicitação'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasApprovedOrder && !hasImportedItems && !hasAssociacaoItems && (
          <div className="bg-[#12121A] border border-mecura-elevated rounded-[24px] p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-mecura-surface flex items-center justify-center mx-auto text-mecura-silver border border-white/5">
              <Package className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-lg">Nenhum Medicamento Prescrito Ainda</h4>
              <p className="text-xs text-mecura-silver max-w-md mx-auto leading-relaxed">
                A sua farmácia personalizada é individualizada e será liberada assim que o médico emitir a sua receita oficial ou a equipe aprovar seu pedido pós-consulta.
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

      {/* Resumo do Tratamento Prescrito (quando não está usando o card de pedido aprovado) */}
      {!hasApprovedOrder && hasImportedItems ? (
        <div className="bg-[#161622] border border-[#262636] rounded-[24px] p-6 space-y-4 relative overflow-hidden mb-8">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-mecura-neon/5 blur-3xl rounded-full" />
          
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-mecura-neon" />
            Resumo do Pedido Prescrito
          </h3>
          
          <div className="space-y-3 text-sm relative z-10">
            <div className="flex justify-between text-[#8A8A9E]">
              <span>Medicamentos Selecionados</span>
              <span className="text-white font-medium">
                {importedItems.reduce((acc, item) => acc + getItemQty(item.id, 1), 0)}{' '}
                {importedItems.reduce((acc, item) => acc + getItemQty(item.id, 1), 0) === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <div className="flex justify-between text-[#8A8A9E] items-center">
              <span className="flex items-center gap-1.5">
                Modalidade de Atendimento
              </span>
              <span className="text-emerald-400 font-medium">Importação Oficial Autorizada</span>
            </div>
            <div className="flex justify-between text-[#8A8A9E] items-center">
              <span>Regulamentação e Segurança</span>
              <span className="text-white font-medium">Conformidade RDC Anvisa</span>
            </div>
            
            <div className="pt-4 border-t border-[#262636] border-dashed">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Status do Tratamento</span>
                <span className="text-xs font-bold text-mecura-neon bg-mecura-neon/10 px-3 py-1 rounded-full border border-mecura-neon/30">
                  Pronto para Solicitação
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : !hasApprovedOrder && hasAssociacaoItems ? (
        <div className="bg-[#121A16] border border-emerald-500/20 rounded-[24px] p-6 text-center space-y-3">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
          <h4 className="text-white font-bold text-base">Receita de Associação Nacional</h4>
          <p className="text-xs text-mecura-silver max-w-sm mx-auto">
            Utilize o documento oficial da receita ou solicite seu pedido pelo WhatsApp abaixo.
          </p>
          <button
            onClick={handleDownloadPrescription}
            disabled={isDownloadingPdf}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0F] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
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

  const totalItemsSelectedCount = hasApprovedOrder && approvedOrder
    ? approvedOrder.items.reduce((acc, item) => acc + getItemQty(item.id, item.unitQuantity ?? 1), 0)
    : (importedItems.length > 0 ? importedItems : associacaoItems).reduce((acc, item) => acc + getItemQty(item.id, 1), 0);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-xl border-b border-[#1A1A26]">
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
              {hasApprovedOrder ? 'Seu Pedido Aprovado' : hasImportedItems ? 'Farmácia GreenBudz' : 'Prescrição Médica'}
            </h1>
            <span className="text-[10px] text-mecura-neon font-medium block">
              {hasApprovedOrder ? 'Pronto para Solicitação no WhatsApp' : hasImportedItems ? 'Vendido e entregue por GreenBudz' : 'Dispensação & Acompanhamento'}
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
        {(hasApprovedOrder || hasImportedItems || hasAssociacaoItems) && renderStepIndicator()}

        <AnimatePresence mode="wait">
          {step === 1 && renderCart()}
          {step === 2 && renderAddress()}
        </AnimatePresence>

        {/* Sticky Bottom Action Bar */}
        {(hasApprovedOrder || hasImportedItems || hasAssociacaoItems) ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-[#161622]/95 backdrop-blur-xl border border-[#262636] rounded-[28px] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#8A8A9E] font-medium uppercase tracking-wider">
                      {hasApprovedOrder ? 'Pedido Aprovado pela Clínica' : 'Tratamento Prescrito'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-white tracking-tight">
                        {totalItemsSelectedCount} {totalItemsSelectedCount === 1 ? 'item no pedido' : 'itens no pedido'}
                      </span>
                      {hasApprovedOrder && approvedOrder?.showPricesToPatient && (
                        <span className="text-sm font-mono font-extrabold text-mecura-neon tabular-nums">
                          • R$ {approvedFinalTotalBRL.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-emerald-400">
                      {hasApprovedOrder ? 'PEDIDO LIBERADO' : 'OFICIAL'}
                    </span>
                  </div>
                </div>

                <motion.button 
                  whileHover={totalItemsSelectedCount > 0 ? { scale: 1.02 } : {}}
                  whileTap={totalItemsSelectedCount > 0 ? { scale: 0.98 } : {}}
                  disabled={totalItemsSelectedCount <= 0}
                  onClick={() => {
                    if (totalItemsSelectedCount <= 0) return;
                    if (step === 1) {
                      setStep(2);
                    } else {
                      handleSendWhatsAppOrder();
                    }
                  }}
                  className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2.5 text-[15px] ${
                    totalItemsSelectedCount <= 0
                      ? 'bg-[#262636] text-[#6A6A7E] cursor-not-allowed'
                      : step === 1
                        ? 'bg-mecura-neon text-[#0A0A0F] hover:bg-[#b5ff33] shadow-[0_0_25px_rgba(166,255,0,0.25)] cursor-pointer'
                        : 'bg-[#25D366] text-white hover:bg-[#20ba59] shadow-[0_0_25px_rgba(37,211,102,0.35)] cursor-pointer'
                  }`}
                >
                  {totalItemsSelectedCount <= 0 ? (
                    <span>Selecione ao menos 1 item para continuar</span>
                  ) : step === 1 ? (
                    <>
                      <span>Solicitar Pedido (Confirmar Entrega)</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="w-5 h-5 fill-current" />
                      <span>Solicitar Pedido e Confirmar no WhatsApp</span>
                    </>
                  )}
                </motion.button>
                
                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[#8A8A9E]">
                  <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" />
                  <span className="text-[10px]">
                    {step === 1 ? 'Confira os medicamentos liberados e prossiga para solicitar' : 'Envia a confirmação do seu pedido diretamente para o WhatsApp oficial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
