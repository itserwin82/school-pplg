import { Suspense } from "react";
import { getAllKelasWithWali, getAllGuruForWali } from "@/lib/kelas-data";
import { KelasPageClient } from "./kelas-page-client";

export default function KelasPage() {
  return (
    <Suspense fallback={<KelasSkeleton />}>
      <KelasContent />
    </Suspense>
  );
}

async function KelasContent() {
  const [kelasList, guruList] = await Promise.all([
    getAllKelasWithWali(),
    getAllGuruForWali(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Kelas</h2>
        <p className="text-muted-foreground">
          Kelola kelas dan tunjuk wali kelas untuk setiap kelas.
        </p>
      </div>
      <KelasPageClient kelasList={kelasList} guruList={guruList} />
    </div>
  );
}

function KelasSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}