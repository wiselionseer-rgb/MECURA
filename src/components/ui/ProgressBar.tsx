import { cn } from '../../lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-mecura-silver mb-2">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-mecura-surface-light rounded-full overflow-hidden border border-mecura-elevated">
        <div
          className="h-full bg-gradient-to-r from-mecura-neon to-mecura-green rounded-full shadow-[0_0_10px_rgba(166,255,0,0.5)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
