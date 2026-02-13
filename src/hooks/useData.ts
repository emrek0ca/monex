import { useQuery } from '@tanstack/react-query';
import { pb } from '@/api/client';
import { Collections, MonexAccountsResponse, MonexTransactionsResponse } from '@/types/pocketbase-types';

export function useData() {
    const user = pb.authStore.model;

    // Fetch Accounts
    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const records = await pb.collection(Collections.MonexAccounts).getFullList<MonexAccountsResponse>({
                sort: '-created',
                filter: pb.filter('user = {:userId}', { userId: user.id }),
            });
            return records;
        },
        enabled: !!user,
    });

    // Fetch Recent Transactions
    const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ['transactions', 'recent', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const records = await pb.collection(Collections.MonexTransactions).getList<MonexTransactionsResponse>(1, 5, {
                sort: '-date',
                expand: 'account',
                filter: pb.filter('user = {:userId}', { userId: user.id }),
            });
            return records.items;
        },
        enabled: !!user,
    });

    // Calculate Totals
    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

    return {
        accounts,
        recentTransactions,
        totalBalance,
        isLoading: isLoadingAccounts || isLoadingTransactions,
    };
}
