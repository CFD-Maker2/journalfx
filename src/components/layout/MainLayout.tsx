import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useJournalStore } from '@/stores/journalStore';

export function MainLayout() {
  const { isAuthenticated } = useJournalStore();

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
