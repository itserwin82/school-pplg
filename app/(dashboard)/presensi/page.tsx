import { Suspense } from "react";
import { getAllKelasForRekap } from "@/lib/rekap-data";
import { RekapPageClient } from "./rekap-page-client";

export default function PresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string; bulan?: string; tahun?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Memuat data rekap...</div>}>
      <RekapContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RekapContent({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string; bulan?: string; tahun?: string }>;
}) {
  const resolved = await searchParams;
  
  // Ambil daftar kelas di server (ini aman, tidak ada new Date())
  const kelasList = await getAllKelasForRekap();

  return (
    <RekapPageClient 
      initialParams={resolved}
      kelasList={kelasList}
    />
  );
}