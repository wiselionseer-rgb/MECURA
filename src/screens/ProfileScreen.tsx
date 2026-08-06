import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Save, Flame, ShieldCheck, Calendar, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const formatBirthDate = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export function ProfileScreen() {
  const navigate = useNavigate();
  const { 
    userName, setUserName, 
    userEmail, setUserEmail, 
    userPhone, setUserPhone, 
    userCpf, setUserCpf, 
    userBirthDate, setUserBirthDate,
    answers, setAnswer,
    healthStreak, userTier 
  } = useStore();
  
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);
  const [cpf, setCpf] = useState(userCpf);
  const [birthDate, setBirthDate] = useState(userBirthDate || answers?.birthDate || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone);
    setUserCpf(cpf);
    setUserBirthDate(birthDate);
    setAnswer('birthDate', birthDate);
    setAnswer('cpf', cpf);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          name,
          email,
          phone,
          cpf,
          birthDate,
          answers: {
            ...answers,
            birthDate,
            cpf
          },
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error updating profile in Firestore:", err);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      navigate(-1);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans">
      {/* Header */}
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#1A1A26] transition-colors border border-[#262636]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white pr-10">
          Meu Perfil
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div 
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-[#161622] border-2 border-mecura-neon flex items-center justify-center shadow-[0_0_20px_rgba(166,255,0,0.15)]">
              <User className="w-10 h-10 text-mecura-neon" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#161622] border border-[#262636] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
              <Flame className="w-4 h-4 text-mecura-neon" />
              <span className="text-xs font-bold text-white">{healthStreak}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">{userName || 'Usuário'}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-mecura-neon">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Plano {userTier}</span>
          </div>
        </div>

        <div 
          className="space-y-5"
        >
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A8A9E] ml-1">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-[#6A6A7E]" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-[#161622] border border-[#262636] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A8A9E] ml-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#6A6A7E]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#161622] border border-[#262636] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A8A9E] ml-1">Telefone / WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-[#6A6A7E]" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full bg-[#161622] border border-[#262636] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
              />
            </div>
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A8A9E] ml-1">Data de Nascimento</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-mecura-neon" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={birthDate}
                onChange={(e) => setBirthDate(formatBirthDate(e.target.value))}
                placeholder="DD/MM/AAAA"
                className="w-full bg-[#161622] border border-[#262636] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
              />
            </div>
            <p className="text-[11px] text-[#8A8A9E] ml-1">
              Esta data é puxada automaticamente para suas receitas e atestados médicos.
            </p>
          </div>

          {/* CPF Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A8A9E] ml-1">CPF</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CreditCard className="w-5 h-5 text-[#6A6A7E]" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full bg-[#161622] border border-[#262636] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-10">
        <Button 
          className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)] flex items-center justify-center gap-2"
          onClick={handleSave}
          isLoading={isSaving}
        >
          <Save className="w-5 h-5" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
