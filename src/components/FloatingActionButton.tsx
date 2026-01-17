import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'danger';
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainAction?: () => void;
  mainLabel?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  mainAction,
  mainLabel = 'Add',
  position = 'bottom-right',
  size = 'md',
  theme = 'light',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const bgClasses = {
    light: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg',
    dark: 'bg-surface-primary hover:bg-surface-tertiary text-white shadow-lg',
  };

  const secondaryBgClasses = {
    light: 'bg-surface-primary text-content-secondary shadow-md hover:bg-surface-tertiary',
    dark: 'bg-surface-elevated text-white shadow-md hover:bg-interactive-secondary-hover',
  };

  const colorClasses = {
    primary: 'text-brand-500 bg-brand-50 dark:bg-brand-900/30',
    secondary: 'text-content-secondary bg-surface-secondary',
    success: 'text-semantic-success bg-green-50 dark:bg-green-900/30',
    danger: 'text-semantic-error bg-red-50 dark:bg-red-900/30',
  };

  const handleMainAction = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (mainAction) {
      mainAction();
    }
  };

  const handleActionClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Actions Menu */}
      {isOpen && actions.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.onClick)}
              title={action.label}
              className={cn(
                'flex items-center justify-center rounded-full transition-all duration-200',
                'hover:scale-110 active:scale-95',
                'min-h-[44px] min-w-[44px] w-12 h-12',
                theme === 'light' ? secondaryBgClasses.light : secondaryBgClasses.dark,
                action.color && colorClasses[action.color]
              )}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleMainAction}
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-200',
          'hover:scale-110 active:scale-95 font-medium',
          sizeClasses[size],
          bgClasses[theme],
          isOpen && 'rotate-45'
        )}
        title={mainLabel}
        aria-label={mainLabel}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className={iconSizes[size]} />
        ) : (
          <Plus className={iconSizes[size]} />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/0"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
