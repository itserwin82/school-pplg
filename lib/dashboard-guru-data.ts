import { prisma } from "@/lib/prisma";

// Ambil statistik mengajar guru bulan ini
export async function getStatistikMengajar(userId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Ambil semua jadwal yang diajar guru ini
  const jadwalGuru = await prisma.jadwal.findMany({
    where: { guruId: userId },
    select: { id: true, kelasId: true, kelas: { select: { nama: true } } },
  });

  const jadwalIds = jadwalGuru.map(j => j.id);

  if (jadwalIds.length === 0) {
    return {
      totalSesi: 0,
      rataRataKehadiran: 0,
      kelasDiajar: [],
      siswaBermasalah: [],
    };
  }

  // Ambil semua sesi bulan ini
  const sesiBulanIni = await prisma.sesiPembelajaran.findMany({
    where: {
      jadwalId: { in: jadwalIds },
      tanggal: { gte: startOfMonth, lte: endOfMonth },
    },
    include: {
      presensiDetail: {
        select: { status: true },
      },
    },
  });

  // Hitung total sesi
  const totalSesi = sesiBulanIni.length;

  // Hitung rata-rata kehadiran
  let totalHadir = 0;
  let totalPresensi = 0;

  sesiBulanIni.forEach(sesi => {
    sesi.presensiDetail.forEach(p => {
      totalPresensi++;
      if (p.status === "HADIR") totalHadir++;
    });
  });

  const rataRataKehadiran = totalPresensi > 0 ? ((totalHadir / totalPresensi) * 100) : 0;

  // Ambil daftar kelas yang diajar
  const kelasDiajar = Array.from(
    new Map(jadwalGuru.map(j => [j.kelasId, j.kelas.nama])).entries()
  ).map(([id, nama]) => ({ id, nama }));

  // Cari siswa dengan kehadiran < 75% di kelas yang diajar
  const siswaBermasalah: any[] = [];

  for (const kelas of kelasDiajar) {
    const siswaList = await prisma.siswa.findMany({
      where: { kelasId: kelas.id },
      select: { id: true, namaLengkap: true, nis: true },
    });

    for (const siswa of siswaList) {
      const presensiSiswa = await prisma.presensiDetail.findMany({
        where: {
          siswaId: siswa.id,
          sesi: {
            jadwalId: { in: jadwalIds },
          },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { status: true },
      });

      const total = presensiSiswa.length;
      const hadir = presensiSiswa.filter(p => p.status === "HADIR").length;
      const persentase = total > 0 ? ((hadir / total) * 100) : 100;

      if (persentase < 75) {
        siswaBermasalah.push({
          nama: siswa.namaLengkap,
          nis: siswa.nis,
          kelas: kelas.nama,
          persentase: parseFloat(persentase.toFixed(1)),
        });
      }
    }
  }

  return {
    totalSesi,
    rataRataKehadiran: parseFloat(rataRataKehadiran.toFixed(1)),
    kelasDiajar,
    siswaBermasalah: siswaBermasalah.slice(0, 5), // Top 5 siswa bermasalah
  };
}

// Ambil jadwal mengajar hari ini
export async function getJadwalMengajarHariIni(userId: string) {
  const HARI_MAP: Record<number, string> = {
    0: "MINGGU", 1: "SENIN", 2: "SELASA", 3: "RABU",
    4: "KAMIS", 5: "JUMAT", 6: "SABTU",
  };
  const hariIni = HARI_MAP[new Date().getDay()];

  return await prisma.jadwal.findMany({
    where: {
      guruId: userId,
      hari: hariIni,
    },
    include: {
      mapel: true,
      kelas: true,
      sesiList: {
        where: {
          tanggal: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        include: {
          presensiDetail: {
            select: { status: true },
          },
        },
      },
    },
    orderBy: { jamMulai: "asc" },
  });
}

// Ambil SEMUA jadwal guru (seluruh minggu)
export async function getSemuaJadwalGuru(userId: string) {
  return await prisma.jadwal.findMany({
    where: { guruId: userId },
    include: {
      mapel: true,
      kelas: true,
      sesiList: {
        where: {
          tanggal: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        include: {
          presensiDetail: {
            select: { status: true },
          },
        },
      },
    },
    orderBy: [
      { hari: "asc" },
      { jamMulai: "asc" },
    ],
  });
}

// Ambil sesi yang sedang berlangsung untuk guru ini hari ini
export async function getSesiBerlangsung(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.sesiPembelajaran.findFirst({
    where: {
      jadwal: { guruId: userId },
      status: "BERLANGSUNG",
      tanggal: today,
    },
    include: {
      jadwal: {
        include: {
          mapel: true,
          kelas: true,
        },
      },
      presensiDetail: {
        select: { status: true },
      },
    },
  });
}