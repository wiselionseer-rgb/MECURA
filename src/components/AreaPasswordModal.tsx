import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  Brain, 
  Stethoscope, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

interface AreaPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetArea: 'doctor' | 'psychologist';
  onSuccess: () => void;
}

export const AreaPasswordModal: React.FC<AreaPasswordModalProps> = ({
  isOpen,
  onClose,
  targetArea,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPsychologist = targetArea === 'psychologist';

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsSubmitting(false);
      // Focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanPwd = password.trim();
    if (!cleanPwd) {
      setError('Por favor, informe a senha de acesso.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const { doctors } = useAdminStore.getState();
    const isDoctorValid = 
      cleanPwd.toLowerCase() === 'jesus102030@' ||
      cleanPwd.toLowerCase() === 'medico102030@' ||
      cleanPwd.toLowerCase() === 'doutor102030@' ||
      cleanPwd.toLowerCase() === 'dr102030@' ||
      doctors.some(d => d.password?.trim().toLowerCase() === cleanPwd.toLowerCase());

    const isPsychologistValid = 
      cleanPwd.toLowerCase() === 'jesus102030@' ||
      cleanPwd.toLowerCase() === 'psico102030@' ||
      cleanPwd.toLowerCase() === 'psicologo102030@' ||
      cleanPwd.toLowerCase() === 'marco102030@' ||
      doctors.some(d => d.password?.trim().toLowerCase() === cleanPwd.toLowerCase());

    const isValid = isPsychologist ? isPsychologistValid : isDoctorValid;

    if (isValid) {
      // Save session authorization
      if (typeof window !== 'undefined') {
        if (isPsychologist) {
          localStorage.setItem('mecura_role', 'psychologist');
          sessionStorage.setItem('mecura_psychologist_auth', 'true');
        } else {
          localStorage.setItem('mecura_role', 'doctor');
          sessionStorage.setItem('mecura_doctor_auth', 'true');
        }
      }
      setIsSubmitting(false);
      onSuccess();
    } else {
      setIsSubmitting(false);
      setError('Senha incorreta. Verifique suas credenciais de acesso.');
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-md bg-[#0F0F18] border rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden ${
            isPsychologist 
              ? 'border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)]' 
              : 'border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]'
          }`}
        >
          {/* Top ambient glow */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 blur-3xl pointer-events-none opacity-40 ${
              isPsychologist ? 'bg-purple-500' : 'bg-emerald-500'
            }`}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div 
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                isPsychologist
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-purple-500/20'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {isPsychologist ? (
                <Brain className="w-7 h-7" />
              ) : (
                <Stethoscope className="w-7 h-7" />
              )}
            </div>

            <div className="min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-1">
                <span 
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isPsychologist
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  Autenticação Obrigatória
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isPsychologist ? 'Acesso à Área do Psicólogo' : 'Acesso ao Painel Médico'}
              </h3>
              <p className="text-xs text-[#8A8A9E] mt-0.5 font-medium">
                {isPsychologist 
                  ? 'Marco Antônio Boastik • CRP 08/49215' 
                  : 'Dr. Guilherme Taveira Dias • CRM 12345/SP'}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#A0A0B5] leading-relaxed mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isPsychologist ? 'text-purple-400' : 'text-emerald-400'}`} />
            <span>
              Por questões de sigilo ético-profissional e segurança dos prontuários clínicos, digite a <strong>senha de acesso</strong> para alternar para esta área.
            </span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8A9E] mb-2 flex items-center justify-between">
                <span>Senha de Acesso</span>
                <span className="text-[10px] text-[#606075] lowercase font-normal">pressione enter para confirmar</span>
              </label>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A9E] pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={isPsychologist ? 'Digite a senha do psicólogo...' : 'Digite a senha médica...'}
                  className={`w-full bg-[#0A0A12] border rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white placeholder-[#55556A] focus:outline-none transition-all shadow-inner ${
                    error 
                      ? 'border-red-500/60 focus:border-red-500' 
                      : (isPsychologist 
                          ? 'border-white/10 focus:border-purple-400/80 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : 'border-white/10 focus:border-emerald-400/80 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]')
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#8A8A9E] hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-xs font-bold text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPsychologist
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
                }`}
              >
                <span>Acessar {isPsychologist ? 'Psicólogo' : 'Médico'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
