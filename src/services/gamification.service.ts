import { pb } from '@/api/client';
import { Collections, MonexUsersResponse } from '@/types/pocketbase-types';
import { differenceInCalendarDays } from 'date-fns';

export const LEVELS = [
    { level: 1, minXp: 0, titleKey: 'gamification.levels.novice' },
    { level: 2, minXp: 500, titleKey: 'gamification.levels.apprentice' },
    { level: 3, minXp: 1500, titleKey: 'gamification.levels.explorer' },
    { level: 4, minXp: 3000, titleKey: 'gamification.levels.strategist' },
    { level: 5, minXp: 5000, titleKey: 'gamification.levels.master' },
];

export const LEAGUES = [
    { name: 'Bronze', nameKey: 'gamification.leagues.bronze', minXp: 0, icon: '🥉' },
    { name: 'Silver', nameKey: 'gamification.leagues.silver', minXp: 1000, icon: '🥈' },
    { name: 'Gold', nameKey: 'gamification.leagues.gold', minXp: 2500, icon: '🥇' },
    { name: 'Diamond', nameKey: 'gamification.leagues.diamond', minXp: 5000, icon: '💠' },
    { name: 'Elite', nameKey: 'gamification.leagues.elite', minXp: 10000, icon: '👑' },
];

export class GamificationService {
    static getLevel(xp: number) {
        return LEVELS.slice().reverse().find(l => xp >= l.minXp) || LEVELS[0];
    }

    static getLeague(xp: number) {
        return LEAGUES.slice().reverse().find(l => xp >= l.minXp) || LEAGUES[0];
    }

    static getNextLevel(xp: number) {
        return LEVELS.find(l => l.minXp > xp);
    }

    static async awardXp(userId: string, amount: number) {
        try {
            const user = await pb.collection(Collections.MonexUsers).getOne<MonexUsersResponse>(userId);
            const newXp = (user.xp || 0) + amount;

            // Calculate new level/league
            const newLevel = this.getLevel(newXp).level;
            const newLeague = this.getLeague(newXp).name;

            await pb.collection(Collections.MonexUsers).update(userId, {
                xp: newXp,
                level: newLevel,
                league: newLeague,
            });

            return { newXp, newLevel, newLeague };
        } catch (error) {
            console.error('Failed to award XP:', error);
            throw error;
        }
    }

    static async checkDailyLogin(userId: string) {
        const user = await pb.collection(Collections.MonexUsers).getOne<MonexUsersResponse>(userId);
        const lastActive = user.last_active ? new Date(user.last_active) : null;
        const now = new Date();

        if (!lastActive) {
            // First time login
            await pb.collection(Collections.MonexUsers).update(userId, {
                last_active: now.toISOString(),
                streak: 1
            });
            return;
        }

        const daysDiff = differenceInCalendarDays(now, lastActive);

        if (daysDiff === 1) {
            // Consecutive day
            await pb.collection(Collections.MonexUsers).update(userId, {
                last_active: now.toISOString(),
                streak: (user.streak || 0) + 1
            });
        } else if (daysDiff > 1) {
            // Streak broken
            await pb.collection(Collections.MonexUsers).update(userId, {
                last_active: now.toISOString(),
                streak: 1
            });
        } else {
            // Same day, just update time
            await pb.collection(Collections.MonexUsers).update(userId, {
                last_active: now.toISOString()
            });
        }
    }

    static async claimDailyReward(userId: string) {
        const user = await pb.collection(Collections.MonexUsers).getOne<MonexUsersResponse>(userId);
        const lastReward = user.last_reward_date ? new Date(user.last_reward_date) : null;
        const now = new Date();

        if (lastReward && differenceInCalendarDays(now, lastReward) < 1) {
            throw new Error("Reward already claimed today");
        }

        await this.awardXp(userId, 250);
        await pb.collection(Collections.MonexUsers).update(userId, {
            last_reward_date: now.toISOString()
        });

        return 250;
    }
}
