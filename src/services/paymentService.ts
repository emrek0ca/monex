import { pb } from '@/api/client';

export interface PaymentConfig {
    iban: string;
    accountHolder: string;
    bankName: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
}

export interface PaymentRequest {
    id: string;
    user: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected';
    plan: 'monthly' | 'yearly';
    reference_code: string;
    receipt_url?: string;
    admin_note?: string;
    created: string;
    updated: string;
}

export const getPaymentConfig = (): PaymentConfig => {
    return {
        iban: import.meta.env.VITE_PAYMENT_IBAN || 'TR00 0000 0000 0000 0000 0000 00',
        accountHolder: import.meta.env.VITE_PAYMENT_HOLDER || 'Monex Teknoloji A.Ş.',
        bankName: import.meta.env.VITE_PAYMENT_BANK || 'Monex Bank',
        monthlyPrice: Number(import.meta.env.VITE_PRICE_MONTHLY) || 99,
        yearlyPrice: Number(import.meta.env.VITE_PRICE_YEARLY) || 799,
        currency: 'TRY',
    };
};

export class PaymentService {
    /**
     * Get the current pending payment for the user
     */
    static async getPendingPayment(): Promise<PaymentRequest | null> {
        const user = pb.authStore.model;
        if (!user) return null;

        try {
            const record = await pb.collection('monex_payments').getFirstListItem(
                pb.filter('user = {:userId} && status = "pending"', { userId: user.id }),
                { requestKey: null }
            );
            return record as unknown as PaymentRequest;
        } catch (error) {
            return null;
        }
    }

    /**
     * Create a new payment request
     */
    static async createPaymentRequest(plan: 'monthly' | 'yearly'): Promise<PaymentRequest> {
        const user = pb.authStore.model;
        if (!user) throw new Error('User not logged in');

        const config = getPaymentConfig();
        const amount = plan === 'monthly' ? config.monthlyPrice : config.yearlyPrice;
        
        // Generate a simple reference code
        const refCode = `MNX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const data = {
            user: user.id,
            amount,
            currency: config.currency,
            status: 'pending',
            plan,
            reference_code: refCode,
        };

        const record = await pb.collection('monex_payments').create(data);
        return record as unknown as PaymentRequest;
    }

    /**
     * Upload payment receipt
     */
    static async uploadReceipt(paymentId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('receipt_url', file);
        
        await pb.collection('monex_payments').update(paymentId, formData);
    }

    /**
     * Cancel a payment request
     */
    static async cancelPayment(paymentId: string): Promise<void> {
        await pb.collection('monex_payments').update(paymentId, {
            status: 'rejected',
            admin_note: 'Kullanıcı tarafından iptal edildi'
        });
    }

    /**
     * Format price for display
     */
    static formatPrice(amount: number, currency: string): string {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }
}
