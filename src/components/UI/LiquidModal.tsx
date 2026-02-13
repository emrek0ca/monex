import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiquidModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    icon?: ReactNode;
    variant?: 'default' | 'gradient';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
};

export function LiquidModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    icon,
    variant = 'default',
}: LiquidModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{
                                type: 'spring',
                                duration: 0.4,
                                bounce: 0.15
                            }}
                            className={cn(
                                'relative w-full overflow-hidden',
                                'bg-white dark:bg-slate-900',
                                'rounded-2xl sm:rounded-3xl',
                                'shadow-2xl shadow-black/10',
                                'border border-gray-200/50 dark:border-white/10',
                                sizeClasses[size],
                                'max-h-[90vh] overflow-y-auto'
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative gradient blur */}
                            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-3xl pointer-events-none" />

                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className={cn(
                                    "relative sticky top-0 z-10 px-5 sm:px-6 pt-5 sm:pt-6 pb-4",
                                    variant === 'gradient' && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                                )}>
                                    <div className="flex items-start gap-4">
                                        {icon && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', delay: 0.1 }}
                                                className={cn(
                                                    "flex h-11 w-11 items-center justify-center rounded-xl shrink-0",
                                                    variant === 'gradient'
                                                        ? "bg-white/20 text-white"
                                                        : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                                                )}
                                            >
                                                {icon}
                                            </motion.div>
                                        )}
                                        <div className="flex-1 pr-8 min-w-0">
                                            {title && (
                                                <motion.h2
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className={cn(
                                                        "text-lg sm:text-xl font-bold tracking-tight",
                                                        variant !== 'gradient' && "text-gray-900 dark:text-white"
                                                    )}
                                                >
                                                    {title}
                                                </motion.h2>
                                            )}
                                            {description && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.15 }}
                                                    className={cn(
                                                        "text-sm mt-1",
                                                        variant === 'gradient'
                                                            ? "text-white/70"
                                                            : "text-gray-500 dark:text-gray-400"
                                                    )}
                                                >
                                                    {description}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                    {showCloseButton && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring' }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={onClose}
                                            className={cn(
                                                "absolute top-4 right-4 p-2 rounded-full transition-colors",
                                                variant === 'gradient'
                                                    ? "hover:bg-white/10 text-white/80 hover:text-white"
                                                    : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            )}
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="relative p-5 sm:p-6"
                            >
                                {children}
                            </motion.div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

// Enhanced Liquid Glass Form Components
export function LiquidInput({
    label,
    error,
    className,
    icon,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    icon?: ReactNode;
}) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        'w-full h-11 rounded-xl px-4 text-sm',
                        'bg-gray-50 dark:bg-white/5',
                        'border border-gray-200 dark:border-white/10',
                        'text-gray-900 dark:text-white',
                        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
                        'transition-all duration-200',
                        icon && 'pl-10',
                        error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function LiquidSelect({
    label,
    error,
    children,
    className,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            )}
            <div className="relative">
                <select
                    className={cn(
                        'w-full h-11 rounded-xl px-4 text-sm appearance-none cursor-pointer',
                        'bg-gray-50 dark:bg-white/5',
                        'border border-gray-200 dark:border-white/10',
                        'text-gray-900 dark:text-white',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
                        'transition-all duration-200',
                        'pr-10',
                        error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function LiquidTextarea({
    label,
    error,
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            )}
            <textarea
                className={cn(
                    'w-full rounded-xl px-4 py-3 text-sm resize-none',
                    'bg-gray-50 dark:bg-white/5',
                    'border border-gray-200 dark:border-white/10',
                    'text-gray-900 dark:text-white',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
                    'transition-all duration-200',
                    'min-h-[100px]',
                    error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function LiquidButton({
    children,
    variant = 'default',
    size = 'md',
    className,
    isLoading,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'primary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}) {
    const variants = {
        default: 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10',
        primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-400 hover:to-rose-400 shadow-lg shadow-red-500/25',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300',
    };

    const sizes = {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-5 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-xl',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center font-medium transition-all duration-200',
                'disabled:opacity-50 disabled:pointer-events-none',
                'active:scale-[0.98]',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
