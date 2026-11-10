"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type QrScannerProps = {
  onScanSuccess: (token: string) => void;
  isProcessing: boolean;
  scanResult?: {
    success: boolean;
    message: string;
    mapel?: string;
    alreadyScanned?: boolean;
    waktuScan?: string;
  } | null;
  onReset: () => void;
};

export function QrScanner({ onScanSuccess, isProcessing, scanResult, onReset }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanner = async () => {
    console.log("🎥 [SCANNER] Memulai scanner...");
    setError(null);
    
    try {
      // Hapus scanner lama jika ada
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (e) {
          console.log("⚠️ [SCANNER] Clear old scanner:", e);
        }
        scannerRef.current = null;
      }

      // Tunggu sedikit agar DOM siap
      await new Promise(resolve => setTimeout(resolve, 100));

      const html5QrCode = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Coba kamera belakang dulu, fallback ke kamera depan
      const cameras = await Html5Qrcode.getCameras();
      console.log("🎥 [SCANNER] Kamera tersedia:", cameras.length);
      
      if (cameras.length === 0) {
        throw new Error("Tidak ada kamera yang terdeteksi");
      }

      // Pilih kamera belakang jika ada
      const backCamera = cameras.find(c => 
        c.label.toLowerCase().includes("back") || 
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      );
      
      const cameraId = backCamera ? backCamera.id : cameras[0].id;
      console.log("🎥 [SCANNER] Menggunakan kamera:", cameraId);

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          console.log("✅ [SCANNER] QR terdeteksi:", decodedText);
          
          // Ekstrak token
          let token = decodedText;
          try {
            const url = new URL(decodedText);
            const extractedToken = url.searchParams.get("token");
            if (extractedToken) {
              token = extractedToken;
            }
          } catch {
            // Bukan URL, gunakan langsung
          }
          
          console.log("🔑 [SCANNER] Token final:", token);
          
          // Stop scanner SEBELUM callback untuk menghindari double-scan
          stopScanner().then(() => {
            onScanSuccess(token);
          });
        },
        (errorMessage) => {
          // Ignore - ini normal saat belum menemukan QR
        }
      );

      setIsScanning(true);
      console.log("✅ [SCANNER] Scanner aktif");
    } catch (err: any) {
      console.error("❌ [SCANNER] Error:", err);
      
      let errorMsg = "Gagal memulai kamera";
      if (err.name === "NotAllowedError") {
        errorMsg = "Akses kamera ditolak. Klik ikon gembok di address bar untuk mengizinkan.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFound") {
        errorMsg = "Kamera tidak ditemukan pada perangkat ini.";
      } else if (err.name === "NotReadableError") {
        errorMsg = "Kamera sedang digunakan oleh aplikasi lain.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    console.log("🛑 [SCANNER] Menghentikan scanner...");
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        console.log("🛑 [SCANNER] State saat ini:", state);
        
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await scannerRef.current.stop();
          console.log("✅ [SCANNER] Scanner stopped");
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error("⚠️ [SCANNER] Error saat stop:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup saat komponen unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Tampilkan hasil scan dengan 3 kondisi berbeda
  if (scanResult) {
    // Kondisi 1: Sudah pernah scan (INFO - Biru)
    if (scanResult.alreadyScanned) {
      return (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500">
                <AlertCircle className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900">Sudah Presensi</h3>
                {scanResult.mapel && (
                  <p className="mt-2 text-lg text-blue-700">📚 {scanResult.mapel}</p>
                )}
                <p className="mt-2 text-sm text-blue-800">{scanResult.message}</p>
                {scanResult.waktuScan && (
                  <p className="mt-1 text-sm text-blue-600">
                    Waktu presensi: <strong>{scanResult.waktuScan}</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={onReset} variant="outline">
                  Scan QR Lain
                </Button>
                <a href="/dashboard-siswa">
                  <Button>Kembali ke Dashboard</Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Kondisi 2: Berhasil scan pertama kali (SUCCES - Hijau)
    if (scanResult.success) {
      return (
        <Card className="border-2 border-emerald-500 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-900">Presensi Berhasil!</h3>
                {scanResult.mapel && (
                  <p className="mt-2 text-lg text-emerald-700">📚 {scanResult.mapel}</p>
                )}
                <p className="mt-1 text-sm text-emerald-600">{scanResult.message}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={onReset} variant="outline">
                  Scan Lagi
                </Button>
                <a href="/dashboard-siswa">
                  <Button>Kembali ke Dashboard</Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Kondisi 3: Gagal scan (ERROR - Merah)
    return (
      <Card className="border-2 border-red-500 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
              <XCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-900">Presensi Gagal</h3>
              <p className="mt-2 text-sm text-red-700">{scanResult.message}</p>
            </div>
            <Button onClick={onReset} variant="outline" className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scanner Area */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-border bg-black aspect-square">
        <div id="qr-reader" className="w-full h-full" />
        
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <Camera className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Kamera belum aktif</p>
            <p className="text-sm opacity-70 mt-1">Klik tombol di bawah untuk memulai</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <p className="text-xs text-red-600 mt-2">Gunakan input manual di bawah sebagai alternatif</p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-3" />
              <p className="font-medium">Memverifikasi presensi...</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanner} className="w-full" size="lg" disabled={!!error}>
            <Camera className="mr-2 h-5 w-5" />
            Aktifkan Kamera
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="w-full" size="lg">
            <CameraOff className="mr-2 h-5 w-5" />
            Matikan Kamera
          </Button>
        )}
      </div>

      {/* Instruksi */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>📱 Cara Scan:</strong> Arahkan kamera HP ke QR Code yang ditampilkan guru. 
          Pastikan QR Code terlihat jelas dalam kotak pemindai.
        </p>
      </div>
    </div>
  );
}