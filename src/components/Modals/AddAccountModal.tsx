import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexAccountsResponse } from '@/types/pocketbase-types';
import { LiquidModal, LiquidInput, LiquidSelect } from '@/components/UI/LiquidModal';
import { Building2, Banknote, PiggyBank, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: MonexAccountsResponse | null;
}

type AccountType = 'bank' | 'cash' | 'savings' | 'investment';

const accountTypes: { type: AccountType; icon: React.ReactNode; color: string }[] = [
    { type: 'bank', icon: <Building2 className="h-5 w-5" />, color: 'blue' },
    { type: 'cash', icon: <Banknote className="h-5 w-5" />, color: 'green' },
    { type: 'savings', icon: <PiggyBank className="h-5 w-5" />, color: 'amber' },
    { type: 'investment', icon: <CreditCard className="h-5 w-5" />, color: 'purple' },
];

export function AddAccountModal({ isOpen, onClose, editData }: AddAccountModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const isEditing = !!editData;

    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('bank');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState('USD');

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            setName(editData.name || '');
            setType((editData.type as AccountType) || 'bank');
            setBalance(editData.balance?.toString() || '');
            setCurrency(editData.currency || 'USD');
        }
    }, [editData]);

    const createMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexAccounts).create({
                user: user?.id,
                name,
                type,
                balance: parseFloat(balance) || 0,
                currency,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success(t('accounts.addSuccess') || 'Account created successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('accounts.addError') || 'Failed to create account');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexAccounts).update(editData!.id, {
                name,
                type,
                balance: parseFloat(balance) || 0,
                currency,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success(t('accounts.updateSuccess') || 'Account updated successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('accounts.updateError') || 'Failed to update account');
        },
    });

    const handleClose = () => {
        setName('');
        setType('bank');
        setBalance('');
        setCurrency('USD');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter an account name');
            return;
        }
        if (isEditing) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const getTypeColor = (t: AccountType) => {
        const colors = {
            bank: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
            cash: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
            savings: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
            investment: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
        };
        return colors[t];
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? (t('accounts.editAccount') || 'Edit Account') : t('accounts.addAccount')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Type */}
                <div>
                    <label className="text-sm font-medium mb-2 block">{t('accounts.type') || 'Account Type'}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {accountTypes.map((at) => (
                            <button
                                key={at.type}
                                type="button"
                                onClick={() => setType(at.type)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all border',
                                    type === at.type ? getTypeColor(at.type) : 'bg-muted/50 text-muted-foreground hover:bg-muted border-transparent'
                                )}
                            >
                                {at.icon}
                                <span className="text-[10px] font-medium capitalize">{t(`accounts.${at.type}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Name */}
                <LiquidInput
                    label={t('accounts.name') || 'Account Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Main Checking"
                    required
                />

                {/* Balance */}
                <div className="relative">
                    <label className="text-sm font-medium mb-2 block">
                        {isEditing ? (t('accounts.balance') || 'Balance') : (t('accounts.initialBalance') || 'Initial Balance')}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full liquid-input pl-10 text-xl font-bold"
                        />
                    </div>
                </div>

                {/* Currency */}
                <LiquidSelect
                    label={t('accounts.currency') || 'Currency'}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                    <option value="GBP">GBP - British Pound</option>
                </LiquidSelect>

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
