import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { logout, pb } from '@/api/client';
import { useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Crown, Sparkles, Zap, Check, CreditCard, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionStore, SUBSCRIPTION_PRICES } from '@/store/subscriptionStore';
import { UpgradeModal } from '@/components/UI/UpgradeModal';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const user = pb.authStore.model;
    const navigate = useNavigate();
    const { isPremium, aiQueriesRemaining, maxFreeQueries, setPremium, subscriptionDetails } = useSubscriptionStore();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const dateLocale = i18n.language === 'tr' ? tr : enUS;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCancelSubscription = () => {
        // In a real app, this would call the payment API
        setPremium(false);
        setShowCancelDialog(false);
        toast.success(t('common.success') || 'İşlem başarılı');
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: currency === '₺' ? 'TRY' : (currency === '€' ? 'EUR' : 'USD'),
            currencyDisplay: 'narrowSymbol'
        }).format(amount).replace('TRY', '₺').replace('EUR', '€').replace('USD', '$');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            
            <ConfirmDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancelSubscription}
                title={t('settings.cancelSubscription')}
                description={t('settings.cancelConfirm')}
                variant="destructive"
            />

            {/* Header - Apple Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                        {t('settings.title')}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {t('settings.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    {isPremium && (
                        <div className="flex items-center gap-2 rounded-full bg-[#007AFF] px-4 py-2 text-white shadow-lg shadow-blue-500/10">
                            <Crown className="h-4 w-4" />
                            <span className="text-sm font-semibold">{t('dashboard.proMember')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                {/* Subscription Panel - Apple Style */}
                <div className={cn(
                    "bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden",
                    isPremium && "ring-2 ring-blue-500/10"
                )}>
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-[1.25rem] shadow-inner",
                                isPremium ? "bg-blue-50 text-[#007AFF]" : "bg-gray-50 text-gray-400"
                            )}>
                                {isPremium ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">{t('settings.subscription')}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {isPremium ? t('settings.fullAccess') : t('settings.upgradeMore')}
                                </p>
                            </div>
                        </div>

                        {isPremium ? (
                            <div className="space-y-6">
                                {/* Premium Status - Apple Card */}
                                <div className="rounded-[2rem] bg-[#FBFBFD] border border-gray-100 p-8 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                <Zap className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('settings.proPlan')}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t('settings.unlimited')}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                                                {formatCurrency(SUBSCRIPTION_PRICES.pro.yearly / 12, 'USD')}
                                                <span className="text-sm text-gray-400 font-medium">{t('upgrade.perMonth')}</span>
                                            </p>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">{t('upgrade.billedAnnually')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Benefits Grid */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: Zap, text: t('settings.unlimitedAI'), color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { icon: Sparkles, text: t('settings.smartPredictions'), color: 'text-purple-500', bg: 'bg-purple-50' },
                                        { icon: Shield, text: t('settings.prioritySupport'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { icon: CreditCard, text: t('settings.advancedReports'), color: 'text-amber-500', bg: 'bg-amber-50' },
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-3xl bg-[#FBFBFD] border border-gray-100 transition-colors hover:border-blue-100">
                                            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-inner", benefit.bg)}>
                                                <Check className={cn("h-4 w-4", benefit.color)} />
                                            </div>
                                            <span className="text-sm font-bold text-[#1D1D1F] tracking-tight">{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 rounded-full h-12 border-gray-200 font-semibold" disabled>
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        {t('settings.renews')} {subscriptionDetails?.expiresAt ? format(subscriptionDetails.expiresAt, 'PPP', { locale: dateLocale }) : '---'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="rounded-full h-12 text-gray-400 hover:text-rose-500 font-semibold"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        {t('settings.cancelSubscription')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Free Plan Status */}
                                <div className="rounded-[2rem] border-2 border-dashed border-gray-100 p-8 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('settings.freePlan')}</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t('settings.basicFeatures')}</p>
                                        </div>
                                        <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{formatCurrency(0)}<span className="text-sm text-gray-400 font-medium">{t('upgrade.perMonth')}</span></p>
                                    </div>
                                </div>

                                {/* AI Usage */}
                                <div className="rounded-[2rem] bg-[#FBFBFD] border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{t('settings.aiQueries')}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{aiQueriesRemaining} {t('settings.queriesRemainingSimple')}</p>
                                        </div>
                                        <span className="text-lg font-black text-blue-500">%{(((maxFreeQueries - aiQueriesRemaining) / maxFreeQueries) * 100).toFixed(0)}</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((maxFreeQueries - aiQueriesRemaining) / maxFreeQueries) * 100}%` }}
                                            className="h-full bg-[#007AFF] rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Upgrade High-Contrast Panel */}
                                <div className="group relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-20 transition group-hover:opacity-30" />
                                    <div className="relative rounded-[2.5rem] bg-white border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-[#007AFF] shadow-inner shrink-0">
                                            <Crown className="h-8 w-8" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight mb-1">{t('premium.upgradeToPro')}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{t('settings.upgradeMore')}</p>
                                        </div>
                                        <Button
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="bg-[#007AFF] hover:bg-[#0071E3] text-white font-bold rounded-full h-12 px-8 shadow-xl shadow-blue-500/20 w-full sm:w-auto"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {t('upgrade.upgradeNow')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile & Security - Apple Panels */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#007AFF]">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('settings.profile')}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settings.profileDesc')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('settings.name')}</label>
                                <Input defaultValue={user?.name || ''} readOnly className="h-12 rounded-2xl bg-[#FBFBFD] border-gray-100 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('settings.email')}</label>
                                <Input defaultValue={user?.email || ''} readOnly className="h-12 rounded-2xl bg-[#FBFBFD] border-gray-100 focus:ring-blue-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">{t('settings.security')}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settings.securityDesc')}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                                    <Check className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-emerald-700 tracking-tight">{t('settings.encryptionEnabled')}</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-4">{t('settings.changePasswordDesc')}</p>
                                <Button variant="outline" className="w-full rounded-full h-12 border-gray-200 font-semibold" disabled>{t('settings.changePassword')}</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Panel - Only visible to admins */}
                {(user?.role === 'admin' || user?.email === 'admin@monex.com') && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-l-4 border-l-blue-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-blue-50 text-[#007AFF] shadow-inner">
                                    <Crown className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">{t('settings.adminPanel')}</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {t('settings.adminPanelDesc')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => navigate('/admin/payments')}
                                className="bg-[#1D1D1F] hover:bg-black text-white font-bold rounded-full h-12 px-8 shadow-xl shadow-black/10 w-full sm:w-auto"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t('settings.managePayments')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Danger Zone - Apple Style Refined */}
                <div className="bg-rose-50/30 rounded-[2.5rem] border border-rose-100 p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-rose-600 tracking-tight">{t('settings.dangerZone')}</h3>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">{t('settings.signOutDesc')}</p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="bg-white hover:bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-full h-12 px-8 shadow-sm w-full sm:w-auto"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            {t('settings.signOut')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
