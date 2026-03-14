import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/UI/Button';
import {
    X,
    Crown,
    Sparkles,
    Check,
    Zap,
    Brain,
    TrendingUp,
    Shield,
    BarChart3,
    Star,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LemonSqueezyService } from '@/services/lemonSqueezy.service';
import { useUserStore } from '@/store/userStore';
import { SUBSCRIPTION_PRICES } from '@/store/subscriptionStore';
import { PaymentModal } from '@/components/Modals/PaymentModal';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { t } = useTranslation();
    const { user } = useUserStore();
    const [isYearly, setIsYearly] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showManualPayment, setShowManualPayment] = useState(false);

    const monthlyPrice = SUBSCRIPTION_PRICES.pro.monthly;
    const yearlyPrice = SUBSCRIPTION_PRICES.pro.yearly;
    const yearlyMonthly = (yearlyPrice / 12).toFixed(0);
    const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

    const features = [
        { icon: Zap, key: 'unlimitedAI' },
        { icon: TrendingUp, key: 'predictions' },
        { icon: Brain, key: 'budget' },
        { icon: Star, key: 'health' },
        { icon: Sparkles, key: 'categorization' },
        { icon: BarChart3, key: 'analytics' },
    ];

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const checkoutUrl = await LemonSqueezyService.createCheckout(
                isYearly ? 'pro_yearly' : 'pro_monthly',
                user.id,
                user.email
            );
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className={cn(
                                "relative w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl",
                                "bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900",
                                "border border-white/10 shadow-2xl"
                            )}
                        >
                            {/* Glow Effects */}
                            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
                            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Content */}
                            <div className="relative p-6 sm:p-8">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-4 shadow-lg shadow-amber-500/30">
                                        <Crown className="h-6 w-6 text-yellow-900" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('upgrade.title')}</h2>
                                    <p className="text-sm text-white/60">{t('upgrade.subtitle')}</p>
                                </div>

                                {/* Billing Toggle */}
                                <div className="flex items-center justify-center gap-3 mb-6 bg-white/5 rounded-full p-1">
                                    <button
                                        onClick={() => setIsYearly(false)}
                                        className={cn(
                                            "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
                                            !isYearly
                                                ? "bg-white text-gray-900"
                                                : "text-white/60 hover:text-white"
                                        )}
                                    >
                                        {t('upgrade.monthly')}
                                    </button>
                                    <button
                                        onClick={() => setIsYearly(true)}
                                        className={cn(
                                            "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2",
                                            isYearly
                                                ? "bg-white text-gray-900"
                                                : "text-white/60 hover:text-white"
                                        )}
                                    >
                                        {t('upgrade.yearly')}
                                        {isYearly && (
                                            <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                                -{savings}%
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Price */}
                                <div className="text-center mb-6">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl sm:text-5xl font-bold text-white">
                                            {isYearly
                                                ? `₺${yearlyMonthly}`
                                                : `₺${monthlyPrice}`}
                                        </span>
                                        <span className="text-white/60">{t('upgrade.perMonth')}</span>
                                    </div>
                                    {isYearly && (
                                        <p className="text-xs text-white/50 mt-1">
                                            {t('upgrade.billedAnnually')} (₺{yearlyPrice.toLocaleString('tr-TR')})
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-6">
                                    {features.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                                                <Check className="h-3.5 w-3.5 text-green-400" />
                                            </div>
                                            <span className="text-sm text-white/80">
                                                {t(`upgrade.features.${feature.key}`)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-900 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/30"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <Crown className="h-5 w-5 mr-2" />
                                    )}
                                    {t('upgrade.upgradeNow')}
                                </Button>

                                <button
                                    onClick={() => setShowManualPayment(true)}
                                    className="w-full mt-3 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                                >
                                    Havale/EFT ile ödemek için tıklayın
                                </button>

                                {/* Payment Method Info */}
                                <div className="mt-4 text-center space-y-1">
                                    <p className="text-[11px] text-white/50">
                                        💳 Lemon Squeezy ile güvenli ödeme
                                    </p>
                                    <p className="text-[10px] text-white/40 flex items-center justify-center gap-1">
                                        <Shield className="h-3 w-3" /> {t('upgrade.guarantee')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PaymentModal
                isOpen={showManualPayment}
                onClose={() => setShowManualPayment(false)}
            />
        </>
    );
}
