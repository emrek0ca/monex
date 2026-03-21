import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;

if (!POCKETBASE_URL) {
    console.error('VITE_POCKETBASE_URL is not defined in environment variables.');
}

export const pb = new PocketBase(POCKETBASE_URL || 'http://127.0.0.1:8090');

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
