import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SubscriptionService, SubscriptionDetails } from '@/services/subscriptionService';

export type SubscriptionPlan = 'free' | 'pro' | 'pro_plus' | 'expired';

// Tier-specific AI limits
export const SUBSCRIPTION_PRICES = {
    pro: {
        monthly: 299,
        yearly: 2999,
    },
    pro_plus: {
        monthly: 599,
        yearly: 5999,
    },
    extra_ai: {
        amount: 149,
        queries: 100
    }
};

export const TIER_LIMITS = {
    free: { daily: 1, monthly: null, historyDays: 7 },
    pro: { daily: null, monthly: 30, historyDays: 365 * 10 }, // Virtual infinity
    pro_plus: { daily: null, monthly: Infinity, historyDays: 365 * 100 }
};

// Validation interval in milliseconds (5 minutes)
const VALIDATION_INTERVAL = 5 * 60 * 1000;

interface SubscriptionState {
    // Server-validated state (not persisted for security)
    isPremium: boolean;
    plan: SubscriptionPlan;
    subscriptionDetails: SubscriptionDetails | null;
    lastServerCheck: number | null;

    // Additional limits and tracking
    extraAIQueries: number;

    // Local state (can be persisted)
    trialEndsAt: string | null;
    aiQueriesRemaining: number;
    aiQueriesResetDate: string;
    maxFreeQueries: number;

    // Actions
    setPremium: (isPremium: boolean, plan?: SubscriptionPlan) => void;
    decrementQueries: () => boolean;
    resetDailyQueries: () => void;
    checkAndResetQueries: () => void;
    canUseAI: () => Promise<boolean>;
    refreshSubscription: () => Promise<void>;
    verifyPremiumStatus: () => Promise<boolean>;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            // Server-validated state - defaults to free/non-premium
            isPremium: false,
            plan: 'free',
            subscriptionDetails: null,
            lastServerCheck: null,
            extraAIQueries: 0,

            // Local state
            trialEndsAt: null,
            aiQueriesRemaining: TIER_LIMITS.free.daily!,
            aiQueriesResetDate: getTodayDateString(),
            maxFreeQueries: TIER_LIMITS.free.daily!,

            setPremium: (isPremium, plan = 'pro') => set({
                isPremium,
                plan: isPremium ? plan : 'free',
                lastServerCheck: Date.now()
            }),

            decrementQueries: () => {
                const state = get();
                const plan = state.plan;

                // Pro+ has unlimited queries
                if (plan === 'pro_plus') return true;

                // Check if we need to reset queries for a new day/month
                state.checkAndResetQueries();

                // 1. Use regular plan queries
                if (state.aiQueriesRemaining > 0) {
                    set({ aiQueriesRemaining: state.aiQueriesRemaining - 1 });
                    return true;
                }

                // 2. Use extra purchased AI queries
                if (state.extraAIQueries > 0) {
                    set({ extraAIQueries: state.extraAIQueries - 1 });
                    return true;
                }

                return false;
            },

            resetDailyQueries: () => {
                const state = get();
                const plan = state.plan;
                const limits = (TIER_LIMITS as Record<string, any>)[plan] || TIER_LIMITS.free;
                const dailyLimit = limits.daily || limits.monthly || 0;

                set({
                    aiQueriesRemaining: dailyLimit,
                    aiQueriesResetDate: getTodayDateString()
                });
            },

            checkAndResetQueries: () => {
                const state = get();
                const today = getTodayDateString();

                if (state.aiQueriesResetDate !== today) {
                    const plan = state.plan;
                    const limits = (TIER_LIMITS as Record<string, any>)[plan] || TIER_LIMITS.free;

                    // Reset logic: 
                    // Free: Resets daily (1)
                    // Pro: 30 per month. For simplicity here, we can either track monthly reset 
                    // or just allow 30 anytime and reset if it's a new month.
                    // For now, let's treat the 'monthly' limit as a pool that resets if the month part of the date changes.

                    const currentMonth = state.aiQueriesResetDate.substring(0, 7);
                    const newMonth = today.substring(0, 7);

                    if (limits.daily) {
                        // Resets every day
                        set({
                            aiQueriesRemaining: limits.daily,
                            aiQueriesResetDate: today
                        });
                    } else if (limits.monthly && currentMonth !== newMonth) {
                        // Resets every month
                        set({
                            aiQueriesRemaining: limits.monthly,
                            aiQueriesResetDate: today
                        });
                    } else if (limits.monthly && state.aiQueriesRemaining === undefined) {
                        // Initial setup for monthly users
                        set({
                            aiQueriesRemaining: limits.monthly,
                            aiQueriesResetDate: today
                        });
                    }
                }
            },

            /**
             * Check if user can use AI - now with server validation
             * Always validates with server if local state is stale
             */
            canUseAI: async () => {
                const state = get();
                const now = Date.now();

                // If we haven't checked server recently, validate first
                const needsServerCheck = !state.lastServerCheck ||
                    (now - state.lastServerCheck) > VALIDATION_INTERVAL;

                if (needsServerCheck) {
                    const isPremiumVerified = await state.verifyPremiumStatus();
                    if (isPremiumVerified) return true;
                } else if (state.isPremium) {
                    return true;
                }

                // Fall back to query count for free users
                state.checkAndResetQueries();
                return get().aiQueriesRemaining > 0;
            },

            /**
             * Refresh subscription from server - updates local state
             */
            refreshSubscription: async () => {
                try {
                    const details = await SubscriptionService.checkSubscription();
                    set({
                        isPremium: details.isPremium,
                        plan: details.status as SubscriptionPlan,
                        subscriptionDetails: details,
                        lastServerCheck: Date.now()
                    });
                } catch (error) {
                    console.error('Failed to refresh subscription:', error);
                    // On error, reset to safe state
                    set({ isPremium: false, plan: 'free', lastServerCheck: null });
                }
            },

            /**
             * Real-time server validation for premium status
             * Use this before any premium-only operations
             */
            verifyPremiumStatus: async (): Promise<boolean> => {
                try {
                    const details = await SubscriptionService.checkSubscription();
                    set({
                        isPremium: details.isPremium,
                        plan: details.status as SubscriptionPlan,
                        subscriptionDetails: details,
                        lastServerCheck: Date.now()
                    });
                    return details.isPremium;
                } catch (error) {
                    console.error('Failed to verify premium status:', error);
                    // On error, assume not premium for security
                    set({ isPremium: false, plan: 'free' });
                    return false;
                }
            }
        }),
        {
            name: 'monex-subscription',
            storage: createJSONStorage(() => localStorage),
            // SECURITY: Only persist non-sensitive data
            // isPremium and plan are NOT persisted - must be verified from server
            partialize: (state) => ({
                trialEndsAt: state.trialEndsAt,
                aiQueriesRemaining: state.aiQueriesRemaining,
                aiQueriesResetDate: state.aiQueriesResetDate,
                // We persist lastServerCheck to know when to revalidate
                lastServerCheck: state.lastServerCheck
            }),
        }
    )
);

