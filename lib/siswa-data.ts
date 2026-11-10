import { prisma } from "@/lib/prisma";

export async function getAllSiswa(search?: string, kelasId?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      { nis: { contains: search } },
      { namaLengkap: { contains: search } },
    ];
  }

  if (kelasId) {
    where.kelasId = kelasId;
  }

  const siswaList = await prisma.siswa.findMany({
    where,
    select: {
      id: true,
      nis: true,
      namaLengkap: true,
      createdAt: true,
      kelas: {
        select: {
          id: true,
          nama: true,
          jurusan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return siswaList;
}

export async function getAllKelas() {
  const kelasList = await prisma.kelas.findMany({
    select: {
      id: true,
      nama: true,
      tingkat: true,
      jurusan: true,
    },
    orderBy: {
      tingkat: "asc",
    },
  });

  return kelasList;
}

export async function getSiswaById(id: string) {
  const siswa = await prisma.siswa.findUnique({
    where: { id },
    select: {
      id: true,
      nis: true,
      namaLengkap: true,
      kelasId: true,
    },
  });

  return siswa;
}