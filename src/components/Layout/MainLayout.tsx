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
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/UI/Logo';

export default function MainLayout() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isPremium, refreshSubscription } = useSubscriptionStore();
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

    // Mobile bottom nav items (subset)
    const mobileNavItems = [
        { icon: Home, labelKey: 'nav.home', href: '/app' },
        { icon: ArrowRightLeft, labelKey: 'nav.transactions', href: '/app/transactions' },
        { icon: PieChart, labelKey: 'nav.budgets', href: '/app/budgets' },
        { icon: Target, labelKey: 'nav.goals', href: '/app/goals' },
        { icon: Settings, labelKey: 'nav.more', href: '/app/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-[#FBFBFD] text-foreground">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-1 border-r border-gray-100 bg-white/80 backdrop-blur-xl px-4 py-6">
                    {/* Logo - Refined Apple Look */}
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

                    {/* User Profile - Sophisticated Card */}
                    <div className="mb-8 px-1">
                        <div className="rounded-[1.5rem] bg-[#FBFBFD] border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-[2px]">
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        <div className="h-full w-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {pb.authStore.model?.name?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-bold text-[#1D1D1F]">{pb.authStore.model?.name || 'User'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level 5 Pro</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>XP</span>
                                    <span>350/500</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '70%' }}
                                        className="h-full bg-[#007AFF] rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - Clean Vertical List */}
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

                    {/* Logout Button */}
                    <div className="mt-auto border-t pt-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
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

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/70 backdrop-blur-xl px-4 py-3 safe-area-top">
                <div className="flex items-center gap-2">
                    <LogoIcon size="md" />
                    <span className="text-xl font-bold">Monex</span>
                    {isPremium && (
                        <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            <Crown className="h-2.5 w-2.5" /> PRO
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/50 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.2 }}
                            className="fixed top-0 left-0 bottom-0 z-40 w-72 bg-white pt-16 md:hidden overflow-y-auto"
                        >
                            <div className="px-3 py-4">
                                {/* User Profile */}
                                <div className="mb-6 px-2">
                                    <div className="rounded-lg bg-accent/50 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="truncate text-sm font-medium">{pb.authStore.model?.name || 'User'}</p>
                                                <p className="text-xs text-muted-foreground">Level 5</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-1">
                                    {sidebarItems.map((item) => (
                                        <NavLink
                                            key={item.href}
                                            to={item.href}
                                            end={item.href === '/app'}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                                    isActive
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'text-muted-foreground'
                                                )
                                            }
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {t(item.labelKey)}
                                        </NavLink>
                                    ))}
                                </nav>

                                {/* Logout */}
                                <div className="mt-8 pt-4 border-t">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive py-3"
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
                <div className="p-4 pt-20 pb-24 md:p-6 lg:p-8 md:pt-8 md:pb-8 w-full">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/70 backdrop-blur-xl safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    {mobileNavItems.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href === '/app' && location.pathname === '/app');
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className="flex flex-col items-center gap-1 py-1 px-3 min-w-[60px]"
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isActive ? "bg-primary/10" : ""
                                )}>
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
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
