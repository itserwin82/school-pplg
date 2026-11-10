"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { FileDown, Filter, AlertTriangle, Loader2 } from "lucide-react";

import { getRekapPresensiAction } from "@/app/actions/rekap";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BULAN_OPTIONS = [
  { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
  { value: "3", label: "Maret" }, { value: "4", label: "April" },
  { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
  { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
  { value: "9", label: "September" }, { value: "10", label: "Oktober" },
  { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return { value: String(year), label: String(year) };
});

type RekapPageClientProps = {
  initialParams: { kelas?: string; bulan?: string; tahun?: string };
  kelasList: { id: string; nama: string }[];
};

export function RekapPageClient({ initialParams, kelasList }: RekapPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultBulan = initialParams.bulan ? parseInt(initialParams.bulan) : new Date().getMonth() + 1;
  const defaultTahun = initialParams.tahun ? parseInt(initialParams.tahun) : new Date().getFullYear();

  const [kelasId, setKelasId] = useState(initialParams.kelas || "");
  const [bulan, setBulan] = useState(defaultBulan);
  const [tahun, setTahun] = useState(defaultTahun);
  
  // ✅ PERBAIKAN: Pastikan state selalu berupa array
  const [rekapData, setRekapData] = useState<any[]>([]);

  // Sinkronisasi URL jika parameter bulan/tahun tidak ada
  useEffect(() => {
    if (!initialParams.bulan || !initialParams.tahun) {
      const params = new URLSearchParams(searchParams.toString());
      if (!initialParams.bulan) params.set("bulan", String(defaultBulan));
      if (!initialParams.tahun) params.set("tahun", String(defaultTahun));
      
      router.replace(`/presensi?${params.toString()}`, { scroll: false });
    }
  }, [initialParams.bulan, initialParams.tahun, defaultBulan, defaultTahun, router, searchParams]);

  // Fetch data ketika filter berubah
  useEffect(() => {
    if (kelasId) {
      startTransition(async () => {
        try {
          const data = await getRekapPresensiAction(kelasId, bulan, tahun);
          // ✅ PERBAIKAN: Pastikan data yang di-set adalah array
          setRekapData(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Gagal memuat rekap:", error);
          setRekapData([]);
        }
      });
    } else {
      setRekapData([]);
    }
  }, [kelasId, bulan, tahun]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/presensi?${params.toString()}`);
  };

  const handleExportExcel = () => {
    // ✅ PERBAIKAN: Safe check untuk mencegah error undefined.length
    if (!rekapData || rekapData.length === 0) return;

    const excelData = rekapData.map(row => ({
      "NIS": row.nis,
      "Nama Siswa": row.nama,
      "Total Pertemuan": row.total,
      "Hadir": row.hadir,
      "Sakit": row.sakit,
      "Izin": row.izin,
      "Alpha": row.alpha,
      "Persentase Kehadiran (%)": row.persentase,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");
    
    const kelasNama = kelasList.find(k => k.id === kelasId)?.nama || "Data";
    const fileName = `Rekap_Presensi_${kelasNama.replace(/\s+/g, '_')}_${bulan}_${tahun}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const kelasNama = kelasList.find(k => k.id === kelasId)?.nama || "Belum Dipilih";

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rekap Presensi</h2>
          <p className="text-muted-foreground">
            Laporan kehadiran siswa per kelas dan per bulan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={kelasId} onValueChange={(val) => {
            setKelasId(val);
            handleFilterChange("kelas", val);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasList.map((k) => (
                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(bulan)} onValueChange={(val) => {
            setBulan(parseInt(val));
            handleFilterChange("bulan", val);
          }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {BULAN_OPTIONS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(tahun)} onValueChange={(val) => {
            setTahun(parseInt(val));
            handleFilterChange("tahun", val);
          }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {TAHUN_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ PERBAIKAN: Tambahkan safe check di tombol disabled */}
          <Button onClick={handleExportExcel} disabled={!rekapData || rekapData.length === 0 || isPending}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tabel Rekap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Data Kehadiran: {kelasNama} - {BULAN_OPTIONS.find(b => b.value === String(bulan))?.label} {tahun}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && kelasId ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Memuat data rekap...</p>
            </div>
          ) : !rekapData || rekapData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {kelasId ? "Belum ada data presensi untuk periode ini." : "Silakan pilih kelas terlebih dahulu."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center text-emerald-700">Hadir</TableHead>
                    <TableHead className="text-center text-yellow-700">Sakit</TableHead>
                    <TableHead className="text-center text-blue-700">Izin</TableHead>
                    <TableHead className="text-center text-red-700">Alpha</TableHead>
                    <TableHead className="text-center">Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekapData.map((row, index) => {
                    const isLowAttendance = row.persentase < 75;
                    return (
                      <TableRow key={index} className={isLowAttendance ? "bg-red-50/50" : ""}>
                        <TableCell className="font-mono text-sm">{row.nis}</TableCell>
                        <TableCell className="font-medium">{row.nama}</TableCell>
                        <TableCell className="text-center">{row.total}</TableCell>
                        <TableCell className="text-center font-medium text-emerald-700">{row.hadir}</TableCell>
                        <TableCell className="text-center text-yellow-700">{row.sakit}</TableCell>
                        <TableCell className="text-center text-blue-700">{row.izin}</TableCell>
                        <TableCell className="text-center text-red-700">{row.alpha}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={isLowAttendance ? "destructive" : "secondary"} className="font-mono">
                            {row.persentase}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}