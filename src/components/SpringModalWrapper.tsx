import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface SpringModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-5xl" or "max-w-6xl"
  headerExtra?: React.ReactNode;
}

export const SpringModalWrapper: React.FC<SpringModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-5xl',
  headerExtra
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
          {/* Backdrop with Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container with Spring Entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`relative z-10 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 w-full ${maxWidth} my-auto flex flex-col max-h-[92vh] overflow-hidden`}
          >
            {/* Header if provided */}
            {(title || icon) && (
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  {icon && (
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">{title}</h2>}
                    {subtitle && <p className="text-xs text-slate-400 font-mono">{subtitle}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {headerExtra}
                  <button
                    onClick={onClose}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
