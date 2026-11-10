"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QrCodeDisplayProps = {
  qrToken: string;
  expiredAt: string;
  mapelNama: string;
  kelasNama: string;
  jumlahHadir: number;
  totalSiswa: number;
  sesiId: string;
  onRegenerate: (sesiId: string, durasiMenit: number) => Promise<void>;
  isRegenerating: boolean;
};

export function QrCodeDisplay({
  qrToken,
  expiredAt,
  mapelNama,
  kelasNama,
  jumlahHadir,
  totalSiswa,
  sesiId,
  onRegenerate,
  isRegenerating,
}: QrCodeDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [durasiMenit, setDurasiMenit] = useState<number>(15);
  
  // Real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scanUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/scan?token=${qrToken}`;
  
  const expiredDate = new Date(expiredAt);
  const diffMs = expiredDate.getTime() - currentTime.getTime();
  const isExpired = diffMs <= 0;
  
  const diffMinutes = Math.max(0, Math.floor(diffMs / 1000 / 60));
  const diffSeconds = Math.max(0, Math.floor((diffMs / 1000) % 60));

  const handleRegenerate = async () => {
    await onRegenerate(sesiId, durasiMenit);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">{mapelNama}</h3>
        <p className="text-lg text-muted-foreground">Kelas {kelasNama}</p>
      </div>

      {/* QR Code */}
      <div className={`rounded-2xl border-4 p-6 shadow-2xl transition-all ${
        isExpired 
          ? "border-red-300 bg-red-50 opacity-60" 
          : "border-primary/20 bg-white"
      }`}>
        <QRCodeSVG
          value={scanUrl}
          size={320}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor={isExpired ? "#999999" : "#000000"}
        />
      </div>

      {/* Token Manual */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Kode Token (manual input):</p>
        <p className="font-mono text-2xl font-bold tracking-wider text-primary">
          {qrToken}
        </p>
      </div>

      {/* Timer */}
      {isExpired ? (
        <div className="flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-900">
            QR Code sudah kadaluarsa
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2">
          <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
          <span className="text-sm font-medium text-amber-900">
            Berlaku <span className="font-bold">{diffMinutes}</span> menit{" "}
            <span className="font-bold">{diffSeconds.toString().padStart(2, "0")}</span> detik lagi
          </span>
        </div>
      )}

      {/* Statistik Real-time */}
      <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-900">
          {jumlahHadir} / {totalSiswa} siswa sudah hadir
        </span>
      </div>

      {/* ✅ KONTROL QR BARU - Dipindahkan dari kartu sesi */}
      <div className="w-full max-w-md rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium text-center">
          {isExpired ? "⚠️ Generate QR Baru" : "🔄 Perpanjang / Ganti QR"}
        </p>
        
        <div className="flex gap-2">
          <Select 
            value={String(durasiMenit)} 
            onValueChange={(val) => setDurasiMenit(parseInt(val))}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Durasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 menit</SelectItem>
              <SelectItem value="10">10 menit</SelectItem>
              <SelectItem value="15">15 menit</SelectItem>
              <SelectItem value="30">30 menit</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex-1"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate QR Baru
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {isExpired 
            ? "QR lama sudah tidak valid. Generate QR baru agar siswa bisa scan."
            : "QR lama akan otomatis tidak valid setelah QR baru di-generate."}
        </p>
      </div>
    </div>
  );
}