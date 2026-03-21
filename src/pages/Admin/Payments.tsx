import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Button } from '@/components/UI/Button';
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Loader2,
    ChevronLeft,
    Calendar,
    User,
    CreditCard,
    AlertTriangle,
    Filter,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface PaymentRequest {
    id: string;
    user: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected';
    plan: 'monthly' | 'yearly';
    reference_code: string;
    receipt_url?: string;
    admin_note?: string;
    created: string;
    updated: string;
}

interface PaymentWithUser extends PaymentRequest {
    expand?: {
        user?: {
            id: string;
            email: string;
            name?: string;
        };
    };
}

export default function AdminPayments() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<FilterStatus>('all');
    const user = pb.authStore.model;
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@monex.com';

    const dateLocale = i18n.language === 'tr' ? tr : enUS;

    const { data: payments, isLoading } = useQuery({
        queryKey: ['admin-payments', filter],
        queryFn: async () => {
            let filterQuery = '';
            if (filter !== 'all') {
                filterQuery = `status = '${filter}'`;
            }

            const result = await pb.collection('monex_payments').getFullList({
                filter: filterQuery,
                sort: '-created',
                expand: 'user',
            });

            return result as unknown as PaymentWithUser[];
        },
        enabled: isAdmin,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        <Clock className="h-3 w-3" /> {t('admin.pending')}
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle className="h-3 w-3" /> {t('admin.approved')}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                        <XCircle className="h-3 w-3" /> {t('admin.rejected')}
                    </span>
                );
            default:
                return null;
        }
    };

    const getReceiptUrl = (payment: PaymentWithUser) => {
        if (!payment.receipt_url) return null;
        return pb.files.getURL(payment as any, payment.receipt_url);
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl max-w-md mx-4"
                >
                    <div className="h-20 w-20 rounded-[2rem] bg-rose-50 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-10 w-10 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1D1D1F] tracking-tight mb-2">{t('admin.unauthorized')}</h1>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">{t('admin.unauthorizedDesc')}</p>
                    <Button 
                        onClick={() => navigate('/app')}
                        className="bg-[#1D1D1F] hover:bg-black text-white font-bold rounded-full h-12 px-8 shadow-lg shadow-black/10 w-full"
                    >
                        {t('admin.backToApp')}
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFD]">
            {/* Header - Apple Navigation Style */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => navigate('/app')}
                            className="rounded-full hover:bg-gray-50 h-10 w-10"
                        >
                            <ChevronLeft className="h-5 w-5 text-[#1D1D1F]" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#007AFF]">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-[#1D1D1F] tracking-tight leading-none">{t('admin.payments')}</h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{t('admin.panel')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10 max-w-6xl">
                {/* Filters & Quick Stats */}
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-between mb-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100 overflow-x-auto w-full lg:w-auto"
                    >
                        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    filter === status
                                        ? "bg-white text-[#007AFF] shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-[#1D1D1F]"
                                )}
                            >
                                {t(`admin.${status}`)}
                            </button>
                        ))}
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto"
                    >
                        {[
                            { label: t('admin.pending'), value: payments?.filter(p => p.status === 'pending').length || 0, color: 'amber' },
                            { label: t('admin.approved'), value: payments?.filter(p => p.status === 'approved').length || 0, color: 'emerald' },
                            { label: t('admin.rejected'), value: payments?.filter(p => p.status === 'rejected').length || 0, color: 'rose' },
                            { label: t('admin.total'), value: payments?.length || 0, color: 'blue' },
                        ].map((stat, i) => (
                            <div key={i} className={cn(
                                "p-4 rounded-2xl border bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-[120px]",
                                stat.color === 'amber' && "border-amber-100",
                                stat.color === 'emerald' && "border-emerald-100",
                                stat.color === 'rose' && "border-rose-100",
                                stat.color === 'blue' && "border-blue-100",
                            )}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={cn(
                                    "text-2xl font-black tracking-tight",
                                    stat.color === 'amber' && "text-amber-600",
                                    stat.color === 'emerald' && "text-emerald-600",
                                    stat.color === 'rose' && "text-rose-600",
                                    stat.color === 'blue' && "text-[#007AFF]",
                                )}>{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Payments List */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="h-10 w-10 animate-spin text-[#007AFF] mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('common.loading')}</p>
                        </div>
                    ) : payments?.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
                                <CreditCard className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight">{t('admin.noPayments')}</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">{t('common.noData')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {payments?.map((payment, index) => (
                                    <motion.div
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="p-8 hover:bg-[#FBFBFD] transition-all group"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
                                            <div className="flex-1 min-w-0 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {getStatusBadge(payment.status)}
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-mono text-[10px] font-bold">
                                                        {payment.reference_code}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-white shadow-sm">
                                                            <User className="h-5 w-5 text-[#007AFF]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-[#1D1D1F] leading-none">
                                                                {payment.expand?.user?.name || payment.expand?.user?.email?.split('@')[0] || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs font-medium text-gray-400 mt-1">{payment.expand?.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-[52px]">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(payment.created), 'dd MMM yyyy HH:mm', { locale: dateLocale })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-2">
                                                <p className="text-3xl font-black text-[#1D1D1F] tracking-tighter">
                                                    {payment.currency === 'TRY' ? '₺' : (payment.currency === 'EUR' ? '€' : '$')}
                                                    {payment.amount.toLocaleString()}
                                                </p>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    payment.plan === 'yearly' ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {payment.plan === 'yearly' ? t('admin.yearly') : t('admin.monthly')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Area */}
                                        <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-50/50">
                                            {payment.receipt_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(getReceiptUrl(payment) || '', '_blank')}
                                                    className="rounded-full px-6 font-bold border-gray-200 hover:bg-gray-50 h-10 text-[#1D1D1F]"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" /> {t('admin.receipt')}
                                                </Button>
                                            )}

                                            {payment.status === 'pending' && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50/50 border border-amber-100">
                                                    <Info className="h-4 w-4 text-amber-500" />
                                                    <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">
                                                        {t('admin.manualNote')}
                                                    </p>
                                                </div>
                                            )}

                                            {payment.admin_note && (
                                                <div className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <CreditCard className="h-3 w-3" />
                                                    {t('common.note') || 'NOT'}: {payment.admin_note}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
