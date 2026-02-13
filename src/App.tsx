import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ErrorBoundary } from '@/components/UI/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
}

export default App;
