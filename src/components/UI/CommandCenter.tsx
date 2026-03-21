import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Search, 
    Plus, 
    LayoutDashboard, 
    ArrowRightLeft, 
    BarChart3, 
    Target, 
    PieChart, 
    Settings,
    Wallet,
    Command,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AddTransactionModal, AddAccountModal, AddGoalModal, AddBudgetModal } from '@/components/Modals';

export function CommandCenter() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeModal, setActiveModal] = useState<'transaction' | 'account' | 'goal' | 'budget' | null>(null);

    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
        setQuery('');
    };

    const items = [
        // Actions
        { id: 'add-tx', title: t('command.addTransaction'), icon: Plus, category: 'actions', action: () => setActiveModal('transaction'), shortcut: 'T' },
        { id: 'add-acc', title: t('command.addAccount'), icon: Wallet, category: 'actions', action: () => setActiveModal('account'), shortcut: 'A' },
        { id: 'add-goal', title: t('command.addGoal'), icon: Target, category: 'actions', action: () => setActiveModal('goal'), shortcut: 'G' },
        { id: 'add-budget', title: t('command.addBudget'), icon: PieChart, category: 'actions', action: () => setActiveModal('budget'), shortcut: 'B' },
        
        // Navigation
        { id: 'nav-dash', title: t('command.goToDashboard'), icon: LayoutDashboard, category: 'navigation', action: () => navigate('/app') },
        { id: 'nav-tx', title: t('command.goToTransactions'), icon: ArrowRightLeft, category: 'navigation', action: () => navigate('/app/transactions') },
        { id: 'nav-analytics', title: t('command.goToAnalytics'), icon: BarChart3, category: 'navigation', action: () => navigate('/app/analytics') },
        { id: 'nav-goals', title: t('command.goToGoals'), icon: Target, category: 'navigation', action: () => navigate('/app/goals') },
        { id: 'nav-budgets', title: t('command.goToBudgets'), icon: PieChart, category: 'navigation', action: () => navigate('/app/budgets') },
        { id: 'nav-settings', title: t('command.goToSettings'), icon: Settings, category: 'navigation', action: () => navigate('/app/settings') },
    ];

    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    const categories = ['actions', 'navigation'] as const;

    return (
        <>
            {/* Modals */}
            <AddTransactionModal isOpen={activeModal === 'transaction'} onClose={() => setActiveModal(null)} />
            <AddAccountModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} />
            <AddGoalModal isOpen={activeModal === 'goal'} onClose={() => setActiveModal(null)} />
            <AddBudgetModal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} />

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />

                        {/* Palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="relative p-6 border-b border-gray-100 dark:border-white/10">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    autoFocus
                                    placeholder={t('command.placeholder')}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent pl-12 pr-12 h-12 text-lg font-medium text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:outline-none"
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <kbd className="hidden sm:flex h-6 px-2 items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-500">ESC</kbd>
                                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                {filteredItems.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Command className="h-10 w-10 text-gray-200 dark:text-white/10 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('command.noResults')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {categories.map(cat => {
                                            const categoryItems = filteredItems.filter(item => item.category === cat);
                                            if (categoryItems.length === 0) return null;

                                            return (
                                                <div key={cat} className="space-y-2">
                                                    <h3 className="px-4 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em]">
                                                        {t(`command.${cat}`)}
                                                    </h3>
                                                    <div className="grid gap-1">
                                                        {categoryItems.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => handleAction(item.action)}
                                                                className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-[#007AFF] group transition-all text-left"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:bg-white/20 group-hover:border-transparent transition-all shadow-inner">
                                                                        <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                                                    </div>
                                                                    <span className="font-bold text-[#1D1D1F] dark:text-white group-hover:text-white tracking-tight">
                                                                        {item.title}
                                                                    </span>
                                                                </div>
                                                                {item.shortcut && (
                                                                    <kbd className="hidden sm:flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-400 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent">
                                                                        {item.shortcut}
                                                                    </kbd>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <kbd className="h-5 px-1.5 rounded bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[9px] font-black shadow-sm">↵</kbd>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.select') || 'SEÇ'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="h-5 px-1.5 rounded bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[9px] font-black shadow-sm">↑↓</kbd>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.navigate') || 'GEZİN'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
