import { prisma } from "@/lib/prisma";

export async function getStatistikSekolah() {
  const [
    totalSiswa,
    totalGuru,
    totalKelas,
    totalMapel,
    totalJadwal,
  ] = await Promise.all([
    prisma.siswa.count(),
    prisma.guru.count(),
    prisma.kelas.count(),
    prisma.mataPelajaran.count(),
    prisma.jadwal.count(),
  ]);

  // Statistik presensi hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sesiHariIni = await prisma.sesiPembelajaran.findMany({
    where: { tanggal: today },
    include: {
      presensiDetail: { select: { status: true } },
    },
  });

  let totalHadir = 0;
  let totalPresensi = 0;
  sesiHariIni.forEach(sesi => {
    sesi.presensiDetail.forEach(p => {
      totalPresensi++;
      if (p.status === "HADIR") totalHadir++;
    });
  });

  const persentaseHadirHariIni = totalPresensi > 0 
    ? ((totalHadir / totalPresensi) * 100).toFixed(1) 
    : "0";

  return {
    totalSiswa,
    totalGuru,
    totalKelas,
    totalMapel,
    totalJadwal,
    totalSesiHariIni: sesiHariIni.length,
    persentaseHadirHariIni,
  };
}

export async function getAktivitasTerbaru() {
  const sesiTerbaru = await prisma.sesiPembelajaran.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      jadwal: {
        include: {
          mapel: true,
          kelas: true,
          guru: true,
        },
      },
      _count: {
        select: { presensiDetail: true },
      },
    },
  });

  return sesiTerbaru;
}