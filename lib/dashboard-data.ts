import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [
    totalSiswa,
    totalGuru,
    totalKelas,
    totalMapel,
    distribusiKelas,
    siswaTerbaru,
  ] = await Promise.all([
    prisma.siswa.count(),

    prisma.guru.count(),

    prisma.kelas.count(),

    prisma.mataPelajaran.count(),

    prisma.kelas.findMany({
      select: {
        nama: true,
        tingkat: true,
        jurusan: true,
        _count: {
          select: {
            siswaList: true,
          },
        },
      },
      orderBy: [
        {
          tingkat: "asc",
        },
        {
          nama: "asc",
        },
      ],
    }),

    prisma.siswa.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        nis: true,
        namaLengkap: true,
        createdAt: true,
        kelas: {
          select: {
            nama: true,
            jurusan: true,
          },
        },
      },
    }),
  ]);

  return {
    totalSiswa,
    totalGuru,
    totalKelas,
    totalMapel,
    distribusiKelas: distribusiKelas.map((item) => ({
      name: item.nama,
      siswa: item._count.siswaList,
    })),
    siswaTerbaru,
  };
}