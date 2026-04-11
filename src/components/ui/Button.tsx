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
      primary: "bg-mecura-neon text-[#0A0A0F] shadow-[0_0_15px_rgba(166,255,0,0.3)] hover:bg-mecura-neon-hover hover:shadow-[0_0_25px_rgba(166,255,0,0.5)]",
      premium: "bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0A0F] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]",
      secondary: "bg-mecura-surface-light text-mecura-pearl hover:bg-mecura-elevated",
      outline: "border border-mecura-neon text-mecura-pearl hover:bg-mecura-neon/10",
      ghost: "border border-mecura-silver text-mecura-pearl hover:bg-white/5",
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
