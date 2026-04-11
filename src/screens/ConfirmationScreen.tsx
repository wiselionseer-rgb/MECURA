import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

export function ConfirmationScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans p-6 items-center justify-center">
      <div className="bg-[#1A1A24] rounded-3xl p-8 border border-[#2A2A3A] shadow-2xl text-center w-full max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/30">
          <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
          Agendamento confirmado com sucesso! ✅
        </h2>

        <p className="text-mecura-silver mb-8 leading-relaxed">
          Obrigado por dar esse passo importante. Você está a um passo de iniciar um acompanhamento premium, totalmente focado no seu caso.
        </p>

        <div className="bg-[#0A0A0F] rounded-2xl p-6 border border-[#2A2A3A] mb-8 text-sm text-mecura-silver text-left">
          <p className="mb-4">
            <strong className="text-[#D4AF37]">Fique atento:</strong> você receberá em breve a confirmação da consulta junto com o link de acesso à videochamada.
          </p>
          <p>
            As informações serão enviadas pelo WhatsApp e também pelo seu e-mail.
          </p>
        </div>

        <p className="text-lg font-semibold text-mecura-pearl mb-8">Nos vemos em breve!</p>

        <Button 
          className="w-full h-14 text-lg font-bold tracking-wide" 
          variant="premium"
          onClick={() => navigate('/dashboard')}
        >
          Ir para o Painel
        </Button>
      </div>
    </div>
  );
}
