import { prisma } from "@/lib/prisma";

export async function getAllKelasWithWali() {
  return await prisma.kelas.findMany({
    select: {
      id: true,
      nama: true,
      tingkat: true,
      jurusan: true,
      waliKelasId: true,
      waliKelas: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      _count: {
        select: { siswaList: true },
      },
    },
    orderBy: [
      { tingkat: "asc" },
      { nama: "asc" },
    ],
  });
}

export async function getAllGuruForWali() {
  return await prisma.guru.findMany({
    select: {
      id: true,
      namaLengkap: true,
    },
    orderBy: { namaLengkap: "asc" },
  });
}