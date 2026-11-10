"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, BookOpen, Filter, QrCode, Users } from "lucide-react";
import { toast } from "sonner";

import { createSesiFromJadwal, mulaiSesi, tutupSesi, getSesiDetailAction, sinkronisasiSiswaSesi, regenerateQrCode } from "@/app/actions/sesi";
import { SesiCard } from "@/components/sesi/sesi-card";
import { QrCodeDisplay } from "@/components/sesi/qr-code-display";
import { StudentAttendanceList } from "@/components/sesi/student-attendance-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type SesiPageClientProps = {
  jadwalList: any[];
  selectedHari: string;
  userRole: string;
};

const HARI_OPTIONS = [
  { value: "SENIN", label: "Senin" },
  { value: "SELASA", label: "Selasa" },
  { value: "RABU", label: "Rabu" },
  { value: "KAMIS", label: "Kamis" },
  { value: "JUMAT", label: "Jumat" },
  { value: "SABTU", label: "Sabtu" },
];

export function SesiPageClient({ jadwalList, selectedHari, userRole }: SesiPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeSesi, setActiveSesi] = useState<any>(null);
  const [hari, setHari] = useState(selectedHari);
  
  // ✅ PERBAIKAN: State ini SEKARANG BERADA DI DALAM fungsi komponen
  const [activeTab, setActiveTab] = useState<"qr" | "list">("qr");

  // Polling untuk update real-time saat QR modal terbuka
  useEffect(() => {
    if (!qrModalOpen || !activeSesi) return;

    const interval = setInterval(async () => {
      const updatedSesi = await getSesiDetailAction(activeSesi.id);
      if (updatedSesi) {
        // ✅ AUTO-SYNC: Cek dan sinkronisasi otomatis
        const totalDiKelas = updatedSesi.jadwal.kelas._count?.siswaList || 0;
        const totalDiSesi = updatedSesi.presensiDetail?.length || 0;
        
        if (totalDiSesi < totalDiKelas) {
          await sinkronisasiSiswaSesi(updatedSesi.id);
          // Refresh lagi setelah sync
          const refreshed = await getSesiDetailAction(activeSesi.id);
          if (refreshed) setActiveSesi(refreshed);
        } else {
          setActiveSesi(updatedSesi);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrModalOpen, activeSesi?.id]);

  const handleHariChange = (value: string) => {
    setHari(value);
    router.push(`/sesi?hari=${value}`);
  };

  const handleStartSesi = (jadwalOrSesiId: string) => {
    startTransition(async () => {
      const isJadwal = jadwalList.some((j) => j.id === jadwalOrSesiId);

      let result;
      if (isJadwal) {
        const today = new Date().toISOString().split("T")[0];
        result = await createSesiFromJadwal(jadwalOrSesiId, today);

        if (result.success) {
          toast.success(result.message + " Silakan klik 'Mulai Sesi' lagi untuk generate QR.");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        result = await mulaiSesi(jadwalOrSesiId, 15);

        if (result.success) {
          toast.success(result.message);
          const sesiDetail = await getSesiDetailAction(jadwalOrSesiId);
          if (sesiDetail) {
            setActiveSesi(sesiDetail);
            setQrModalOpen(true);
          }
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  const handleCloseSesi = (sesiId: string) => {
    startTransition(async () => {
      const result = await tutupSesi(sesiId);
      if (result.success) {
        toast.success(result.message);
        setQrModalOpen(false);
        setActiveSesi(null);
        setActiveTab("qr"); // Reset tab ke QR saat tutup
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateQr = async (sesiId: string, durasiMenit: number) => {
    setIsRegenerating(true);
    try {
      const result = await regenerateQrCode(sesiId, durasiMenit);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh data sesi untuk mendapatkan QR baru
        const sesiDetail = await getSesiDetailAction(sesiId);
        if (sesiDetail) {
          setActiveSesi(sesiDetail);
        }
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShowQr = async (sesiId: string) => {
    const sesiDetail = await getSesiDetailAction(sesiId);
    if (sesiDetail) {
      setActiveSesi(sesiDetail);
      setQrModalOpen(true);
    } else {
      toast.error("Gagal memuat detail sesi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sesi Pembelajaran</h2>
          <p className="text-muted-foreground">
            Kelola sesi pembelajaran dan presensi siswa secara real-time.
          </p>
        </div>

        {/* Filter Hari */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={hari} onValueChange={handleHariChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih hari" />
            </SelectTrigger>
            <SelectContent>
              {HARI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong> Anda sedang melihat jadwal hari <strong>{HARI_OPTIONS.find(h => h.value === hari)?.label}</strong>. 
          Gunakan dropdown di atas untuk melihat jadwal hari lain. 
          Klik <strong>"Mulai Sesi"</strong> untuk membuat sesi, lalu klik lagi untuk generate QR Code.
        </p>
      </div>

      {/* Empty State */}
      {jadwalList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Tidak ada jadwal untuk hari {HARI_OPTIONS.find(h => h.value === hari)?.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              Belum ada jadwal yang diatur untuk hari ini, atau coba pilih hari lain menggunakan filter di atas.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/jadwal")}
            >
              Kelola Jadwal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jadwalList.map((jadwal) => (
            <SesiCard
              key={jadwal.id}
              jadwal={jadwal}
              onStartSesi={handleStartSesi}
              onCloseSesi={handleCloseSesi}
              onShowQr={handleShowQr}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Modal QR Code & Daftar Siswa */}
      <Dialog open={qrModalOpen} onOpenChange={(open) => {
        setQrModalOpen(open);
        if (!open) setActiveTab("qr"); // Reset tab saat modal ditutup
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kelola Sesi: {activeSesi?.jadwal?.mapel?.nama || "Presensi"}
            </DialogTitle>
          </DialogHeader>

          {activeSesi && (
            <div className="space-y-4">
              {/* Custom Tabs */}
              <div className="flex border-b border-border">
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "qr" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("qr")}
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "list" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("list")}
                >
                  <Users className="h-4 w-4" />
                  Daftar Siswa ({activeSesi.presensiDetail?.length || 0})
                </button>
              </div>

              {/* Tab 1: QR Code */}
              {activeTab === "qr" && (
                <QrCodeDisplay
                  qrToken={activeSesi.qrToken || ""}
                  expiredAt={activeSesi.qrExpiredAt?.toISOString() || ""}
                  mapelNama={activeSesi.jadwal.mapel.nama}
                  kelasNama={activeSesi.jadwal.kelas.nama}
                  jumlahHadir={activeSesi.presensiDetail?.filter((p: any) => p.status === "HADIR").length || 0}
                  totalSiswa={activeSesi.presensiDetail?.length || 0}
                  sesiId={activeSesi.id}
                  onRegenerate={handleRegenerateQr}
                  isRegenerating={isRegenerating}
                />
              )}

              {/* Tab 2: Daftar Siswa untuk Manual Override */}
                {activeTab === "list" && (
                  <StudentAttendanceList 
                    presensiDetails={activeSesi.presensiDetail || []}
                    sesiId={activeSesi.id}
                    totalSiswaDiKelas={activeSesi.jadwal.kelas._count?.siswaList || 0}
                    onRefresh={async () => {
                      const updated = await getSesiDetailAction(activeSesi.id);
                      if (updated) setActiveSesi(updated);
                    }}
                  />
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}