import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { TransactionList } from '@/components/Transactions/TransactionList';
import { AddTransactionModal } from '@/components/Modals';
import { Button } from '@/components/UI/Button';
import { pb } from '@/api/client';
import { Collections, MonexTransactionsResponse } from '@/types/pocketbase-types';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function Transactions() {
    const { t } = useTranslation();
    const user = pb.authStore.model;
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions', 'all', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexTransactions).getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user
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

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading transactions...</p>
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

            {/* Header - Apple Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('transactions.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('transactions.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-6 py-6 shadow-xl shadow-blue-500/10"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    {t('transactions.addTransaction')}
                </Button>
            </div>

            {/* Stats Cards - Apple Perspective */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam İşlem</span>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{stats.totalTransactions}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500">
                            {stats.thisMonthCount} Bu Ay
                        </div>
                    </div>
                </motion.div>

                {/* Income */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.in')}</span>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                            +${stats.income.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{format(new Date(), 'MMMM')}</p>
                    </div>
                </motion.div>

                {/* Expenses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.out')}</span>
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-rose-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-rose-600 tracking-tight">
                            -${stats.expense.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{format(new Date(), 'MMMM')}</p>
                    </div>
                </motion.div>

                {/* Net */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Durum</span>
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
                            {stats.net >= 0 ? '+' : ''}${stats.net.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Bu Ay</p>
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs - Apple Pill Style */}
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
                        {type === 'all' && 'Tümü'}
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

            {/* Transactions List - Apple Style */}
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
