import { prisma } from "@/lib/prisma";

export async function getAllGuru(search?: string) {
  const where: any = {};
  
  if (search) {
    where.OR = [
      { nip: { contains: search } },
      { namaLengkap: { contains: search } },
    ];
  }

  return await prisma.guru.findMany({
    where,
    select: {
      id: true,
      nip: true,
      namaLengkap: true,
      userId: true,
      user: {
        select: {
          email: true,
          _count: {
            select: {
              jadwalList: true, // ✅ Hitung jadwal melalui relasi user
            },
          },
        },
      },
      kelasWali: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
    orderBy: { namaLengkap: "asc" },
  });
}

export async function getGuruById(id: string) {
  return await prisma.guru.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}