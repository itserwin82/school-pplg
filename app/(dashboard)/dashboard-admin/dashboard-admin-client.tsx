"use client";

import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Activity,
  TrendingUp,
  UserCheck,
  Settings
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DashboardAdminClientProps = {
  userName: string;
  statistik: {
    totalSiswa: number;
    totalGuru: number;
    totalKelas: number;
    totalMapel: number;
    totalJadwal: number;
    totalSesiHariIni: number;
    persentaseHadirHariIni: string;
  };
  aktivitasTerbaru: any[];
};

export function DashboardAdminClient({
  userName,
  statistik,
  aktivitasTerbaru,
}: DashboardAdminClientProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Panel Administrator</h2>
            <p className="mt-1 opacity-90">
              Selamat datang, {userName}. Kelola seluruh sistem sekolah dari sini.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Settings className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Statistik Utama Sekolah */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Siswa</p>
                <p className="mt-1 text-3xl font-bold text-blue-600">{statistik.totalSiswa}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link href="/siswa" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              Kelola Siswa →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Guru</p>
                <p className="mt-1 text-3xl font-bold text-purple-600">{statistik.totalGuru}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link href="/guru" className="text-xs text-purple-600 hover:underline mt-2 inline-block">
              Kelola Guru →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Kelas</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">{statistik.totalKelas}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Link href="/kelas" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
              Kelola Kelas →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jadwal</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">{statistik.totalJadwal}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Link href="/jadwal" className="text-xs text-amber-600 hover:underline mt-2 inline-block">
              Kelola Jadwal →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Statistik Presensi Hari Ini */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Sesi Berjalan Hari Ini</p>
                <p className="mt-1 text-3xl font-bold text-emerald-900">
                  {statistik.totalSesiHariIni}
                </p>
              </div>
              <Activity className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Kehadiran Hari Ini</p>
                <p className="mt-1 text-3xl font-bold text-blue-900">
                  {statistik.persentaseHadirHariIni}%
                </p>
              </div>
              <UserCheck className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitas Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktivitas Sesi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aktivitasTerbaru.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Belum ada aktivitas sesi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aktivitasTerbaru.map((sesi) => {
                const hadirCount = sesi.presensiDetail?.filter((p: any) => p.status === "HADIR").length || 0;
                const totalCount = sesi._count?.presensiDetail || 0;
                const statusColor = sesi.status === "BERLANGSUNG" 
                  ? "bg-emerald-100 text-emerald-800" 
                  : sesi.status === "SELESAI" 
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-700";

                return (
                  <div key={sesi.id} className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{sesi.jadwal.mapel.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        Kelas {sesi.jadwal.kelas.nama} • {sesi.jadwal.guru?.name || "Guru"}
                      </p>
                    </div>
                    <Badge className={statusColor}>{sesi.status}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {hadirCount}/{totalCount} hadir
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}