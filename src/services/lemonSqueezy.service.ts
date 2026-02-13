export type CheckoutPlan = 'pro_monthly' | 'pro_yearly' | 'pro_plus_monthly' | 'pro_plus_yearly' | 'extra_ai_100';

const PAYMENT_LINKS: Record<CheckoutPlan, string> = {
    pro_monthly: 'https://pay.lemon.com/monex-pro',
    pro_yearly: 'https://pay.lemon.com/monex-pro-yearly',
    pro_plus_monthly: 'https://pay.lemon.com/monex-pro-plus',
    pro_plus_yearly: 'https://pay.lemon.com/monex-pro-plus',
    extra_ai_100: 'https://pay.lemon.com/monex-pro-plus'
};

export class LemonSqueezyService {
    /**
     * Generates a checkout URL for the specified plan
     */
    static async createCheckout(plan: CheckoutPlan, userId: string, userEmail: string): Promise<string | null> {
        const baseUrl = PAYMENT_LINKS[plan];
        if (!baseUrl) return null;

        const params = new URLSearchParams({
            'checkout[email]': userEmail,
            'checkout[custom][user_id]': userId,
        });

        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Check if the user has an active subscription by verifying with backend
     * Lemon Squeezy webhooks should handle the actual database updates
     */
    static async syncSubscription(): Promise<void> {
        // This would typically trigger a background sync or refresh the local store
        // from the PocketBase collection that's updated via webhooks.
    }
}
