import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, CreditCard, Eye, EyeOff, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

interface PasswordResetCpfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onPasswordResetSuccess?: (email: string, newPassword: string) => void;
}

export function PasswordResetCpfModal({
  isOpen,
  onClose,
  initialEmail = '',
  onPasswordResetSuccess
}: PasswordResetCpfModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [cpfLast4, setCpfLast4] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync initial email when modal opens
  React.useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail, isOpen]);

  const handleCpfInput = (val: string) => {
    // Only accept numeric digits, maximum 4 characters
    const digitsOnly = val.replace(/\D/g, '').slice(0, 4);
    setCpfLast4(digitsOnly);
    setErrorMessage('');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    if (cpfLast4.length !== 4) {
      setErrorMessage('Por favor, informe exatamente os 4 últimos dígitos do seu CPF.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da nova senha não confere.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Search user in Firestore 'users' collection by email
      const usersRef = collection(db, 'users');
      const qSnapshot = await getDocs(query(usersRef, where('email', '==', cleanEmail)));
      
      let userDocToUpdate: any = null;

      if (!qSnapshot.empty) {
        userDocToUpdate = qSnapshot.docs[0];
      } else {
        // Fallback: search case-insensitive if exact match failed
        const allUsersSnap = await getDocs(usersRef);
        const lowerEmail = cleanEmail.toLowerCase();
        userDocToUpdate = allUsersSnap.docs.find(d => {
          const dEmail = (d.data().email || '').toLowerCase().trim();
          return dEmail === lowerEmail;
        });
      }

      if (!userDocToUpdate) {
        setErrorMessage('Nenhum cadastro encontrado com este e-mail. Verifique se digitou corretamente.');
        setIsLoading(false);
        return;
      }

      const userData = userDocToUpdate.data();

      // 2. Validate last 4 digits of CPF
      const registeredCpf = (userData.cpf || userData.answers?.cpf || '').toString();
      const cpfDigitsOnly = registeredCpf.replace(/\D/g, '');

      if (!cpfDigitsOnly || cpfDigitsOnly.length < 4) {
        // Fallback: If CPF wasn't registered yet, we check if patient is current auth user
        if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail.toLowerCase()) {
          // Allow update and register the last 4 digits
          await updateDoc(doc(db, 'users', userDocToUpdate.id), {
            password: newPassword,
            lastPasswordReset: new Date().toISOString(),
            passwordResetMethod: 'cpf_last_4_initial',
            updatedAt: new Date().toISOString()
          });
          if (auth.currentUser) {
            try { await updatePassword(auth.currentUser, newPassword); } catch (_) {}
          }
          setSuccess(true);
          onPasswordResetSuccess?.(cleanEmail, newPassword);
          setIsLoading(false);
          return;
        }

        setErrorMessage('Não encontramos um CPF cadastrado para esta conta. Entre em contato com o suporte para recuperar o acesso.');
        setIsLoading(false);
        return;
      }

      const actualLast4 = cpfDigitsOnly.slice(-4);

      if (cpfLast4 !== actualLast4) {
        setErrorMessage('Os 4 dígitos informados não conferem com o CPF cadastrado para este e-mail.');
        setIsLoading(false);
        return;
      }

      // 3. Validation SUCCESS! Update password in Firestore
      await updateDoc(doc(db, 'users', userDocToUpdate.id), {
        password: newPassword,
        lastPasswordReset: new Date().toISOString(),
        passwordResetMethod: 'cpf_validation_last_4',
        updatedAt: new Date().toISOString()
      });

      // 4. If current auth user matches, update in Firebase Auth as well
      if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail.toLowerCase()) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (authErr) {
          console.warn('[PASSWORD RESET] updatePassword client warning:', authErr);
        }
      }

      // 5. Ensure patient metadata is preserved in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mecura_patientId', userDocToUpdate.id);
        if (userData.name && userData.name.trim().toLowerCase() !== 'paciente') {
          localStorage.setItem('mecura_patient_name', userData.name);
        }
      }

      setSuccess(true);
      onPasswordResetSuccess?.(cleanEmail, newPassword);
    } catch (err: any) {
      console.error('[PASSWORD RESET] Erro:', err);
      setErrorMessage(err.message || 'Erro ao redefinir a senha. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMessage('');
    setSuccess(false);
    setCpfLast4('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#14141E] border border-[#262638] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-mecura-neon/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1F1F2E] flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#2A2A3E] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!success ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Alterar / Trocar Senha</h3>
                <p className="text-xs text-[#8A8A9E]">Validação de segurança pelos 4 últimos dígitos do CPF</p>
              </div>
            </div>

            <p className="text-sm text-mecura-silver mb-5 leading-relaxed">
              Para redefinir sua senha com segurança instantânea, informe o seu e-mail cadastrado e os <strong className="text-mecura-neon">4 últimos dígitos do seu CPF</strong>.
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#8A8A9E] mb-1.5 block">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-[#6A6A7E]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                    placeholder="seu@email.com"
                    className="w-full bg-[#1B1B28] border border-[#2D2D42] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
                    autoCapitalize="none"
                    required
                  />
                </div>
              </div>

              {/* CPF Last 4 Digits */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8A8A9E]">
                    4 últimos dígitos do seu CPF
                  </label>
                  <span className="text-[10px] text-mecura-neon font-mono">
                    ***.***.XX{cpfLast4 ? cpfLast4.slice(0, 2) : '00'}-{cpfLast4 ? cpfLast4.slice(2, 4) : '00'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <CreditCard className="w-4 h-4 text-mecura-neon" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={cpfLast4}
                    onChange={(e) => handleCpfInput(e.target.value)}
                    placeholder="Ex: 8911"
                    className="w-full bg-[#1B1B28] border border-[#2D2D42] rounded-xl py-3 pl-10 pr-4 text-white text-base tracking-widest font-mono placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#7A7A8E] mt-1">
                  Apenas os 4 números finais do CPF cadastrado no seu perfil.
                </p>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="text-xs font-semibold text-[#8A8A9E] mb-1.5 block">
                  Nova Senha (mínimo 6 dígitos)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[#6A6A7E]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
                    placeholder="Digite sua nova senha"
                    className="w-full bg-[#1B1B28] border border-[#2D2D42] rounded-xl py-3 pl-10 pr-10 text-white text-sm placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6A6A7E] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="text-xs font-semibold text-[#8A8A9E] mb-1.5 block">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[#6A6A7E]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(''); }}
                    placeholder="Repita sua nova senha"
                    className="w-full bg-[#1B1B28] border border-[#2D2D42] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-[#6A6A7E] focus:outline-none focus:border-mecura-neon focus:ring-1 focus:ring-mecura-neon transition-all"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-[#2D2D42] text-[#8A8A9E] hover:text-white"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 font-bold bg-mecura-neon text-black hover:bg-[#b5ff33]"
                >
                  {isLoading ? 'Validando CPF...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Senha Alterada com Sucesso!</h3>
            <p className="text-sm text-mecura-silver mb-6 leading-relaxed">
              Sua identidade foi confirmada pelos 4 últimos dígitos do seu CPF e sua nova senha foi salva.
            </p>
            <Button
              className="w-full font-bold bg-mecura-neon text-black hover:bg-[#b5ff33] shadow-lg shadow-mecura-neon/20"
              onClick={handleClose}
            >
              Concluir e Acessar Minha Conta
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
