import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OverviewChart } from '@/components/Charts/OverviewChart';
import { AIInsightsCard, FinancialHealthScore, PredictionsCard } from '@/components/Dashboard/PremiumFeatures';
import { GamificationCard } from '@/components/Dashboard/GamificationCard';
import {
    TrendingUp,
    TrendingDown,
    RefreshCcw,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    ChevronRight,
    Wallet,
    Target,
    PieChart,
    Clock,
    Sparkles,
    CreditCard,
    ArrowRight,
    Zap,
    BarChart3,
    Settings
} from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { pb } from '@/api/client';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { MonexTransactionsResponse, MonexAccountsResponse, MonexGoalsResponse, MonexBudgetsResponse, Collections } from '@/types/pocketbase-types';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { UpgradeModal } from '@/components/UI/UpgradeModal';
import { AddTransactionModal } from '@/components/Modals';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { AIAssistant } from '@/components/Dashboard/AIAssistant';

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useUserStore();
    const { isPremium, plan } = useSubscriptionStore();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);

    // Limit history based on tier
    const historyLimitDays = isPremium ? 10000 : 7; // Pro/Pro+ get effectively unlimited history

    // Fetch all transactions
    const { data: allTransactions = [], isLoading: txLoading } = useQuery({
        queryKey: ['allTransactions', user?.id],
        queryFn: async () => {
            return pb.collection('monex_transactions').getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: pb.filter('user = {:userId}', { userId: user?.id })
            });
        },
        enabled: !!user,
    });

    // Tier-based transaction filter
    const transactions = useMemo(() => {
        if (isPremium) return allTransactions;

        const now = new Date();
        return allTransactions.filter(tx => {
            const txDate = new Date(tx.date || '');
            return differenceInDays(now, txDate) <= historyLimitDays;
        });
    }, [allTransactions, isPremium, historyLimitDays]);

    // Fetch accounts
    const { data: accounts = [], isLoading: accLoading } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexAccounts).getFullList<MonexAccountsResponse>({
                sort: 'name',
                filter: pb.filter('user = {:userId}', { userId: user?.id })
            });
        },
        enabled: !!user,
    });

    // Fetch goals
    const { data: goals = [] } = useQuery({
        queryKey: ['goals', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexGoals).getFullList<MonexGoalsResponse>({
                sort: 'deadline',
                filter: pb.filter('user = {:userId}', { userId: user?.id })
            });
        },
        enabled: !!user,
    });

    // Fetch budgets
    const { data: budgets = [] } = useQuery({
        queryKey: ['budgets', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexBudgets).getFullList<MonexBudgetsResponse>({
                sort: '-created',
                filter: pb.filter('user = {:userId}', { userId: user?.id })
            });
        },
        enabled: !!user,
    });

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const currentMonthTx = transactions.filter(tx => {
            const txDate = new Date(tx.date || '');
            return txDate >= currentMonthStart && txDate <= currentMonthEnd;
        });

        const lastMonthTx = transactions.filter(tx => {
            const txDate = new Date(tx.date || '');
            return txDate >= lastMonthStart && txDate <= lastMonthEnd;
        });

        const currentIncome = currentMonthTx.filter(tx => tx.type === 'income').reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);
        const currentExpense = currentMonthTx.filter(tx => tx.type === 'expense').reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);
        const lastIncome = lastMonthTx.filter(tx => tx.type === 'income').reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);
        const lastExpense = lastMonthTx.filter(tx => tx.type === 'expense').reduce((sum: number, tx: MonexTransactionsResponse) => sum + (tx.amount || 0), 0);

        const incomeTrend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
        const expenseTrend = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;
        const totalBalance = accounts.reduce((sum: number, acc: MonexAccountsResponse) => sum + (acc.balance || 0), 0);
        const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;

        const totalGoalTarget = goals.reduce((sum: number, g: MonexGoalsResponse) => sum + (g.targetAmount || 0), 0);
        const totalGoalCurrent = goals.reduce((sum: number, g: MonexGoalsResponse) => sum + (g.currentAmount || 0), 0);
        const goalsProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

        const totalBudgetLimit = budgets.reduce((sum: number, b: MonexBudgetsResponse) => sum + (b.limit_amount || 0), 0);
        const totalBudgetUsed = budgets.reduce((sum: number, b: MonexBudgetsResponse) => sum + (b.current_amount || 0), 0);
        const budgetUsage = totalBudgetLimit > 0 ? (totalBudgetUsed / totalBudgetLimit) * 100 : 0;

        const recentTx = transactions.slice(0, 5);


        const incomeTrendData = [40, 70, 45, 90, 65, 80, 95]; // Static placeholders for visual wow
        const expenseTrendData = [30, 45, 35, 50, 40, 60, 55];

        const upcomingGoal = goals.find(g => {
            const deadline = g.deadline ? new Date(g.deadline) : null;
            return deadline && deadline > now && (g.currentAmount || 0) < (g.targetAmount || 0);
        });

        return {
            totalBalance,
            currentIncome,
            currentExpense,
            incomeTrend,
            expenseTrend,
            incomeTrendData,
            expenseTrendData,
            savingsRate,
            goalsProgress,
            budgetUsage,
            recentTx,
            upcomingGoal,
            accountCount: accounts.length,
            goalCount: goals.length,
            budgetCount: budgets.length,
            isHistoryRestricted: !isPremium && allTransactions.length > transactions.length
        };
    }, [transactions, allTransactions.length, accounts, goals, budgets, isPremium]);

    const isLoading = txLoading || accLoading;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <RefreshCcw className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <AddTransactionModal isOpen={showAddTransaction} onClose={() => setShowAddTransaction(false)} />
            <AIAssistant />

            {/* Hero Header - Executive Apple Aesthetic */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[3rem] bg-white border border-gray-100 p-10 sm:p-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] mb-10"
            >
                {/* Refined Background Textures */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Welcome Text Section - Column 7 */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2.5 rounded-full bg-[#1D1D1F]/[0.03] border border-[#1D1D1F]/5 px-4 py-1.5 backdrop-blur-md"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]/60">Finansal İstihbarat</span>
                        </motion.div>

                        <div className="space-y-3">
                            <h1 className="text-5xl sm:text-6xl font-bold text-[#1D1D1F] tracking-tight leading-[1.1]">
                                {t('dashboard.welcome')},<br />
                                <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>
                            </h1>

                            {stats.isHistoryRestricted ? (
                                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#FFF9E6] border border-[#FFE8A3] shadow-inner text-[#855D00]">
                                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <span className="text-sm font-semibold">Ücretsiz Plan: <span className="opacity-70 font-medium">Son 7 gün</span></span>
                                    <button
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="text-xs font-black uppercase tracking-widest bg-white rounded-full px-3 py-1 shadow-sm hover:scale-105 transition-transform"
                                    >
                                        Yükselt
                                    </button>
                                </div>
                            ) : (
                                <p className="text-[#86868B] text-xl font-medium max-w-lg leading-relaxed">
                                    {t('dashboard.subtitle') || "Finansal durumunuzu kontrol edin ve hedeflerinize bir adım daha yaklaşın."}
                                </p>
                            )}
                        </div>

                        {/* Executive Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button
                                onClick={() => setShowAddTransaction(true)}
                                className="relative group bg-[#1D1D1F] hover:bg-[#000] text-white font-bold rounded-2xl px-10 py-7 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Plus className="h-5 w-5 mr-2" />
                                <span className="relative">{t('transactions.add')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate('/app/analytics')}
                                className="bg-white border-gray-100 text-[#1D1D1F] hover:bg-gray-50 font-bold rounded-2xl px-10 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1"
                            >
                                <BarChart3 className="h-5 w-5 mr-2" />
                                {t('dashboard.overview')}
                            </Button>
                        </div>
                    </div>

                    {/* Integrated Net Worth Station - Column 5 */}
                    <div className="lg:col-span-5 relative">
                        <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full" />
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative bg-white border border-gray-100 rounded-[3rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-[#F5F5F7] flex items-center justify-center border border-gray-100">
                                    <Wallet className="h-8 w-8 text-[#1D1D1F]" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-black text-[#86868B] uppercase tracking-[0.3em]">Total Assets</span>
                                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span>2.4%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-5xl sm:text-6xl font-black text-[#1D1D1F] tracking-tight">
                                    ${(stats.totalBalance || 0).toLocaleString()}
                                </h2>
                                <p className="text-lg font-medium text-[#86868B]">Kullanılabilir Bakiye</p>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-gray-100 pt-10">
                                <div>
                                    <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mb-1">Gelir</p>
                                    <p className="text-xl font-bold text-emerald-600 tracking-tight">${stats.currentIncome.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mb-1">Gider</p>
                                    <p className="text-xl font-bold text-[#1D1D1F] tracking-tight">${stats.currentExpense.toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Executive Stats Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Monthly Income */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full",
                            stats.incomeTrend >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                            {stats.incomeTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(stats.incomeTrend).toFixed(1)}%
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('transactions.income')}</p>
                        <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tight">${stats.currentIncome.toLocaleString()}</h3>
                    </div>
                    {/* Refined Sparkline */}
                    <div className="mt-8 h-10 w-full opacity-20 border-t border-gray-50 pt-4">
                        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path
                                d={`M 0 ${20 - stats.incomeTrendData[0] / 5} ${stats.incomeTrendData.map((d, i) => `L ${(i / 6) * 100} ${20 - d / 5}`).join(' ')}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="text-emerald-500"
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* Monthly Expense */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                            <TrendingDown className="h-7 w-7" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full",
                            stats.expenseTrend <= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                            {stats.expenseTrend <= 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {Math.abs(stats.expenseTrend).toFixed(1)}%
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('transactions.expense')}</p>
                        <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tight">${stats.currentExpense.toLocaleString()}</h3>
                    </div>
                    {/* Refined Sparkline */}
                    <div className="mt-8 h-10 w-full opacity-20 border-t border-gray-50 pt-4">
                        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path
                                d={`M 0 ${20 - stats.expenseTrendData[0] / 5} ${stats.expenseTrendData.map((d, i) => `L ${(i / 6) * 100} ${20 - d / 5}`).join(' ')}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="text-rose-500"
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* Savings Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                            <Target className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-widest">
                            AYLIK
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('dashboard.savingsRate')}</p>
                        <h3 className={cn(
                            "text-3xl font-black tracking-tight",
                            stats.savingsRate >= 20 ? "text-[#1D1D1F]" :
                                stats.savingsRate >= 0 ? "text-amber-600" : "text-rose-600"
                        )}>
                            {stats.savingsRate.toFixed(1)}%
                        </h3>
                    </div>
                    <div className="mt-8 border-t border-gray-50 pt-4">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {stats.currentIncome - stats.currentExpense >= 0 ? 'Harcama Dengeli' : 'Bütçe Aşımı'}
                        </p>
                    </div>
                </motion.div>

                {/* Budget Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                            <PieChart className="h-7 w-7" />
                        </div>
                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border border-gray-100 px-3 py-1.5 rounded-full bg-gray-50">
                            {stats.budgetCount} Bütçe
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('nav.budgets')}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className={cn(
                                "text-3xl font-black tracking-tight",
                                stats.budgetUsage > 90 ? "text-rose-600" :
                                    stats.budgetUsage > 70 ? "text-amber-600" : "text-emerald-600"
                            )}>
                                {stats.budgetUsage.toFixed(0)}%
                            </h3>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Doluluk</span>
                        </div>
                    </div>
                    <div className="mt-8 relative h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, stats.budgetUsage)}%` }}
                            transition={{ duration: 1.2, ease: "circOut" }}
                            className={cn(
                                "absolute left-0 top-0 h-full rounded-full shadow-sm",
                                stats.budgetUsage > 90 ? "bg-rose-500" :
                                    stats.budgetUsage > 70 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t('dashboard.overview')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Income vs Expenses over time</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/app/analytics')}
                                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                            >
                                {t('common.viewAll')}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                        <OverviewChart />
                    </div>
                </motion.div>

                {/* Side Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {/* Gamification Stats */}
                    {user && (
                        <GamificationCard
                            xp={user.xp || 0}
                            level={user.level || 1}
                            streak={user.streak || 0}
                        />
                    )}

                    {/* Proactive AI Insight */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1D1D1F] text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Wiqo İçgörüsü</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic">
                            "{plan === 'pro_plus'
                                ? "Geçen aya göre abonelik harcamalarında %15 tasarruf edebilirsin. Detaylar analiz sayfasında."
                                : "Pro plana geçerek AI destekli harcama tahminlerine ulaşabilirsin."}"
                        </p>
                    </motion.div>

                    {/* Goals Progress */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                                    <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{t('nav.goals')}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                                {stats.goalCount} active
                            </span>
                        </div>
                        <div className="relative h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, stats.goalsProgress)}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stats.goalsProgress.toFixed(0)}% complete</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/app/goals')}
                                className="text-xs h-7 px-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                            >
                                View <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>

                    {/* Upcoming Goal */}
                    {stats.upcomingGoal && (
                        <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                    {t('goals.nextDeadline') || 'Upcoming'}
                                </span>
                            </div>
                            <p className="font-black text-[#1D1D1F] text-lg mb-2">{stats.upcomingGoal.title}</p>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-sm font-bold text-gray-500">
                                    ${(stats.upcomingGoal.currentAmount || 0).toLocaleString()} / ${(stats.upcomingGoal.targetAmount || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-widest">
                                    {stats.upcomingGoal.deadline && differenceInDays(new Date(stats.upcomingGoal.deadline), new Date())} GÜN KALDI
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Professional Management Console - Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="font-bold text-[#1D1D1F] dark:text-white tracking-tight">Hızlı Yönetim</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Yönetim Konsolu</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                <Zap className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { icon: CreditCard, label: t('nav.accounts'), href: '/app/accounts', color: 'bg-blue-50 text-blue-600' },
                                { icon: PieChart, label: t('nav.budgets'), href: '/app/budgets', color: 'bg-amber-50 text-amber-600' },
                                { icon: Target, label: t('nav.goals'), href: '/app/goals', color: 'bg-violet-50 text-violet-600' },
                                { icon: Settings, label: t('nav.settings'), href: '/app/settings', color: 'bg-gray-50 text-gray-600' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.href)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all group"
                                >
                                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shadow-inner", action.color)}>
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="text-sm font-bold text-[#1D1D1F] dark:text-gray-300 transition-colors group-hover:text-blue-600">{action.label}</span>
                                        <p className="text-[10px] text-gray-400 font-medium">Yönetim Paneline Git</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Transactions - Executive List Style */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="flex items-center justify-between p-10 pb-6 border-b border-gray-50">
                        <div>
                            <h3 className="font-black text-2xl text-[#1D1D1F] tracking-tight">{t('dashboard.recentTransactions')}</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Son finansal aktiviteleriniz ve işlem detayları</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/app/transactions')}
                            className="bg-gray-50 border-gray-100 text-[#1D1D1F] hover:bg-gray-100 rounded-2xl px-6 h-12 font-bold"
                        >
                            Tümünü Gör
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {stats.recentTx.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
                                    <Wallet className="h-10 w-10 text-gray-300" />
                                </div>
                                <h4 className="text-[#1D1D1F] font-black text-xl mb-2">Henüz işlem yok</h4>
                                <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mb-8">Harcamalarınızı ekledikçe burada detaylı bir döküm göreceksiniz.</p>
                                <Button
                                    onClick={() => setShowAddTransaction(true)}
                                    className="bg-[#1D1D1F] hover:bg-black text-white rounded-2xl h-12 px-8 font-bold shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    İlk İşlemi Başlat
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-1">
                                {stats.recentTx.map((tx, index) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 8, backgroundColor: "#FBFBFD" }}
                                        transition={{ delay: 0.8 + index * 0.05 }}
                                        className="flex items-center justify-between p-5 rounded-3xl transition-all cursor-pointer group"
                                        onClick={() => navigate('/app/transactions')}
                                    >
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white transition-all group-hover:scale-105 group-hover:rotate-3",
                                                tx.type === 'income'
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-[#1D1D1F] text-white"
                                            )}>
                                                {tx.type === 'income' ? (
                                                    <TrendingUp className="h-6 w-6" />
                                                ) : (
                                                    <TrendingDown className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-[#1D1D1F] text-lg truncate leading-tight mb-1">{tx.note || tx.category}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                        {tx.date && format(new Date(tx.date), 'dd MMM yyyy')}
                                                    </p>
                                                    <span className="h-1 w-1 rounded-full bg-gray-200" />
                                                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">{tx.category || 'Genel'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-xl font-black tracking-tighter",
                                                tx.type === 'income' ? "text-emerald-600" : "text-[#1D1D1F]"
                                            )}>
                                                {tx.type === 'income' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">İşlem Onaylandı</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Premium Features Section */}
            {isPremium ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <AIInsightsCard />
                    <FinancialHealthScore />
                    <PredictionsCard />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 sm:p-8"
                >
                    {/* Background blur */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Pro Features</span>
                            </div>
                            <h3 className="font-bold text-xl">{t('premium.upgradeToPro')}</h3>
                            <p className="text-white/60 mt-1 text-sm max-w-md">
                                {t('settings.upgradeMore')}
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-white text-violet-700 hover:bg-white/90 shadow-lg shadow-black/20"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {t('upgrade.upgradeNow')}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
