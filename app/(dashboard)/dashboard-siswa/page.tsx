import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DashboardSiswaClient } from "./dashboard-siswa-client";

export default async function DashboardSiswaPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <DashboardSiswaContent />
    </Suspense>
  );
}

async function DashboardSiswaContent() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const siswa = await prisma.siswa.findFirst({
    where: { user: { id: session.user.id } },
    include: { kelas: true },
  });

  if (!siswa) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Profil siswa tidak ditemukan.</p>
      </div>
    );
  }

  const HARI_MAP: Record<number, string> = {
    0: "MINGGU", 1: "SENIN", 2: "SELASA", 3: "RABU",
    4: "KAMIS", 5: "JUMAT", 6: "SABTU",
  };
  const hariIni = HARI_MAP[new Date().getDay()];

  const jadwalHariIni = await prisma.jadwal.findMany({
    where: {
      hari: hariIni,
      kelasId: siswa.kelasId,
    },
    include: {
      mapel: true,
      guru: true,
      sesiList: {
        where: {
          tanggal: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    },
    orderBy: { jamMulai: "asc" },
  });

  const sesiLive = await prisma.sesiPembelajaran.findFirst({
    where: {
      jadwal: { kelasId: siswa.kelasId },
      status: "BERLANGSUNG",
      tanggal: new Date(new Date().setHours(0, 0, 0, 0)),
    },
    include: {
      jadwal: {
        include: {
          mapel: true,
          guru: true,
        },
      },
    },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const presensiBulanIni = await prisma.presensiDetail.findMany({
    where: {
      siswaId: siswa.id,
      createdAt: { gte: startOfMonth },
    },
    select: { status: true },
  });

  const stats = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
  presensiBulanIni.forEach((p) => {
    if (stats[p.status as keyof typeof stats] !== undefined) {
      stats[p.status as keyof typeof stats]++;
    }
  });

  const sesiHariIni = await prisma.sesiPembelajaran.findMany({
    where: {
      jadwal: { kelasId: siswa.kelasId },
      tanggal: new Date(new Date().setHours(0, 0, 0, 0)),
    },
    select: { id: true },
  });

  const sesiIds = sesiHariIni.map(s => s.id);

  let statusPresensiHariIni: {
    totalSesi: number;
    sudahPresensi: number;
    belumPresensi: number;
  } | null = null;

  if (sesiIds.length > 0) {
    const presensiHariIni = await prisma.presensiDetail.findMany({
      where: {
        sesiId: { in: sesiIds },
        siswaId: siswa.id,
      },
      select: { status: true },
    });

    const sudahPresensi = presensiHariIni.filter(p => p.status === "HADIR").length;

    statusPresensiHariIni = {
      totalSesi: sesiIds.length,
      sudahPresensi,
      belumPresensi: sesiIds.length - sudahPresensi,
    };
  }

  // Cek apakah hari ini weekend
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=Minggu, 6=Sabtu

    return (
    <DashboardSiswaClient
      siswa={siswa}
      jadwalHariIni={jadwalHariIni}
      stats={stats}
      hariIni={hariIni}
      sesiLive={sesiLive}
      statusPresensiHariIni={statusPresensiHariIni}
      isWeekend={isWeekend}
    />
  );
}