import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './Button';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    const iconConfig = {
        danger: {
            bg: 'bg-red-50 dark:bg-red-500/10',
            icon: 'text-red-600 dark:text-red-400',
            ring: 'ring-red-100 dark:ring-red-500/20',
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            icon: 'text-amber-600 dark:text-amber-400',
            ring: 'ring-amber-100 dark:ring-amber-500/20',
        },
        default: {
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            icon: 'text-blue-600 dark:text-blue-400',
            ring: 'ring-blue-100 dark:ring-blue-500/20',
        },
    };

    const buttonConfig = {
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-lg shadow-red-500/25',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25',
        default: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25',
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                                className={cn(
                                    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                                    'w-[90vw] max-w-sm',
                                    'bg-white dark:bg-slate-900 rounded-2xl',
                                    'shadow-2xl shadow-black/10',
                                    'border border-gray-200/50 dark:border-white/10',
                                    'p-6 focus:outline-none overflow-hidden'
                                )}
                            >
                                {/* Decorative blur */}
                                <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-red-400/20 to-rose-400/20 blur-3xl pointer-events-none" />

                                <Dialog.Close asChild>
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                </Dialog.Close>

                                <div className="relative flex flex-col items-center text-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', delay: 0.1 }}
                                        className={cn(
                                            'h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ring-4',
                                            iconConfig[variant].bg,
                                            iconConfig[variant].ring
                                        )}
                                    >
                                        <AlertTriangle className={cn('h-7 w-7', iconConfig[variant].icon)} />
                                    </motion.div>

                                    <Dialog.Title asChild>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-lg font-bold text-gray-900 dark:text-white mb-2"
                                        >
                                            {title}
                                        </motion.h2>
                                    </Dialog.Title>

                                    <Dialog.Description asChild>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
                                        >
                                            {description}
                                        </motion.p>
                                    </Dialog.Description>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="flex gap-3 w-full"
                                    >
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-11 bg-gray-100 dark:bg-white/10 border-0 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                                            onClick={onClose}
                                            disabled={isLoading}
                                        >
                                            {cancelLabel}
                                        </Button>
                                        <Button
                                            className={cn('flex-1 h-11 border-0', buttonConfig[variant])}
                                            onClick={onConfirm}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : confirmLabel}
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
