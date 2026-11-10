"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  PlayCircle,
  FileDown,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DashboardGuruClientProps = {
  userName: string;
  statistik: {
    totalSesi: number;
    rataRataKehadiran: number;
    kelasDiajar: { id: string; nama: string }[];
    siswaBermasalah: {
      nama: string;
      nis: string;
      kelas: string;
      persentase: number;
    }[];
  };
  jadwalHariIni: any[];
  semuaJadwal: any[];
  sesiBerlangsung?: any;
  isWeekend?: boolean;
};

const HARI_LABELS: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
  MINGGU: "Minggu",
};

export function DashboardGuruClient({
  userName,
  statistik,
  jadwalHariIni,
  semuaJadwal,
  sesiBerlangsung,
  isWeekend,
}: DashboardGuruClientProps) {
  
  const [activeTab, setActiveTab] = useState<"hari-ini" | "semua">("hari-ini");
  const firstName = userName.split(" ")[0];

  // ==========================================
  // VARIASI PESAN LIBUR UNTUK GURU
  // ==========================================
  const pesanSabtuGuru = [
    "Terima kasih atas dedikasi Anda minggu ini. Nikmati waktu istirahat bersama keluarga.",
    "Anda telah bekerja keras. Saatnya menikmati waktu berkualitas dengan orang tercinta.",
    "Sabtu adalah waktu untuk diri sendiri. Recharge dan kumpulkan inspirasi baru!",
    "Lupakan sejenak tugas mengajar. Hari ini adalah hari Anda!",
  ];

  const pesanMingguGuru = [
    "Anda telah memberikan yang terbaik untuk siswa-siswa kita. Siapkan energi untuk minggu yang penuh inspirasi!",
    "Dedikasi Anda luar biasa. Minggu depan kita lanjutkan misi mencerdaskan bangsa!",
    "Hari ini adalah waktu untuk keluarga dan hobi. Senin kita kembali menginspirasi!",
    "Pahlawan tanpa tanda jasa, nikmati hari liburmu. Kamu layak mendapatkannya!",
  ];

  // Pilih pesan random berdasarkan hari
  const randomPesanGuru = new Date().getDay() === 6
    ? pesanSabtuGuru[Math.floor(Math.random() * pesanSabtuGuru.length)]
    : pesanMingguGuru[Math.floor(Math.random() * pesanMingguGuru.length)];
  // ==========================================


  // Group semua jadwal berdasarkan hari
  const jadwalByHari = semuaJadwal.reduce((acc: any, jadwal) => {
    if (!acc[jadwal.hari]) {
      acc[jadwal.hari] = [];
    }
    acc[jadwal.hari].push(jadwal);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Selamat Datang, {firstName}!</h2>
            <p className="mt-1 opacity-90">
              Berikut ringkasan aktivitas mengajar Anda.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ✅ PESAN LIBUR WEEKEND UNTUK GURU */}
      {isWeekend && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {new Date().getDay() === 6 ? "☕" : "🌟"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-indigo-900">
                  {new Date().getDay() === 6 
                    ? "Akhir Pekan Tiba, Saatnya Recharge!" 
                    : "Hari Minggu, Waktu untuk Keluarga & Inspirasi"}
                </p>
                {/* ✅ GANTI TEKS STATIS DENGAN VARIABEL INI */}
                <p className="text-sm text-indigo-700 mt-1">
                  {randomPesanGuru}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ SESI BERLANGSUNG CARD - Sangat Prominent */}
      {sesiBerlangsung && (
        <Card className="border-2 border-emerald-500 bg-emerald-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 animate-pulse">
                  <span className="text-white font-bold text-xl">🔴</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-900">SESI SEDANG BERLANGSUNG</p>
                  <p className="text-sm text-emerald-700">
                    {sesiBerlangsung.jadwal.mapel.nama} • Kelas {sesiBerlangsung.jadwal.kelas.nama}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {sesiBerlangsung.presensiDetail?.filter((p: any) => p.status === "HADIR").length || 0} / {sesiBerlangsung.presensiDetail?.length || 0} siswa hadir
                  </p>
                </div>
              </div>
              <Link href="/sesi">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Kelola Sesi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistik Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sesi Bulan Ini</p>
                <p className="mt-1 text-3xl font-bold">{statistik.totalSesi}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Kehadiran</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {statistik.rataRataKehadiran}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kelas yang Diajar</p>
                <p className="mt-1 text-3xl font-bold">{statistik.kelasDiajar.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alert */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/sesi">
              <Button className="w-full justify-start" variant="outline">
                <PlayCircle className="mr-2 h-4 w-4" />
                Mulai Sesi Hari Ini
              </Button>
            </Link>
            <Link href="/presensi">
              <Button className="w-full justify-start" variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Lihat Rekap Presensi
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Alert Siswa Bermasalah */}
        {statistik.siswaBermasalah.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Perhatian: Siswa dengan Kehadiran Rendah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statistik.siswaBermasalah.map((siswa, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg bg-white p-3 border border-red-200">
                    <div>
                      <p className="font-medium text-sm">{siswa.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        NIS: {siswa.nis} • {siswa.kelas}
                      </p>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {siswa.persentase}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Jadwal dengan Tab Switcher */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Jadwal Mengajar
            </CardTitle>
            
            {/* Tab Switcher */}
            <div className="flex rounded-lg border border-border p-1">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "hari-ini"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("hari-ini")}
              >
                Hari Ini ({jadwalHariIni.length})
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "semua"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("semua")}
              >
                Semua Jadwal ({semuaJadwal.length})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab: Hari Ini */}
          {activeTab === "hari-ini" && (
            <>
              {jadwalHariIni.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Tidak ada jadwal mengajar hari ini</p>
                  <p className="text-sm text-muted-foreground mt-1">Nikmati hari libur Anda!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jadwalHariIni.map((jadwal) => {
                    const sesi = jadwal.sesiList?.[0];
                    const statusColor = sesi?.status === "BERLANGSUNG" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : sesi?.status === "SELESAI" 
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-700";

                    const hadirCount = sesi?.presensiDetail?.filter((p: any) => p.status === "HADIR").length || 0;
                    const totalCount = sesi?.presensiDetail?.length || 0;

                    return (
                      <div key={jadwal.id} className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[70px]">
                          <Clock className="h-4 w-4 text-primary mb-1" />
                          <span className="text-xs font-mono font-medium">{jadwal.jamMulai}</span>
                          <span className="text-xs text-muted-foreground">{jadwal.jamSelesai}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{jadwal.mapel.nama}</p>
                          <p className="text-sm text-muted-foreground">
                            Kelas {jadwal.kelas.nama}
                          </p>
                        </div>
                        {sesi && (
                          <div className="flex items-center gap-2">
                            <Badge className={statusColor}>
                              {sesi.status === "BERLANGSUNG" ? "🔴 LIVE" : sesi.status === "SELESAI" ? "Selesai" : "Belum"}
                            </Badge>
                            {totalCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {hadirCount}/{totalCount} hadir
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab: Semua Jadwal */}
          {activeTab === "semua" && (
            <>
              {semuaJadwal.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Belum ada jadwal mengajar</p>
                  <p className="text-sm text-muted-foreground mt-1">Hubungi admin untuk mengatur jadwal</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(jadwalByHari)
                    .sort((a, b) => {
                      const hariOrder = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
                      return hariOrder.indexOf(a) - hariOrder.indexOf(b);
                    })
                    .map((hari) => (
                      <div key={hari}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {HARI_LABELS[hari]} ({jadwalByHari[hari].length} sesi)
                        </h3>
                        <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                          {jadwalByHari[hari].map((jadwal: any) => (
                            <div key={jadwal.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                              <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-2 py-1 min-w-[60px]">
                                <span className="text-xs font-mono font-medium">{jadwal.jamMulai}</span>
                                <span className="text-xs text-muted-foreground">{jadwal.jamSelesai}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{jadwal.mapel.nama}</p>
                                <p className="text-xs text-muted-foreground">
                                  Kelas {jadwal.kelas.nama}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}