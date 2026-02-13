import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexBudgetsResponse } from '@/types/pocketbase-types';
import { LiquidModal, LiquidSelect } from '@/components/UI/LiquidModal';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: MonexBudgetsResponse | null;
}

const budgetCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health & Fitness',
    'Travel',
    'Education',
    'Personal Care',
    'Other',
];

export function AddBudgetModal({ isOpen, onClose, editData }: AddBudgetModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const isEditing = !!editData;

    const [category, setCategory] = useState('');
    const [limitAmount, setLimitAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            setCategory(editData.category || '');
            setLimitAmount(editData.limit_amount?.toString() || '');
            setCurrentAmount(editData.current_amount?.toString() || '');
        }
    }, [editData]);

    const createMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexBudgets).create({
                user: user?.id,
                category: category || budgetCategories[0],
                limit_amount: parseFloat(limitAmount),
                current_amount: 0,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success(t('budgets.addSuccess') || 'Budget created successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('budgets.addError') || 'Failed to create budget');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexBudgets).update(editData!.id, {
                category: category || budgetCategories[0],
                limit_amount: parseFloat(limitAmount),
                current_amount: parseFloat(currentAmount) || 0,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success(t('budgets.updateSuccess') || 'Budget updated successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('budgets.updateError') || 'Failed to update budget');
        },
    });

    const handleClose = () => {
        setCategory('');
        setLimitAmount('');
        setCurrentAmount('');
        setPeriod('monthly');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!limitAmount || parseFloat(limitAmount) <= 0) {
            toast.error('Please enter a valid limit amount');
            return;
        }
        if (isEditing) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? (t('budgets.editBudget') || 'Edit Budget') : t('budgets.addBudget')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category */}
                <LiquidSelect
                    label={t('budgets.category') || 'Category'}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {budgetCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </LiquidSelect>

                {/* Limit Amount */}
                <div>
                    <label className="text-sm font-medium mb-2 block">{t('budgets.limit')}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={limitAmount}
                            onChange={(e) => setLimitAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full liquid-input pl-10 text-xl font-bold"
                            required
                        />
                    </div>
                </div>

                {/* Current Amount (only show when editing) */}
                {isEditing && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('budgets.currentSpent') || 'Current Spent'}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                            <input
                                type="number"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full liquid-input pl-10 text-xl font-bold"
                            />
                        </div>
                    </div>
                )}

                {/* Period (only for new budgets) */}
                {!isEditing && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('budgets.period') || 'Period'}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['monthly', 'weekly'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPeriod(p)}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${period === p
                                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted border-transparent'
                                        }`}
                                >
                                    {p === 'monthly' ? t('budgets.monthly') || 'Monthly' : t('budgets.weekly') || 'Weekly'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                        className="flex-1 liquid-button bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEditing ? t('common.save') : t('common.add')}
                    </button>
                </div>
            </form>
        </LiquidModal>
    );
}
