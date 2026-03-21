import { MonexTransactionsResponse } from '@/types/pocketbase-types';
import { CurrencyService, CurrencyCode } from '@/services/currencyService';

export const FinanceUtils = {
    sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),

    avg: (arr: number[]) => (arr.length === 0 ? 0 : FinanceUtils.sum(arr) / arr.length),

    /**
     * Parses the amount and currency from a transaction
     */
    parseTransactionAmount: (tx: MonexTransactionsResponse, targetCurrency: string = 'USD') => {
        const amount = tx.amount || 0;
        let fromCurrency: CurrencyCode = 'USD';

        // Check for currency tag in note like [TRY], [EUR]
        const match = tx.note?.match(/\[([A-Z]{3})\]/);
        if (match && match[1]) {
            fromCurrency = match[1] as CurrencyCode;
        } else {
            // Fallback to a default if no tag, ideally user's currency
            // For now we assume USD if no tag exists
            fromCurrency = 'USD';
        }

        const targetCode = CurrencyService.getCodeFromSymbol(targetCurrency);
        const convertedAmount = CurrencyService.convert(amount, fromCurrency, targetCode);

        return {
            originalAmount: amount,
            originalCurrency: fromCurrency,
            convertedAmount,
            targetCurrency: targetCode,
            cleanNote: tx.note?.replace(/\[[A-Z]{3}\]\s?/, '') || ''
        };
    },

    /**
     * Calculates total income, expense, and savings rate from transactions with multi-currency support
     */
    calculateCashFlow: (transactions: MonexTransactionsResponse[], targetCurrency: string = '$') => {
        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
            const { convertedAmount } = FinanceUtils.parseTransactionAmount(tx, targetCurrency);
            if (tx.type === 'income') income += convertedAmount;
            if (tx.type === 'expense') expense += convertedAmount;
        });

        const net = income - expense;
        const savingsRate = income > 0 ? (net / income) * 100 : 0;

        return { income, expense, net, savingsRate };
    },

    /**
     * Groups transactions by month for trend analysis with multi-currency support
     */
    getMonthlyData: (transactions: MonexTransactionsResponse[], targetCurrency: string = '$') => {
        const months: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(tx => {
            if (!tx.date) return;
            const date = tx.date.substring(0, 7); // YYYY-MM

            if (!months[date]) months[date] = { income: 0, expense: 0 };

            const { convertedAmount } = FinanceUtils.parseTransactionAmount(tx, targetCurrency);
            if (tx.type === 'income') months[date].income += convertedAmount;
            if (tx.type === 'expense') months[date].expense += convertedAmount;
        });

        return Object.entries(months)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, data]) => ({ date, ...data }));
    },

    /**
     * Estimates runway based on multi-currency normalized data
     */
    calculateRunway: (currentBalance: number, transactions: MonexTransactionsResponse[], targetCurrency: string = '$') => {
        const monthlyData = FinanceUtils.getMonthlyData(transactions, targetCurrency);
        if (monthlyData.length === 0) return Infinity;

        const totalExpense = monthlyData.reduce((acc, m) => acc + m.expense, 0);
        const burnRate = totalExpense / monthlyData.length;

        if (burnRate <= 0) return Infinity;

        return currentBalance / burnRate;
    },

    /**
     * Projects future net worth based on multi-currency normalized data
     */
    projectNetWorth: (currentBalance: number, transactions: MonexTransactionsResponse[], monthsToProject: number = 12, targetCurrency: string = '$') => {
        const monthlyData = FinanceUtils.getMonthlyData(transactions, targetCurrency);
        if (monthlyData.length === 0) return Array(monthsToProject).fill(currentBalance);

        const totalNet = monthlyData.reduce((acc, m) => acc + (m.income - m.expense), 0);
        const avgGrowth = totalNet / monthlyData.length;

        const projection = [];
        let balance = currentBalance;

        for (let i = 0; i < monthsToProject; i++) {
            balance += avgGrowth;
            projection.push(balance);
        }

        return projection;
    },

    /**
     * Converts transactions to CSV string
     */
    exportToCSV: (transactions: MonexTransactionsResponse[], headers: Record<string, string>) => {
        const rows = [
            [headers.date, headers.category, headers.note, headers.type, headers.amount].join(',')
        ];

        transactions.forEach(t => {
            const row = [
                t.date?.split(' ')[0] || '',
                t.category || '',
                `"${(t.note || '').replace(/"/g, '""')}"`,
                t.type || '',
                t.amount || 0
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }
};
