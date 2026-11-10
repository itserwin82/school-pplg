import { prisma } from "@/lib/prisma";

// 1. Fungsi untuk halaman presensi harian
export async function getPresensiByDate(tanggal: string, kelasId?: string) {
  const startDate = new Date(tanggal);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(tanggal);
  endDate.setHours(23, 59, 59, 999);

  const where: any = {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (kelasId && kelasId !== "all") {
    where.siswa = {
      kelasId: kelasId,
    };
  }

  const presensiList = await prisma.presensi.findMany({
    where,
    select: {
      id: true,
      tanggal: true,
      status: true,
      keterangan: true,
      siswa: {
        select: {
          id: true,
          nis: true,
          namaLengkap: true,
          kelas: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
    orderBy: {
      siswa: {
        namaLengkap: "asc",
      },
    },
  });

  return presensiList;
}

// 2. Fungsi untuk statistik presensi siswa
export async function getPresensiStats(siswaId: string, bulan: number, tahun: number) {
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0);

  const presensiList = await prisma.presensi.findMany({
    where: {
      siswaId,
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      tanggal: true,
      status: true,
    },
  });

  const stats = {
    HADIR: 0,
    SAKIT: 0,
    IZIN: 0,
    ALPHA: 0,
  };

  presensiList.forEach((p) => {
    if (stats[p.status as keyof typeof stats] !== undefined) {
      stats[p.status as keyof typeof stats]++;
    }
  });

  return {
    stats,
    total: presensiList.length,
    presensiList,
  };
}

// 3. Fungsi untuk heatmap kehadiran (BARU)
export async function getPresensiHeatmap(siswaId: string, bulan: number, tahun: number) {
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

  const presensiList = await prisma.presensi.findMany({
    where: {
      siswaId,
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      tanggal: true,
      status: true,
    },
    orderBy: {
      tanggal: "asc",
    },
  });

  const heatmapData = new Map<string, string>();
  presensiList.forEach((p) => {
    const dateKey = new Date(p.tanggal).toISOString().split("T")[0];
    heatmapData.set(dateKey, p.status);
  });

  const stats = {
    HADIR: 0,
    SAKIT: 0,
    IZIN: 0,
    ALPHA: 0,
  };

  presensiList.forEach((p) => {
    if (stats[p.status as keyof typeof stats] !== undefined) {
      stats[p.status as keyof typeof stats]++;
    }
  });

  const totalHari = presensiList.length;
  const persentaseHadir = totalHari > 0 ? ((stats.HADIR / totalHari) * 100).toFixed(1) : "0";

  let currentStreak = 0;
  let longestStreak = 0;
  const sortedDates = Array.from(heatmapData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [_, status] of sortedDates) {
    if (status === "HADIR") {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    heatmapData,
    stats,
    totalHari,
    persentaseHadir,
    longestStreak,
    startDate,
    endDate,
  };
}

// 4. Fungsi untuk detail siswa (BARU)
export async function getSiswaDetail(siswaId: string) {
  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: {
      id: true,
      nis: true,
      namaLengkap: true,
      kelas: {
        select: {
          id: true,
          nama: true,
          jurusan: true,
        },
      },
    },
  });

  return siswa;
}