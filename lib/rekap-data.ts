import { prisma } from "@/lib/prisma";

export async function getRekapPresensi(kelasId: string, bulan: number, tahun: number) {
  // 1. Ambil semua siswa di kelas tersebut
  const siswaList = await prisma.siswa.findMany({
    where: { kelasId },
    select: { 
      id: true, 
      nis: true, 
      namaLengkap: true 
    },
    orderBy: { namaLengkap: "asc" },
  });

  if (siswaList.length === 0) return [];

  // 2. Tentukan rentang tanggal bulan tersebut
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

  // 3. Ambil semua data presensi siswa-siswa tersebut di bulan itu
  const presensiData = await prisma.presensiDetail.findMany({
    where: {
      siswaId: { in: siswaList.map(s => s.id) },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      siswaId: true,
      status: true,
    },
  });

  // 4. Agregasi data per siswa
  const rekap = siswaList.map(siswa => {
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

  return rekap;
}

export async function getAllKelasForRekap() {
  return await prisma.kelas.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });
}