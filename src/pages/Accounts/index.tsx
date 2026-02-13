import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { Collections, MonexAccountsResponse } from '@/types/pocketbase-types';
import { Button } from '@/components/UI/Button';
import { AddAccountModal } from '@/components/Modals';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import {
    Plus,
    Wallet,
    Building2,
    Banknote,
    PiggyBank,
    CreditCard,
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/UI/DropdownMenu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Accounts() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const [showAddModal, setShowAddModal] = useState(false);
    const [editAccount, setEditAccount] = useState<MonexAccountsResponse | null>(null);
    const [deleteAccount, setDeleteAccount] = useState<MonexAccountsResponse | null>(null);

    const { data: accounts, isLoading } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexAccounts).getFullList<MonexAccountsResponse>({
                sort: '-created',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await pb.collection(Collections.MonexAccounts).delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success(t('accounts.deleteSuccess') || 'Account deleted successfully');
            setDeleteAccount(null);
        },
        onError: () => {
            toast.error(t('accounts.deleteError') || 'Failed to delete account');
        }
    });

    const getIcon = (type: string) => {
        const iconClass = "h-6 w-6";
        switch (type) {
            case 'bank': return <Building2 className={cn(iconClass, "text-blue-600")} />;
            case 'cash': return <Banknote className={cn(iconClass, "text-emerald-600")} />;
            case 'investment': return <CreditCard className={cn(iconClass, "text-purple-600")} />;
            case 'savings': return <PiggyBank className={cn(iconClass, "text-amber-600")} />;
            default: return <Wallet className={cn(iconClass, "text-gray-600")} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'bank': return t('accounts.bank');
            case 'cash': return t('accounts.cash');
            case 'investment': return t('accounts.investment');
            case 'savings': return t('accounts.savings');
            default: return type;
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'bank': return {
                gradient: 'from-blue-500 to-indigo-600',
                bg: 'bg-blue-50 dark:bg-blue-500/10',
                border: 'border-blue-100 dark:border-blue-500/20',
                iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            };
            case 'cash': return {
                gradient: 'from-emerald-500 to-green-600',
                bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                border: 'border-emerald-100 dark:border-emerald-500/20',
                iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            };
            case 'investment': return {
                gradient: 'from-purple-500 to-violet-600',
                bg: 'bg-purple-50 dark:bg-purple-500/10',
                border: 'border-purple-100 dark:border-purple-500/20',
                iconBg: 'bg-purple-100 dark:bg-purple-500/20',
            };
            case 'savings': return {
                gradient: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                border: 'border-amber-100 dark:border-amber-500/20',
                iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            };
            default: return {
                gradient: 'from-gray-500 to-slate-600',
                bg: 'bg-gray-50 dark:bg-gray-500/10',
                border: 'border-gray-100 dark:border-gray-500/20',
                iconBg: 'bg-gray-100 dark:bg-gray-500/20',
            };
        }
    };

    const totalBalance = accounts?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;
    const positiveAccounts = accounts?.filter(a => (a.balance || 0) > 0).length || 0;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading accounts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AddAccountModal
                isOpen={showAddModal || !!editAccount}
                onClose={() => {
                    setShowAddModal(false);
                    setEditAccount(null);
                }}
                editData={editAccount}
            />

            {/* Header - Apple Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('accounts.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('accounts.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-6 py-6 shadow-xl shadow-blue-500/10"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {t('accounts.addAccount')}
                </Button>
            </div>

            {/* Stats Cards - Light High Contrast */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                {/* Total Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm:col-span-2 relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/10 to-violet-500/10 rounded-[2.5rem] blur-xl opacity-50 transition group-hover:opacity-100" />
                    <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">
                                    <Wallet className="h-4 w-4 text-blue-500" />
                                    <span>{t('accounts.totalBalance')}</span>
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-bold text-[#1D1D1F] tracking-tight">
                                    ${totalBalance.toLocaleString()}
                                </h2>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBFBFD] border border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        {accounts?.length || 0} {t('accounts.accountCount')}
                                    </div>
                                    {positiveAccounts > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            <TrendingUp className="h-3 w-3" />
                                            {positiveAccounts} Pozitif
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <TrendingUp className="h-10 w-10" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Add Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full h-full bg-[#FBFBFD] rounded-[2.5rem] p-8 border-2 border-dashed border-gray-100 hover:border-blue-300 hover:bg-white transition-all group flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Plus className="h-7 w-7 text-blue-600" />
                        </div>
                        <p className="font-bold text-[#1D1D1F]">{t('accounts.addAccount')}</p>
                        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Yeni Limit Ekle</p>
                    </button>
                </motion.div>
            </div>

            <ConfirmDialog
                isOpen={!!deleteAccount}
                onClose={() => setDeleteAccount(null)}
                onConfirm={() => deleteAccount && deleteMutation.mutate(deleteAccount.id)}
                title={t('accounts.deleteTitle') || 'Delete Account'}
                description={t('accounts.deleteDescription') || `Are you sure you want to delete "${deleteAccount?.name}"? This action cannot be undone.`}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            {/* Accounts Grid - Apple Style Cards */}
            {accounts && accounts.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((acc, index) => {
                        const config = getTypeConfig(acc.type || '');
                        return (
                            <motion.div
                                key={acc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                        config.iconBg
                                    )}>
                                        {getIcon(acc.type || 'other')}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-gray-100 shadow-xl">
                                            <DropdownMenuItem onClick={() => setEditAccount(acc)} className="rounded-xl py-2.5 font-semibold text-gray-600">
                                                <Pencil className="h-4 w-4 mr-2" />
                                                {t('common.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteAccount(acc)}
                                                variant="danger"
                                                className="rounded-xl py-2.5 font-semibold"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {t('common.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight truncate">{acc.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                            config.bg,
                                            config.iconBg.replace('bg-', 'text-').replace('50', '600')
                                        )}>
                                            {getTypeLabel(acc.type || '')}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{acc.currency || 'USD'}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Bakiye</p>
                                        <p className={cn(
                                            "text-2xl font-bold tracking-tight",
                                            (acc.balance || 0) >= 0
                                                ? "text-[#1D1D1F]"
                                                : "text-rose-500"
                                        )}>
                                            ${(acc.balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    {(acc.balance || 0) > 0 && (
                                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
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
                        <Wallet className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 font-display tracking-tight">Henüz hesap yok</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                        {t('accounts.noAccounts') || "Finansal yolculuğuna başlamak için ilk hesabını ekle."}
                    </p>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-8 py-6 shadow-xl shadow-blue-500/10"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t('accounts.addAccount')}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
