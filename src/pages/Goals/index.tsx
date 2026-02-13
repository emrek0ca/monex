import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { Collections, MonexGoalsResponse } from '@/types/pocketbase-types';
import { Button } from '@/components/UI/Button';
import { AddGoalModal } from '@/components/Modals';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { Plus, Target, Loader2, Clock, CheckCircle, TrendingUp, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/UI/DropdownMenu';

export default function Goals() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const user = pb.authStore.model;
    const [showAddModal, setShowAddModal] = useState(false);
    const [editGoal, setEditGoal] = useState<MonexGoalsResponse | null>(null);
    const [deleteGoal, setDeleteGoal] = useState<MonexGoalsResponse | null>(null);

    const { data: goals, isLoading } = useQuery({
        queryKey: ['goals', user?.id],
        queryFn: async () => {
            return pb.collection(Collections.MonexGoals).getFullList<MonexGoalsResponse>({
                sort: 'deadline',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await pb.collection(Collections.MonexGoals).delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success(t('goals.deleteSuccess') || 'Goal deleted successfully');
            setDeleteGoal(null);
        },
        onError: () => {
            toast.error(t('goals.deleteError') || 'Failed to delete goal');
        }
    });

    const totalTarget = goals?.reduce((acc, curr) => acc + (curr.targetAmount || 0), 0) || 0;
    const totalSaved = goals?.reduce((acc, curr) => acc + (curr.currentAmount || 0), 0) || 0;
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <AddGoalModal
                isOpen={showAddModal || !!editGoal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditGoal(null);
                }}
                editData={editGoal}
            />

            <ConfirmDialog
                isOpen={!!deleteGoal}
                onClose={() => setDeleteGoal(null)}
                onConfirm={() => deleteGoal && deleteMutation.mutate(deleteGoal.id)}
                title={t('goals.deleteTitle') || 'Delete Goal'}
                description={t('goals.deleteDescription') || `Are you sure you want to delete "${deleteGoal?.title}"? This action cannot be undone.`}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            {/* Header - Apple Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('goals.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('goals.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-6 py-6 shadow-xl shadow-blue-500/10"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {t('goals.addGoal')}
                </Button>
            </div>

            {/* Overview Card - Light High Contrast */}
            {goals && goals.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] blur-xl opacity-50 transition group-hover:opacity-100" />
                    <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    {t('goals.totalProgress') || 'TOPLAM İLERLEME'}
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-4xl sm:text-5xl font-bold text-[#1D1D1F] tracking-tight">
                                        ${totalSaved.toLocaleString()}
                                    </h2>
                                    <span className="text-gray-400 font-medium pb-1">/ ${totalTarget.toLocaleString()}</span>
                                </div>
                                <div className="mt-8">
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${overallProgress}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full shadow-sm"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest text-right">
                                        HEDEFLERİN %{overallProgress.toFixed(0)} TAMAMLANDI
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-blue-50 border border-blue-100/50 text-[#007AFF] shadow-inner">
                                <TrendingUp className="h-6 w-6" />
                                <span className="text-lg font-black tracking-tight">{overallProgress.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {goals?.map((goal, index) => {
                    const percentage = Math.min(100, ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100);
                    const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
                    const isCompleted = percentage >= 100;
                    const isOverdue = daysLeft !== null && daysLeft < 0 && !isCompleted;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                    isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#007AFF]"
                                )}>
                                    {isCompleted ? <CheckCircle className="h-7 w-7" /> : <Target className="h-7 w-7" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    {daysLeft !== null && (
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            isOverdue ? "bg-rose-50 text-rose-600" :
                                                daysLeft <= 7 ? "bg-amber-50 text-amber-600" :
                                                    "bg-gray-50 text-gray-400"
                                        )}>
                                            <Clock className="h-3 w-3" />
                                            {isOverdue ? t('goals.overdue') :
                                                daysLeft === 0 ? t('goals.today') :
                                                    `${daysLeft} GÜN`}
                                        </div>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-gray-100 shadow-xl">
                                            <DropdownMenuItem onClick={() => setEditGoal(goal)} className="rounded-xl py-2.5 font-semibold text-gray-600">
                                                <Pencil className="h-4 w-4 mr-2" />
                                                {t('common.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteGoal(goal)}
                                                variant="danger"
                                                className="rounded-xl py-2.5 font-semibold"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {t('common.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="space-y-1 mb-8">
                                <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight truncate">{goal.title}</h3>
                                {goal.deadline && (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        HEDEF TARİH: {format(new Date(goal.deadline), 'dd MMM yyyy')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
                                            ${(goal.currentAmount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            / ${(goal.targetAmount || 0).toLocaleString()} hedef
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "text-lg font-black tracking-tight",
                                        isCompleted ? "text-emerald-600" : "text-[#007AFF]"
                                    )}>
                                        %{percentage.toFixed(0)}
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                                        className={cn(
                                            "h-full rounded-full shadow-sm",
                                            isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-[#007AFF] to-[#5856D6]"
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                    isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#007AFF]"
                                )}>
                                    {isCompleted ? (
                                        <>
                                            <CheckCircle className="h-3 w-3" />
                                            {t('goals.completed') || 'TAMAMLANDI'}
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-3 w-3" />
                                            {percentage.toFixed(0)}% İLERLEME
                                        </>
                                    )}
                                </div>
                                {!isCompleted && (
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        ${((goal.targetAmount || 0) - (goal.currentAmount || 0)).toLocaleString()} KALDI
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {goals?.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-16 border border-gray-100 text-center shadow-sm"
                >
                    <div className="h-20 w-20 rounded-[2rem] bg-[#FBFBFD] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Target className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 font-display tracking-tight">Henüz hedef yok</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                        Hayallerine ulaşmak için ilk finansal hedefini belirle.
                    </p>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold rounded-full px-8 py-6 shadow-xl shadow-blue-500/10"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        {t('goals.addGoal')}
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
