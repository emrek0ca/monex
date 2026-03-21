import { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/UI/Button';
import {
    Menu,
    X,
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    PieChart,
    Target,
    BarChart3,
    Settings,
    LogOut,
    Crown,
    Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pb } from '@/api/client';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/UI/Logo';
import { CommandCenter } from '@/components/UI/CommandCenter';
import { GamificationService } from '@/services/gamification.service';

export default function MainLayout() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isPremium, refreshSubscription } = useSubscriptionStore();
    const { user } = useUserStore();
    const location = useLocation();

    // Refresh subscription status on mount
    useEffect(() => {
        refreshSubscription();
    }, [refreshSubscription]);

    const sidebarItems = [
        { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: '/app' },
        { icon: Wallet, labelKey: 'nav.accounts', href: '/app/accounts' },
        { icon: ArrowRightLeft, labelKey: 'nav.transactions', href: '/app/transactions' },
        { icon: PieChart, labelKey: 'nav.budgets', href: '/app/budgets' },
        { icon: Target, labelKey: 'nav.goals', href: '/app/goals' },
        { icon: BarChart3, labelKey: 'nav.analytics', href: '/app/analytics' },
        { icon: Settings, labelKey: 'nav.settings', href: '/app/settings' },
    ];

    const mobileNavItems = [
        { icon: Home, labelKey: 'nav.home', href: '/app' },
        { icon: ArrowRightLeft, labelKey: 'nav.transactions', href: '/app/transactions' },
        { icon: PieChart, labelKey: 'nav.budgets', href: '/app/budgets' },
        { icon: Target, labelKey: 'nav.goals', href: '/app/goals' },
        { icon: Settings, labelKey: 'nav.more', href: '/app/settings' },
    ];

    // Gamification Logic
    const currentLevel = user ? GamificationService.getLevel(user.xp || 0) : null;
    const nextLevel = user ? GamificationService.getNextLevel(user.xp || 0) : null;
    const xpProgress = user && nextLevel ? ((user.xp || 0) / nextLevel.minXp) * 100 : 100;

    return (
        <div className="flex min-h-screen bg-[#FBFBFD] text-foreground">
            {/* Global Utilities */}
            <CommandCenter />

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-1 border-r border-gray-100 bg-white/80 backdrop-blur-xl px-4 py-6">
                    {/* Logo */}
                    <div className="mb-10 flex items-center gap-2.5 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="h-9 w-9 bg-[#1D1D1F] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform text-white">
                            <LogoIcon size="sm" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">Monex</span>
                        {isPremium && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                PRO
                            </span>
                        )}
                    </div>

                    {/* User Profile - Dynamic */}
                    <div className="mb-8 px-1">
                        <div className="rounded-[1.5rem] bg-[#FBFBFD] border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-[2px]">
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        <div className="h-full w-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-bold text-[#1D1D1F]">{user?.name || 'User'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {currentLevel ? t(currentLevel.titleKey) : '...'} {isPremium ? 'Pro' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>XP</span>
                                    <span>{user?.xp || 0} / {nextLevel?.minXp || 'MAX'}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {sidebarItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === '/app'}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all group',
                                        isActive
                                            ? 'bg-blue-50 text-[#007AFF]'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1D1D1F]'
                                    )
                                }
                            >
                                <item.icon className={cn(
                                    "h-4 w-4 transition-colors",
                                    "group-hover:text-inherit"
                                )} />
                                {t(item.labelKey)}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="mt-auto border-t pt-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold px-4"
                            onClick={() => {
                                pb.authStore.clear();
                                window.location.href = '/';
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            {t('nav.logout')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 py-3 safe-area-top">
                <div className="flex items-center gap-2">
                    <LogoIcon size="md" />
                    <span className="text-xl font-bold tracking-tight">Monex</span>
                    {isPremium && (
                        <span className="flex items-center gap-0.5 rounded-full bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 uppercase">
                            PRO
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-gray-400">
                        <Search className="h-5 w-5" onClick={() => {}} /> {/* CMD+K would trigger here too */}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full h-10 w-10">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 z-40 w-[280px] bg-white pt-20 md:hidden overflow-y-auto shadow-2xl"
                        >
                            <div className="px-4 py-4 space-y-8">
                                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate font-bold text-[#1D1D1F]">{user?.name || 'User'}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentLevel ? t(currentLevel.titleKey) : '...'}</p>
                                        </div>
                                    </div>
                                </div>

                                <nav className="space-y-1">
                                    {sidebarItems.map((item) => (
                                        <NavLink
                                            key={item.href}
                                            to={item.href}
                                            end={item.href === '/app'}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all',
                                                    isActive
                                                        ? 'bg-blue-50 text-[#007AFF]'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                )
                                            }
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {t(item.labelKey)}
                                        </NavLink>
                                    ))}
                                </nav>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 text-gray-400 hover:text-rose-500 py-4 font-bold"
                                        onClick={() => {
                                            pb.authStore.clear();
                                            window.location.href = '/';
                                        }}
                                    >
                                        <LogOut className="h-5 w-5" />
                                        {t('nav.logout')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 overflow-y-auto">
                <div className="p-4 pt-24 pb-24 md:p-8 lg:p-12 md:pt-10 md:pb-10 w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/80 backdrop-blur-2xl safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-2">
                    {mobileNavItems.map((item) => {
                        const isActive = location.pathname === item.href || (item.href === '/app' && location.pathname === '/app');
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className="flex flex-col items-center gap-1.5 py-1 px-2 min-w-[64px]"
                            >
                                <div className={cn(
                                    "p-2 rounded-xl transition-all duration-300",
                                    isActive ? "bg-blue-50 text-[#007AFF] shadow-inner" : "text-gray-400"
                                )}>
                                    <item.icon className={cn("h-5 w-5")} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    isActive ? "text-[#007AFF]" : "text-gray-400"
                                )}>
                                    {t(item.labelKey)}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
