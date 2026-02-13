import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { pb } from '@/api/client';
import { MonexUsersResponse } from '@/types/pocketbase-types';

interface UserState {
    user: MonexUsersResponse | null;
    token: string | null;
    setUser: (user: MonexUsersResponse) => void;
    clearUser: () => void;
    syncWithPocketBase: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: pb.authStore.model as MonexUsersResponse | null,
            token: pb.authStore.token,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null, token: null }),
            syncWithPocketBase: () => {
                set({
                    user: pb.authStore.model as MonexUsersResponse | null,
                    token: pb.authStore.token
                });
            }
        }),
        {
            name: 'monex-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

// Subscribe to PocketBase auth changes to keep store in sync
pb.authStore.onChange(() => {
    useUserStore.getState().syncWithPocketBase();
});
