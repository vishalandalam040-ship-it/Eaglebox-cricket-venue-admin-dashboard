import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-color)]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-primary)]">
        <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-xl">Access Denied</h2>
        <p className="text-[var(--text-secondary)] mt-2">You do not have permission to view this page.</p>
        <p className="text-sm mt-4 text-[var(--text-secondary)]">Current Role: {user.role}</p>
      </div>
    );
  }

  return children;
};
