"use client";

import { useState } from "react";
import { Clock, Users, BookOpen, Play, Square, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SesiCardProps = {
  jadwal: any;
  onStartSesi: (jadwalId: string) => void;
  onCloseSesi: (sesiId: string) => void;
  onShowQr: (sesiId: string) => void;
  isPending: boolean;
};

const STATUS_CONFIG = {
  BELUM_DIMULAI: { label: "Belum Dimulai", color: "bg-slate-100 text-slate-700" },
  BERLANGSUNG: { label: "Berlangsung", color: "bg-emerald-100 text-emerald-800" },
  SELESAI: { label: "Selesai", color: "bg-blue-100 text-blue-800" },
  DIBATALKAN: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

export function SesiCard({ 
  jadwal, 
  onStartSesi, 
  onCloseSesi, 
  onShowQr,
  onRegenerateQr,
  isPending 
}: SesiCardProps) {
  const sesi = jadwal.sesiList?.[0];
  const statusConfig = STATUS_CONFIG[sesi?.status || "BELUM_DIMULAI"];
  
  // ✅ State untuk durasi regenerate
  const [durasiMenit, setDurasiMenit] = useState<number>(15);
  
  const stats = sesi?.presensiDetail?.reduce(
    (acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 }
  ) || { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };

  return (
    <Card className="border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{jadwal.mapel.nama}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kelas {jadwal.kelas.nama} • {jadwal.guru?.name || "Guru"}
              </p>
            </div>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Waktu */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{jadwal.jamMulai} - {jadwal.jamSelesai}</span>
          </div>
          {sesi && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{stats.HADIR} hadir dari {sesi.presensiDetail?.length || 0} siswa</span>
            </div>
          )}
        </div>

        {/* Statistik Presensi */}
        {sesi && (
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-center">
              <p className="text-xs text-emerald-700">Hadir</p>
              <p className="text-lg font-bold text-emerald-900">{stats.HADIR}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-2 text-center">
              <p className="text-xs text-yellow-700">Sakit</p>
              <p className="text-lg font-bold text-yellow-900">{stats.SAKIT}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-center">
              <p className="text-xs text-blue-700">Izin</p>
              <p className="text-lg font-bold text-blue-900">{stats.IZIN}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-2 text-center">
              <p className="text-xs text-red-700">Alpha</p>
              <p className="text-lg font-bold text-red-900">{stats.ALPHA}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Tombol untuk sesi BELUM dibuat */}
          {!sesi && (
            <Button 
              onClick={() => onStartSesi(jadwal.id)}
              disabled={isPending}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Mulai Sesi
            </Button>
          )}

          {/* Tombol untuk sesi BELUM_DIMULAI */}
          {sesi?.status === "BELUM_DIMULAI" && (
            <Button 
              onClick={() => onStartSesi(sesi.id)}
              disabled={isPending}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Mulai Sesi & Generate QR
            </Button>
          )}

          {/* ✅ Tombol untuk sesi BERLANGSUNG - LEBIH SIMPLE */}
          {sesi?.status === "BERLANGSUNG" && (
            <>
              <Button 
                onClick={() => onShowQr(sesi.id)}
                variant="outline"
                className="flex-1"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Kelola Sesi
              </Button>

              <Button 
                onClick={() => onCloseSesi(sesi.id)}
                variant="destructive"
                disabled={isPending}
                size="sm"
              >
                <Square className="mr-2 h-4 w-4" />
                Tutup
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}