import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-uefa-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-700 border-t-cyan-aura rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
