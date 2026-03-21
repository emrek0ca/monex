import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexAccountsResponse, MonexTransactionsResponse } from '@/types/pocketbase-types';
import { LiquidModal, LiquidInput, LiquidSelect, LiquidTextarea } from '@/components/UI/LiquidModal';
import { TrendingUp, TrendingDown, ArrowLeftRight, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CurrencyService, CurrencyCode } from '@/services/currencyService';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: MonexTransactionsResponse | null;
}

type TransactionType = 'income' | 'expense' | 'transfer';

const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
    transfer: ['Account Transfer'],
};

export function AddTransactionModal({ isOpen, onClose, editData }: AddTransactionModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const isEditing = !!editData;

    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<CurrencyCode>('USD');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [accountId, setAccountId] = useState('');

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            setType((editData.type as TransactionType) || 'expense');
            setAmount(editData.amount?.toString() || '');
            setCategory(editData.category || '');
            setDate(editData.date ? format(new Date(editData.date), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0]);
            setAccountId(editData.account || '');
            
            // Extract currency and note
            const match = editData.note?.match(/\[([A-Z]{3})\]/);
            if (match) {
                setCurrency(match[1] as CurrencyCode);
                setNote(editData.note?.replace(/\[[A-Z]{3}\]\s?/, '') || '');
            } else {
                setNote(editData.note || '');
                setCurrency('USD');
            }
        }
    }, [editData]);

    const { data: accounts } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexAccounts).getFullList<MonexAccountsResponse>({
                sort: 'name',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user && isOpen,
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const finalNote = `[${currency}] ${note}`.trim();
            return pb.collection(Collections.MonexTransactions).create({
                user: user?.id,
                type,
                amount: parseFloat(amount),
                category: category || categories[type][0],
                date,
                note: finalNote,
                account: accountId || accounts?.[0]?.id,
            });
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t('transactions.addSuccess'));
            handleClose();
        },
        onError: () => {
            toast.error(t('transactions.addError'));
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            const finalNote = `[${currency}] ${note}`.trim();
            return pb.collection(Collections.MonexTransactions).update(editData!.id, {
                type,
                amount: parseFloat(amount),
                category: category || categories[type][0],
                date,
                note: finalNote,
                account: accountId || accounts?.[0]?.id,
            });
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t('transactions.updateSuccess') || 'Transaction updated successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('transactions.updateError') || 'Failed to update transaction');
        },
    });

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
        queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
        queryClient.invalidateQueries({ queryKey: ['chartTransactions'] });
        queryClient.invalidateQueries({ queryKey: ['analyticsTransactions'] });
    };

    const handleClose = () => {
        setType('expense');
        setAmount('');
        setCurrency('USD');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
        setAccountId('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.error(t('transactions.invalidAmount') || 'Please enter a valid amount');
            return;
        }
        if (isEditing) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const transactionTypes: TransactionType[] = ['expense', 'income', 'transfer'];
    const currencies: CurrencyCode[] = ['USD', 'TRY', 'EUR', 'GBP'];

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? (t('transactions.editTransaction') || 'Edit Transaction') : t('transactions.addTransaction')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Transaction Type */}
                <div className="grid grid-cols-3 gap-2">
                    {transactionTypes.map((txType) => (
                        <button
                            key={txType}
                            type="button"
                            onClick={() => {
                                setType(txType);
                                setCategory('');
                            }}
                            className={cn(
                                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                                type === txType
                                    ? txType === 'income'
                                        ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                                        : txType === 'expense'
                                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {txType === 'income' && <TrendingUp className="h-5 w-5" />}
                            {txType === 'expense' && <TrendingDown className="h-5 w-5" />}
                            {txType === 'transfer' && <ArrowLeftRight className="h-5 w-5" />}
                            <span className="text-xs font-medium">{t(`transactions.${txType}`)}</span>
                        </button>
                    ))}
                </div>

                {/* Amount & Currency */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                            {CurrencyService.getSymbol(currency)}
                        </span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full liquid-input pl-10 text-2xl font-bold"
                            required
                        />
                    </div>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="w-24 liquid-input font-bold text-center"
                    >
                        {currencies.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <LiquidSelect
                    label={t('transactions.category')}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">{t('common.select')}</option>
                    {categories[type].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </LiquidSelect>

                {/* Account */}
                {accounts && accounts.length > 0 && (
                    <LiquidSelect
                        label={t('transactions.account')}
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </LiquidSelect>
                )}

                {/* Date */}
                <LiquidInput
                    type="date"
                    label={t('transactions.date')}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                {/* Note */}
                <LiquidTextarea
                    label={t('transactions.note')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('transactions.notePlaceholder')}
                    rows={2}
                />

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 liquid-button"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            'flex-1 liquid-button text-white border-0 flex items-center justify-center gap-2',
                            type === 'income'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : type === 'expense'
                                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        )}
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEditing ? t('common.save') : t('common.add')}
                    </button>
                </div>
            </form>
        </LiquidModal>
    );
}
