import { prisma } from "@/lib/prisma";

export async function getAllJadwal(hari?: string, kelasId?: string) {
  const where: any = {};

  if (hari && hari !== "all") {
    where.hari = hari;
  }

  if (kelasId && kelasId !== "all") {
    where.kelasId = kelasId;
  }

  return await prisma.jadwal.findMany({
    where,
    select: {
      id: true,
      hari: true,
      jamMulai: true,
      jamSelesai: true,
      mapel: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
      guru: {
        select: {
          id: true,
          name: true, // ✅ Ini benar karena guru terhubung ke User
        },
      },
      kelas: {
        select: {
          id: true,
          nama: true,
          jurusan: true,
        },
      },
    },
    orderBy: [
      { hari: "asc" },
      { jamMulai: "asc" },
    ],
  });
}

export async function getJadwalById(id: string) {
  return await prisma.jadwal.findUnique({
    where: { id },
    include: {
      mapel: true,
      guru: true,
      kelas: true,
    },
  });
}

export async function getAllGuru() {
  return await prisma.user.findMany({
    where: { role: "GURU" },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}