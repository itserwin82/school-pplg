import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getStatistikMengajar, getJadwalMengajarHariIni, getSemuaJadwalGuru, getSesiBerlangsung } from "@/lib/dashboard-guru-data";
import { DashboardGuruClient } from "./dashboard-guru-client";

export default async function DashboardGuruPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Memuat dashboard...</div>}>
      <DashboardGuruContent />
    </Suspense>
  );
}

async function DashboardGuruContent() {
  await headers();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "GURU") {
    redirect("/");
  }

  const [statistik, jadwalHariIni, semuaJadwal, sesiBerlangsung] = await Promise.all([
    getStatistikMengajar(session.user.id),
    getJadwalMengajarHariIni(session.user.id),
    getSemuaJadwalGuru(session.user.id),
    getSesiBerlangsung(session.user.id),
  ]);

  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <DashboardGuruClient
      userName={session.user.name || "Guru"}
      statistik={statistik}
      jadwalHariIni={jadwalHariIni}
      semuaJadwal={semuaJadwal}
      sesiBerlangsung={sesiBerlangsung}
      isWeekend={isWeekend}
    />
  );
}