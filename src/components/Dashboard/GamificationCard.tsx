import { motion } from 'framer-motion';
import { Flame, Star } from 'lucide-react';
import { GamificationService } from '@/services/gamification.service';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface GamificationCardProps {
    xp: number;
    level: number;
    league: string;
    streak: number;
    className?: string;
}

export function GamificationCard({ xp, level, streak, className }: Omit<GamificationCardProps, 'league'>) {
    const { t } = useTranslation();
    const currentLevel = GamificationService.getLevel(xp);
    const nextLevel = GamificationService.getNextLevel(xp);
    const currentLeague = GamificationService.getLeague(xp);

    // Calculate progress within the current level's range
    const range = nextLevel ? (nextLevel.minXp - currentLevel.minXp) : 1000;
    const progressInLevel = xp - currentLevel.minXp;
    const progressPerc = nextLevel ? (progressInLevel / range) * 100 : 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] p-8 border shadow-sm",
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-violet-100 dark:border-white/10",
                className
            )}
        >
            {/* Soft Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative space-y-5">
                {/* Header: League & Level */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-2xl shadow-inner">
                            {currentLeague.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                                {t(`users.league.${currentLeague.name}`, { defaultValue: currentLeague.name })} {t('gamification.league')}
                            </p>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{currentLevel.title}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-white/40 tracking-wider">{t('gamification.level')}</p>
                        <p className="text-3xl font-black bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">{level}</p>
                    </div>
                </div>

                {/* XP Progress Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('gamification.progress')}</span>
                            <p className="text-sm font-black text-slate-700 dark:text-white">{xp} <span className="text-[10px] text-slate-400 font-medium">XP</span></p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <span className="text-xs font-bold text-slate-400">{t('gamification.target')}</span>
                            <p className="text-sm font-black text-slate-500">{nextLevel?.minXp || 'MAX'}</p>
                        </div>
                    </div>

                    <div className="relative h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPerc}%` }}
                            transition={{ duration: 1.2, ease: "circOut" }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 rounded-full"
                        >
                            {/* Subtle gloss effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                        </motion.div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
                        <Flame className={cn("h-5 w-5", streak > 0 ? "text-orange-500" : "text-slate-300 dark:text-white/20")} />
                        <div>
                            <p className="text-[10px] text-orange-600/60 dark:text-orange-400/60 font-bold uppercase leading-none mb-1">{t('gamification.streak')}</p>
                            <p className="text-sm font-black text-slate-700 dark:text-white leading-none">{streak} {t('gamification.days')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                        <Star className="h-5 w-5 text-amber-500" />
                        <div>
                            <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 font-bold uppercase leading-none mb-1">{t('gamification.success')}</p>
                            <p className="text-sm font-black text-slate-700 dark:text-white leading-none">%85</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
