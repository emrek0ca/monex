import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexGoalsResponse } from '@/types/pocketbase-types';
import { LiquidModal, LiquidInput, LiquidTextarea } from '@/components/UI/LiquidModal';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: MonexGoalsResponse | null;
}

export function AddGoalModal({ isOpen, onClose, editData }: AddGoalModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const isEditing = !!editData;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            setTitle(editData.title || '');
            setDescription(editData.source_category || '');
            setTargetAmount(editData.targetAmount?.toString() || '');
            setCurrentAmount(editData.currentAmount?.toString() || '');
            setDeadline(editData.deadline ? format(new Date(editData.deadline), 'yyyy-MM-dd') : '');
        }
    }, [editData]);

    const createMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexGoals).create({
                user: user?.id,
                title,
                source_category: description,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
                deadline: deadline || null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success(t('goals.addSuccess') || 'Goal created successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('goals.addError') || 'Failed to create goal');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            return pb.collection(Collections.MonexGoals).update(editData!.id, {
                title,
                source_category: description,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
                deadline: deadline || null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success(t('goals.updateSuccess') || 'Goal updated successfully');
            handleClose();
        },
        onError: () => {
            toast.error(t('goals.updateError') || 'Failed to update goal');
        },
    });

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Please enter a goal title');
            return;
        }
        if (!targetAmount || parseFloat(targetAmount) <= 0) {
            toast.error('Please enter a valid target amount');
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
            title={isEditing ? (t('goals.editGoal') || 'Edit Goal') : t('goals.addGoal')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Goal Title */}
                <LiquidInput
                    label={t('goals.goalTitle') || 'Goal Title'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Car, Emergency Fund"
                    required
                />

                {/* Description */}
                <LiquidTextarea
                    label={t('goals.description') || 'Description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you saving for?"
                    rows={2}
                />

                {/* Target Amount */}
                <div>
                    <label className="text-sm font-medium mb-2 block">{t('goals.targetAmount')}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="10,000"
                            step="0.01"
                            min="0"
                            className="w-full liquid-input pl-10 text-xl font-bold"
                            required
                        />
                    </div>
                </div>

                {/* Current Amount */}
                <div>
                    <label className="text-sm font-medium mb-2 block">{t('goals.currentAmount')}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={currentAmount}
                            onChange={(e) => setCurrentAmount(e.target.value)}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            className="w-full liquid-input pl-10 text-xl font-bold"
                        />
                    </div>
                </div>

                {/* Deadline */}
                <LiquidInput
                    type="date"
                    label={t('goals.deadline')}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
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
