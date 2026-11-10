"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { QrCode, AlertCircle, Keyboard } from "lucide-react";

import { scanQrPresensi } from "@/app/actions/sesi";
import { QrScanner } from "@/components/sesi/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScanQr() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    mapel?: string;
    alreadyScanned?: boolean;
    waktuScan?: string;   
  } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  console.log("🔍 [SCAN PAGE] Session:", session?.user);

  const handleScanSuccess = (token: string) => {
    console.log("🔍 [SCAN PAGE] Token dari QR:", token);
    startTransition(async () => {
      const result = await scanQrPresensi(token);
      console.log("🔍 [SCAN PAGE] Result dari server:", result);
      setScanResult({
        success: result.success,
        message: (result as any).error || result.message,
        mapel: result.mapel,
        alreadyScanned: (result as any).alreadyScanned,
        waktuScan: (result as any).waktuScan,
      });
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    console.log("🔍 [SCAN PAGE] Manual token:", manualToken);
    handleScanSuccess(manualToken.trim());
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken("");
  };

  const isSiswa = session?.user?.role === "SISWA";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
          <QrCode className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Scan Presensi</h2>
        <p className="text-muted-foreground">
          Arahkan kamera ke QR Code atau masukkan token manual
        </p>
      </div>

      {/* Info Session */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        <p><strong>Role:</strong> {session?.user?.role || "Tidak terdeteksi"}</p>
        <p><strong>Email:</strong> {session?.user?.email || "-"}</p>
        <p><strong>User ID:</strong> {session?.user?.id || "-"}</p>
      </div>

      {/* Warning jika bukan siswa */}
      {!isSiswa && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Perhatian:</strong> Fitur scan presensi hanya untuk siswa. 
            Anda login sebagai <strong>{session?.user?.role || "User"}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Scanner */}
      {isSiswa ? (
        <>
          <QrScanner
            onScanSuccess={handleScanSuccess}
            isProcessing={isPending}
            scanResult={scanResult}
            onReset={handleReset}
          />

          {/* Fallback: Input Manual Token */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Button
              variant="ghost"
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full justify-start"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              {showManualInput ? "Sembunyikan" : "Tidak bisa scan? Masukkan token manual"}
            </Button>

            {showManualInput && (
              <form onSubmit={handleManualSubmit} className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="token">Kode Token (16 karakter)</Label>
                  <Input
                    id="token"
                    placeholder="Contoh: A1B2C3D4E5F6G7H8"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                    maxLength={16}
                    className="font-mono text-center tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Token tertera di bawah QR Code yang ditampilkan guru
                  </p>
                </div>
                <Button type="submit" disabled={isPending || manualToken.length < 8} className="w-full">
                  {isPending ? "Memproses..." : "Submit Presensi"}
                </Button>
              </form>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Fitur ini hanya tersedia untuk akun siswa.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}