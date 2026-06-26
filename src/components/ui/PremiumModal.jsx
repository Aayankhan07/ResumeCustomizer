import { X } from 'lucide-react';
import Button from './Button';

export default function PremiumModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 flex flex-col gap-4 animate-scale-in z-10 text-left">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 transition-colors cursor-pointer focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {children && (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {children}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg text-xs font-bold"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="py-2 px-4 rounded-lg text-xs font-bold"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
