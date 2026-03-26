'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onDismiss: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
};

const styles = {
    success: 'bg-white border-emerald-100 shadow-emerald-900/5',
    error: 'bg-white border-rose-100 shadow-rose-900/5',
    info: 'bg-white border-indigo-100 shadow-indigo-900/5',
    warning: 'bg-white border-amber-100 shadow-amber-900/5'
};

export function Toast({ id, type, message, duration = 5000, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md max-w-sm w-full pointer-events-auto ${styles[type]}`}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-semibold text-slate-700 flex-1">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
