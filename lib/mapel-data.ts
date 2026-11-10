import { prisma } from "@/lib/prisma";

export async function getAllMapel(search?: string) {
  const where: any = {};
  if (search) {
    where.OR = [
      { kode: { contains: search } },
      { nama: { contains: search } },
    ];
  }

  return await prisma.mataPelajaran.findMany({
    where,
    orderBy: { kode: "asc" },
  });
}

export async function getMapelById(id: string) {
  return await prisma.mataPelajaran.findUnique({ where: { id } });
}