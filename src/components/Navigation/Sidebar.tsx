import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    PieChart,
    Target,
    BarChart3,
    Settings,
    LogOut,
    Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/Button';
import { Progress } from '@/components/UI/Progress';
import { pb } from '@/api/client';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { LogoIcon } from '@/components/UI/Logo';

export function Sidebar() {
    const { t } = useTranslation();
    const { isPremium } = useSubscriptionStore();

    const sidebarItems = [
        { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: '/app' },
        { icon: Wallet, labelKey: 'nav.accounts', href: '/app/accounts' },
        { icon: ArrowRightLeft, labelKey: 'nav.transactions', href: '/app/transactions' },
        { icon: PieChart, labelKey: 'nav.budgets', href: '/app/budgets' },
        { icon: Target, labelKey: 'nav.goals', href: '/app/goals' },
        { icon: BarChart3, labelKey: 'nav.analytics', href: '/app/analytics' },
        { icon: Settings, labelKey: 'nav.settings', href: '/app/settings' },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
            <div className="mb-8 flex items-center gap-2 px-2">
                <LogoIcon size="md" />
                <span className="text-xl font-bold">Monex</span>
                {isPremium && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <Crown className="h-3 w-3" /> PRO
                    </span>
                )}
            </div>

            <div className="mb-6 px-2">
                <div className="rounded-lg bg-accent/50 p-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{pb.authStore.model?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">Level 5</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>XP</span>
                            <span>350/500</span>
                        </div>
                        <Progress value={70} className="h-1.5" />
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/app'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                isActive
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground'
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {t(item.labelKey)}
                    </NavLink>
                ))}
            </nav>

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
    );
}
