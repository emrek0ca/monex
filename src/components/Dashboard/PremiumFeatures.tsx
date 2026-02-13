import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import {
    Sparkles,
    TrendingUp,
    Brain,
    Lock,
    Crown,
    AlertTriangle,
    CheckCircle,
    Lightbulb,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { UpgradeModal } from '../UI/UpgradeModal';

interface PremiumCardProps {
    children: React.ReactNode;
    title: string;
    icon: React.ReactNode;
    onUpgrade: () => void;
    badge?: React.ReactNode;
}

function PremiumCard({ children, title, icon, onUpgrade, badge }: PremiumCardProps) {
    const { t } = useTranslation();
    const { isPremium } = useSubscriptionStore();

    if (!isPremium) {
        return (
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                {icon}
                            </div>
                            <CardTitle className="text-sm">{title}</CardTitle>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                            <Crown className="h-2.5 w-2.5" /> {t('premium.pro')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="relative">
                    {/* Blurred Preview */}
                    <div className="filter blur-sm opacity-50 pointer-events-none">
                        {children}
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/80 to-background/40">
                        <Lock className="h-6 w-6 text-violet-500 mb-2" />
                        <Button
                            size="sm"
                            onClick={onUpgrade}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs"
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t('premium.unlock')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white">
                            {icon}
                        </div>
                        <CardTitle className="text-sm">{title}</CardTitle>
                    </div>
                    {badge}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function AIInsightsCard() {
    const { t } = useTranslation();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const insights = [
        { type: 'warning', icon: AlertTriangle, text: 'Your food spending is 23% higher than last month.', color: 'text-amber-500' },
        { type: 'success', icon: CheckCircle, text: 'Great job! You saved $340 more this month.', color: 'text-green-500' },
        { type: 'tip', icon: Lightbulb, text: 'Consider reducing subscriptions to save $45/month.', color: 'text-blue-500' },
    ];

    return (
        <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <PremiumCard
                title={t('premium.aiInsights')}
                icon={<Brain className="h-4 w-4" />}
                onUpgrade={() => setShowUpgradeModal(true)}
            >
                <div className="space-y-3">
                    {insights.map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2"
                        >
                            <insight.icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.color}`} />
                            <p className="text-xs text-muted-foreground">{insight.text}</p>
                        </motion.div>
                    ))}
                </div>
            </PremiumCard>
        </>
    );
}

export function FinancialHealthScore() {
    const { t } = useTranslation();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const score = 78;

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 60) return 'text-yellow-500';
        if (s >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return t('premium.excellent');
        if (s >= 60) return t('premium.good');
        if (s >= 40) return t('premium.fair');
        return t('premium.needsWork');
    };

    return (
        <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <PremiumCard
                title={t('premium.financialHealth')}
                icon={<Sparkles className="h-4 w-4" />}
                onUpgrade={() => setShowUpgradeModal(true)}
            >
                <div className="flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative h-20 w-20">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                className="text-muted/30"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                className={getScoreColor(score)}
                                strokeDasharray={`${score * 2.83} 283`}
                                initial={{ strokeDasharray: '0 283' }}
                                animate={{ strokeDasharray: `${score * 2.83} 283` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.span
                                className={`text-2xl font-bold ${getScoreColor(score)}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {score}
                            </motion.span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
                            {getScoreLabel(score)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('premium.outOf100')}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            {t('premium.basedOn')}
                        </p>
                    </div>
                </div>
            </PremiumCard>
        </>
    );
}

export function PredictionsCard() {
    const { t } = useTranslation();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const predictions = [
        { category: 'Food & Dining', predicted: 580, change: 12 },
        { category: 'Transportation', predicted: 220, change: -8 },
        { category: 'Entertainment', predicted: 150, change: 5 },
    ];

    const totalPredicted = predictions.reduce((acc, p) => acc + p.predicted, 0);

    return (
        <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <PremiumCard
                title={t('premium.predictions')}
                icon={<TrendingUp className="h-4 w-4" />}
                onUpgrade={() => setShowUpgradeModal(true)}
            >
                <div className="space-y-3">
                    <div className="text-center pb-2 mb-2 border-b">
                        <p className="text-xs text-muted-foreground">{t('premium.predictedSpend')}</p>
                        <p className="text-xl font-bold">${totalPredicted}</p>
                    </div>
                    {predictions.map((pred, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{pred.category}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">${pred.predicted}</span>
                                <span className={`flex items-center text-[10px] ${pred.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {pred.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(pred.change)}%
                                </span>
                            </div>
                        </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                        {t('premium.aiPredictions')}
                    </p>
                </div>
            </PremiumCard>
        </>
    );
}
