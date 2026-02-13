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
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [filter, setFilter] = useState<FilterStatus>('pending');
    // Check if current user is admin
    const user = pb.authStore.model;
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@monex.com';

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

    // Manual approval mutations REMOVED (Moving to Lemon Squeezy)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Clock className="h-3 w-3" /> Beklemede
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" /> Onaylandı
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        <XCircle className="h-3 w-3" /> Reddedildi
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Yetkisiz Erişim</h1>
                    <p className="text-muted-foreground mb-4">Bu sayfayı görüntüleme yetkiniz yok.</p>
                    <Button onClick={() => navigate('/app')}>Ana Sayfaya Dön</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Geri
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">Ödeme Yönetimi</h1>
                            <p className="text-xs text-muted-foreground">Admin Paneli</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                filter === status
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                            )}
                        >
                            {status === 'all' && 'Tümü'}
                            {status === 'pending' && 'Beklemede'}
                            {status === 'approved' && 'Onaylanan'}
                            {status === 'rejected' && 'Reddedilen'}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Beklemede', value: payments?.filter(p => p.status === 'pending').length || 0, color: 'amber' },
                        { label: 'Onaylanan', value: payments?.filter(p => p.status === 'approved').length || 0, color: 'green' },
                        { label: 'Reddedilen', value: payments?.filter(p => p.status === 'rejected').length || 0, color: 'red' },
                        { label: 'Toplam', value: payments?.length || 0, color: 'blue' },
                    ].map((stat, i) => (
                        <div key={i} className={cn(
                            "p-4 rounded-xl",
                            stat.color === 'amber' && "bg-amber-50 dark:bg-amber-900/20",
                            stat.color === 'green' && "bg-green-50 dark:bg-green-900/20",
                            stat.color === 'red' && "bg-red-50 dark:bg-red-900/20",
                            stat.color === 'blue' && "bg-blue-50 dark:bg-blue-900/20",
                        )}>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Payments List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : payments?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Ödeme bulunamadı</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {payments?.map((payment, index) => (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card rounded-xl border p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(payment.status)}
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {payment.reference_code}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {payment.expand?.user?.email || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(payment.created), 'dd MMM yyyy HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold">₺{payment.amount}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {payment.plan === 'yearly' ? 'Yıllık' : 'Aylık'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                        {payment.receipt_url && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(getReceiptUrl(payment) || '', '_blank')}
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> Dekont
                                            </Button>
                                        )}

                                        {payment.status === 'pending' && (
                                            <p className="text-xs text-amber-600 font-medium">
                                                Bu manuel ödeme Lemon Squeezy geçişi öncesindedir. Manuel onay deskteği kaldırıldı.
                                            </p>
                                        )}

                                        {payment.admin_note && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                Not: {payment.admin_note}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

        </div>
    );
}
