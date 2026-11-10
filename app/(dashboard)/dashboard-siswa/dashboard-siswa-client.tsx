"use client";

import Link from "next/link";
import { QrCode, BookOpen, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DashboardSiswaClientProps = {
  siswa: any;
  jadwalHariIni: any[];
  stats: { HADIR: number; SAKIT: number; IZIN: number; ALPHA: number };
  hariIni: string;
  sesiLive?: any;
  statusPresensiHariIni?: {
    totalSesi: number;
    sudahPresensi: number;
    belumPresensi: number;
  } | null;
  isWeekend?: boolean;
};

const HARI_LABELS: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu",
  KAMIS: "Kamis", JUMAT: "Jumat", SABTU: "Sabtu", MINGGU: "Minggu",
};

export function DashboardSiswaClient({ 
  siswa, 
  jadwalHariIni, 
  stats, 
  hariIni,
  sesiLive,
  statusPresensiHariIni,
  isWeekend,
}: DashboardSiswaClientProps) {
  const totalPresensi = stats.HADIR + stats.SAKIT + stats.IZIN + stats.ALPHA;
  const persentaseHadir = totalPresensi > 0 ? ((stats.HADIR / totalPresensi) * 100).toFixed(1) : "0";

  const pesanSabtu = [
    "Waktunya refresh pikiran setelah seminggu belajar. Nikmati akhir pekanmu!",
    "Sabtu adalah hari untuk hobi dan keluarga. Recharge energimu!",
    "Setelah seminggu penuh pembelajaran, saatnya bersantai dan menikmati hidup!",
    "Main game, nonton film, atau baca buku favoritmu. Weekend adalah milikmu!",
  ];

  const pesanMinggu = [
    "Hari istirahat untuk mengumpulkan energi. Siapkan dirimu untuk minggu yang penuh semangat!",
    "Minggu adalah waktu untuk refleksi dan persiapan. Kamu akan hebat minggu depan!",
    "Nikmati hari liburmu. Senin kita kembali dengan semangat baru!",
    "Keluargamu menunggumu di rumah. Habiskan waktu berkualitas bersama mereka!",
  ];

  // Pilih pesan random berdasarkan hari
  const randomPesanSiswa = new Date().getDay() === 6 
    ? pesanSabtu[Math.floor(Math.random() * pesanSabtu.length)]
    : pesanMinggu[Math.floor(Math.random() * pesanMinggu.length)];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold">
            {siswa.namaLengkap.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Halo, {siswa.namaLengkap.split(" ")[0]}!</h2>
            <p className="opacity-90">
              {siswa.kelas.nama} • NIS: {siswa.nis}
            </p>
          </div>
        </div>

        {/* ✅ SESI LIVE ALERT - Sangat Prominent */}
        {sesiLive && (
          <div className="mt-4 rounded-xl bg-white/20 backdrop-blur p-4 border-2 border-white/30 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 animate-pulse">
                  <span className="text-white font-bold text-sm">🔴</span>
                </div>
                <div>
                  <p className="font-bold text-sm">SESI SEDANG BERLANGSUNG!</p>
                  <p className="text-xs opacity-90">
                    {sesiLive.jadwal.mapel.nama} • {sesiLive.jadwal.guru?.name}
                  </p>
                </div>
              </div>
              <Link href="/scan">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  Scan Sekarang
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Action: Scan QR */}
        <Link href="/scan" className="mt-4 block">
          <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
            <QrCode className="mr-2 h-5 w-5" />
            Scan Presensi
          </Button>
        </Link>
      </div>

      {statusPresensiHariIni && statusPresensiHariIni.totalSesi > 0 && (
        <Card className={
          statusPresensiHariIni.belumPresensi === 0
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  statusPresensiHariIni.belumPresensi === 0 ? "bg-emerald-500" : "bg-amber-500"
                }`}>
                  {statusPresensiHariIni.belumPresensi === 0 ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    statusPresensiHariIni.belumPresensi === 0 ? "text-emerald-900" : "text-amber-900"
                  }`}>
                    {statusPresensiHariIni.belumPresensi === 0
                      ? "✅ Semua Presensi Hari Ini Sudah Lengkap!"
                      : `⚠️ Anda Belum Presensi di ${statusPresensiHariIni.belumPresensi} Sesi`}
                  </p>
                  <p className={`text-xs ${
                    statusPresensiHariIni.belumPresensi === 0 ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {statusPresensiHariIni.sudahPresensi} dari {statusPresensiHariIni.totalSesi} sesi hari ini
                  </p>
                </div>
              </div>
              {statusPresensiHariIni.belumPresensi > 0 && (
                <Link href="/scan">
                  <Button size="sm" variant="outline" className="border-amber-300 hover:bg-amber-100">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan Sekarang
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ PESAN LIBUR WEEKEND */}
      {isWeekend && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {new Date().getDay() === 6 ? "🎮" : "🌴"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-purple-900">
                  {new Date().getDay() === 6 ? "Selamat Hari Sabtu!" : "Selamat Hari Minggu!"}
                </p>
                {/* ✅ GANTI TEKS STATIS DENGAN VARIABEL INI */}
                <p className="text-sm text-purple-700 mt-1">
                  {randomPesanSiswa}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistik Presensi Bulan Ini */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">Persentase Hadir</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{persentaseHadir}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Hadir</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">{stats.HADIR}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700">Sakit/Izin</p>
                <p className="mt-1 text-2xl font-bold text-yellow-900">{stats.SAKIT + stats.IZIN}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Alpha</p>
                <p className="mt-1 text-2xl font-bold text-red-900">{stats.ALPHA}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jadwal Hari Ini */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jadwal Hari {HARI_LABELS[hariIni]}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {jadwalHariIni.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Tidak ada jadwal hari ini</p>
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
                        {jadwal.guru?.name || "Guru"}
                      </p>
                    </div>
                    {sesi && (
                      <Badge className={statusColor}>
                        {sesi.status === "BERLANGSUNG" ? "🔴 LIVE" : sesi.status === "SELESAI" ? "Selesai" : "Belum"}
                      </Badge>
                    )}
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