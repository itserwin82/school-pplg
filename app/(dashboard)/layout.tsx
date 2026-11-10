import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ✅ BUNGKUS SIDEBAR DENGAN SUSPENSE */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ✅ BUNGKUS HEADER DENGAN SUSPENSE (jika ada usePathname/useSearchParams di masa depan) */}
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        
        <main className="flex-1 overflow-y-auto p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}

// Skeleton untuk Sidebar saat loading
function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </aside>
  );
}

// Skeleton untuk Header saat loading
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="ml-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
    </header>
  );
}