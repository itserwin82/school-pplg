import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getJadwalByHari } from "@/lib/sesi-data";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { SesiPageClient } from "./sesi-page-client";

export default function SesiPage({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string }>;
}) {
  return (
    <Suspense fallback={<SesiSkeleton />}>
      <SesiContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SesiContent({
  searchParams,
}: {
  searchParams: Promise<{ hari?: string }>;
}) {
  // ✅ INI PENGGANTI "export const dynamic". Mencegah caching.
  noStore();

  const session = await auth();
  const resolved = await searchParams;

  const HARI_MAP: Record<number, string> = {
    0: "MINGGU", 1: "SENIN", 2: "SELASA", 3: "RABU",
    4: "KAMIS", 5: "JUMAT", 6: "SABTU",
  };
  const hariIni = HARI_MAP[new Date().getDay()];
  const hari = resolved.hari || hariIni;

  console.log("=== 🔍 DEBUG SESI PAGE ===");
  console.log("1. Session User ID   :", session?.user?.id);
  console.log("2. Session User Role :", session?.user?.role);

  let guruId: string | undefined = undefined;

  if (session?.user?.role === "GURU") {
    guruId = session.user.id; 
    console.log("3. ✅ Mode GURU aktif. Filtering jadwal untuk User ID:", guruId);
  } else {
    console.log("3. ⚠️ Mode ADMIN/LAINNYA. Menampilkan SEMUA jadwal.");
  }

  const jadwalList = await getJadwalByHari(hari, guruId);
  
  console.log("4. 📊 Jumlah jadwal ditemukan:", jadwalList.length);
  console.log("============================");

  return (
    <SesiPageClient
      jadwalList={jadwalList}
      selectedHari={hari}
      userRole={session?.user?.role || "ADMIN"}
    />
  );
}

function SesiSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}