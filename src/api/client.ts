import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://api.witlydesign.com';
export const pb = new PocketBase(POCKETBASE_URL);

// Helper to check if user is logged in
export const isUserLoggedIn = () => {
    return pb.authStore.isValid;
};

// Helper to get current user
export const getCurrentUser = () => {
    return pb.authStore.model;
};

// Helper to logout
export const logout = () => {
    pb.authStore.clear();
};
