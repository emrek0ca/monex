import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useUserStore } from '@/store/userStore';
import { Collections, MonexTransactionsResponse, MonexAccountsResponse } from '@/types/pocketbase-types';
import { UpgradeModal } from '@/components/UI/UpgradeModal';
import { BarChart3, PieChart, TrendingUp, Calendar, Loader2, ArrowUpRight, ArrowDownRight, Wallet, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6',
    '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899'
];

export default function Analytics() {
    const { t, i18n } = useTranslation();
    const { user } = useUserStore();
    const { plan } = useSubscriptionStore();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const dateLocale = i18n.language === 'tr' ? tr : enUS;

    // Determine history limit based on tier
    const historyLimitDays = plan === 'pro_plus' ? 36500 : (plan === 'pro' ? 365 : 7);

    // Fetch transactions with tier-based limit
    const { data: allTransactions = [], isLoading } = useQuery({
        queryKey: ['analyticsTransactions', user?.id, historyLimitDays],
        queryFn: async () => {
            if (!user?.id) return [];
            
            const dateFilter = historyLimitDays === 7
                ? format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                : format(subMonths(new Date(), historyLimitDays === 365 ? 12 : 1200), 'yyyy-MM-dd');

            return pb.collection(Collections.MonexTransactions).getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: pb.filter('user = {:userId} && date >= {:dateFilter}', { userId: user.id, dateFilter })
            });
        },
        enabled: !!user?.id,
    });

    const transactions = allTransactions;

    // Fetch accounts
    const { data: accounts = [] } = useQuery({
        queryKey: ['analyticsAccounts', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return pb.collection(Collections.MonexAccounts).getFullList<MonexAccountsResponse>({
                sort: 'name',
                filter: pb.filter('user = {:userId}', { userId: user.id })
            });
        },
        enabled: !!user?.id,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: user?.currency === '₺' ? 'TRY' : (user?.currency === '€' ? 'EUR' : 'USD'),
            currencyDisplay: 'narrowSymbol'
        }).format(amount).replace('TRY', '₺').replace('EUR', '€').replace('USD', '$');
    };

    const getTranslatedCategory = (category: string) => {
        // Simple mapping for common categories if they exist in i18n
        const key = `categories.${category.toLowerCase()}`;
        const translated = t(key);
        return translated === key ? category : translated;
    };

    // Calculate spending by category
    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        transactions.forEach((tx: MonexTransactionsResponse) => {
            if (tx.type === 'expense' && tx.amount) {
                const cat = tx.category || 'Other';
                categories[cat] = (categories[cat] || 0) + tx.amount;
            }
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ 
                name: getTranslatedCategory(name), 
                value 
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [transactions, t]);

    // Calculate monthly income vs expense
    const monthlyData = useMemo(() => {
        const months = eachMonthOfInterval({
            start: subMonths(new Date(), historyLimitDays === 7 ? 0 : 11),
            end: new Date()
        });

        return months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthTx = transactions.filter((tx: MonexTransactionsResponse) => {
                const txDate = new Date(tx.date || '');
                return txDate >= monthStart && txDate <= monthEnd;
            });

            const income = monthTx
                .filter((tx: MonexTransactionsResponse) => tx.type === 'income')
                .reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);

            const expense = monthTx
                .filter((tx: MonexTransactionsResponse) => tx.type === 'expense')
                .reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);

            return {
                month: format(month, 'MMM', { locale: dateLocale }),
                income,
                expense,
                net: income - expense
            };
        });
    }, [transactions, historyLimitDays, dateLocale]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalIncome = transactions
            .filter((tx: MonexTransactionsResponse) => tx.type === 'income')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

        const totalExpense = transactions
            .filter((tx: MonexTransactionsResponse) => tx.type === 'expense')
            .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

        const totalBalance = accounts.reduce((sum: number, acc: MonexAccountsResponse) => sum + (acc.balance || 0), 0);

        const avgMonthlyIncome = totalIncome / 12;
        const avgMonthlyExpense = totalExpense / 12;

        return {
            totalIncome,
            totalExpense,
            totalBalance,
            avgMonthlyIncome,
            avgMonthlyExpense,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
        };
    }, [transactions, accounts]);

    // Account distribution
    const accountData = useMemo(() => {
        return accounts.map((acc: MonexAccountsResponse) => ({
            name: acc.name,
            value: acc.balance || 0,
            type: acc.type
        })).filter(acc => acc.value > 0);
    }, [accounts]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t('analytics.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header - Apple Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('analytics.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('analytics.subtitle')}
                    </p>
                </div>

                {plan !== 'pro_plus' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 rounded-[2rem] bg-amber-50 border border-amber-100 shadow-sm"
                    >
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-inner">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">
                                {plan === 'free' ? t('analytics.limitedHistory') : t('analytics.proHistory')}
                            </p>
                            <p className="text-[11px] text-amber-700 font-medium">
                                {t('analytics.upgradeForFull')}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUpgradeModal(true)}
                            className="h-10 w-10 p-0 rounded-full hover:bg-amber-100 text-amber-700"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </div>

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

            {/* Overview Stats - Light High Contrast */}
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('analytics.totalIncome')}</span>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
                            {formatCurrency(totals.totalIncome)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                            {t('analytics.monthlyAvg')}: {formatCurrency(totals.avgMonthlyIncome)}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('analytics.totalExpense')}</span>
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <ArrowDownRight className="h-5 w-5 text-rose-600" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
                            {formatCurrency(totals.totalExpense)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                            {t('analytics.monthlyAvg')}: {formatCurrency(totals.avgMonthlyExpense)}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('analytics.netWorth')}</span>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-[#007AFF]" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                            {formatCurrency(totals.totalBalance)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                            {accounts.length} {t('accounts.accountCount')}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('analytics.savingsRate')}</span>
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <p className={cn(
                            "text-2xl sm:text-3xl font-bold tracking-tight",
                            totals.savingsRate >= 0 ? "text-indigo-600" : "text-rose-500"
                        )}>
                            %{totals.savingsRate.toFixed(1)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                            {t('analytics.yearlyAvg')}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 1 - Apple Style Containers */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Monthly Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('analytics.monthlyTrend')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('analytics.incomeExpenseAnalysis')}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                                <XAxis
                                    dataKey="month"
                                    className="text-[10px] font-bold"
                                    tick={{ fill: '#86868B' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    className="text-[10px] font-bold"
                                    tick={{ fill: '#86868B' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => formatCurrency(v).split('.')[0]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid #F5F5F7',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                    labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#86868B', marginBottom: '8px', textTransform: 'uppercase' }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} fill="url(#incomeGradient)" name={t('analytics.income')} />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fill="url(#expenseGradient)" name={t('analytics.expense')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Spending by Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('analytics.spendingByCategory')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('analytics.categoryDistribution')}</p>
                        </div>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    {categoryData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid #F5F5F7',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                        formatter={(value: number) => [formatCurrency(value), '']}
                                    />
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
                            <PieChart className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">{t('analytics.noData')}</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Charts Row 2 - Apple Style Containers */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Income vs Expense Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('analytics.incomeVsExpense')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('analytics.monthlyComparison')}</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                                <XAxis
                                    dataKey="month"
                                    className="text-[10px] font-bold"
                                    tick={{ fill: '#86868B' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    className="text-[10px] font-bold"
                                    tick={{ fill: '#86868B' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => formatCurrency(v).split('.')[0]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid #F5F5F7',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                    labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#86868B', marginBottom: '8px', textTransform: 'uppercase' }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Bar dataKey="income" name={t('analytics.income')} fill="#22c55e" radius={[10, 10, 10, 10]} barSize={20} />
                                <Bar dataKey="expense" name={t('analytics.expense')} fill="#ef4444" radius={[10, 10, 10, 10]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Account Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('analytics.accountDistribution')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('analytics.assetDistribution')}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    {accountData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={accountData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {accountData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid #F5F5F7',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                        formatter={(value: number) => [formatCurrency(value), '']}
                                    />
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
                            <Calendar className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">{t('analytics.noData')}</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Net Savings Trend - Apple Style Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('analytics.netSavingsTrend')}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('analytics.netSavingsAnalysis')}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                            <XAxis
                                dataKey="month"
                                className="text-[10px] font-bold"
                                tick={{ fill: '#86868B' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                className="text-[10px] font-bold"
                                tick={{ fill: '#86868B' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => formatCurrency(v).split('.')[0]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid #F5F5F7',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#86868B', marginBottom: '8px', textTransform: 'uppercase' }}
                                formatter={(value: number) => [formatCurrency(value), '']}
                            />
                            <Area type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={3} fill="url(#netGradient)" name={t('analytics.netSavings')} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
