import AppHeader from "@/app/layout/appHeader";
import SidebarNav from "@/app/layout/SidebarNav";
import ProtectedRoute from "@/app/security/protectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <AppLiveQueries /> */}
      <ProtectedRoute>
        <div
          className="lg:h-screen grid grid-cols-1 lg:grid-cols-[250px_1fr] 
           lg:grid-rows-1 grid-areas-mobile lg:grid-areas-desktop"
        >
          <SidebarNav />
          <main className="grid-in-content bg-[#F7F7F7] min-h-screen lg:h-screen">
            <div className="h-full overflow-y-auto px-6 pt-4 pb-24 lg:pb-6">
              <AppHeader />
              {children}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </>
  );
}
