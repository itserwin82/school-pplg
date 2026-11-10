import { Suspense } from "react";
import { getAllSiswa, getAllKelas } from "@/lib/siswa-data";
import { SiswaPageClient } from "./siswa-page-client";

// 1. Komponen utama HANYA membungkus Suspense (Tidak Async)
export default function SiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kelas?: string }>;
}) {
  return (
    <Suspense fallback={<SiswaPageSkeleton />}>
      <SiswaPageContent searchParams={searchParams} />
    </Suspense>
  );
}

// 2. Komponen Async yang mengambil data (Dibungkus Suspense)
async function SiswaPageContent({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kelas?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const [siswaList, kelasList] = await Promise.all([
    getAllSiswa(resolvedSearchParams.search, resolvedSearchParams.kelas),
    getAllKelas(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Siswa</h2>
        <p className="text-muted-foreground">
          Kelola data siswa jurusan PPLG.
        </p>
      </div>

      <SiswaPageClient siswaList={siswaList} kelasList={kelasList} />
    </div>
  );
}

// 3. Loading Skeleton Premium
function SiswaPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-10 flex-1 max-w-sm animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-[180px] animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}