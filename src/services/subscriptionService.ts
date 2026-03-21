import { pb } from '@/api/client';
import { MonexUsersResponse } from '@/types/pocketbase-types';
import i18n from '@/i18n';

export interface SubscriptionDetails {
    status: 'free' | 'pro' | 'pro_plus' | 'expired';
    type: 'monthly' | 'yearly' | null;
    expiresAt: Date | null;
    daysRemaining: number | null;
    isPremium: boolean;
}

export class SubscriptionService {
    /**
     * Check and return subscription details for current user
     */
    static async checkSubscription(): Promise<SubscriptionDetails> {
        const user = pb.authStore.model;
        if (!user) {
            return {
                status: 'free',
                type: null,
                expiresAt: null,
                daysRemaining: null,
                isPremium: false,
            };
        }

        try {
            // Refresh user data with auto-cancellation disabled
            const userData = await pb.collection('monex_users').getOne<MonexUsersResponse>(user.id, {
                requestKey: null, // Disable auto-cancellation
            });

            const status = userData.subscription_status || 'free';
            const expiresAt = userData.subscription_expires ? new Date(userData.subscription_expires) : null;
            const type = userData.subscription_type || null;

            // Calculate days remaining
            let daysRemaining: number | null = null;
            if (expiresAt) {
                const now = new Date();
                const diff = expiresAt.getTime() - now.getTime();
                daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
            }

            // Client-side expiry check for UI state
            const isExpired = status === 'pro' && expiresAt && expiresAt < new Date();

            return {
                status: isExpired ? 'expired' : status as any,
                type,
                expiresAt,
                daysRemaining: isExpired ? 0 : daysRemaining,
                isPremium: status === 'pro' && !isExpired,
            };
        } catch (error) {
            console.error('Error checking subscription:', error);
            return {
                status: 'free',
                type: null,
                expiresAt: null,
                daysRemaining: null,
                isPremium: false,
            };
        }
    }

    /**
     * Activate subscription for a user
     */
    static async activateSubscription(
        userId: string,
        plan: 'monthly' | 'yearly'
    ): Promise<void> {
        const expiresAt = new Date();
        if (plan === 'monthly') {
            expiresAt.setDate(expiresAt.getDate() + 30);
        } else {
            expiresAt.setDate(expiresAt.getDate() + 365);
        }

        await pb.collection('monex_users').update(userId, {
            subscription_status: 'pro',
            subscription_expires: expiresAt.toISOString(),
            subscription_type: plan,
        });
    }

    /**
     * Get subscription status text
     */
    static getStatusText(details: SubscriptionDetails): string {
        if (details.status === 'pro') {
            return i18n.t('subscription.statusText.pro', { days: details.daysRemaining });
        } else if (details.status === 'pro_plus') {
            return i18n.t('subscription.statusText.proPlus', { days: details.daysRemaining });
        } else if (details.status === 'expired') {
            return i18n.t('subscription.statusText.expired');
        }
        return i18n.t('subscription.statusText.free');
    }

    /**
     * Get subscription badge color
     */
    static getStatusColor(status: 'free' | 'pro' | 'pro_plus' | 'expired'): string {
        switch (status) {
            case 'pro':
                return 'bg-gradient-to-r from-amber-500 to-orange-500';
            case 'pro_plus':
                return 'bg-gradient-to-r from-purple-600 to-indigo-600';
            case 'expired':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    }
}
