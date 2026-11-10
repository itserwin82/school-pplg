"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  BookOpen, 
  Settings, 
  Calendar, 
  GraduationCap, 
  PlayCircle, 
  QrCode,
  LogOut
} from "lucide-react";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = session?.user?.role === "SISWA" 
  ? [
      { name: "Dashboard", href: "/dashboard-siswa", icon: LayoutDashboard },
      { name: "Scan Presensi", href: "/scan", icon: QrCode },
    ]
  : session?.user?.role === "GURU"
  ? [
      { name: "Dashboard", href: "/dashboard-guru", icon: LayoutDashboard },
      { name: "Sesi Hari Ini", href: "/sesi", icon: PlayCircle },
      { name: "Rekap Presensi", href: "/presensi", icon: CalendarCheck },
    ]
  : [
      { name: "Dashboard", href: "/dashboard-admin", icon: LayoutDashboard },
      { name: "Data Siswa", href: "/siswa", icon: Users },
      { name: "Data Kelas", href: "/kelas", icon: GraduationCap },
      { name: "Data Guru", href: "/guru", icon: Users },
      { name: "Mata Pelajaran", href: "/mapel", icon: BookOpen },
      { name: "Jadwal", href: "/jadwal", icon: Calendar },
      { name: "Sesi Hari Ini", href: "/sesi", icon: PlayCircle },
      { name: "Rekap Presensi", href: "/presensi", icon: CalendarCheck },
    ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">PPLG Scada</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {session?.user?.role?.toLowerCase() || "User"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}