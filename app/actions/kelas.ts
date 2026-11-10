"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { kelasSchema } from "@/lib/validations/kelas";

export async function createKelas(formData: FormData) {
  try {
    const rawData = {
      nama: formData.get("nama") as string,
      tingkat: formData.get("tingkat") as string,
      jurusan: formData.get("jurusan") as string,
      waliKelasId: (formData.get("waliKelasId") as string) || null,
    };

    const validatedData = kelasSchema.parse(rawData);

    await prisma.kelas.create({
      data: {
        nama: validatedData.nama,
        tingkat: validatedData.tingkat,
        jurusan: validatedData.jurusan,
        waliKelasId: validatedData.waliKelasId,
      },
    });

    revalidatePath("/kelas");
    return { success: true, message: "Kelas berhasil ditambahkan" };
  } catch (error: any) {
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menambahkan kelas" };
  }
}

export async function updateKelas(id: string, formData: FormData) {
  try {
    const rawData = {
      nama: formData.get("nama") as string,
      tingkat: formData.get("tingkat") as string,
      jurusan: formData.get("jurusan") as string,
      waliKelasId: (formData.get("waliKelasId") as string) || null,
    };

    const validatedData = kelasSchema.parse(rawData);

    await prisma.kelas.update({
      where: { id },
      data: {
        nama: validatedData.nama,
        tingkat: validatedData.tingkat,
        jurusan: validatedData.jurusan,
        waliKelasId: validatedData.waliKelasId,
      },
    });

    revalidatePath("/kelas");
    return { success: true, message: "Kelas berhasil diperbarui" };
  } catch (error: any) {
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal memperbarui kelas" };
  }
}

export async function deleteKelas(id: string) {
  try {
    await prisma.kelas.delete({ where: { id } });
    revalidatePath("/kelas");
    return { success: true, message: "Kelas berhasil dihapus" };
  } catch (error) {
    return { success: false, error: "Gagal menghapus. Pastikan tidak ada siswa/jadwal yang menggunakan kelas ini." };
  }
}