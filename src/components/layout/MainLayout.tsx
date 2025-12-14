import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthContext } from '@/contexts/AuthContext';

export function MainLayout() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-[260px] min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
