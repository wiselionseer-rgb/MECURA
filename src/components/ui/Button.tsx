import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden tracking-wide";
    
    const variants = {
      primary: "bg-gradient-to-r from-[#A6FF00] via-[#86FF00] to-[#A6FF00] text-[#0A0A0F] font-black shadow-[0_8px_30px_rgba(166,255,0,0.45)] hover:shadow-[0_12px_40px_rgba(166,255,0,0.65)] hover:bg-[#CFFF5A] border border-[#CFFF5A]/50",
      premium: "bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#00FF66] text-[#0A0A0F] font-black shadow-[0_10px_35px_rgba(166,255,0,0.5)] hover:shadow-[0_15px_45px_rgba(166,255,0,0.7)] border border-white/40",
      secondary: "bg-[#142118] text-white hover:bg-[#1B2B20] border border-white/10",
      outline: "border border-[#A6FF00] text-[#A6FF00] font-bold hover:bg-[#A6FF00]/10 hover:border-[#A6FF00]",
      ghost: "border border-white/10 text-white/80 hover:text-white hover:bg-white/5",
    };
    
    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-14 px-6 text-base",
      lg: "h-16 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
