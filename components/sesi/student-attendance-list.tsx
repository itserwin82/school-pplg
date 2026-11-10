"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { updatePresensiSiswa, sinkronisasiSiswaSesi } from "@/app/actions/sesi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentAttendanceListProps = {
  presensiDetails: any[];
  sesiId: string;
  totalSiswaDiKelas: number; // ✅ TAMBAHAN: Total siswa di kelas
  onRefresh: () => void;
};

const STATUS_COLORS = {
  HADIR: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SAKIT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IZIN: "bg-blue-100 text-blue-800 border-blue-200",
  ALPHA: "bg-red-100 text-red-800 border-red-200",
};

export function StudentAttendanceList({ 
  presensiDetails, 
  sesiId, 
  totalSiswaDiKelas,
  onRefresh 
}: StudentAttendanceListProps) {
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState<Record<string, string>>({});

  const handleStatusChange = (siswaId: string, newStatus: string) => {
    setEditingId(siswaId);
    
    startTransition(async () => {
      const ket = newStatus === "SAKIT" || newStatus === "IZIN" ? (keterangan[siswaId] || "") : undefined;
      
      const result = await updatePresensiSiswa(sesiId, siswaId, newStatus, ket);
      
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.error);
      }
      setEditingId(null);
    });
  };

  const handleSync = () => {
    setIsSyncing(true);
    startTransition(async () => {
      const result = await sinkronisasiSiswaSesi(sesiId);
      setIsSyncing(false);
      
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const jumlahDiSesi = presensiDetails.length;
  const adaYangBelumSinkron = jumlahDiSesi < totalSiswaDiKelas;

  return (
    <div className="space-y-4">
      {/* Info Box: Jumlah Siswa */}
      <div className={`rounded-lg border p-4 ${
        adaYangBelumSinkron 
          ? "border-amber-200 bg-amber-50" 
          : "border-emerald-200 bg-emerald-50"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {adaYangBelumSinkron ? (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-xs text-white font-bold">✓</span>
              </div>
            )}
            <div>
              <p className={`text-sm font-medium ${adaYangBelumSinkron ? "text-amber-900" : "text-emerald-900"}`}>
                {jumlahDiSesi} dari {totalSiswaDiKelas} siswa di kelas
              </p>
              {adaYangBelumSinkron && (
                <p className="text-xs text-amber-700 mt-0.5">
                  {totalSiswaDiKelas - jumlahDiSesi} siswa belum memiliki data presensi di sesi ini
                </p>
              )}
            </div>
          </div>

          {adaYangBelumSinkron && (
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              size="sm"
              variant="outline"
              className="border-amber-300 hover:bg-amber-100"
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sinkronisasi
            </Button>
          )}
        </div>
      </div>

      {/* Daftar Siswa */}
      {presensiDetails.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada data siswa untuk sesi ini.
          {totalSiswaDiKelas > 0 && (
            <p className="text-sm mt-2">
              Klik tombol "Sinkronisasi" di atas untuk memuat data siswa.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {presensiDetails.map((detail) => {
            const isEditing = editingId === detail.siswaId;
            
            return (
              <div key={detail.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {detail.siswa.namaLengkap.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{detail.siswa.namaLengkap}</p>
                      <p className="text-xs text-muted-foreground">NIS: {detail.siswa.nis}</p>
                    </div>
                  </div>
                  
                  <Badge className={STATUS_COLORS[detail.status as keyof typeof STATUS_COLORS]}>
                    {detail.status}
                  </Badge>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 mt-1">
                  <Select 
                    defaultValue={detail.status} 
                    onValueChange={(val) => handleStatusChange(detail.siswaId, val)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Ubah Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HADIR">✅ Hadir</SelectItem>
                      <SelectItem value="SAKIT">🤒 Sakit</SelectItem>
                      <SelectItem value="IZIN">📝 Izin</SelectItem>
                      <SelectItem value="ALPHA">❌ Alpha</SelectItem>
                    </SelectContent>
                  </Select>

                  {(detail.status === "SAKIT" || detail.status === "IZIN") && (
                    <div className="flex-1 flex items-center gap-1">
                      <Input
                        placeholder="Keterangan..."
                        className="h-8 text-xs"
                        defaultValue={detail.keterangan || ""}
                        onChange={(e) => setKeterangan(prev => ({ ...prev, [detail.siswaId]: e.target.value }))}
                        onBlur={() => {
                          if (keterangan[detail.siswaId] !== detail.keterangan) {
                            handleStatusChange(detail.siswaId, detail.status);
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {isEditing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}