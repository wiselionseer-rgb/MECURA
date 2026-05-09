import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Check, Share2, Copy, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { userName } = useStore();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [bonus, setBonus] = useState(0);
  const [invited, setInvited] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Simulate generating a unique code based on name or random
      const prefix = userName ? userName.split(' ')[0].toUpperCase() : 'MECURA';
      const randomScore = Math.floor(1000 + Math.random() * 9000);
      setReferralCode(`${prefix}${randomScore}`);
      
      // We can mock that they have 1 invited friend and 50 reais for demonstration purposes, 
      // or just 0 to start. Let's start with 0.
    }
  }, [isOpen, userName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mecura - Desconto na Primeira Consulta',
      text: `Use meu código ${referralCode} e ganhe 50% de desconto na sua primeira consulta na Mecura!`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-gradient-to-b from-[#1A2E1A] to-[#121A12] border border-mecura-neon/30 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
            
            <div className="p-6 relative z-10 w-full h-full flex flex-col items-center">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-mecura-neon/20 flex flex-shrink-0 items-center justify-center border border-mecura-neon/40 shadow-[0_0_20px_rgba(166,255,0,0.2)] mb-5">
                <Gift className="w-8 h-8 text-mecura-neon" />
              </div>

              <h2 className="text-2xl font-black text-white text-center tracking-tight mb-2">
                Indique e <span className="text-mecura-neon">Ganhe R$50</span>
              </h2>
              <p className="text-[#8A8A9E] text-center text-[14px] leading-relaxed px-4 mb-8">
                Seu amigo ganha <strong className="text-white">50% de desconto</strong> na primeira consulta, e você ganha <strong className="text-white">R$ 50</strong> em bônus para utilizar em novas consultas.
              </p>

              <div className="w-full bg-[#0A0A0F]/50 rounded-2xl p-4 border border-white/5 mb-6">
                <div className="text-[11px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-2 text-center">
                  Seu Código de Indicação
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 bg-[#161622] border border-mecura-neon/20 rounded-xl px-4 py-3 flex items-center justify-between">
                     <span className="font-mono text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A1A1AA] tracking-widest">{referralCode}</span>
                   </div>
                   <button 
                     onClick={handleCopy}
                     className="w-14 h-[52px] rounded-xl bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/30 flex items-center justify-center hover:bg-mecura-neon hover:text-black transition-colors"
                   >
                     {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                   </button>
                   <button 
                     onClick={handleShare}
                     className="w-14 h-[52px] rounded-xl bg-mecura-neon text-black flex items-center justify-center hover:bg-[#b5ff33] transition-colors shadow-[0_0_15px_rgba(166,255,0,0.3)]"
                   >
                     <Share2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-[#161622] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Users className="w-6 h-6 text-[#A1A1AA] mb-2" />
                   <span className="text-[11px] text-[#8A8A9E] font-bold uppercase tracking-wider mb-0.5">Indicados</span>
                   <span className="text-2xl font-black text-white">{invited}</span>
                </div>
                <div className="bg-gradient-to-b from-mecura-neon/5 to-[#161622] border border-mecura-neon/20 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-mecura-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Sparkles className="w-6 h-6 text-mecura-neon mb-2" />
                   <span className="text-[11px] text-mecura-neon/70 font-bold uppercase tracking-wider mb-0.5">Seus Bônus</span>
                   <span className="text-2xl font-black text-mecura-neon">R$ {bonus}</span>
                </div>
              </div>
              
              <div className="mt-6 w-full text-center">
                <div className="text-[10px] text-[#8A8A9E] mb-2">
                  Você pode usar seus bônus na tela de checkout para ter descontos nas suas consultas.
                </div>
              </div>

            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
