import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { TransactionList } from '@/components/Transactions/TransactionList';
import { AddTransactionModal } from '@/components/Modals';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
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
    Download,
    Search,
    SlidersHorizontal,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, format, subDays, startOfYear } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { FinanceUtils } from '@/utils/finance';
import { toast } from 'sonner';

type DateFilter = 'month' | '30days' | 'year' | 'all';

export default function Transactions() {
    const { t, i18n } = useTranslation();
    const { user } = useUserStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [showFilters, setShowFilters] = useState(false);

    const dateLocale = i18n.language === 'tr' ? tr : enUS;

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions', user?.id, dateFilter],
        queryFn: async () => {
            if (!user?.id) return [];
            
            let filter = pb.filter('user = {:userId}', { userId: user.id });
            
            const now = new Date();
            if (dateFilter === 'month') {
                filter += ` && date >= '${startOfMonth(now).toISOString()}'`;
            } else if (dateFilter === '30days') {
                filter += ` && date >= '${subDays(now, 30).toISOString()}'`;
            } else if (dateFilter === 'year') {
                filter += ` && date >= '${startOfYear(now).toISOString()}'`;
            }

            return pb.collection(Collections.MonexTransactions).getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter
            });
        },
        enabled: !!user?.id
    });

    const filteredTransactions = useMemo(() => {
        let result = transactions || [];

        // Type filter
        if (filterType !== 'all') {
            result = result.filter(tx => tx.type === filterType);
        }

        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(tx => 
                tx.note?.toLowerCase().includes(query) || 
                tx.category?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [transactions, filterType, searchQuery]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const expense = filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
            totalTransactions: filteredTransactions.length,
            income,
            expense,
            net: income - expense
        };
    }, [filteredTransactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: user?.currency === '₺' ? 'TRY' : (user?.currency === '€' ? 'EUR' : 'USD'),
            currencyDisplay: 'narrowSymbol'
        }).format(amount).replace('TRY', '₺').replace('EUR', '€').replace('USD', '$');
    };

    const handleExport = () => {
        if (!filteredTransactions || filteredTransactions.length === 0) return;
        try {
            const headers = {
                date: t('transactions.date'),
                category: t('transactions.category'),
                note: t('transactions.note'),
                type: t('transactions.type'),
                amount: t('transactions.amount'),
            };
            const csvContent = FinanceUtils.exportToCSV(filteredTransactions, headers);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `monex_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.click();
            toast.success(t('transactions.exportSuccess'));
        } catch (error) {
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

            {/* Search & Filter Bar - Executive Style */}
            <div className="grid gap-4 md:flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('transactions.searchPlaceholder')}
                        className="pl-11 h-12 rounded-2xl bg-white border-gray-100 shadow-sm focus:ring-[#007AFF]/10 focus:border-[#007AFF]"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <X className="h-3 w-3 text-gray-500" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "h-12 rounded-2xl border-gray-100 bg-white font-bold px-6 shadow-sm",
                        showFilters ? "bg-gray-50 border-gray-200" : ""
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                    {t('transactions.filter')}
                </Button>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-wrap gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('transactions.filterByDate')}</label>
                                <div className="flex p-1 bg-gray-100/50 rounded-xl border border-gray-100">
                                    {(['month', '30days', 'year', 'all'] as const).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setDateFilter(key)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                dateFilter === key ? "bg-white text-[#007AFF] shadow-sm" : "text-gray-500"
                                            )}
                                        >
                                            {key === 'month' && t('transactions.thisMonth')}
                                            {key === '30days' && t('transactions.last30Days')}
                                            {key === 'year' && t('transactions.thisYear')}
                                            {key === 'all' && t('transactions.allTime')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setDateFilter('all');
                                    setFilterType('all');
                                    setSearchQuery('');
                                }}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs uppercase tracking-widest"
                            >
                                {t('transactions.clearFilters')}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('transactions.totalTransactions')}</span>
                    <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{stats.totalTransactions}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('dashboard.in')}</span>
                    <p className="text-3xl font-bold text-emerald-600 tracking-tight">+{formatCurrency(stats.income)}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('dashboard.out')}</span>
                    <p className="text-3xl font-bold text-rose-600 tracking-tight">-{formatCurrency(stats.expense)}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t('transactions.netStatus')}</span>
                    <p className={cn(
                        "text-3xl font-bold tracking-tight",
                        stats.net >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>{stats.net >= 0 ? '+' : ''}{formatCurrency(stats.net)}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
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
                                ? filteredTransactions.length
                                : filteredTransactions.filter(tx => tx.type === type).length
                            }
                        </span>
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden"
            >
                <TransactionList transactions={filteredTransactions} />
            </motion.div>
        </div>
    );
}
