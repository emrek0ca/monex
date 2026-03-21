import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { Collections, MonexBudgetsResponse } from '@/types/pocketbase-types';
import { Button } from '@/components/UI/Button';
import { AddBudgetModal } from '@/components/Modals';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import {
    Plus,
    Loader2,
    AlertTriangle,
    PieChart,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    Check,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useUserStore } from '@/store/userStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/UI/DropdownMenu';

export default function Budgets() {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editBudget, setEditBudget] = useState<MonexBudgetsResponse | null>(null);
    const [deleteBudget, setDeleteBudget] = useState<MonexBudgetsResponse | null>(null);

    const { data: budgets, isLoading } = useQuery({
        queryKey: ['budgets', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexBudgets).getFullList<MonexBudgetsResponse>({
                sort: '-created',
                filter: pb.filter('user = {:userId}', { userId: user?.id })
            });
        },
        enabled: !!user?.id
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await pb.collection(Collections.MonexBudgets).delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success(t('budgets.deleteSuccess'));
            setDeleteBudget(null);
        },
        onError: () => {
            toast.error(t('budgets.deleteError'));
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: user?.currency === '₺' ? 'TRY' : (user?.currency === '€' ? 'EUR' : 'USD'),
            currencyDisplay: 'narrowSymbol'
        }).format(amount).replace('TRY', '₺').replace('EUR', '€').replace('USD', '$');
    };

    const totalBudget = budgets?.reduce((acc, curr) => acc + (curr.limit_amount || 0), 0) || 0;
    const totalSpent = budgets?.reduce((acc, curr) => acc + (curr.current_amount || 0), 0) || 0;
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const onTrackCount = budgets?.filter(b => (b.current_amount || 0) <= (b.limit_amount || 0)).length || 0;
    const overBudgetCount = budgets?.filter(b => (b.current_amount || 0) > (b.limit_amount || 0)).length || 0;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AddBudgetModal
                isOpen={showAddModal || !!editBudget}
                onClose={() => {
                    setShowAddModal(false);
                    setEditBudget(null);
                }}
                editData={editBudget}
            />

            <ConfirmDialog
                isOpen={!!deleteBudget}
                onClose={() => setDeleteBudget(null)}
                onConfirm={() => deleteBudget && deleteMutation.mutate(deleteBudget.id)}
                title={t('budgets.deleteTitle')}
                description={t('budgets.deleteDescription', { category: deleteBudget?.category })}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                variant="destructive"
                isLoading={deleteMutation.isPending}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('budgets.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('budgets.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-6 py-6 shadow-xl shadow-blue-500/10"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {t('budgets.addBudget')}
                </Button>
            </div>

            {/* Stats Grid */}
            {budgets && budgets.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sm:col-span-2 relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500/10 to-rose-500/10 rounded-[2.5rem] blur-xl opacity-50 transition group-hover:opacity-100" />
                        <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">
                                        <PieChart className="h-4 w-4 text-orange-500" />
                                        <span>{t('budgets.totalSpent')}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-4xl sm:text-5xl font-bold text-[#1D1D1F] tracking-tight truncate">
                                            {formatCurrency(totalSpent)}
                                        </h2>
                                        <span className="text-gray-400 font-medium px-2">/ {formatCurrency(totalBudget)}</span>
                                    </div>
                                    <div className="mt-6">
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, totalPercentage)}%` }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                className={cn(
                                                    "h-full rounded-full bg-gradient-to-r",
                                                    totalPercentage > 100 ? "from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "from-orange-500 to-amber-500"
                                                )}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                                            {t('budgets.budgetUsage', { percent: totalPercentage.toFixed(0) })}
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-6 h-20 w-20 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                                    {totalPercentage > 100 ? (
                                        <TrendingUp className="h-10 w-10" />
                                    ) : (
                                        <TrendingDown className="h-10 w-10" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('budgets.onTrack')}</span>
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-emerald-600 tracking-tight">{onTrackCount}</p>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">{t('budgets.onTrackDesc')}</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('budgets.overBudgetCount')}</span>
                                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-rose-600 tracking-tight">{overBudgetCount}</p>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">{t('budgets.overBudgetDesc')}</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Budget Cards */}
            {budgets && budgets.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {budgets.map((budget, index) => {
                        const percentage = ((budget.current_amount || 0) / (budget.limit_amount || 1)) * 100;
                        const isOver = (budget.current_amount || 0) > (budget.limit_amount || 0);
                        const remaining = (budget.limit_amount || 0) - (budget.current_amount || 0);

                        const getStatusColor = () => {
                            if (isOver) return { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'from-rose-500 to-red-600', badge: 'bg-rose-100 text-rose-700' };
                            if (percentage > 80) return { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'from-amber-400 to-orange-500', badge: 'bg-amber-100 text-amber-700' };
                            return { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'from-emerald-400 to-green-500', badge: 'bg-emerald-100 text-emerald-700' };
                        };

                        const status = getStatusColor();

                        return (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight truncate mb-1">{budget.category}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('budgets.monthlyBudget')}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-gray-100 shadow-xl">
                                            <DropdownMenuItem onClick={() => setEditBudget(budget)} className="rounded-xl py-2.5 font-semibold text-gray-600">
                                                <Pencil className="h-4 w-4 mr-2" />
                                                {t('common.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteBudget(budget)}
                                                variant="danger"
                                                className="rounded-xl py-2.5 font-semibold"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {t('common.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
                                                {formatCurrency(budget.current_amount || 0)}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                / {formatCurrency(budget.limit_amount || 0)} {t('budgets.limit')}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "text-lg font-black tracking-tight",
                                            status.text
                                        )}>
                                            %{Math.min(percentage, 999).toFixed(0)}
                                        </div>
                                    </div>

                                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, percentage)}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                                            className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", status.bar)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                        status.bg, status.text
                                    )}>
                                        {isOver ? (
                                            <>
                                                <AlertTriangle className="h-3 w-3" />
                                                {formatCurrency(Math.abs(remaining))} {t('budgets.overBudgetCapital')}
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-3 w-3" />
                                                {formatCurrency(remaining)} {t('budgets.remainingCapital')}
                                            </>
                                        )}
                                    </div>
                                    {isOver && (
                                        <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-16 border border-gray-100 text-center shadow-sm"
                >
                    <div className="h-20 w-20 rounded-[2rem] bg-[#FBFBFD] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <PieChart className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 font-display tracking-tight">{t('budgets.noBudgetsTitle')}</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                        {t('budgets.noBudgets')}
                    </p>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-8 py-6 shadow-xl shadow-blue-500/10"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t('budgets.addBudget')}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
