"use server";

import { prisma } from "@/lib/prisma";

export async function getRekapPresensiAction(kelasId: string, bulan: number, tahun: number) {
  const siswaList = await prisma.siswa.findMany({
    where: { kelasId },
    select: { id: true, nis: true, namaLengkap: true },
    orderBy: { namaLengkap: "asc" },
  });

  if (siswaList.length === 0) return [];

  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

  const presensiData = await prisma.presensiDetail.findMany({
    where: {
      siswaId: { in: siswaList.map(s => s.id) },
      createdAt: { gte: startDate, lte: endDate },
    },
    select: { siswaId: true, status: true },
  });

  return siswaList.map(siswa => {
    const siswaPresensi = presensiData.filter(p => p.siswaId === siswa.id);
    const total = siswaPresensi.length;
    
    const hadir = siswaPresensi.filter(p => p.status === "HADIR").length;
    const sakit = siswaPresensi.filter(p => p.status === "SAKIT").length;
    const izin = siswaPresensi.filter(p => p.status === "IZIN").length;
    const alpha = siswaPresensi.filter(p => p.status === "ALPHA").length;
    const persentase = total > 0 ? ((hadir / total) * 100) : 0;

    return {
      nis: siswa.nis,
      nama: siswa.namaLengkap,
      total,
      hadir,
      sakit,
      izin,
      alpha,
      persentase: parseFloat(persentase.toFixed(1)),
    };
  });
}