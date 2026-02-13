import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { MonexTransactionsResponse } from '@/types/pocketbase-types';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Loader2 } from 'lucide-react';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="liquid-glass rounded-xl p-3 shadow-lg">
                <p className="text-sm font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium">${entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function OverviewChart() {
    const { t } = useTranslation();
    const user = pb.authStore.model;

    // Fetch all transactions
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['chartTransactions', user?.id],
        queryFn: async () => {
            return pb.collection('monex_transactions').getFullList<MonexTransactionsResponse>({
                sort: '-date',
                filter: `user='${user?.id}'`
            });
        },
        enabled: !!user,
    });

    // Process transactions into monthly data
    const chartData = useMemo(() => {
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 5);

        // Generate last 6 months
        const months = eachMonthOfInterval({
            start: startOfMonth(sixMonthsAgo),
            end: endOfMonth(now)
        });

        return months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthTransactions = transactions?.filter(tx => {
                const txDate = new Date(tx.date || '');
                return txDate >= monthStart && txDate <= monthEnd;
            }) || [];

            const income = monthTransactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);

            const expenses = monthTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);

            return {
                month: format(month, 'MMM'),
                fullMonth: format(month, 'MMMM yyyy'),
                income,
                expenses,
                net: income - expenses,
            };
        });
    }, [transactions]);

    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const hasData = chartData.some(d => d.income > 0 || d.expenses > 0);

    if (!hasData) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>{t('analytics.noData') || 'No transaction data available'}</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(128, 128, 128, 0.1)"
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: '20px' }}
                />
                <Area
                    type="monotone"
                    dataKey="income"
                    name={t('transactions.income') || 'Income'}
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                    type="monotone"
                    dataKey="expenses"
                    name={t('transactions.expense') || 'Expenses'}
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
