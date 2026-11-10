import { Suspense } from "react";
import { getAllMapel } from "@/lib/mapel-data";
import { MapelPageClient } from "./mapel-page-client";

export default function MapelPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return (
    <Suspense fallback={<MapelSkeleton />}>
      <MapelContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MapelContent({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolved = await searchParams;
  const mapelList = await getAllMapel(resolved.search);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mata Pelajaran</h2>
        <p className="text-muted-foreground">Kelola data mata pelajaran dan beban jam mengajar.</p>
      </div>
      <MapelPageClient mapelList={mapelList} />
    </div>
  );
}

function MapelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}