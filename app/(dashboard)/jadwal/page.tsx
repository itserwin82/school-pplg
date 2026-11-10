import { Suspense } from "react";
import { getAllJadwal, getAllGuru } from "@/lib/jadwal-data";
import { getAllKelas } from "@/lib/siswa-data";
import { getAllMapel } from "@/lib/mapel-data";
import { JadwalPageClient } from "./jadwal-page-client";

export default function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string; kelas?: string }>;
}) {
  return (
    <Suspense fallback={<JadwalSkeleton />}>
      <JadwalContent searchParams={searchParams} />
    </Suspense>
  );
}

async function JadwalContent({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string; kelas?: string }>;
}) {
  const resolved = await searchParams;
  
  const [jadwalList, kelasList, mapelList, guruList] = await Promise.all([
    getAllJadwal(resolved.hari, resolved.kelas),
    getAllKelas(),
    getAllMapel(),
    getAllGuru(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
        <p className="text-muted-foreground">
          Kelola jadwal pembelajaran per kelas dan deteksi bentrok jadwal otomatis.
        </p>
      </div>
      <JadwalPageClient
        jadwalList={jadwalList}
        kelasList={kelasList}
        mapelList={mapelList}
        guruList={guruList}
        initialHari={resolved.hari}
        initialKelas={resolved.kelas}
      />
    </div>
  );
}

function JadwalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}