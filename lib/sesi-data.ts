import { prisma } from "@/lib/prisma";

const HARI_MAP: Record<number, string> = {
  0: "MINGGU",
  1: "SENIN",
  2: "SELASA",
  3: "RABU",
  4: "KAMIS",
  5: "JUMAT",
  6: "SABTU",
};

// Ambil jadwal untuk hari tertentu (bukan hanya hari ini)
export async function getJadwalByHari(hari: string, guruId?: string) {
  const where: any = { hari };

  // Jika guruId ada, filter berdasarkan guruId (yang isinya adalah User.id)
  if (guruId) {
    where.guruId = guruId; 
  }

  return await prisma.jadwal.findMany({
    where,
    include: {
      mapel: true,
      kelas: true,
      guru: true,
      sesiList: {
        include: {
          presensiDetail: {
            include: { siswa: true },
          },
        },
      },
    },
    orderBy: { jamMulai: "asc" },
  });
}

// Ambil sesi hari ini (untuk backward compatibility)
export async function getSesiHariIni(guruId?: string) {
  const hariIni = HARI_MAP[new Date().getDay()];
  return await getJadwalByHari(hariIni, guruId);
}

// Ambil detail sesi lengkap
export async function getSesiDetail(sesiId: string) {
  const sesi = await prisma.sesiPembelajaran.findUnique({
    where: { id: sesiId },
    include: {
      jadwal: {
        include: {
          mapel: true,
          kelas: {
            include: {
              _count: { select: { siswaList: true } }, // Hitung total siswa di kelas
            },
          },
          guru: true,
        },
      },
      presensiDetail: {
        include: {
          siswa: {
            include: { kelas: true },
          },
        },
        orderBy: {
          siswa: { namaLengkap: "asc" },
        },
      },
    },
  });

  return sesi;
}

export function getPresensiStatsFromDetail(presensiDetail: any[]) {
  const stats = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
  presensiDetail.forEach((p) => {
    if (stats[p.status as keyof typeof stats] !== undefined) {
      stats[p.status as keyof typeof stats]++;
    }
  });
  const total = presensiDetail.length;
  const persentaseHadir = total > 0 ? ((stats.HADIR / total) * 100).toFixed(1) : "0";
  return { stats, total, persentaseHadir };
}