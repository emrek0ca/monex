import { Navigate, useLocation } from 'react-router-dom';
import { isUserLoggedIn } from '@/api/client';

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const location = useLocation();

    if (!isUserLoggedIn()) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
}
