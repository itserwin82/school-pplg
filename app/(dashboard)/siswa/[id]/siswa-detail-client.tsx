"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, BookOpen } from "lucide-react";

import { getHeatmapDataAction } from "@/app/actions/presensi";
import { HeatmapCalendar } from "@/components/presensi/heatmap-calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function SiswaDetailClient({ 
  siswa, 
  initialBulan, 
  initialTahun 
}: { 
  siswa: any; 
  initialBulan: string; 
  initialTahun: string; 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [bulan, setBulan] = useState(initialBulan);
  const [tahun, setTahun] = useState(initialTahun);
  const [heatmapData, setHeatmapData] = useState<any>(null);

  // 1. Efek untuk menangani default tanggal di sisi klien (di mana new Date() diizinkan)
  useEffect(() => {
    if (!initialBulan || !initialTahun) {
      const now = new Date(); // ✅ AMAN: new Date() di Client Component
      const defaultBulan = String(now.getMonth() + 1);
      const defaultTahun = String(now.getFullYear());
      
      setBulan(defaultBulan);
      setTahun(defaultTahun);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("bulan", defaultBulan);
      params.set("tahun", defaultTahun);
      router.replace(`/siswa/${siswa.id}?${params.toString()}`);
    }
  }, [initialBulan, initialTahun, router, searchParams, siswa.id]);

  // 2. Ambil data saat bulan/tahun berubah
  useEffect(() => {
    if (bulan && tahun) {
      startTransition(async () => {
        const data = await getHeatmapDataAction(siswa.id, parseInt(bulan), parseInt(tahun));
        setHeatmapData(data);
      });
    }
  }, [bulan, tahun, siswa.id]);

  if (!heatmapData) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <>
      <Card className="border-border/70 bg-gradient-to-br from-card to-muted/40 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              {siswa.namaLengkap
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{siswa.namaLengkap}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  NIS: {siswa.nis}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {siswa.kelas.nama}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <HeatmapCalendar
        heatmapData={heatmapData.heatmapData}
        bulan={parseInt(bulan)}
        tahun={parseInt(tahun)}
        stats={heatmapData.stats}
        totalHari={heatmapData.totalHari}
        persentaseHadir={heatmapData.persentaseHadir}
        longestStreak={heatmapData.longestStreak}
      />
    </>
  );
}