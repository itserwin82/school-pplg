import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getStatistikSekolah, getAktivitasTerbaru } from "@/lib/dashboard-admin-data";
import { DashboardAdminClient } from "./dashboard-admin-client";

export default async function DashboardAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Memuat dashboard...</div>}>
      <DashboardAdminContent />
    </Suspense>
  );
}

async function DashboardAdminContent() {
  await headers();
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [statistik, aktivitasTerbaru] = await Promise.all([
    getStatistikSekolah(),
    getAktivitasTerbaru(),
  ]);

  return (
    <DashboardAdminClient
      userName={session.user.name || "Admin"}
      statistik={statistik}
      aktivitasTerbaru={aktivitasTerbaru}
    />
  );
}