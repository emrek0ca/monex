import { pb } from '@/api/client';
import { MonexTransactionsResponse, MonexAccountsResponse } from '@/types/pocketbase-types';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import i18n from '@/i18n';

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

// WARNING: GROQ_API_KEY is exposed on the client side. 
// In a production environment, AI requests should be proxied through a secure backend 
// (e.g., PocketBase hooks or a separate Edge Function) to keep the API key hidden.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''; 
const AI_API_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const AI_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Wiqo, an AI financial advisor for Monex.
You are helpful, professional, and concise.
You have access to the user's financial data summary provided in the context.
Answer questions about their spending, budgets, and savings.
Do not give specific investment advice (e.g., "buy Apple stock").
Format your responses with markdown if needed.
`;

export class AIService {
    static async generateInsight(userContext: any, query: string): Promise<string> {
        if (!GROQ_API_KEY) {
            console.warn("VITE_GROQ_API_KEY is not set.");
            return i18n.t('ai.error');
        }

        // 0. Check subscription limits
        const subStore = useSubscriptionStore.getState();
        if (subStore.aiQueriesRemaining <= 0 && subStore.plan !== 'pro_plus') {
            return i18n.t('ai.limitReachedDesc');
        }

        try {
            // 1. Log query
            await pb.collection('monex_ai_query').create({
                prompt: query,
                user: pb.authStore.model?.id
            });

            // 2. Call LLM
            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT + `\nContext: ${JSON.stringify(userContext)}` },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("AI Error:", data.error);
                throw new Error(data.error.message || "AI Service Error");
            }

            const answer = data.choices?.[0]?.message?.content || i18n.t('ai.noAnswer');

            // 3. Decrement query count on success
            subStore.decrementQueries();

            return answer;

        } catch (error) {
            console.error("AI Service Error:", error);
            return i18n.t('ai.error');
        }
    }

    /**
     * Chat method for AI Assistant - wrapper around generateInsight
     */
    static async chat(message: string, userId: string): Promise<string> {
        const userContext = await this.buildUserContext(userId);
        return this.generateInsight(userContext, message);
    }

    static async buildUserContext(userId: string) {
        // Fetch recent transactions and account balances to give context
        const transactions = await pb.collection('monex_transactions').getList<MonexTransactionsResponse>(1, 10, {
            sort: '-date',
            filter: pb.filter('user = {:userId}', { userId })
        });

        const accounts = await pb.collection('monex_accounts').getFullList<MonexAccountsResponse>({
            filter: pb.filter('user = {:userId}', { userId })
        });

        // Basic summary of spending by category (simple calculation)
        const spendingByCategory: Record<string, number> = {};
        transactions.items.forEach(t => {
            if (t.type === 'expense' && t.amount) {
                spendingByCategory[t.category || 'Other'] = (spendingByCategory[t.category || 'Other'] || 0) + t.amount;
            }
        });

        return {
            recentTransactions: transactions.items.map((t: MonexTransactionsResponse) => ({
                date: t.date,
                amount: t.amount,
                category: t.category,
                type: t.type,
                note: t.note
            })),
            accounts: accounts.map((a: MonexAccountsResponse) => ({
                name: a.name,
                balance: a.balance,
                type: a.type
            })),
            spendingSummary: spendingByCategory
        };
    }
}
