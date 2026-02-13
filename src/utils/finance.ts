import { MonexTransactionsResponse } from '@/types/pocketbase-types';

export const FinanceUtils = {
    sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),

    avg: (arr: number[]) => (arr.length === 0 ? 0 : FinanceUtils.sum(arr) / arr.length),

    /**
     * Calculates total income, expense, and savings rate from transactions
     */
    calculateCashFlow: (transactions: MonexTransactionsResponse[]) => {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') income += (t.amount || 0);
            if (t.type === 'expense') expense += (t.amount || 0);
        });

        const net = income - expense;
        const savingsRate = income > 0 ? (net / income) * 100 : 0;

        return { income, expense, net, savingsRate };
    },

    /**
     * Groups transactions by month for trend analysis
     */
    getMonthlyData: (transactions: MonexTransactionsResponse[]) => {
        const months: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(t => {
            if (!t.date) return;
            const date = t.date.substring(0, 7); // YYYY-MM

            if (!months[date]) months[date] = { income: 0, expense: 0 };

            if (t.type === 'income') months[date].income += (t.amount || 0);
            if (t.type === 'expense') months[date].expense += (t.amount || 0);
        });

        return Object.entries(months)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, data]) => ({ date, ...data }));
    },

    /**
     * Estimates runway (months until bankruptcy) based on current balance and average monthly burn
     */
    calculateRunway: (currentBalance: number, transactions: MonexTransactionsResponse[]) => {
        const monthlyData = FinanceUtils.getMonthlyData(transactions);
        if (monthlyData.length === 0) return Infinity;

        // Calculate average monthly expense (Burn Rate)
        const totalExpense = monthlyData.reduce((acc, m) => acc + m.expense, 0);
        const burnRate = totalExpense / monthlyData.length;

        if (burnRate <= 0) return Infinity;

        return currentBalance / burnRate;
    },

    /**
     * Projects future net worth based on current growth
     */
    projectNetWorth: (currentBalance: number, transactions: MonexTransactionsResponse[], monthsToProject: number = 12) => {
        const monthlyData = FinanceUtils.getMonthlyData(transactions);
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
    }
};
