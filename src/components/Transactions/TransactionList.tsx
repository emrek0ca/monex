import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowDownLeft,
    Coffee,
    ShoppingBag,
    Zap,
    Home,
    TrendingUp,
    Loader2,
    ArrowRightLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    Car,
    Plane,
    Heart,
    Gamepad2,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexTransactionsResponse } from '@/types/pocketbase-types';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { AddTransactionModal } from '@/components/Modals';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/UI/DropdownMenu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'grocery':
        case 'food':
        case 'food & dining':
            return { icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' };
        case 'shopping':
            return { icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-500/10' };
        case 'utilities':
        case 'bills & utilities':
            return { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
        case 'salary':
        case 'income':
            return { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
        case 'transport':
        case 'transportation':
            return { icon: Car, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' };
        case 'travel':
            return { icon: Plane, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' };
        case 'health':
        case 'healthcare':
            return { icon: Heart, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' };
        case 'entertainment':
            return { icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' };
        case 'education':
            return { icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' };
        default:
            return { icon: Home, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-500/10' };
    }
};

interface TransactionListProps {
    transactions?: MonexTransactionsResponse[];
}

export function TransactionList({ transactions: propTransactions }: TransactionListProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const [editTransaction, setEditTransaction] = useState<MonexTransactionsResponse | null>(null);
    const [deleteTransaction, setDeleteTransaction] = useState<MonexTransactionsResponse | null>(null);

    const { data: fetchedTransactions, isLoading } = useQuery({
        queryKey: ['transactions', 'all', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexTransactions).getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user && !propTransactions
    });

    const transactions = propTransactions || fetchedTransactions;

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await pb.collection(Collections.MonexTransactions).delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
            toast.success(t('transactions.deleteSuccess') || 'Transaction deleted successfully');
            setDeleteTransaction(null);
        },
        onError: () => {
            toast.error(t('transactions.deleteError') || 'Failed to delete transaction');
        }
    });

    if (isLoading && !propTransactions) {
        return (
            <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
        );
    }

    // Group transactions by date
    const groupedTransactions = transactions?.reduce((groups, tx) => {
        const date = tx.date ? format(new Date(tx.date), 'yyyy-MM-dd') : 'unknown';
        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {} as Record<string, MonexTransactionsResponse[]>) || {};

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    return (
        <>
            <AddTransactionModal
                isOpen={!!editTransaction}
                onClose={() => setEditTransaction(null)}
                editData={editTransaction}
            />

            <ConfirmDialog
                isOpen={!!deleteTransaction}
                onClose={() => setDeleteTransaction(null)}
                onConfirm={() => deleteTransaction && deleteMutation.mutate(deleteTransaction.id)}
                title={t('transactions.deleteTitle') || 'Delete Transaction'}
                description={t('transactions.deleteDescription') || 'Are you sure you want to delete this transaction? This action cannot be undone.'}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            {transactions && transactions.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {sortedDates.map((date) => (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="px-5 py-3 bg-gray-50/50 dark:bg-white/5 sticky top-0">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {date === 'unknown'
                                        ? 'Unknown Date'
                                        : format(new Date(date), 'EEEE, MMMM d, yyyy')
                                    }
                                </p>
                            </div>

                            {/* Transactions for this date */}
                            {groupedTransactions[date].map((tx, index) => {
                                const config = getCategoryConfig(tx.category || 'other');
                                const IconComponent = tx.type === 'income' ? TrendingUp : config.icon;

                                return (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="group flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className={cn(
                                                'flex h-11 w-11 items-center justify-center rounded-xl shrink-0',
                                                tx.type === 'income'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                                                    : config.bg
                                            )}>
                                                <IconComponent className={cn(
                                                    "h-5 w-5",
                                                    tx.type === 'income'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : config.color
                                                )} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {tx.note || t('transactions.noDescription')}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                                        tx.type === 'income'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                            : config.bg + ' ' + config.color
                                                    )}>
                                                        {tx.category || t('transactions.uncategorized')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {tx.date ? format(new Date(tx.date), 'HH:mm') : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                'text-base font-bold shrink-0',
                                                tx.type === 'income'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            )}>
                                                {tx.type === 'income' ? '+' : '-'}${tx.amount?.toLocaleString()}
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditTransaction(tx)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        {t('common.edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteTransaction(tx)}
                                                        variant="danger"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('common.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        {t('transactions.noTransactions')}
                    </p>
                </div>
            )}
        </>
    );
}
