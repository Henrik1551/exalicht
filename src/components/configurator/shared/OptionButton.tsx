import { cn } from '@/lib/utils';

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function OptionButton({ 
  selected, 
  onClick, 
  children, 
  className = '',
  disabled = false,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 border rounded-lg transition-all text-sm font-medium',
        selected 
          ? 'border-primary bg-primary text-primary-foreground' 
          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
