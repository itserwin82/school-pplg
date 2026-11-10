import { Suspense } from "react";
import { ScanQr } from "./scan-qr-client";
import { QrCode } from "lucide-react";

export default function ScanPage() {
  return (
    <Suspense fallback={<ScanSkeleton />}>
      <ScanQr />
    </Suspense>
  );
}

function ScanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}