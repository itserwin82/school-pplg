import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SiswaDetailClient } from "./siswa-detail-client";
import { getSiswaDetail } from "@/lib/presensi-data";
import { Button } from "@/components/ui/button";

// 1. Wrapper Component: SINKRON, hanya merender Suspense
export default function SiswaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SiswaDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

// 2. Content Component: ASINKRON, melakukan pengambilan data (BERADA DI DALAM Suspense)
async function SiswaDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const siswaId = resolvedParams.id;
  const bulan = resolvedSearchParams.bulan || "";
  const tahun = resolvedSearchParams.tahun || "";

  // ✅ Sekarang aman karena berada di dalam komponen yang dibungkus <Suspense>
  const siswa = await getSiswaDetail(siswaId);

  if (!siswa) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Siswa tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/siswa">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Data Siswa
        </Button>
      </Link>

      <SiswaDetailClient 
        siswa={siswa} 
        initialBulan={bulan} 
        initialTahun={tahun} 
      />
    </div>
  );
}

// 3. Skeleton Loading
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}