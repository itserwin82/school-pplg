"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mapelSchema } from "@/lib/validations/mapel";

export async function createMapel(formData: FormData) {
  try {
    const rawData = {
      kode: formData.get("kode") as string,
      nama: formData.get("nama") as string,
      jamPelajaran: formData.get("jamPelajaran") as string,
    };

    const validatedData = mapelSchema.parse(rawData);

    const existing = await prisma.mataPelajaran.findUnique({
      where: { kode: validatedData.kode },
    });

    if (existing) {
      return { success: false, error: "Kode mata pelajaran sudah terdaftar" };
    }

    await prisma.mataPelajaran.create({
      data: validatedData,
    });

    revalidatePath("/mapel");
    return { success: true, message: "Mata pelajaran berhasil ditambahkan" };
  } catch (error: any) {
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menambahkan mata pelajaran" };
  }
}

export async function updateMapel(id: string, formData: FormData) {
  try {
    const rawData = {
      kode: formData.get("kode") as string,
      nama: formData.get("nama") as string,
      jamPelajaran: formData.get("jamPelajaran") as string,
    };

    const validatedData = mapelSchema.parse(rawData);

    const existing = await prisma.mataPelajaran.findFirst({
      where: { kode: validatedData.kode, id: { not: id } },
    });

    if (existing) {
      return { success: false, error: "Kode mata pelajaran sudah digunakan" };
    }

    await prisma.mataPelajaran.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/mapel");
    return { success: true, message: "Mata pelajaran berhasil diperbarui" };
  } catch (error: any) {
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal memperbarui mata pelajaran" };
  }
}

export async function deleteMapel(id: string) {
  try {
    await prisma.mataPelajaran.delete({ where: { id } });
    revalidatePath("/mapel");
    return { success: true, message: "Mata pelajaran berhasil dihapus" };
  } catch (error) {
    return { success: false, error: "Gagal menghapus. Pastikan tidak ada jadwal yang menggunakan mapel ini." };
  }
}