import { Navigate, useLocation } from 'react-router-dom';
import { pb } from '@/api/client';

// Admin emails from environment variable (comma-separated list)
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@monex.com')
    .split(',')
    .map((e: string) => e.trim().toLowerCase());

/**
 * Check if a user has admin privileges
 * Uses both role field and admin email whitelist
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAdminUser(user: any): boolean {
    if (!user) return false;

    // Check role field from database
    if (user.role === 'admin') return true;

    // Check against admin emails list from env
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;

    return false;
}

/**
 * Route guard that requires admin role
 * Redirects non-admin users to dashboard with unauthorized state
 */
export default function RequireAdmin({ children }: { children: JSX.Element }) {
    const location = useLocation();
    const user = pb.authStore.model;

    // Check if user is logged in
    if (!pb.authStore.isValid || !user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Check if user has admin role
    if (!isAdminUser(user)) {
        return <Navigate to="/app" state={{ unauthorized: true }} replace />;
    }

    return children;
}
