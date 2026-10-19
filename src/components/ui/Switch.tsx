import { motion } from 'motion/react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative flex items-center w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? 'bg-[#A6FF00] shadow-[0_0_15px_rgba(166,255,0,0.5)]' : 'bg-[#142118] border border-white/10'
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-4 h-4 rounded-full shadow-sm ${
          checked ? 'bg-[#0A0A0F] ml-auto' : 'bg-gray-400'
        }`}
      />
    </div>
  );
}
