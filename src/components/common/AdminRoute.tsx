import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default AdminRoute; 