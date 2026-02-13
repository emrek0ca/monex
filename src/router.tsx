import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import LandingPage from '@/pages/Landing';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Dashboard from '@/pages/Dashboard';
import Accounts from '@/pages/Accounts';
import Transactions from '@/pages/Transactions';
import Budgets from '@/pages/Budgets';
import Goals from '@/pages/Goals';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import AdminPayments from '@/pages/Admin/Payments';
import RequireAuth from '@/components/providers/RequireAuth';
import RequireAdmin from '@/components/providers/RequireAdmin';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/app',
        element: (
            <RequireAuth>
                <MainLayout />
            </RequireAuth>
        ),
        children: [
            {
                path: '/app',
                element: <Dashboard />,
            },
            {
                path: '/app/accounts',
                element: <Accounts />,
            },
            {
                path: '/app/transactions',
                element: <Transactions />,
            },
            {
                path: '/app/budgets',
                element: <Budgets />,
            },
            {
                path: '/app/goals',
                element: <Goals />,
            },
            {
                path: '/app/analytics',
                element: <Analytics />,
            },
            {
                path: '/app/settings',
                element: <Settings />,
            },
        ],
    },
    {
        path: '/admin/payments',
        element: (
            <RequireAdmin>
                <AdminPayments />
            </RequireAdmin>
        ),
    },
    {
        path: '/auth/login',
        element: <Login />,
    },
    {
        path: '/auth/register',
        element: <Register />,
    },
], {
    future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
        // @ts-expect-error - Valid flag in v6.x for v7 migration
        v7_startTransition: true,
    },
});
