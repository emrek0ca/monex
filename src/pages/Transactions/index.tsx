import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { TransactionList } from '@/components/Transactions/TransactionList';
import { AddTransactionModal } from '@/components/Modals';
import { Button } from '@/components/UI/Button';
import { pb } from '@/api/client';
import { useUserStore } from '@/store/userStore';
import { Collections, MonexTransactionsResponse } from '@/types/pocketbase-types';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    ArrowRightLeft,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { FinanceUtils } from '@/utils/finance';
import { toast } from 'sonner';

export default function Transactions() {
    const { t, i18n } = useTranslation();
    const { user } = useUserStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const dateLocale = i18n.language === 'tr' ? tr : enUS;

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions', 'all', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return pb.collection(Collections.MonexTransactions).getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: pb.filter('user = {:userId}', { userId: user.id })
            });
        },
        enabled: !!user?.id
    });

    const stats = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const thisMonth = transactions?.filter(tx => {
            const txDate = new Date(tx.date || '');
            return txDate >= monthStart && txDate <= monthEnd;
        }) || [];

        const income = thisMonth.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const expense = thisMonth.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
            totalTransactions: transactions?.length || 0,
            thisMonthCount: thisMonth.length,
            income,
            expense,
            net: income - expense
        };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (filterType === 'all') return transactions || [];
        return (transactions || []).filter(tx => tx.type === filterType);
    }, [transactions, filterType]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: user?.currency === '₺' ? 'TRY' : (user?.currency === '€' ? 'EUR' : 'USD'),
            currencyDisplay: 'narrowSymbol'
        }).format(amount).replace('TRY', '₺').replace('EUR', '€').replace('USD', '$');
    };

    const handleExport = () => {
        if (!transactions || transactions.length === 0) return;

        try {
            const headers = {
                date: t('transactions.date'),
                category: t('transactions.category'),
                note: t('transactions.note'),
                type: t('transactions.type'),
                amount: t('transactions.amount'),
            };

            const csvContent = FinanceUtils.exportToCSV(transactions, headers);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `monex_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(t('transactions.exportSuccess'));
        } catch (error) {
            console.error('Export error:', error);
            toast.error(t('transactions.exportError'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t('transactions.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AddTransactionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('transactions.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('transactions.subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="rounded-full px-6 h-12 border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t('transactions.exportCSV')}
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-bold rounded-full px-8 h-12 shadow-xl shadow-blue-500/10"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        {t('transactions.addTransaction')}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('transactions.totalTransactions')}</span>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{stats.totalTransactions}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500">
                            {stats.thisMonthCount} {t('transactions.thisMonth')}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.in')}</span>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                            +{formatCurrency(stats.income)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{format(new Date(), 'MMMM', { locale: dateLocale })}</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.out')}</span>
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-rose-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-rose-600 tracking-tight">
                            -{formatCurrency(stats.expense)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{format(new Date(), 'MMMM', { locale: dateLocale })}</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('transactions.netStatus')}</span>
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center",
                                stats.net >= 0 ? "bg-emerald-50" : "bg-rose-50"
                            )}>
                                {stats.net >= 0 ? (
                                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                ) : (
                                    <ArrowDownRight className="h-5 w-5 text-rose-600" />
                                )}
                            </div>
                        </div>
                        <p className={cn(
                            "text-3xl font-bold tracking-tight",
                            stats.net >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {stats.net >= 0 ? '+' : ''}{formatCurrency(stats.net)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{t('transactions.thisMonth')}</p>
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100"
            >
                {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            filterType === type
                                ? "bg-white text-[#007AFF] shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-[#1D1D1F]"
                        )}
                    >
                        {type === 'all' && t('transactions.all')}
                        {type === 'income' && t('dashboard.in')}
                        {type === 'expense' && t('dashboard.out')}
                        <span className="ml-2 opacity-50 font-medium">
                            {type === 'all'
                                ? transactions?.length || 0
                                : (transactions || []).filter(tx => tx.type === type).length
                            }
                        </span>
                    </button>
                ))}
            </motion.div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden"
            >
                <TransactionList transactions={filteredTransactions} />
            </motion.div>
        </div>
    );
}
