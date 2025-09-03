import AppHeader from '@/app/layout/appHeader';
import SidebarNav from '@/app/layout/SidebarNav';
import ProtectedRoute from '@/app/security/protectedRoute';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="grid-areas-mobile lg:grid-areas-desktop grid grid-cols-1 lg:h-screen lg:grid-cols-[250px_1fr] lg:grid-rows-1">
        <SidebarNav />
        <main className="grid-in-content min-h-screen bg-[#F7F7F7] lg:h-screen">
          <div className="h-full overflow-y-auto px-6 pb-24 pt-4 lg:pb-6">
            <AppHeader />
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
