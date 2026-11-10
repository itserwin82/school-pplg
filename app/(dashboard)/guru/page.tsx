import { Suspense } from "react";
import { getAllGuru } from "@/lib/guru-data";
import { GuruPageClient } from "./guru-page-client";

export default function GuruPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return (
    <Suspense fallback={<GuruSkeleton />}>
      <GuruContent searchParams={searchParams} />
    </Suspense>
  );
}

async function GuruContent({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolved = await searchParams;
  const guruList = await getAllGuru(resolved.search);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Guru</h2>
        <p className="text-muted-foreground">
          Kelola data guru dan akun login mereka.
        </p>
      </div>
      <GuruPageClient guruList={guruList} />
    </div>
  );
}

function GuruSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}